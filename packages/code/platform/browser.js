function startBrowser(appName, appArgs) {
    package.include({
        "core": [
            "*"
        ],
        "lib":[
            "googleauth"
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
    }, function () {
        console.log("finished");
        package.core.startup.app = {
            name: appName,
            params: appArgs
        };
        package.core.message.loadWorker("packages/code/platform/client.js");
        package.core.startup.run(() => {
            
        });
    });
}
