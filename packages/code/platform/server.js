require("../screens.js");

screens.include({
    "core": [
        "property",
        "console",
        "file",
        "private",
        "json",
        "http",
        "handle",
        "message",
        "type",
        "ref",
        "module",
        "script",
        "object",
        "stream",
        "path",
        "util",
        "server",
        "hash",
        "flow",
        "startup",
        "network",
        "service",
        "cache"
    ],
    "storage": [
        "file",
        "data",
        "db"
    ],
    "user": [
        "verify"
    ],
    "db": [
        "passage"
    ],
    "manager": [
        "download",
        "packet",
        "service"
    ],
    "media": [
        "ffmpeg",
        "hls"
    ],
    "startup": [
        "version"
    ],
    "lib": [
        "zlib"
    ]
}, function () {
    screens.core.startup.run();
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
