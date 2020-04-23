from flask import Flask, jsonify, request, abort, session, redirect, url_for, escape, send_file
from flask_cors import CORS
import os

import numpy as np
from .data import user_similarity, item_similarity, username_dict, anime_id_dict, review_sheet, user_data
import importlib

app = Flask(__name__)
CORS(app)

#====================================== GET METHODS ==================================================
@app.route('/model_recs', methods=["GET"])
def get_model_recommendations():
    req = request.get_json()
    key_list, val_list = list(username_dict.keys()), list(username_dict.values())

    arr_sim = user_similarity[username_dict[req.username]]
    arr_users = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=object)

    sim_inds = arr_sim.argsort()
    sorted_arr_users = arr_users[sim_inds]
    top_k_users = sorted_arr_users[1:11]  # k=10, the top user is always the user itself

    key_list, val_list = list(anime_id_dict.keys()), list(anime_id_dict.values())

    arr_sim = item_similarity[anime_id_dict[2904]]
    arr_animes = np.asarray([key_list[val_list.index(i)] for i in range(len(arr_sim))], dtype=np.int64)

    sim_inds = arr_sim.argsort()
    sorted_arr_animes = arr_animes[sim_inds]
    top_k_animes = sorted_arr_animes[1:11]  # k=10, the top similar anime is always the anime itself

    return jsonify({'top_users': top_k_users, 'top_animes': top_k_animes})

@app.route('/completed', methods=["GET"])
def get_completed():
    req = request.get_json()
    cell = user_data.findall(req.username)[0]
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
    cells = review_sheet.findall(req.anime_id)
    for cell in cells:
        username = review_sheet.row_values(cell.row)[0]
        if req.username == username:
            review_sheet.delete_row(cell.row)

    return jsonify(req)


#====================================== PATCH METHODS =================================================
@app.route('/add_completed', methods=["PATCH"])
def add_completed():
    req = request.get_json()
    row = [req.username, req.anime_id, req.score]
    review_sheet.insert_row(row, 2)

    # modify animania google sheets database
    cell = user_data.findall(req.username)[0]
    anime_list = user_data.cell(cell.row, 2).value
    anime_list[req.anime_id] = req.score
    user_data.update_cell(cell.row, 2, anime_list)

    importlib.reload(user_similarity)
    importlib.reload(item_similarity)

    return jsonify(req)


if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))
