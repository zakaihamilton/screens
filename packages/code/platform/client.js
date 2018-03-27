importScripts("/packages/code/screens.js?platform=client");

screens.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}, function () {
    screens.core.startup.run(() => {
        screens.core.message.workerReady(() => {

        });
    });
});
