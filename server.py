import os
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

client = MongoClient()
db = client.animania
user_data = db.users

jikan = Jikan()

import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/spreadsheets",
         "https://www.googleapis.com/auth/drive.file",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name("./creds.json", scope)
gs = gspread.authorize(creds)
review_sheet = gs.open("reviews").sheet1
user_matrix = {}
item_matrix = {}
recommendations = {"user": {}, "item": {}}


# define a custom encoder point to the json_util provided by pymongo (or its dependency bson)
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj): return json_util.default(obj)


app = Flask("animania")
app.json_encoder = CustomJSONEncoder
CORS(app)


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

    if type == "user":
        username = request.args.get('username')
        if username is None:
            abort(400)
    elif type == "item":
        anime_id = request.args.get('anime_id')
        if anime_id is None:
            abort(400)
    else:
        abort(400)

    user = user_data.find_one({'username': username})
    settings = user["settings"]

    if type == "user":
        k = settings["k"]
        n = settings["n"]
        if username in user_matrix:
            similarity, username_dict = user_matrix[username]
        else:
            similarity, username_dict = build_user_matrix(username)
            user_matrix[username] = similarity, username_dict  # cache results

        top_recs = []
        if username in recommendations["user"]:
            top_recs = recommendations["user"][username]
        else:
            key_list, val_list = list(username_dict.keys()), list(username_dict.values())
            arr_sim = similarity[username_dict[username]]

            arr_recs = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)
            sim_inds = arr_sim.argsort()
            sorted_arr = arr_recs[sim_inds]
            top_k = []
            i = 1
            while True and len(top_k) < k and i < k * 2:
                try:
                    user = sorted_arr[i]
                    animelist = sorted(jikan.user(username=user, request='animelist')['anime'], key=by_score,
                                       reverse=True)[:n * 2]
                    top_k.append(user)
                    anime_ids = [anime["mal_id"] for anime in animelist]
                    top_recs.extend(anime_ids)
                except:
                    print("An unexpected API error occured.")  # user might have a private animelist
                i += 1

            recommendations["user"][username] = list(set(top_recs))[:k * n]

        return jsonify({'result': list(set(top_recs))[:k * n]})

    else:
        q = settings["q"]
        if anime_id in item_matrix:
            similarity, anime_id_dict = item_matrix[anime_id]
        else:
            similarity, anime_id_dict = build_item_matrix(anime_id)
            item_matrix[anime_id] = similarity, anime_id_dict  # cache results

        if anime_id in recommendations["item"]:
            return jsonify({'result': recommendations["items"][anime_id]})
        else:
            key_list, val_list = list(anime_id_dict.keys()), list(anime_id_dict.values())
            arr_sim = similarity[anime_id_dict[int(anime_id)]]
            arr_recs = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)
            sim_inds = arr_sim.argsort()
            sorted_arr = arr_recs[sim_inds]
            top_k = sorted_arr[1:q]  # k=10, the top anime is always the anime itself
            recommendations["item"][anime_id] = list(set(top_k.tolist()))

            return jsonify({'result': list(set(top_k.tolist()))})


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
        del anime_list[req["anime_id"]]
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
        del watch_list[req["anime_id"]]
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


def build_item_matrix(anime_id):
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

    return pairwise_distances(train_data_matrix.T, metric='cosine'), anime_id_dict


def build_user_matrix(username):
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

    return pairwise_distances(train_data_matrix, metric='cosine'), username_dict


def by_score(anime):
    return anime["score"]


def main():
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))


if __name__ == "__main__":
    # Only for debugging while developing
    Thread(target=main).start()
