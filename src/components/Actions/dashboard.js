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
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        if(method=="POST" && data){
            xhr.send(data);
        }else{
            xhr.send();
        }
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