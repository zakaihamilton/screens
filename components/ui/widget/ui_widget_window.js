COMPONENT.define({
    name: "UIWidgetWindow",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window"
    },
    styles: {
        width: "500px",
        height: "100px",
        border: "1px solid black",
        "background-color": "red",
        display: "block"
    },
    data: {
        title: "Hello"
    },
    render: element => `
        <widget-window-title title="${element.data.title}"></widget-window-title>`
});

COMPONENT.define({
    name: "UIWidgetTitle",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window-title"
    },
    styles: {

    },
    render: element => `
        <div>${element.getAttribute("title")}</div>`
});