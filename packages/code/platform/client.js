importScripts("/packages/code/package.js?platform=client");

package.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}, function (info) {
    package.core.console.log("client loaded");
    package.core.startup.run(() => {
        package.core.message.workerReady(() => {

        });
    });
});
