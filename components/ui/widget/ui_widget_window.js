COMPONENT.UIWidgetWindow = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window"
        };
    }
    styles() {
        let parent = this.parent();
        return {
            width: "500px",
            height: "100px",
            border: parent ? "" : "1px solid black",
            display: "flex",
            position: parent ? "relative" : "absolute",
            "flex-direction": "column",
            "align-items": "stretch",
            "align-content": "stretch",
            "justify-content": "stretch",
            "border-radius": parent ? "0px" : "6px",
            "overflow": "scroll",
            "box-sizing": "border-box"
        };
    }
    data() {
        return {
            title: "Hello"
        };
    }
    minimize() {
        let parent = this.parent();
        if (!parent) {
            this.element.style.height = "38px";
        }
        return !parent;
    }
    maximize() {
        let parent = this.parent();
        if (!parent) {
            this.element.style.left = "0px";
            this.element.style.top = "0px";
            this.element.style.width = "100%";
            this.element.style.height = "100%";
        }
        return !parent;
    }
    render(element) {
        let parent = this.parent();
        let html = "";
        if (!parent) {
            html = `<widget-window-title label="${element.data.title}"></widget-window-title>`;
        }
        html += "<widget-window-content><slot></slot></widget-window-content>";
        return html;
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
            "padding": "3px",
            "height": "32px",
            "border-radius": "6px 6px 0px 0px",
            "display": "flex",
            "align-items": "center"
        };
    }
    hover() {
        return {
            filter: "invert(10%)"
        };
    }
    touch() {
        return {
            filter: "invert(20%)"
        };
    }
    render(element) {
        return `<widget-window-label label="${element.getAttribute("label")}"></widget-window-label>
        <widget-window-close></widget-window-close>
        <widget-window-minimize></widget-window-minimize>
        <widget-window-maximize></widget-window-maximize>`;
    }
};

COMPONENT.UIWidgetWindowLabel = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-label"
        };
    }
    styles() {
        return {
            "user-select": "none",
            "padding-left": "6px",
            "flex-grow": "1"
        };
    }
    hover() {
        return {
            filter: "invert(10%)"
        };
    }
    touch() {
        return {
            filter: "invert(20%)"
        };
    }
    render(element) {
        return `<div>${element.getAttribute("label")}</div>`;
    }
};

COMPONENT.UIWidgetWindowAction = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-action"
        };
    }
    styles() {
        return {
            "border": "1px solid darkgray",
            "background-color": "lightgray",
            "border-radius": "6px",
            "width": "25px",
            "height": "25px",
            "margin": "3px",
        };
    }
    events() {
        return {
            click(event) {
                const instance = this.instance;
                instance.emit(instance.action(), instance);
            }
        };
    }
    hover() {
        return {
            filter: "invert(10%)"
        };
    }
    touch() {
        return {
            filter: "invert(20%)"
        };
    }
};

COMPONENT.UIWidgetWindowClose = class extends COMPONENT.UIWidgetWindowAction {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-close"
        };
    }
    action() {
        return "close";
    }
    render() {
        return "<img title=\"Close\" width=\"25px\" height=\"25px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNNDM3LjUsMzg2LjZMMzA2LjksMjU2bDEzMC42LTEzMC42YzE0LjEtMTQuMSwxNC4xLTM2LjgsMC01MC45Yy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMEwyNTYsMjA1LjFMMTI1LjQsNzQuNSAgYy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMGMtMTQuMSwxNC4xLTE0LjEsMzYuOCwwLDUwLjlMMjA1LjEsMjU2TDc0LjUsMzg2LjZjLTE0LjEsMTQuMS0xNC4xLDM2LjgsMCw1MC45ICBjMTQuMSwxNC4xLDM2LjgsMTQuMSw1MC45LDBMMjU2LDMwNi45bDEzMC42LDEzMC42YzE0LjEsMTQuMSwzNi44LDE0LjEsNTAuOSwwQzQ1MS41LDQyMy40LDQ1MS41LDQwMC42LDQzNy41LDM4Ni42eiIvPjwvc3ZnPg==\"></img>";
    }
};


COMPONENT.UIWidgetWindowMinimize = class extends COMPONENT.UIWidgetWindowAction {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-minimize"
        };
    }
    action() {
        return "minimize";
    }
    render() {
        return "<img title=\"Minimize\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggM3YzYTIgMiAwIDAgMS0yIDJIM20xOCAwaC0zYTIgMiAwIDAgMS0yLTJWM20wIDE4di0zYTIgMiAwIDAgMSAyLTJoM00zIDE2aDNhMiAyIDAgMCAxIDIgMnYzIi8+PC9zdmc+\"></img>";
    }
};

COMPONENT.UIWidgetWindowMaximize = class extends COMPONENT.UIWidgetWindowAction {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-maximize"
        };
    }
    action() {
        return "maximize";
    }
    render() {
        return "<img title=\"Maximize\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggM0g1YTIgMiAwIDAgMC0yIDJ2M20xOCAwVjVhMiAyIDAgMCAwLTItMmgtM20wIDE4aDNhMiAyIDAgMCAwIDItMnYtM00zIDE2djNhMiAyIDAgMCAwIDIgMmgzIi8+PC9zdmc+\"></img>";
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
        let parent = this.parent("widget-window");
        return {
            "border-top": parent ? "" : "1px solid darkgray",
            "border-bottom": parent ? "1px solid darkgray" : "",
            "background-color": "lightgray",
            "border-radius": parent ? "0px" : "0px 0px 6px 6px",
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