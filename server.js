const express = require("express");
const fs = require("fs");
const app = express();

// Whitelist + keys
let whitelist = ["Player1", "Player2"];
let keys = { "ABC123": "Player1" };

// Homepage route
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Whitelist Server</title>
            <style>
                body { font-family: Arial, sans-serif; background: #1a1a1a; color: #f0f0f0; text-align: center; padding: 50px; }
                h1 { color: #00ff88; }
                code { background: #333; padding: 4px 8px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>Whitelist Server is Running ✅</h1>
            <p>To authenticate, use:</p>
            <code>/auth?user=USERNAME&key=YOURKEY</code>
            <p>Example: <a href="/auth?user=Player1&key=ABC123" style="color:#00ff88;">Click here</a></p>
        </body>
        </html>
    `);
});

// Auth route
app.get("/auth", (req, res) => {
    let username = req.query.user;
    let key = req.query.key;

    if (!whitelist.includes(username)) {
        return res.json({ status: "FAIL", message: "Not whitelisted" });
    }

    if (!keys[key] || keys[key] !== username) {
        return res.json({ status: "FAIL", message: "Invalid key" });
    }

    try {
        let script = fs.readFileSync("real_script_obfuscated.lua", "utf8");
        res.json({ status: "OK", code: script });
    } catch (err) {
        res.json({ status: "FAIL", message: "Script not found" });
    }
});

// Port for Render
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));
