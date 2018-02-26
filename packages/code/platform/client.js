importScripts("/packages/code/package.js?platform=client");

package.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}, function (info) {
    if (info.complete) {
        package.core.console.log("client loaded");
        package.core.startup.run(() => {
            package.core.message.workerReady(() => {

            });
        });
    }
});
