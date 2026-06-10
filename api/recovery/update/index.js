"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, recover, recovex, record;

    if (request["method"] != "PATCH") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["searchParams"].has("authorization") == false || /^[0-9A-z/+=]{515}[=]$/.test(request["url"]["searchParams"].get("authorization")) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

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

    [account, recover, recovex] = Buffer.from(request["url"]["searchParams"].get("authorization"), "base64").toString().split(":");

    if (/^[0-9a-f]{128}$/.test(account) == false || /^[0-9a-f]{128}$/.test(recover) == false || /^[0-9a-f]{128}$/.test(recovex) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    try {
        recover = await new Promise((resolve, reject) => {
            fs.readFile("/home/" + account + "/recovery/" + recover + "/index.json", (error, content) => {
                return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
            });
        });
    } catch (error) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (crypto.timingSafeEqual(Buffer.from(recover["recovery-ex"], "hex"), Buffer.from(recovex, "hex")) == false) {
        response.writeHead(401, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 401, "heading": "Unauthorized", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (new Date(recover["created-date"]).getTime() <= new Date().getTime() - 300000) {
        await new Promise((resolve, reject) => {
            fs.rm("/home/" + account + "/recovery/" + recover["recovery-id"] + "/", { recursive: true }, (error) => {
                return error == null ? resolve() : reject(new Error(error["message"]));
            });
        });

        response.writeHead(403, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 403, "heading": "Forbidden", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (recover["recovery-status"] != "ACTIVE") {
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

    if (request["json"]["password"] == undefined || /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,128}$/.test(request["json"]["password"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    record = await new Promise((resolve, reject) => {
        fs.readFile("/home/" + account["account-id"] + "/index.json", (error, content) => {
            return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    record["password"] = {};

    record["password"]["salt"] = await new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    record["password"]["hash"] = await new Promise((resolve, reject) => {
        crypto.scrypt(request["json"]["password"], record["password"]["salt"], 64, (error, content) => {
            return error == null ? resolve(content.toString("hex")) : reject(new Error(error["message"]));
        });
    });

    record["modified-by"] = record["account-id"];

    record["modified-date"] = new Date().toUTCString();

    await new Promise((resolve, reject) => {
        fs.writeFile("/home/" + record["account-id"] + "/index.json", JSON.stringify(record, null, 4), (error) => {
            return error == null ? resolve() : reject(new Error(error["message"]));
        });
    });

    response.writeHead(200, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 200, "heading": "OK", "message": "Nothing went wrong!" }));

    response.end();
};