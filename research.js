const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const { URL } = require("url");
const {
    environmentalScripts
} = require("../../config/config");

// Only these hosts may be fetched server-side; anything else is rejected so an
// attacker-supplied `url` cannot reach internal/metadata/loopback endpoints.
const ALLOWED_HOSTS = new Set([
    "finance.yahoo.com"
]);

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const url = String(req.query.url) + String(req.query.symbol);

            let parsedUrl;
            try {
                parsedUrl = new URL(url);
            } catch (parseError) {
                parsedUrl = null;
            }

            if (!parsedUrl ||
                (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") ||
                !ALLOWED_HOSTS.has(parsedUrl.hostname)) {
                res.writeHead(400, {
                    "Content-Type": "text/html"
                });
                res.write("<h1>The requested research URL is not allowed.</h1>\n");
                return res.end();
            }

            return needle.get(parsedUrl.href, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(body);
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
