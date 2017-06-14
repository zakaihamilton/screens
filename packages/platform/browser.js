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
    ],
    "ui": [
        "data",
        "group",
        "node",
        "rect",
        "drag",
        "element",
        "event",
        "style",
        "popup"
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
    ],
    "app": [
        "main"
    ]
},
        function () {
            package.send_browser("app.main.browser");
        });
