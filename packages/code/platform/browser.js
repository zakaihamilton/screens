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
        "modal": [
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
    }, async () => {
        screens.core.startup.app = {
            name: appName,
            params: appArgs
        };
        await screens.core.message.loadWorker("packages/code/platform/client.js");
        screens.core.startup.run();
    });
}
