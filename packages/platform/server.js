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
        "job"
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
