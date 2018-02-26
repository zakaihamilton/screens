function startBrowser(appName, appArgs) {
    package.include({
        "core": [
            "*"
        ],
        "storage": [
            "*"
        ],
        "user": [
            "*"
        ],
        "content": [
            "*"
        ],
        "ui": [
            "*"
        ],
        "menu": [
            "*"
        ],
        "widget": [
            "*"
        ],
        "kab": [
            "text",
            "letters"
        ],
        "manager": [
            "*"
        ],
        "media": [
            "*"
        ],
        "startup": [
            "*"
        ]
    }, function (info) {
        if (info.failure) {
            console.log("Cannot load " + info.failure.package + "." + info.failure.component);
        } else if (info.progress && info.loaded) {

        }
        if (info.complete) {
            package.core.startup.app = {
                name: appName,
                params: appArgs
            };
            package.core.message.loadWorker("packages/code/platform/client.js");
            package.core.startup.run(() => {
                
            });
        }
    });
}
