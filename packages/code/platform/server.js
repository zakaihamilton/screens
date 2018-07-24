require("../screens.js");

screens.include({
    "core": [
        "property",
        "console",
        "mutex",
        "file",
        "private",
        "json",
        "http",
        "handle",
        "message",
        "type",
        "ref",
        "module",
        "object",
        "stream",
        "path",
        "util",
        "server",
        "hash",
        "startup",
        "network",
        "socket",
        "service",
        "cache",
        "string",
        "session"
    ],
    "storage": [
        "file",
        "data",
        "db"
    ],
    "user": [
        "verify",
        "profile"
    ],
    "db": [
        "library",
        "shared"
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
}).then(() => {
    screens.core.startup.run();
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
