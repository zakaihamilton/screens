require("../package.js");

package.include({
    "core": [
        "property",
        "console",
        "test",
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
        "data"
    ],
    "user": [
        "profile"
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
}, function (info) {
    if (info.complete) {
        package.core.console.log("server loaded");
        package.core.startup.run();
    }
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
