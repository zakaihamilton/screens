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
            "*"
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
        package.core.startup.app = {
            name: appName,
            params: appArgs
        };
        package.core.message.loadWorker("packages/code/platform/client.js");
        package.core.startup.run(() => {
            
        });
    });
}
