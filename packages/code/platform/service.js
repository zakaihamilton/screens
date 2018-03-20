global.platform = "service";

require("../package.js");

package.include({
    "core": [
        "console",
        "message",
        "type",
        "file",
        "ref",
        "http",
        "handle",
        "json",
        "string",
        "object",
        "property",
        "flow",
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
    ],
    "startup": [
        "version"
    ]
}, function () {
    package.core.startup.run();
});

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
