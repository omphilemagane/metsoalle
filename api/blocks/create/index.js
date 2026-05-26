"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, session, sessiex, theuser, record;

    if (request["method"] == "POST") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["searchParams"].has("account-id") == false || /^[0-9a-f]{128}$/.test(request["url"]["searchParams"].get("account-id")) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["authorization"] == undefined || /^[0-9A-z/+=]{515}[=]$/.test(request["headers"]["authorization"]) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] == 0) {
        response.writeHead(411, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 411, "heading": "Length Required", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] != 2) {
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
                return error = null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
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
            return error = null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    try {
        theuser = await new Promise((resolve, reject) => {
            fs.readFile("/home/" + request["url"]["searchParams"].get("account-id") + "/index.json", (error, content) => {
                return error = null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

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

    record = {};

    record["block-id"] = await new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    record["account-id"] = account["account-id"];

    record["foreign-id"] = theuser["account-id"];

    record["block-type"] = "STANDARD";

    record["block-status"] = "ACTIVE";

    record["created-by"] = record["account-id"];

    record["created-date"] = new Date().toUTCString();

    record["modified-by"] = record["account-id"];

    record["modified-date"] = new Date().toUTCString();

    await new Promise((resolve, reject) => {
        fs.mkdir("/home/" + record["account-id"] + "/blocks/" + record["block-id"] + "/", (error) => {
            return error == null ? resolve() : reject(new Error(error["message"]));
        });
    });

    await new Promise((resolve, reject) => {
        fs.writeFile("/home/" + record["account-id"] + "/blocks/" + record["block-id"] + "/index.json", JSON.stringify(record, null, 4), (error) => {
            return error == null ? resolve() : reject(new Error(error["message"]));
        });
    });

    response.writeHead(200, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!" }));

    response.end();
};