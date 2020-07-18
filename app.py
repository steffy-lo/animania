import os
import mongo_config
from threading import Thread

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask.json import JSONEncoder
from jikanpy import Jikan
from sklearn.metrics.pairwise import pairwise_distances
from pymongo import MongoClient
from bson import json_util
import time

username = mongo_config.username()
password = mongo_config.password()
client = MongoClient('mongodb://' + username + ':' + password + '@cluster0-shard-00-00-sbpfr.mongodb.net:27017,cluster0-shard-00-01-sbpfr.mongodb.net:27017,cluster0-shard-00-02-sbpfr.mongodb.net:27017/test?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin')
db = client.animania
user_data = db.users

jikan = Jikan()

import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/spreadsheets",
         "https://www.googleapis.com/auth/drive.file",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name("creds.json", scope)
gs = gspread.authorize(creds)
review_sheet = gs.open("reviews").sheet1
get_similar_users = None
recommendations = {"user": {}, "item": {}, "user-based": {}}


# define a custom encoder point to the json_util provided by pymongo (or its dependency bson)
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj): return json_util.default(obj)


app = Flask(__name__, static_folder='build', static_url_path='')
app.json_encoder = CustomJSONEncoder
CORS(app)

@app.route('/', methods=["GET"])
def index():
    return app.send_static_file('index.html')

@app.route('/favicon.ico', methods=["GET"])
def favicon():
    return app.send_static_file('favicon.ico')

# ====================================== GET METHODS ==================================================
@app.route('/get_user/<username>', methods=["GET"])
def get_user(username):
    user = user_data.find_one({'username': username})
    if not user:
        abort(404)
    anime_list = user["anime_list"]
    watch_list = user["to_watch"]
    settings = user["settings"]
    return jsonify({'result':
                        {'username': username,
                         'animes': anime_list,
                         'toWatch': watch_list,
                         'settings': settings
                         }
                    })


@app.route('/model_recs', methods=["GET"])
def get_model_recommendations():
    type = request.args.get('type')
    username, anime_id = "", ""

    if type is None:
        abort(400)

    username = request.args.get('username')
    if username is None:
        abort(400)

    if type == "item":
        anime_id = request.args.get('anime_id')
        if anime_id is None:
            abort(400)

    user = user_data.find_one({'username': username})
    settings = user["settings"]

    if type == "user":
        k = settings["k"]
        n = settings["n"]
        anime_list = user["anime_list"]

        global get_similar_users

        if get_similar_users is not None and get_similar_users.is_alive():
            time.sleep(10)
            return jsonify({'result': 'processing'})

        update_list = (username in recommendations["user"]) and recommendations["user"][username][1] != anime_list

        if get_similar_users is None or update_list:
            get_similar_users = Thread(target=similar_users, args=(username,))
            get_similar_users.start()
            time.sleep(25)
            return jsonify({'result': 'processing'})

        if username not in recommendations["user-based"]:
            user_based_recommendation(username, k, n)
        else:
            k_prev, n_prev, recs = recommendations["user-based"][username]
            if k_prev != k or n_prev != n:
                user_based_recommendation(username, k, n)
        return jsonify({'result': recommendations["user-based"][username][-1]})

    else:
        q = settings["q"]
        if anime_id not in recommendations["item"]:
            item_based_recommendation(anime_id)

        return jsonify({'result': recommendations["item"][anime_id][1:q]})


# ====================================== POST METHODS =================================================
@app.route('/add_user/<username>', methods=["POST"])
def add_user(username):
    post_data = {
        'username': username,
        'anime_list': {},
        'to_watch': {},
        'settings': {'k': 5, 'n': 5, 'q': 10}
    }
    user_data.insert_one(post_data)
    return jsonify({'result': post_data})


# ====================================== DELETE METHODS ================================================
@app.route('/del_completed', methods=["DELETE"])
def del_completed():
    req = request.get_json()
    for key in ["username", "anime_id"]:
        if key not in req:
            abort(400)
    user = user_data.find_one({'username': req["username"]})
    anime_list = user["anime_list"]
    try:
        del anime_list[str(req["anime_id"])]
        user_data.find_one_and_update({"username": req["username"]},
                                      {"$set": {"anime_list": anime_list}
                                       })
    except KeyError:
        print("Key " + req["anime_id"] + " not found")

    return jsonify(req)

@app.route('/del_to_watch', methods=["DELETE"])
def del_to_watch():
    req = request.get_json()
    for key in ["username", "anime_id"]:
        if key not in req:
            abort(400)
    user = user_data.find_one({'username': req["username"]})
    watch_list = user["to_watch"]
    try:
        del watch_list[str(req["anime_id"])]
        user_data.find_one_and_update({"username": req["username"]},
                                      {"$set": {"to_watch": watch_list}
                                       })
    except KeyError:
        print("Key " + req["anime_id"] + " not found")

    return jsonify(req)


# ====================================== PATCH METHODS =================================================
@app.route('/add_completed', methods=["PATCH"])
def add_completed():
    req = request.get_json()
    for key in ["username", "anime_id", "score"]:
        if key not in req:
            abort(400)

    user = user_data.find_one({'username': req["username"]})
    anime_list = user["anime_list"]
    anime_list[str(req["anime_id"])] = req["score"]
    user_data.find_one_and_update({"username": req["username"]},
                                  {"$set": {"anime_list": anime_list}})

    return jsonify(req)


