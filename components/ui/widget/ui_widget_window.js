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
        down(event) {
            let target = event.currentTarget;
            let parent = target.closest("widget-window");
            let instance = target.instance;
            parent.startRect = parent.getBoundingClientRect().toJSON();
            parent.startRect.left = event.clientX - parent.startRect.left;
            parent.startRect.top = event.clientY - parent.startRect.top;
            event.preventDefault();
            parent.instance.send("move", true);
            const events = {
                move(event) {
                    parent.style.left = (event.clientX - parent.startRect.left) + "px";
                    parent.style.top = (event.clientY - parent.startRect.top) + "px";
                },
                up(event) {
                    instance.unregisterEvents(events);
                    parent.instance.send("move", false);
                }
            };
            instance.registerEvents(events);
        }
    },
    register(instance) {
        instance.registerEvents(this.events);
    }
});