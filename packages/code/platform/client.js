importScripts("/packages/code/screens.js?platform=client");

screens.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}).then(async () => {
    await screens.core.startup.run();
});
