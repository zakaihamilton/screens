importScripts("/packages/code/package.js?platform=client");

package.include({
    "core": [
        "*"
    ],
    "kab": [
        "*"
    ]
}, function () {
    package.core.startup.run(() => {
        package.core.message.workerReady(() => {

        });
    });
});
