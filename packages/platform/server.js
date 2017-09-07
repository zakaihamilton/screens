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
    ]});

package.remote("core.test", "server");
package.remote("core.file", "server");
package.remote("kab.terms", "client");
