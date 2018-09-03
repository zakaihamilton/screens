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
        await screens.core.message.worker.load("packages/code/platform/client.js");
        await screens.core.message.service_worker.load("/service_worker.js");
        screens.core.startup.run();
    });
}
