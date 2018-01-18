require("../package.js");

package.include({
    "core": [
        "property",
        "console",
        "test",
        "http",
        "message",
        "type",
        "ref",
        "module",
        "script",
        "object",
        "file",
        "private",
        "json",
        "stream",
        "path",
        "util",
        "server",
        "hash",
        "flow"
    ],
    "storage":[
        "file",
        "data"
    ],
    "user": [
        "profile"
    ],
    "manager":[
        "download"
    ],
    "media":[
        "ffmpeg"
    ]
});

package.remote("core.app", "browser");
package.remote("kab.text", "client");
package.remote("kab.term", "client");
package.remote("kab.data", "client");

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});
