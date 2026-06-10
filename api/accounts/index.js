"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, session, sessiex, theuser, record;

    if (request["method"] != "GET") {
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

    if (session["session-status"] != "ACTIVE") {
        response.writeHead(403, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 403, "heading": "Forbidden", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    account = await new Promise((resolve, reject) => {
        fs.readFile("/home/" + account + "/index.json", (error, content) => {
            return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    if (account["account-status"] != "ACTIVE") {
        response.writeHead(403, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 403, "heading": "Forbidden", "message": "Something went wrong!" }));

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

    record = await new Promise((resolve, reject) => {
        fs.readFile("/home/" + theuser["account-id"] + "/index.json", (error, content) => {
            return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    response.writeHead(200, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!", record }));

    response.end();
};