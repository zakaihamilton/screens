function startBrowser(appName, appArgs) {
    screens.include({
        "core": [
            "*"
        ],
        "lib":[
            "google",
            "jquery",
            "jsgrid"
        ],
        "storage": [
            "*"
        ],
        "db": [
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
    }).then(async () => {
        screens.core.startup.app = {
            name: appName,
            params: appArgs
        };
        await screens.core.message.loadWorker("packages/code/platform/client.js");
        screens.core.startup.run();
    });
}
