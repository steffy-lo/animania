# Anime Recommendation System Project
## Resources
Jikan (Unofficial MAL API), documentation can be found here: https://jikan.docs.apiary.io/#\
Dataset, which will be used for training the model: https://www.kaggle.com/azathoth42/myanimelist

## Algorithm: Matching Users to Recommendations
### User-Based Collaborative Filtering for a Personalized Recommendations List
We want to find a set of similar users and based on what similar users have rated highly or favourited, these will be matched to the user. Similarity will be defined based on cosine similarity.

### Matching to General Trends
- Display a list of anime based on overall ranking or popularity (this can be all fetched through the API)
- Additional refinements include filtering genres and type of anime (i.e., TV series or movie)

## User Profiles
- Email as username
- Can sign in using Google or Facebook (using Firebase authentication)
- Has a "Completed" List and a "To Watch List"
- Completed animes must be rated by a user so that recommendations can be provided
- Settings info

## Main Features
- See the general trends and a personalized recommendation list
- Add watched or to watch anime into "completed" and "to watch" list respectively
- Completed animes, each having a rating (1-10), will be used to train the dataset and predict similar users
- Modify the number of recommendations given in the settings page

## Tech Stack
- Languages: Python, JavaScript, HTML, CSS
- Frameworks: ReactJS (Front-End), Python Flask (Back-End)
- Database: MongoDB
- APIs/Other: JikanAPI, Google Sheets API, Firebase Authentication, Progressive Web App (PWA)
