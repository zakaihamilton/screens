importScripts("/packages/code/screens.js?platform=service_worker");

screens.include({
    "core": [
        "*"
    ],
    "storage":[
        "cache"
    ]
}).then(async () => {
    await screens.core.startup.run();
});

