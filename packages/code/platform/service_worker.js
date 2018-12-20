importScripts("/packages/code/screens.js?platform=service_worker");

screens.include({
    "core": [
        "*"
    ],
    "storage": [
        "cache"
    ]
}).then(async () => {
    screens.log("service worker started at: __date__");
    await screens.core.startup.run();
});
