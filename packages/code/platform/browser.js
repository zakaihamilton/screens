function startBrowser(appName, appArgs) {
    screens.include({
        "core": [
            "*"
        ],
        "lib": [
            "zoom",
            "interact"
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
        "file": [
            "*"
        ],
        "ui": [
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
            "version",
            "app"
        ]
    }).then(async () => {
        var args = screens.core.string.decode(appArgs);
        if (args) {
            args = JSON.parse(args);
        }
        screens.core.startup.app = {
            name: appName,
            params: args
        };
        await screens.core.message.worker.load("packages/code/platform/client.js");
        await screens.core.message.service_worker.load("/service_worker.js");
        screens.core.startup.run();
    });
}
