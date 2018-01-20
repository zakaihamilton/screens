package.worker = new Worker("packages/code/platform/client.js");

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
            "startup"
        ],
        "storage": [
            "cache",
            "file",
            "data"
        ],
        "user": [
            "profile"
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
            "screenshot"
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
            "spinner"
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
            "download"
        ],
        "media": [
            "ffmpeg"
        ],
        "startup": [
            "app"
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
            }
        }
        if (info.complete) {
            var app = package.startup.app;
            app.args = appArgs;
            app.name = appName;
            package.core.startup.run();
        }
    });
}
