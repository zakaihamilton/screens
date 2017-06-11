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
    ],
    "widget" : [
        "title",
        "radio",
        "checkbox",
        "list",
        "button",
        "input",
        "text",
        "option",
        "header",
        "window",
    ],
    "app": [
        "main"
    ]
},
        function () {
            package.core.message.send_browser("app.main.browser");
        });
