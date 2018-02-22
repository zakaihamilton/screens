importScripts("/packages/code/package.js?platform=client");

package.include({
    "core": [
        "console",
        "message",
        "test",
        "type",
        "ref",
        "http",
        "file",
        "handle",
        "json",
        "string",
        "object",
        "property",
        "flow",
        "startup"
    ],
    "app": [
        "main"
    ],
    "kab": [
        "data",
        "diagram",
        "format",
        "search",
        "style",
        "text"
    ]
}, function (info) {
    if (info.complete) {
        package.core.console.log("client loaded");
        package.core.startup.run(() => {
            package.core.message.send_browser("core.startup.run", function() {
                
            });
        });
    }
});
