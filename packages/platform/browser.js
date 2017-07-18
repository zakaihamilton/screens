package.include({
    "core": [
        "console",
        "object",
        "remote",
        "event",
        "http",
        "message",
        "type",
        "ref",
        "module",
        "script",
        "property",
        "cmd",
        "app"
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
        "set",
        "move",
        "resize"
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
        "border"
    ],
    "app": [
        "main"
    ]
},
        function (failure) {
            if (failure) {
                alert("Cannot load " + failure);
            } else {
                package.send_browser("app.main.browser");
            }
        });
