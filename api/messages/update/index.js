"use strict";

const crypto = require("crypto");
const fs = require("fs");

/* StartingPoint */
module.exports = async (request, response) => {
    response.writeHead(501, { "Content-Type": "application/json" });

    response.write(JSON.stringify({ "code": 501, "heading": "Not Implemented", "message": "Something went wrong!" }));

    response.end();
};