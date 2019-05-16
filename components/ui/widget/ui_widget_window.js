COMPONENT.UIWidgetWindow = class UIWidgetWindow extends COMPONENT.UIWidgetCustom {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window"
        };
    }
    styles() {
        return {
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
        };
    }
    data() {
        return {
            title: "Hello"
        };
    }
    render(element) {
        return `<widget-window-title title="${element.data.title}"></widget-window-title>
        <widget-window-content></widget-window-content>`;
    }
};

COMPONENT.UIWidgetWindowTitle = class UIWidgetWindowTitle extends COMPONENT.UIWidgetCustom {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-title"
        };
    }
    constructor() {
        super();
        this.drag = this.attach(COMPONENT.UIWidgetWindowMove);
    }
    render(element) {
        return `<div>${element.getAttribute("title")}</div>`;
    }
};

COMPONENT.UIWidgetWindowContent = class UIWidgetWindowContent extends COMPONENT.UIWidgetCustom {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-content"
        };
    }
    styles() {
        return {
            border: "1px solid green",
            "background-color": "blue",
            "flex": "1"
        };
    }
};

COMPONENT.UIWidgetWindowMove = class UIWidgetWindowMove extends COMPONENT.UIEventMove {
    static config() {
        return {
            platform: "browser"
        };
    }
    selector() {
        return "widget-window";
    }
};