"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    let account, session, sessiex, record;

    if (request["method"] != "PUT") {
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

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] == 0) {
        response.writeHead(411, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 411, "heading": "Length Required", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["headers"]["content-length"] == undefined || request["headers"]["content-length"] >= 1049600) {
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

    if (request["json"]["profile-picture"] == undefined || /^(|data\:image\/png\;base64\,[0-9A-z/+=]{1024,1048576})$/.test(request["json"]["profile-picture"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["full-name"] == undefined || /^(?!\s).{1,128}(?<!\s)$/.test(request["json"]["full-name"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["date-of-birth"] == undefined || /^[\d]{4}[-][\d]{2}[-][\d]{2}$/.test(request["json"]["date-of-birth"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["country-code"] == undefined || /^[+][\d]{1,6}$/.test(request["json"]["country-code"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["phone-number"] == undefined || /^[\d]{6,18}$/.test(request["json"]["phone-number"]) == false) {
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

    if (request["json"]["password"] == undefined || /^(|(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,128})$/.test(request["json"]["password"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["account-type"] == undefined || /^(PUBLIC|PRIVATE)$/.test(request["json"]["account-type"]) == false) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    request["json"]["phone-number"] = request["json"]["phone-number"][0] == "0" ? request["json"]["phone-number"].slice(1) : request["json"]["phone-number"];

    if (request["json"]["date-of-birth"] != account["date-of-birth"]) {
        response.writeHead(400, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["json"]["username"] != account["username"]) {
        record = await new Promise((resolve, reject) => {
            fs.readdir("/home/", (error, content) => {
                return error == null ? resolve(content) : reject(new Error(error["message"]));
            });
        });

        record = await Promise.all(record.map((element, index) => {
            return new Promise((resolve, reject) => {
                fs.readFile("/home/" + element + "/index.json", (error, content) => {
                    return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
                });
            });
        }));

        record = record.find((element, index) => {
            return element["username"] == request["json"]["username"];
        });

        if (record != undefined) {
            response.writeHead(409, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 409, "heading": "Conflict", "message": "Something went wrong!" }));

            response.end();

            return;
        }
    }

    record = await new Promise((resolve, reject) => {
        fs.writeFile("/home/" + account["account-id"] + "/index.json", (error, content) => {
            return error == null ? resolve(JSON.parse(content)) : reject(new Error(error["message"]));
        });
    });

    record["profile-picture"] = request["json"]["profile-picture"];

    record["full-name"] = request["json"]["full-name"];

    record["date-of-birth"] = request["json"]["date-of-birth"];

    record["country-code"] = request["json"]["country-code"];

    record["phone-number"] = request["json"]["phone-number"];

    record["username"] = request["json"]["username"];

    if (request["json"]["password"] != "") {
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
    }

    record["account-type"] = request["json"]["account-type"];

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