importScripts("/packages/code/screens.js?platform=service_worker");

screens.include({
    "core": [
        "*"
    ],
    "storage": [
        "cache"
    ]
}).then(async () => {
    screens.log("service worker started");
    await screens.core.startup.run();
});
