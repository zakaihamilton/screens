function startBrowser(appName, appArgs) {
    screens.include({
        "core": [
            "*"
        ],
        "lib":[
            "google"
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
            "*"
        ],
        "manager": [
            "*"
        ],
        "media": [
            "*"
        ],
        "startup": [
            "app"
        ]
    }, function () {
        screens.core.startup.app = {
            name: appName,
            params: appArgs
        };
        screens.core.message.loadWorker("packages/code/platform/client.js");
        screens.core.startup.run(() => {
            
        });
    });
}
