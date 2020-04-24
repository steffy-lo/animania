import pandas as pd

import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/spreadsheets",
         "https://www.googleapis.com/auth/drive.file",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name("../creds.json", scope)
client = gspread.authorize(creds)
review_sheet = client.open("reviews").sheet1
user_data = client.open("animania").sheet1

user_stats = pd.DataFrame(review_sheet.get_all_records())

username_dict = dict(zip([val for val in user_stats['profile'].unique()], [i for i, val in enumerate(user_stats['profile'].unique())]))
anime_id_dict = dict(zip([int(val) for val in user_stats['anime_uid'].unique()], [i for i, val in enumerate(user_stats['anime_uid'].unique())]))