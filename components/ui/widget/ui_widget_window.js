COMPONENT.UIWidgetWindow = class extends COMPONENT.UIWidget {
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
            display: "flex",
            position: "absolute",
            "flex-direction": "column",
            "align-items": "stretch",
            "align-content": "stretch",
            "justify-content": "stretch",
            "border-radius": "6px",
            "overflow": "scroll"
        };
    }
    data() {
        return {
            title: "Hello"
        };
    }
    render(element) {
        return `<widget-window-title value="${element.data.title}"></widget-window-title>
        <widget-window-content><slot></slot></widget-window-content>`;
    }
};

COMPONENT.UIWidgetWindowTitle = class extends COMPONENT.UIWidget {
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
    styles() {
        return {
            "background-color": "white",
            "user-select": "none",
            "padding": "6px",
            "border-radius": "6px 6px 0px 0px"
        };
    }
    css() {
        return ":host(:hover) { filter:invert(10%);} :host(:active:hover) {filter:invert(20%);} ";
    }
    render(element) {
        return `<div>${element.getAttribute("value")}</div>`;
    }
};

COMPONENT.UIWidgetWindowContent = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-content"
        };
    }
    styles() {
        return {
            "border-top": "1px solid darkgray",
            "background-color": "lightgray",
            "border-radius": "0px 0px 6px 6px",
            "flex": "1"
        };
    }
    render() {
        return "<slot></slot>";
    }
};

COMPONENT.UIWidgetWindowMove = class extends COMPONENT.UIEventMove {
    static config() {
        return {
            platform: "browser"
        };
    }
    owner() {
        return "widget-window";
    }
};