"use strict";

const crypto = require("crypto");
const fs = require("fs");

const self = async (request, response, account, session, sessiex) => {
    let record;

    if (request["url"]["searchParams"].has("post-id") == false) {
        record = await new Promise((resolve, reject) => {
            fs.readdir("/home/" + account["account-id"] + "/reports/", (error, content) => {
                return error == null ? resolve(content) : reject(new Error(error["message"]));
            });
        });

        record = await Promise.all(record.map((element, index) => {
            return new Promise((resolve, reject) => {
                fs.readFile("/home/" + account["account-id"] + "/reports/" + element + "/index.json", (error, content) => {
                    return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
                });
            });
        }));

        record = record.map((element, index) => {
            return {
                "report-id": element["report-id"],
                "post-id": element["post-id"],
                "account-id": element["account-id"],
                "post-type": element["post-type"],
                "post-status": element["post-status"],
                "created-by": element["created-by"],
                "created-date": element["created-date"],
                "modified-by": element["modified-by"],
                "modified-date": element["modified-date"]
            };
        });

        response.writeHead(200, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!", record }));

        response.end();
    } else {
        if (request["url"]["searchParams"].has("post-id") == false || /^[0-9a-f]{128}$/.test(request["url"]["searchParams"].get("post-id")) == false) {
            response.writeHead(400, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

            response.end();

            return;
        }

        try {
            await new Promise((resolve, reject) => {
                fs.access("/home/" + account["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/index.json", fs.constants.F_OK, (error) => {
                    return error == null ? resolve() : reject(new Error(error["message"]));
                });
            });
        } catch (error) {
            response.writeHead(400, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

            response.end();

            return;
        }

        record = await new Promise((resolve, reject) => {
            fs.readdir("/home/" + account["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/reports/", (error, content) => {
                return error == null ? resolve(content) : reject(new Error(error["message"]));
            });
        });

        record = await Promise.all(record.map((element, index) => {
            return new Promise((resolve, reject) => {
                fs.readFile("/home/" + account["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/reports/" + element + "/index.json", (error, content) => {
                    return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
                });
            });
        }));

        record = record.map((element, index) => {
            return {
                "report-id": element["report-id"],
                "post-id": element["post-id"],
                "account-id": element["account-id"],
                "post-type": element["post-type"],
                "post-status": element["post-status"],
                "created-by": element["created-by"],
                "created-date": element["created-date"],
                "modified-by": element["modified-by"],
                "modified-date": element["modified-date"]
            };
        });

        response.writeHead(200, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!", record }));

        response.end();
    }
};

const user = async (request, response, account, session, sessiex) => {
    let theuser, record;

    if (request["url"]["searchParams"].has("post-id") == false || /^[0-9a-f]{128}$/.test(request["url"]["searchParams"].get("post-id")) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["searchParams"].has("account-id") == false || /^[0-9a-f]{128}$/.test(request["url"]["searchParams"].get("account-id")) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    try {
        theuser = await new Promise((resolve, reject) => {
            fs.readFile("/home/" + request["url"]["searchParams"].get("account-id") + "/index.json", (error, content) => {
                return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    try {
        await new Promise((resolve, reject) => {
            fs.access("/home/" + theuser["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/index.json", fs.constants.F_OK, (error) => {
                return error == null ? resolve() : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    record = await new Promise((resolve, reject) => {
        fs.readdir("/home/" + theuser["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/reports/", (error, content) => {
            return error == null ? resolve(content) : reject(new Error(error["message"]));
        });
    });

    record = await Promise.all(record.map((element, index) => {
        return new Promise((resolve, reject) => {
            fs.readFile("/home/" + theuser["account-id"] + "/posts/" + request["url"]["searchParams"].get("post-id") + "/reports/" + element + "/index.json", (error, content) => {
                return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    }));

    record = record.map((element, index) => {
        return {
            "report-id": element["report-id"],
            "post-id": element["post-id"],
            "account-id": element["account-id"],
            "post-type": element["post-type"],
            "post-status": element["post-status"],
            "created-by": element["created-by"],
            "created-date": element["created-date"],
            "modified-by": element["modified-by"],
            "modified-date": element["modified-date"]
        };
    });

    response.writeHead(200, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!", record }));

    response.end();
};

/* StartingPoint */
module.exports = async (request, response) => {
    let account, session, sessiex;

    if (request["method"] != "GET") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["authorization"] == undefined || /^[0-9A-z/+=]{515}[=]$/.test(request["headers"]["authorization"]) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    [account, session, sessiex] = Buffer.from(request["headers"]["authorization"], "base64").toString().split(":");

    if (/^[0-9a-f]{128}$/.test(account) == false || /^[0-9a-f]{128}$/.test(session) == false || /^[0-9a-f]{128}$/.test(sessiex) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    try {
        session = await new Promise((resolve, reject) => {
            fs.readFile("/home/" + account + "/sessions/" + session + "/index.json", (error, content) => {
                return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (crypto.timingSafeEqual(Buffer.from(session["session-ex"], "hex"), Buffer.from(sessiex, "hex")) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    account = await new Promise((resolve, reject) => {
        fs.readFile("/home/" + account + "/index.json", (error, content) => {
            return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    if (request["url"]["searchParams"].has("account-id") == false) {
        await self(request, response, account, session, sessiex);
    } else {
        await user(request, response, account, session, sessiex);
    }
};