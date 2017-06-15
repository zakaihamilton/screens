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
        "script"
    ],
    "ui": [
        "data",
        "group",
        "node",
        "rect",
        "move",
        "resize",
        "element",
        "event",
        "style",
        "popup",
        "basic"
    ],
    "widget": [
        "title",
        "radio",
        "checkbox",
        "list",
        "button",
        "input",
        "text",
        "header",
        "window",
        "menu",
        "icon",
        "image"
    ],
    "app": [
        "main"
    ]
},
        function () {
            package.send_browser("app.main.browser");
        });
