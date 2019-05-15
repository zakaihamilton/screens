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
        display: "flex",
        position: "absolute",
        "flex-direction": "column",
        "align-items": "stretch",
        "align-content": "stretch",
        "justify-content": "stretch"
    },
    data: {
        title: "Hello"
    },
    render: element => `
        <widget-window-title title="${element.data.title}"></widget-window-title>
        <widget-window-content></widget-window-content>`
});

COMPONENT.define({
    name: "UIWidgetWindowTitle",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window-title"
    },
    events: {
        click() {
            alert(this.getAttribute("title"));
        }
    },
    render: element => `
        <div>${element.getAttribute("title")}</div>`
});

COMPONENT.define({
    name: "UIWidgetWindowContent",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window-content"
    },
    styles: {
        border: "1px solid green",
        "background-color": "blue",
        "flex": "1"
    }
});