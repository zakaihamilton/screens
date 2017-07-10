package.include({
    "core": [
        "console",
        "remote",
        "event",
        "http",
        "message",
        "type",
        "ref",
        "module",
        "script",
        "property",
        "cmd"
    ],
    "ui": [
        "data",
        "group",
        "node",
        "rect",
        "drag",
        "element",
        "event",
        "touch",
        "key",
        "style",
        "basic",
        "focus",
        "theme",
        "property",
        "scroll",
        "attribute",
        "var"
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
        "desktop"
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
