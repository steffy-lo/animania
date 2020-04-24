from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from threading import Thread
import os

from main.server.data import username_dict, anime_id_dict, review_sheet, user_data

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import pairwise_distances
similarity_matrix = {"user": None, "item": None}
recommendations = {"users": [], "items": [], "cached_users": False, "cached_items": False}
user_matrix_t = None
item_matrix_t = None

app = Flask("animania")
CORS(app)

#====================================== GET METHODS ==================================================
@app.route('/model_recs', methods=["GET"])
def get_model_recommendations():
    req = request.get_json()
    if "type" not in req:
        abort(400)

    if req["type"] == "user":
        if "username" not in req:
            abort(400)
    elif req["type"] == "item":
        if "anime_id" not in req:
            abort(400)
    else:
        abort(400)

    if similarity_matrix[req["type"]] is not None:
        similarity = similarity_matrix[req["type"]]
        if req["type"] == "user":
            if recommendations["cached_users"]:
                return jsonify({'top_recs': recommendations["users"]})
            key_list, val_list = list(username_dict.keys()), list(username_dict.values())
            arr_sim = similarity[username_dict[req["username"]]]
        else:
            if recommendations["cached_items"]:
                return jsonify({'top_recs': recommendations["items"]})
            key_list, val_list = list(anime_id_dict.keys()), list(anime_id_dict.values())
            arr_sim = similarity[anime_id_dict[req["anime_id"]]]

        arr_recs = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)

        sim_inds = arr_sim.argsort()
        sorted_arr = arr_recs[sim_inds]
        top_k = sorted_arr[1:11]  # k=10, the top user is always the user itself

        if req["type"] == "user":
            recommendations["users"] = top_k.tolist()  # cache results
            recommendations["cached_users"] = True
        else:
            recommendations["items"] = top_k.tolist()  # cache results
            recommendations["cached_items"] = True

        return jsonify({'top_recs': top_k.tolist()})

    return jsonify({'top_recs': []})

@app.route('/completed', methods=["GET"])
def get_completed():
    req = request.get_json()
    if "username" not in req:
        abort(400)
    cell = user_data.findall(req["username"])[0]
    anime_list = user_data.cell(cell.row, 2).value

    return jsonify(anime_list)


#====================================== POST METHODS =================================================
@app.route('/add_user/<username>', methods=["POST"])
def add_user(username):
    row = [username, {}]
    user_data.insert_row(row, 2)

    return jsonify(row)


#====================================== DELETE METHODS ================================================
@app.route('/del_completed', methods=["DELETE"])
def del_completed():
    req = request.get_json()
    if "anime_id" not in req:
        abort(400)
    cells = review_sheet.findall(req["anime_id"])
    for cell in cells:
        username = review_sheet.row_values(cell.row)[0]
        if req.username == username:
            review_sheet.delete_row(cell.row)

    return jsonify(req)


#====================================== PATCH METHODS =================================================
@app.route('/add_completed', methods=["PATCH"])
def add_completed():
    req = request.get_json()
    for key in ["username", "anime_id", "score"]:
        if key not in req:
            abort(400)

    row = [req["username"], req["anime_id"], req["score"]]
    review_sheet.insert_row(row, 2)

    # modify animania google sheets database
    cell = user_data.findall(req["username"])[0]
    anime_list = user_data.cell(cell.row, 2).value
    anime_list[req["anime_id"]] = req["score"]
    user_data.update_cell(cell.row, 2, anime_list)

    if user_matrix_t is not None and user_matrix_t.is_alive():
        user_matrix_t.join()
    if item_matrix_t is not None and item_matrix_t.is_alive():
        item_matrix_t.join()

    training.join()
    training.start()  # retrain

    return jsonify(req)


def get_user_matrix(train_data_matrix):
    similarity_matrix["user"] = pairwise_distances(train_data_matrix, metric='cosine')
    print(similarity_matrix["user"])


def get_item_matrix(train_data_matrix):
    similarity_matrix["item"] = pairwise_distances(train_data_matrix.T, metric='cosine')
    print(similarity_matrix["item"])


def train():
    # Create user-item matrix
    recommendations["cached_items"] = False
    recommendations["cached_users"] = False
    user_stats = pd.DataFrame(review_sheet.get_all_records())
    num_users = user_stats.profile.nunique()
    num_animes = user_stats.anime_uid.nunique()

    train_data_matrix = np.zeros((num_users, num_animes), dtype='uint8')
    for line in user_stats.itertuples():
        train_data_matrix[username_dict[line[1]] - 1, anime_id_dict[line[2]] - 1] = line[3]

    global user_matrix_t
    user_matrix_t = Thread(target=get_user_matrix, args=(train_data_matrix,))
    user_matrix_t.start()
    global item_matrix_t
    item_matrix_t = Thread(target=get_item_matrix, args=(train_data_matrix,))
    item_matrix_t.start()


def main():
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))


if __name__ == "__main__":
    # Only for debugging while developing
    Thread(target=main).start()
    training = Thread(target=train)
    training.start()
