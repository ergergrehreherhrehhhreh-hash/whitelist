const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const btoa = str => Buffer.from(str, "utf8").toString("base64");

// Whitelist + key storage
let whitelist = ["Player1", "Player2"];
let keys = { "ABC123": "Player1" };

// Token storage
let activeTokens = {}; // token: { user, expires, used }

// Homepage
app.get("/", (req, res) => {
    res.send(`
        <h1>Whitelist Server ✅</h1>
        <p>To authenticate, use:</p>
        <code>/auth?user=USERNAME&key=YOURKEY</code>
        <p>Then request your code with:</p>
        <code>/code?token=TOKEN</code>
    `);
});

// Auth route → generate token
app.get("/auth", (req, res) => {
    let username = req.query.user;
    let key = req.query.key;

    if (!whitelist.includes(username)) {
        return res.json({ status: "FAIL", message: "Not whitelisted" });
    }

    if (!keys[key] || keys[key] !== username) {
        return res.json({ status: "FAIL", message: "Invalid key" });
    }

    // Create token that lasts 200 days
    let token = crypto.randomBytes(8).toString("hex");
    let expiresInMs = 200 * 24 * 60 * 60 * 1000;
    activeTokens[token] = { user: username, expires: Date.now() + expiresInMs, used: false };

    res.json({ status: "OK", token: token, expires: new Date(Date.now() + expiresInMs).toISOString() });
});

// Code route → returns encoded script
app.get("/code", (req, res) => {
    let token = req.query.token;

    if (!activeTokens[token]) {
        return res.json({ status: "FAIL", message: "Invalid or expired token" });
    }

    let tokenData = activeTokens[token];

    if (tokenData.used) {
        return res.json({ status: "FAIL", message: "Token already used" });
    }

    if (Date.now() > tokenData.expires) {
        delete activeTokens[token];
        return res.json({ status: "FAIL", message: "Token expired" });
    }

    try {
        let script = fs.readFileSync("real_script_obfuscated.lua", "utf8");
        let encodedScript = btoa(script);
        tokenData.used = true; // delete after first fetch
        delete activeTokens[token]; // hard delete token after use
        res.json({ status: "OK", code: encodedScript });
    } catch (err) {
        res.json({ status: "FAIL", message: "Script not found" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
