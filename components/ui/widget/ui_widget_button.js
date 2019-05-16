COMPONENT.UIWidgetButton = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button"
        };
    }
    styles() {
        return {
            height: "30px",
            border: "1px solid darkgray",
            "background-color": "lightgray",
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "align-content": "center",
            "justify-content": "center",
            padding: "3px",
            "border-radius": "6px"
        };
    }
    css() {
        return ":host(:hover) { filter:invert(10%);} :host(:active:hover) {filter:invert(20%);} ";
    }
    render(element) {
        return `<widget-button-handle></widget-button-handle>
        <widget-button-label label="${element.getAttribute("label")}"></widget-button-label>`;
    }
};

COMPONENT.UIWidgetButtonHandle = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button-handle"
        };
    }
    constructor() {
        super();
        this.drag = this.attach(COMPONENT.UIWidgetButtonMove);
    }
    styles() {
        return {
            "background": "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggY2xhc3M9Imhlcm9pY29uLXVpIiBkPSJNNCA1aDE2YTEgMSAwIDAgMSAwIDJINGExIDEgMCAxIDEgMC0yem0wIDZoMTZhMSAxIDAgMCAxIDAgMkg0YTEgMSAwIDAgMSAwLTJ6bTAgNmgxNmExIDEgMCAwIDEgMCAySDRhMSAxIDAgMCAxIDAtMnoiLz48L3N2Zz4=') no-repeat",
            width: "25px",
            height: "25px",
            "border-radius": "6px",
            filter: "invert(50%)"
        };
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
            "user-select": "none",
            margin: "3px"
        };
    }
    render(element) {
        return `<div>${element.getAttribute("label")}</div>`;
    }
};

COMPONENT.UIWidgetButtonMove = class extends COMPONENT.UIEventMove {
    static config() {
        return {
            platform: "browser"
        };
    }
    owner() {
        return "widget-button";
    }
};