importScripts("/packages/code/screens.js?platform=service_worker");

screens.include({
    "core": [
        "*"
    ]
}).then(async () => {
    await screens.core.startup.run();
});
