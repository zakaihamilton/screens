global.platform = "server";
require("../screens.js");

screens.admins = [
    "Zakai Hamilton",
    "Yochanan Mariano Perez"
];

screens.api = [
    "user.profile.get",
    "user.profile.set",
    "user.verify.match",
    "user.verify.heartbeat",
    "user.access.userId",
    "user.access.admin",
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
    "db.shared",
    "db.commentary",
    "media.file",
    "lib.zoom.meetingInfo",
    "lib.zoom.participants"
];

screens.apps = [
    "transform",
    "present",
    "profile",
    "theme",
    "login",
    "logger",
    "cache",
    "launcher",
    "diagram",
    "letters",
    "keyboard",
    "tasks",
    "prism",
    "table",
    "notes",
    "links",
    "visualize"
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
        "object",
        "task",
        "pack"
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
        "shared",
        "commentary"
    ],
    "manager": [
        "download",
        "packet",
        "service",
        "content",
        "event",
        "schedule"
    ],
    "media": [
        "ffmpeg",
        "hls",
        "file",
        "speech"
    ],
    "startup": [
        "version"
    ],
    "lib": [
        "zlib",
        "zoom"
    ]
}).then(() => {
    screens.core.file.alias.set("service_worker.js", "packages/code/platform/service_worker.js");
    screens.core.file.alias.set("eve.js", "external/eve.min.js");
    screens.core.startup.run();
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
