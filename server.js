const express = require("express");
const fs = require("fs");
const app = express();

let whitelist = ["Player1", "Player2"];
let keys = { "ABC123": "Player1" };

app.get("/auth", (req, res) => {
    let username = req.query.user;
    let key = req.query.key;

    if (!whitelist.includes(username)) {
        return res.json({ status: "FAIL", message: "Not whitelisted" });
    }

    if (!keys[key] || keys[key] !== username) {
        return res.json({ status: "FAIL", message: "Invalid key" });
    }

    // Replace with your obfuscated script file
    let script = fs.readFileSync("real_script_obfuscated.lua", "utf8");
    res.json({ status: "OK", code: script });
});

app.listen(3000, () => console.log("Server running on port 3000"));
