global.platform = "service";
require("../screens.js");

screens.include({
    "core": [
        "console",
        "mutex",
        "message",
        "type",
        "file",
        "ref",
        "http",
        "handle",
        "json",
        "string",
        "property",
        "socket",
        "service",
        "util",
        "stream",
        "startup",
        "network",
        "path"
    ],
    "manager": [
        "packet"
    ],
    "storage": [
        "file",
        "data"
    ]
}).then(() => {
    screens.core.startup.run();
    screens.log("Service loading complete");
});

process.on("uncaughtException", (err) => {
    var fs = require("fs");
    var date = new Date();
    // eslint-disable-next-line no-console
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
