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
        "property"
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
        "basic",
        "focus",
        "theme",
        "property",
        "scroll"
    ],
    "widget": [
        "radio",
        "checkbox",
        "list",
        "button",
        "input",
        "text",
        "header",
        "window",
        "modal",
        "menu",
        "icon",
        "image",
        "scrollbar"
    ],
    "app": [
        "main"
    ]
},
        function () {
            package.send_browser("app.main.browser");
        });
