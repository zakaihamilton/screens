COMPONENT.UIWidgetWindow = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window"
        };
    }
    constructor(element) {
        super(element);
        this._isMinimized = false;
        this._isMaximized = false;
        this._pos = { left: parseInt(element.style.left) || 0, top: parseInt(element.style.top) || 0 };
        this._size = { width: parseInt(element.style.width) || 500, height: parseInt(element.style.height) || 100 };
    }
    normal() {
        let parent = this.parent();
        return {
            "min-width": "100px",
            "min-height": "200px",
            ... (this._isMaximized || this._isMinimized) && { left: "0px", top: "0px" },
            ... !parent && !this._isMaximized && !this._isMinimized && { border: "1px solid black" },
            display: "flex",
            position: parent ? "relative" : "absolute",
            "flex-direction": "column",
            "align-items": "stretch",
            "align-content": "stretch",
            "justify-content": "stretch",
            "border-radius": (this._isMaximized || this._isMinimized || parent) ? "0px" : "6px",
            "overflow": this._isMinimized ? "hidden" : "scroll",
            "box-sizing": "border-box",
            "font-family": "Arial, Helvetica, sans-serif"
        };
    }
    styles() {
        let parent = this.parent();
        let styles = {};
        if (this._isMaximized || this._isMinimized) {
            styles.left = "0px";
            styles.top = "0px";
            styles.width = "100%";
            if (this._isMinimized) {
                styles.height = "38px";
                styles["min-height"] = "38px";
            }
            else {
                styles.height = "100%";
                styles["min-height"] = "";
            }
        }
        else if (parent) {
            styles.left = "";
            styles.top = "";
            styles.width = "";
            styles.height = "";
            styles["min-height"] = "";
        }
        else {
            styles.left = this._pos.left + "px";
            styles.top = this._pos.top + "px";
            styles.width = this._size.width + "px";
            styles.height = this._size.height + "px";
            styles["min-height"] = "";
        }
        return styles;
    }
    isMinimized() {
        return this._isMinimized;
    }
    isMaximized() {
        return this._isMaximized;
    }
    async close() {
        let parent = this.parent();
        if (!parent) {
            this.element.remove();
        }
        return true;
    }
    async minimize() {
        let parent = this.parent();
        if (!parent) {
            this._isMinimized = true;
            await this.update();
        }
        return true;
    }
    async maximize() {
        let parent = this.parent();
        if (!parent) {
            this._isMaximized = true;
            await this.update();
        }
        return true;
    }
    async restore() {
        let parent = this.parent();
        if (!parent) {
            this._isMaximized = false;
            await this.update();
        }
        return true;
    }
    async move(pos) {
        if (pos) {
            let parent = this.parent();
            if (!parent) {
                this._pos = Object.assign({}, pos);
                await this.update();
            }
            return !parent;
        }
    }
    render(element) {
        let parent = this.parent();
        let html = "";
        if (!parent) {
            html = `<widget-window-title label="${element.getAttribute("label") || ""}"></widget-window-title>`;
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
    constructor(element) {
        super(element);
        this.drag = this.attach(COMPONENT.UIWidgetWindowMove);
    }
    normal() {
        return {
            "background-color": "white",
            "padding": "3px",
            "height": "32px",
            "border-radius": "6px 6px 0px 0px",
            "display": "flex",
            "align-items": "center",
            "padding-right": "12px"
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
    async render(element) {
        let _isMaximized = (await this.emit("isMaximized"))[0];
        this.drag.enable(!_isMaximized);
        let maximizedRestoreTag = _isMaximized ? "restore" : "maximize";
        return `<widget-window-label label="${element.getAttribute("label")}"></widget-window-label>
        <widget-window-close></widget-window-close>
        <widget-window-minimize></widget-window-minimize>
        <widget-window-${maximizedRestoreTag}></widget-window-${maximizedRestoreTag}>`;
    }
};

COMPONENT.UIWidgetWindowLabel = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-label"
        };
    }
    normal() {
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
    normal() {
        return {
            "border": "1px solid darkgray",
            "background-color": "lightgray",
            "border-radius": "6px",
            "width": "25px",
            "height": "25px",
            "margin": "3px",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center"
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

COMPONENT.UIWidgetWindowRestore = class extends COMPONENT.UIWidgetWindowAction {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-restore"
        };
    }
    action() {
        return "restore";
    }
    render() {
        return "<img title=\"Restore\" width=\"13px\" height=\"13px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggM0g1YTIgMiAwIDAgMC0yIDJ2M20xOCAwVjVhMiAyIDAgMCAwLTItMmgtM20wIDE4aDNhMiAyIDAgMCAwIDItMnYtM00zIDE2djNhMiAyIDAgMCAwIDIgMmgzIi8+PC9zdmc+\"></img>";
    }
};
COMPONENT.UIWidgetWindowContent = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-content"
        };
    }
    normal() {
        let parent = this.parent();
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