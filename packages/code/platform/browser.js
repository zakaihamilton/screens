function startBrowser(appName, appArgs) {
    package.include({
        "core": [
            "*"
        ],
        "lib":[
            "moment"
        ],
        "storage": [
            "cache",
            "file",
            "data"
        ],
        "user": [
            "profile"
        ],
        "content": [
            "text"
        ],
        "ui": [
            "*"
        ],
        "menu": [
            "context"
        ],
        "widget": [
            "*"
        ],
        "kab": [
            "text",
            "letters"
        ],
        "manager": [
            "download",
            "service",
            "packet"
        ],
        "media": [
            "ffmpeg",
            "hls"
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
