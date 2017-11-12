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
        "job",
        "object",
        "file",
        "private",
        "json",
        "media",
        "path"
    ],
    "storage":[
        "remote"
    ]
});

package.remote("core.test", "server");
package.remote("core.file", "server");
package.remote("storage.remote", "server");
package.remote("core.app", "browser");
package.remote("kab.text", "client");
package.remote("kab.term", "client");
package.remote("kab.data", "client");

process.on('uncaughtException', (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("error: " + date.toUTCString() + " = " + err.message);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + " = " + err.message);
});
