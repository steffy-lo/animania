import axios from "axios";

/* For local debugging set to 1 */
const DEBUG = 1;

/* Debug variables.*/
const PREFIX = DEBUG ? "http://localhost:80" : "";

export const getRecommendations = (username, type) => {
    return new Promise((resolve, reject) => {
        axios
            .get(
                PREFIX + "/model_recs?username=" + username + "&type=user",
                { params: JSON.stringify({ username, type }) }
            )
            .then(res => {
                if (!res || !res.data)
                    reject({ stat: 500, msg: "Something went wrong" });
                resolve(res.data.result);
            })
            .catch(err => {
                    reject({
                        stat: err.response.status,
                        msg:
                            "There was an error processing your request. Please, try again later."
                    });
            });
    });
};

export const makeRequest = (method, url, data) => {
    return new Promise(function (resolve, reject) {
        var counter = 0;
        const tryRequest = () => {
            counter++;
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                if (counter > 5) {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                } else {
                    setTimeout(()=>{
                        tryRequest()
                    }, (Math.floor(Math.random() * 60) + 2) * 1000);
                }
            };
            if (method === "POST" && data) {
                xhr.send(data);
            } else {
                xhr.send();
            }
        };
        tryRequest()
    });
};

export const getUser = (username) => {
    return new Promise((resolve, reject) => {
        axios
            .get(PREFIX + "/get_user/" + username)
            .then(res => {
                if (!res || !res.data)
                    reject({ stat: 500, msg: "Something went wrong" });
                resolve(res.data.result);
            })
            .catch(err => {
                reject({
                    stat: err.response.status,
                    msg:
                        "There was an error processing your request. Please, try again later."
                });
            });
    });
};

export const addUser = (username) => {
    return new Promise((resolve, reject) => {
        axios
            .post(PREFIX + "/add_user/" + username)
            .then(res => {
                if (!res || !res.data)
                    reject({ stat: 500, msg: "Something went wrong" });
                resolve(res.data.result);
            })
            .catch(err => {
                reject({
                    stat: err.response.status,
                    msg:
                        "There was an error processing your request. Please, try again later."
                });
            });
    });
};

export const addCompleted = (username, anime_id, score) => {
    return new Promise((resolve, reject) => {
        axios
            .patch(PREFIX + "/add_completed", JSON.stringify({ username, anime_id, score }),
                { headers: { "Content-Type": "application/json" } })
            .then(res => {
                if (!res || !res.data)
                    reject({ stat: 500, msg: "Something went wrong" });
                resolve(res.data);
            })
            .catch(err => {
                reject({
                    stat: err.response.status,
                    msg:
                        "There was an error processing your request. Please, try again later."
                });
            });
    });
};

export const removeFromWatch = (username, anime_id) => {
    return new Promise((resolve, reject) => {
        axios
            .delete(PREFIX + "/del_to_watch", {data: { username, anime_id }},
                { headers: { "Content-Type": "application/json" } })
            .then(res => {
                if (!res || !res.data)
                    reject({ stat: 500, msg: "Something went wrong" });
                resolve(res.data);
            })
            .catch(err => {
                reject({
                    stat: err.response.status,
                    msg:
                        "There was an error processing your request. Please, try again later."
                });
            });
    });
};