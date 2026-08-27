// default app configuration
const crypto = require("crypto");

const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

// Generate secure random secrets if not provided via environment variables
const cookieSecret = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString("hex");
const cryptoKey = process.env.CRYPTO_KEY || crypto.randomBytes(16).toString("hex");

module.exports = {
    port,
    db,
    cookieSecret,
    cryptoKey,
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

