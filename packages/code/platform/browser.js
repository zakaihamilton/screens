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
            "app",
            "version"
        ]
    }, function (info) {
        if (info.failure) {
            console.log("Cannot load " + info.failure.package + "." + info.failure.component);
        } else if (info.progress && info.loaded) {

        }
        if (info.complete) {
            var app = package.startup.app;
            app.appArgs = appArgs;
            app.appName = appName;
            package.core.message.loadWorker("packages/code/platform/client.js");
            package.core.startup.run(() => {
                
            });
        }
    });
}
