"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, record;

    if (request["method"] == "POST") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] == 0) {
        response.writeHead(411, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 411, "heading": "Length Required", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] >= 1024) {
        response.writeHead(413, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 413, "heading": "Payload Too Large", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-type"] == undefined || request["headers"]["content-type"] != "application/json") {
        response.writeHead(415, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 415, "heading": "Unsupported Media Type", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    try {
        request["data"] = await new Promise((resolve, reject) => {
            const timeout = setTimeout(reject, 15000, 408);

            const data = [];

            request.on("data", (chunk) => {
                data.push(chunk);
            });

            request.on("end", () => {
                if (data.reduce((index, element) => { return index + element["length"]; }, 0) == request["headers"]["content-length"]) {
                    resolve(Buffer.concat(data));
                } else {
                    reject(400);
                }
            });
        });
    } catch (error) {
        if (error == 408) {
            response.writeHead(408, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 408, "heading": "Request Timeout", "message": "Something went wrong!" }));

            response.end();

            return;
        } else {
            response.writeHead(400, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

            response.end();

            return;
        }
    }

    try {
        request["json"] = JSON.parse(request["data"]);
    } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["username"] == undefined || /^[0-9a-z][0-9a-z_.]{1,126}[0-9a-z]$/.test(request["json"]["username"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["password"] == undefined || /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,128}$/.test(request["json"]["password"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    account = await new Promise((resolve, reject) => {
        fs.readdir("/home/", (error, content) => {
            return error == null ? resolve(content) : reject(new Error(error["message"]));
        });
    });

    account = await Promise.all(account.map((element, index) => {
        return new Promise((resolve, reject) => {
            fs.readFile("/home/" + element + "/index.json", (error, content) => {
                return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    }));

    account = account.find((element, index) => {
        return element["username"] == request["json"]["username"];
    });

    if (account == undefined) {
        response.writeHead(409, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 409, "heading": "Conflict", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    account["password"]["pass"] = await new Promise((resolve, reject) => {
        crypto.scrypt(request["json"]["password"], account["password"]["salt"], 64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    if (crypto.timingSafeEqual(Buffer.from(account["password"]["hash"], "hex"), Buffer.from(account["password"]["pass"], "hex")) == false) {
        response.writeHead(409, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 409, "heading": "Conflict", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    record = {};

    record["session-id"] = await new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    record["session-ex"] = await new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    record["account-id"] = account["account-id"];

    record["session-type"] = "STANDARD";

    record["session-status"] = "ACTIVE";

    record["created-by"] = record["account-id"];

    record["created-date"] = new Date().toUTCString();

    record["modified-by"] = record["account-id"];

    record["modified-date"] = new Date().toUTCString();

    await new Promise((resolve, reject) => {
        fs.mkdir("/home/" + record["account-id"] + "/sessions/" + record["session-id"] + "/", (error) => {
            return error == null ? resolve() : reject(new Error(error["message"]));
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile("/home/" + record["account-id"] + "/sessions/" + record["session-id"] + "/index.json", JSON.stringify(record, null, 4), (error) => {
            return error == null ? resolve() : reject(new Error(error["message"]));
        });
    });

    response.writeHead(200, { "Authorization": Buffer.from(record["account-id"] + ":" + record["session-id"] + ":" + record["session-ex"]).toString("base64"), "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!" }));

    response.end();
};