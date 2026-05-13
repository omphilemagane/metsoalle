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
            const [headhtml, stylecss, bodyhtml, scriptjs] = await Promise.all([
                new Promise((resolve, reject) => {
                    fs.readFile(__dirname + "/" + stat[i]["pathname"] + "/head.html", (error, content) => {
                        return error == null ? resolve(content) : reject(new Error(error["message"]));
                    });
                }),
                new Promise((resolve, reject) => {
                    fs.readFile(__dirname + "/" + stat[i]["pathname"] + "/style.css", (error, content) => {
                        return error == null ? resolve(content) : reject(new Error(error["message"]));
                    });
                }),
                new Promise((resolve, reject) => {
                    fs.readFile(__dirname + "/" + stat[i]["pathname"] + "/body.html", (error, content) => {
                        return error == null ? resolve(content) : reject(new Error(error["message"]));
                    });
                }),
                new Promise((resolve, reject) => {
                    fs.readFile(__dirname + "/" + stat[i]["pathname"] + "/script.js", (error, content) => {
                        return error == null ? resolve(content) : reject(new Error(error["message"]));
                    });
                })
            ]);

            memo["/" + stat[i]["pathname"]] = {};

            memo["/" + stat[i]["pathname"]]["data"] = Buffer.from(
                "<!DOCTYPE html>" + "\n" +
                "<html>" + "\n" +
                "<head>" + "\n" +
                headhtml.toString() + "\n" +
                "<style>" + "\n" +
                stylecss.toString() + "\n" +
                "</style>" + "\n" +
                "</head>" + "\n" +
                "<body>" + "\n" +
                bodyhtml.toString() + "\n" +
                "<script>" + "\n" +
                scriptjs.toString() + "\n" +
                "</script>" + "\n" +
                "</body>" + "\n" +
                "</html>"
            );

            memo["/" + stat[i]["pathname"]]["mime"] = "text/html";
        }
    }
};

const call = async (request, response) => {
    const endpoint = memo[request["url"]["pathname"]];

    if (request["method"] != "GET") {
        response.writeHead(405, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 405, "heading": "Method Not Allowed", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["pathname"] == "/") {
        request["url"]["pathname"] = "/home";

        response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

        response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["pathname"] == "/favicon.ico") {
        request["url"]["hostname"] = "res.metsoalle.com";

        response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

        response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

        response.end();

        return;
    }

    if (request["url"]["pathname"] == "/robots.txt") {
        response.writeHead(200, { "Content-Type": "text/plain" });

        response.write('User-Agent: *\nDisallow: /\n\nSitemap: https://www.metsoalle.com/sitemap.xml');

        response.end();

        return;
    }

    if (request["url"]["pathname"] == "/sitemap.xml") {
        response.writeHead(200, { "Content-Type": "text/xml" });

        response.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>');

        response.end();

        return;
    }

    if (endpoint == undefined) {
        response.writeHead(404, { "Content-Type": "application/json" });

        response.write(JSON.stringify({ "code": 404, "heading": "Not Found", "message": "Something went wrong!" }));

        response.end();

        return;
    }

    response.writeHead(200, { "Content-Type": endpoint["mime"] });

    response.write(endpoint["data"]);

    response.end();
};

/* StartingPoint */
(() => {
    module.exports = { init, call };
})();