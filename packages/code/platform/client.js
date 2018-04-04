importScripts("/packages/code/screens.js?platform=client");

screens.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}, async function () {
    await screens.core.startup.run();
});
