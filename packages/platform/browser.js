package.include({
    "core": [
        "console",
        "object",
        "property",
        "remote",
        "http",
        "message",
        "type",
        "ref",
        "module",
        "script",
        "cmd",
        "app",
        "string"
    ],
    "storage" : [
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
        "theme",
        "property",
        "scroll",
        "attribute",
        "var",
        "move",
        "resize",
        "monitor"
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
        "canvas"
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
    "kab" : [
        "terms"
    ],
    "app": [
        "main"
    ]
},
        function (info) {
            if (info.failure) {
                alert("Cannot load " + info.failure.package + "." + info.failure.component);
            } else if(info.progress && info.loading) {
                var package_width = (500 / 100) * info.progress.package;
                var component_width = (500 / 100) * info.progress.component;
                var package_progress = document.getElementById("package_progress");
                if(package_progress) {
                    package_progress.style.width = package_width + "px";
                    package_progress.innerHTML=info.loading.package;
                }
                var component_progress = document.getElementById("component_progress");
                if(component_progress) {
                    component_progress.style.width = component_width + "px";
                    component_progress.innerHTML=info.loading.component;
                }
            }
            if (info.complete) {
                document.getElementById("progress").style.display = "none";
                package.send_browser("app.main.browser");
            }
        });
