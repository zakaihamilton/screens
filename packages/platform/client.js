importScripts("/packages/package.js?platform=client");

package.include({
    "core": [
        "console",
        "message",
        "test",
        "type",
        "ref",
        "http",
        "handle",
        "json",
        "string"
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
    ]});
