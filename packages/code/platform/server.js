global.platform = "server";
require("../screens.js");

screens.api = [
    "user.profile.get",
    "user.profile.set",
    "user.verify.match",
    "user.access.appList",
    "user.access.get",
    "user.access.isAPIAllowed",
    "core.cache",
    "core.socket",
    "core.object",
    "core.console",
    "storage.data",
    "storage.file",
    "manager",
    "core.file",
    "db.library",
    "db.shared"
];

screens.apps = [
    "transform",
    "present",
    "profile",
    "theme",
    "login",
    "logger",
    "cache",
    "launcher"
];

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
        "session",
        "object"
    ],
    "storage": [
        "file",
        "data",
        "db"
    ],
    "user": [
        "verify",
        "profile",
        "access",
        "chat",
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
    screens.core.file.alias.set("service_worker.js", "packages/code/platform/service_worker.js");
    screens.core.startup.run();
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
