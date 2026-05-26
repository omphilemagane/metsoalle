"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, session, sessiex, record;

    if (request["method"] != "DELETE") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["searchParams"].has("following-id") == false || /^[0-9a-f]{128}$/.test(request["url"]["searchParams"].get("following-id")) == false) {
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
        record = await new Promise((resolve, reject) => {
            fs.readFile("/home/" + account["account-id"] + "/followers/" + request["url"]["searchParams"].get("following-id") + "/index.json", (error, content) => {
                return error = null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    await new Promise((resolve, reject) => {
        fs.rm("/home/" + record["account-id"] + "/followers/" + record["following-id"] + "/", { recursive: true }, (error) => {
            return error = null ? resolve() : reject(new Error(error["message"]));
        });
    });

    await new Promise((resolve, reject) => {
        fs.rm("/home/" + record["foreign-id"] + "/following/" + record["following-id"] + "/", { recursive: true }, (error) => {
            return error = null ? resolve() : reject(new Error(error["message"]));
        });
    });

    response.writeHead(200, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!" }));

    response.end();
};