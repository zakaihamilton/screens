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
            border: "1px solid black",
            "background-color": "red",
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "align-content": "center",
            "justify-content": "center",
            padding: "3px",
            "border-radius": "6px"
        };
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
            border: "1px solid black",
            background: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggY2xhc3M9Imhlcm9pY29uLXVpIiBkPSJNNSAzaDRhMiAyIDAgMCAxIDIgMnY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yVjVjMC0xLjEuOS0yIDItMnptMCAydjRoNFY1SDV6bTEwLTJoNGEyIDIgMCAwIDEgMiAydjRhMiAyIDAgMCAxLTIgMmgtNGEyIDIgMCAwIDEtMi0yVjVjMC0xLjEuOS0yIDItMnptMCAydjRoNFY1aC00ek01IDEzaDRhMiAyIDAgMCAxIDIgMnY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi00YzAtMS4xLjktMiAyLTJ6bTAgMnY0aDR2LTRINXptMTAtMmg0YTIgMiAwIDAgMSAyIDJ2NGEyIDIgMCAwIDEtMiAyaC00YTIgMiAwIDAgMS0yLTJ2LTRjMC0xLjEuOS0yIDItMnptMCAydjRoNHYtNGgtNHoiLz48L3N2Zz4=') no-repeat",
            width: "25px",
            height: "25px"
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
            border: "1px solid black",
            "background-color": "yellow",
            "user-select": "none"
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