package.worker = new Worker("packages/platform/client.js");

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
        "path"
    ],
    "storage": [
        "cache"
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
        "arrange"
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
        "table"
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
        "terms"
    ],
},
        function (info) {
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
                document.getElementById("bar").style.display = "none";
                package.include("app.main", function (appInfo) {
                    if (appInfo.complete) {
                        package.send_browser("app.main.browser");
                    }
                });
            }
        });
