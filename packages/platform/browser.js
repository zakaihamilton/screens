include({
    "core": [
        "platform",
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
        "bar",
        "rect",
        "drag",
        "element",
        "event",
        "style",
        "radio",
        "checkbox",
        "list",
        "button",
        "input",
        "text",
        "option",
        "header",
        "screen",
    ],
    "app": [
        "main"
    ]
},
        function () {
            package.core.message.send_browser("app.main.browser");
        });
