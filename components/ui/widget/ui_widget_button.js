COMPONENT.UIWidgetButton = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button"
        };
    }
    styles() {
        return {
            width: "100px",
            height: "30px",
            border: "1px solid black",
            "background-color": "red",
            display: "flex",
            "flex-direction": "column",
            "align-items": "stretch",
            "align-content": "stretch",
            "justify-content": "stretch"
        };
    }
    render(element) {
        return `<widget-button-label label="${element.getAttribute("label")}"></widget-button-label>`;
    }
};

COMPONENT.UIWidgetButtonLabel = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button-label"
        };
    }
    constructor() {
        super();
        this.drag = this.attach(COMPONENT.UIWidgetWindowMove);
    }
    styles() {
        return {
            border: "1px solid black",
            "background-color": "yellow"
        };
    }
    render(element) {
        return `<div>${element.getAttribute("label")}</div>`;
    }
};
