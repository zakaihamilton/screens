COMPONENT.define({
    name: "UIWidgetWindow",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window"
    },
    data: {
        styles: {
            width: "500px",
            height: "100px",
            border: "1px solid black",
            "background-color": "red",
            display: "block"
        },
        title: "Hello",
    },
    render: element => `
        <widget-window-title>${element.data.title}</widget-window-title>`
});

COMPONENT.define({
    name: "UIWidgetTitle",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window-title"
    },
    render() {

    }
});