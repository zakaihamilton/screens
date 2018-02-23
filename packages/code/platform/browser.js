function startBrowser(appName, appArgs) {
    package.include({
        "core": [
            "property",
            "console",
            "object",
            "test",
            "http",
            "message",
            "type",
            "ref",
            "module",
            "script",
            "cmd",
            "app",
            "string",
            "handle",
            "json",
            "performance",
            "util",
            "file",
            "path",
            "link",
            "device",
            "server",
            "date",
            "number",
            "hash",
            "flow",
            "startup",
            "network",
            "require",
            "listener"
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
            "event",
            "data",
            "group",
            "node",
            "rect",
            "drag",
            "element",
            "touch",
            "key",
            "style",
            "basic",
            "focus",
            "class",
            "theme",
            "property",
            "options",
            "scroll",
            "attribute",
            "var",
            "move",
            "resize",
            "monitor",
            "layout",
            "work",
            "cachekey",
            "arrange",
            "exec",
            "screenshot",
            "color"
        ],
        "menu": [
            "context"
        ],
        "widget": [
            "radio",
            "checkbox",
            "list",
            "button",
            "input",
            "text",
            "window",
            "modal",
            "menu",
            "icon",
            "image",
            "scrollbar",
            "container",
            "embed",
            "terminal",
            "desktop",
            "tray",
            "content",
            "editor",
            "canvas",
            "table",
            "gridline",
            "bar",
            "tree",
            "audio",
            "video",
            "spinner",
            "chart"
        ],
        "canvas": [
            "dirty",
            "node",
            "element",
            "attribute",
            "style",
            "rect",
            "border",
            "background",
            "text"
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
        ],
        "app": [
            "main"
        ]
    }, function (info) {
        if (info.failure) {
            console.log("Cannot load " + info.failure.package + "." + info.failure.component);
        } else if (info.progress && info.loaded) {
            var progress_width = (300 / 100) * info.progress;
            var progress = document.getElementById("progress");
            if (progress) {
                progress.style.width = progress_width + "px";
                progress.innerHTML = info.loaded.package + "." + info.loaded.component;
                if(info.progress >= 100) {
                    progress.innerHTML = "Initializing Components";
                }
            }
        }
        if (info.complete) {
            progress.innerHTML = "Starting " + (appName ? appName : "Screens Environment");
            setTimeout(() => {
                document.getElementById("bar").style.display = "none";
                var app = package.startup.app;
                app.args = appArgs;
                app.name = appName;
            }, 0);
            package.core.message.loadWorker("packages/code/platform/client.js");
            package.core.startup.run(() => {
                
            });
        }
    });
}