@app.route('/add_to_watch', methods=["PATCH"])
def add_to_watch():
    req = request.get_json()
    for key in ["username", "anime_id", "title", "image_url"]:
        if key not in req:
            abort(400)

    user = user_data.find_one({'username': req["username"]})
    watch_list = user["to_watch"]
    watch_list[str(req["anime_id"])] = {"title": req["title"], "image_url": req["image_url"]}
    user_data.find_one_and_update({"username": req["username"]},
                                  {"$set": {"to_watch": watch_list}
                                   })

    return jsonify(req)


@app.route('/settings', methods=["PATCH"])
def settings():
    req = request.get_json()

    if "username" not in req:
        abort(400)

    if "k" not in req and "n" not in req and "q" not in req:
        abort(400)

    # update settings in database accordingly
    user = user_data.find_one({'username': req["username"]})
    settings = user["settings"]
    if "k" in req:
        settings["k"] = req["k"]
    if "n" in req:
        settings["n"] = req["n"]
    if "q" in req:
        settings["q"] = req["q"]

    user_data.find_one_and_update({"username": req["username"]},
                                  {"$set": {"settings": settings}
                                   })

    return jsonify(req)


def item_based_recommendation(anime_id):
    # build item similarity matrix
    user_stats = pd.DataFrame(review_sheet.get_all_records()).sample(n=10000)
    cells = review_sheet.findall(anime_id)[:20]

    for c in cells:
        user_stats = user_stats.append({'profile': review_sheet.cell(c.row, 1).value,
                                        'anime_uid': int(review_sheet.cell(c.row, 2).value),
                                        'score': int(review_sheet.cell(c.row, 3).value)}, ignore_index=True)
    user_stats.drop_duplicates(inplace=True)
    username_dict = dict(zip([val for val in user_stats['profile'].unique()],
                             [i for i, val in enumerate(user_stats['profile'].unique())]))
    anime_id_dict = dict(zip([int(val) for val in user_stats['anime_uid'].unique()],
                             [i for i, val in enumerate(user_stats['anime_uid'].unique())]))
    num_users = user_stats.profile.nunique()
    num_animes = user_stats.anime_uid.nunique()

    train_data_matrix = np.zeros((num_users, num_animes), dtype='uint8')
    for line in user_stats.itertuples():
        train_data_matrix[username_dict[line[1]] - 1, anime_id_dict[line[2]] - 1] = line[3]

    similarity = pairwise_distances(train_data_matrix.T, metric='cosine')

    # get top similar animes
    key_list, val_list = list(anime_id_dict.keys()), list(anime_id_dict.values())
    arr_sim = similarity[anime_id_dict[int(anime_id)]]
    arr_recs = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)
    sim_inds = arr_sim.argsort()
    sorted_arr = arr_recs[sim_inds]
    recommendations["item"][anime_id] = list(set(sorted_arr.tolist()))


def similar_users(username):
    # build user similarity matrix
    user_stats = pd.DataFrame(review_sheet.get_all_records()).sample(n=10000)
    user = user_data.find_one({'username': username})
    anime_list = user["anime_list"]

    for anime_id, score in anime_list.items():
        user_stats = user_stats.append({'profile': username,
                                        'anime_uid': int(anime_id),
                                        'score': int(score)}, ignore_index=True)

    user_stats.drop_duplicates(inplace=True)
    username_dict = dict(zip([val for val in user_stats['profile'].unique()],
                             [i for i, val in enumerate(user_stats['profile'].unique())]))
    anime_id_dict = dict(zip([int(val) for val in user_stats['anime_uid'].unique()],
                             [i for i, val in enumerate(user_stats['anime_uid'].unique())]))
    num_users = user_stats.profile.nunique()
    num_animes = user_stats.anime_uid.nunique()

    train_data_matrix = np.zeros((num_users, num_animes), dtype='uint8')
    for line in user_stats.itertuples():
        train_data_matrix[username_dict[line[1]] - 1, anime_id_dict[line[2]] - 1] = line[3]

    similarity = pairwise_distances(train_data_matrix, metric='cosine')

    # get top similar users
    key_list, val_list = list(username_dict.keys()), list(username_dict.values())
    arr_sim = similarity[username_dict[username]]

    arr_recs = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)
    sim_inds = arr_sim.argsort()
    sorted_arr = arr_recs[sim_inds]
    recommendations["user"][username] = list(set(sorted_arr.tolist())), anime_list


def user_based_recommendation(username, k, n):
    top_recs = []
    top_k = []
    i = 1
    while len(top_k) < k and i < k * 2:
        try:
            user = recommendations["user"][username][0][i]
            animelist = sorted(jikan.user(username=user, request='animelist')['anime'], key=by_score,
                               reverse=True)[:n]
            top_k.append(user)
            anime_ids = [anime["mal_id"] for anime in animelist]
            top_recs.extend(anime_ids)
        except:
            print("An unexpected API error occured.")  # user might have a private animelist
        i += 1

    recommendations["user-based"][username] = k, n, list(set(top_recs))  # cache results


def by_score(anime):
    return anime["score"]


if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))