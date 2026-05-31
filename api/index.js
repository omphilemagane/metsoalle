"use strict";

const fs = require("fs");

const memo = {};

const init = async () => {
    const readdir = await new Promise((resolve, reject) => {
        fs.readdir(__dirname + "/", { recursive: true }, (error, content) => {
            return error == null ? resolve(content.filter((element, index) => { return element != "index.js"; })) : reject(new Error(error["message"]));
        });
    });

    const stat = await Promise.all(readdir.map((element, index) => {
        return new Promise((resolve, reject) => {
            fs.stat(__dirname + "/" + element, (error, content) => {
                return error == null ? resolve(Object.assign(content, { pathname: element })) : reject(new Error(error["message"]));
            });
        })
    }));

    for (let i = 0; i < stat["length"]; i++) {
        if (stat[i].isDirectory() == true) {
            memo["/" + stat[i]["pathname"]] = require(__dirname + "/" + stat[i]["pathname"] + "/");
        }
    }
};

const call = async (request, response) => {
    const endpoint = memo[request["url"]["pathname"]];

    if (request["url"]["pathname"] == "/favicon.ico") {
        request["url"]["hostname"] = "res.metsoalle.com";

        response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

        response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["pathname"] == "/robots.txt") {
        if (request["method"] != "GET") {
            response.writeHead(405, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

            response.end();

            return;
        } else {
            response.writeHead(200, { "Content-Type": "text/plain" });

            response.write('User-Agent: *\nDisallow: /\n\nSitemap: https://api.metsoalle.com/sitemap.xml');

            response.end();

            return;
        }
    }

    if (request["url"]["pathname"] == "/sitemap.xml") {
        if (request["method"] != "GET") {
            response.writeHead(405, { "Content-Type": "application/json" });

            response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

            response.end();

            return;
        } else {
            response.writeHead(200, { "Content-Type": "text/xml" });

            response.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>');

            response.end();

            return;
        }
    }

    if (request["headers"]["origin"] != undefined && /^https\:\/\/[a-z]{3}\.metsoalle\.com$/.test(request["headers"]["origin"]) == true) {
        response.setHeader("Access-Control-Allow-Credentials", "true");

        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS, DELETE");

        response.setHeader("Access-Control-Allow-Origin", request["headers"]["origin"]);

        response.setHeader("Access-Control-Expose-Headers", "Authorization, Content-Type");
    }

    if (request["method"] == "OPTIONS") {
        response.writeHead(204);

        response.end();

        return;
    }

    if (endpoint == undefined) {
        response.writeHead(404, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 404, "heading": "Not Found", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    await endpoint(request, response);
};

/* StartingPoint */
(() => {
    module.exports = { init, call };
})();