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
        tag: "widget-window-title",
        attach: {
            drag: "UIWidgetWindowMove"
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

COMPONENT.define({
    name: "UIWidgetWindowMove",
    config: {
        platform: "browser"
    },
    events: {
        down() {
            alert("Hello");
        }
    },
    register(instance) {
        instance.registerEvents(this.events);
    }
});