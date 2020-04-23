import numpy as np
from sklearn.metrics.pairwise import pairwise_distances

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from pprint import pprint

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/spreadsheets",
         "https://www.googleapis.com/auth/drive.file",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name("creds.json", scope)
client = gspread.authorize(creds)
review_sheet = client.open("reviews").sheet1
user_data = client.open("animania").sheet1

user_stats = review_sheet.get_all_records()
num_users = user_stats.profile.nunique()
num_animes = user_stats.anime_uid.nunique()

username_dict = dict(zip([val for val in user_stats['profile'].unique()], [i for i, val in enumerate(user_stats['profile'].unique())]))
anime_id_dict = dict(zip([val for val in user_stats['anime_uid'].unique()], [i for i, val in enumerate(user_stats['anime_uid'].unique())]))

# Create user-item matrix
train_data_matrix = np.zeros((num_users, num_animes), dtype='uint8')
for line in user_stats.itertuples():
    train_data_matrix[username_dict[line[1]]-1, anime_id_dict[line[2]]-1] = line[3]

user_similarity = pairwise_distances(train_data_matrix, metric='cosine')
item_similarity = pairwise_distances(train_data_matrix.T, metric='cosine')