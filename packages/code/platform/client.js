importScripts("/packages/code/screens.js?platform=client");

screens.include({
    "core": [
        "*"
    ],
    "ui": [
        "html"
    ],
    "db": [
        "shared",
        "commentary"
    ],
    "kab": [
        "*"
    ]
}).then(async () => {
    await screens.core.startup.run();
});
