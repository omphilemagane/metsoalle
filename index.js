"use strict";

const cluster = require("cluster");
const https = require("https");
const http = require("http");
const os = require("os");
const fs = require("fs");

const memo = {
    "api.metsoalle.com": require(__dirname + "/api/"),
    "app.metsoalle.com": require(__dirname + "/app/"),
    "res.metsoalle.com": require(__dirname + "/res/"),
    "www.metsoalle.com": require(__dirname + "/www/")
};

const init = async () => {
    cluster.on("exit", () => {
        cluster.fork();
    });

    for (let i = 0; i < os.availableParallelism(); i++) {
        cluster.fork();
    }
};

const call = async () => {
    {
        const server = http.createServer();

        server.on("listening", () => {
            console.log(process["pid"] + ": It seems as if that the server is currently listening on " + server["_connectionKey"]);
        });

        server.on("request", (request, response) => {
            request["url"] = new URL("http://" + request["headers"]["host"] + request["url"]);

            request["url"]["protocol"] = "https:";

            response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

            response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

            response.end();
        });

        server.listen(80);
    }

    {
        const server = https.createServer();

        server.on("listening", () => {
            console.log(process["pid"] + ": It seems as if that the server is currently listening on " + server["_connectionKey"]);
        });

        server.on("request", (request, response) => {
            request["url"] = new URL("https://" + request["headers"]["host"] + request["url"]);

            {
                const endpoint = memo[request["url"]["hostname"]];

                if (request["url"]["pathname"] != "/" && request["url"]["pathname"].slice(-1) == "/") {
                    request["url"]["pathname"] = request["url"]["pathname"].slice(0, -1);

                    response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

                    response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

                    response.end();

                    return;
                }

                if (request["url"]["hostname"] == "metsoalle.com") {
                    request["url"]["hostname"] = "www.metsoalle.com";

                    response.writeHead(308, { "Content-Type": "application/json", "Location": request["url"]["href"] });

                    response.write(JSON.stringify({ "code": 308, "heading": "Permanent Redirect", "message": "Nothing went wrong!" }));

                    response.end();

                    return;
                }

                if (endpoint == undefined) {
                    response.writeHead(400, { "Content-Type": "application/json" });

                    response.write(JSON.stringify({ "code": 400, "heading": "Bad Request", "message": "Something went wrong!" }));

                    response.end();

                    return;
                }

                endpoint.call(request, response).catch((error) => {
                    if (response["headersSent"] == false) {
                        response.writeHead(500, { "Content-Type": "application/json" });

                        response.write(JSON.stringify({ "code": 500, "heading": "Internal Server Error", "message": "Something went wrong!" }));

                        response.end();
                    }

                    console.error(error);
                });
            }
        });

        await Promise.all(Object.values(memo).map((element, index) => {
            return element.init();
        }));

        server.setSecureContext({
            "cert": await new Promise((resolve, reject) => {
                fs.readFile("/etc/ssl/certs/com.metsoalle.crt", (error, content) => {
                    return error == null ? resolve(content) : reject(new Error(error["message"]));
                });
            }),
            "key": await new Promise((resolve, reject) => {
                fs.readFile("/etc/ssl/private/com.metsoalle.key", (error, content) => {
                    return error == null ? resolve(content) : reject(new Error(error["message"]));
                });
            })
        });

        server.listen(443);
    }
};

/* StartingPoint */
(() => {
    if (cluster["isPrimary"] == true) {
        init().catch(console.error);
    } else {
        call().catch(console.error);
    }
})();