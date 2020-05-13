import axios from "axios";

/* For local debugging set to 1 */
const DEBUG = 0;

/* Debug variables.*/
const PREFIX = DEBUG ? "http://localhost:80" : "";

export const patchSettings = (username, values) => {
    values.username = username;
    return new Promise((resolve, reject) => {
        axios
            .patch(
                PREFIX + "/settings", JSON.stringify(values),
            { headers: { "Content-Type": "application/json" } }
            )
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