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
            if (this._isMinimized) {
                this._isMinimized = false;
            }
            else {
                this._isMaximized = false;
            }
            await this.update();
        }
        return true;
    }
    async move(pos) {
        if (pos || this._isMaximized) {
            let parent = this.parent();
            let update = false;
            if (!parent) {
                if (pos && pos.top <= 0) {
                    if (!this._isMaximized) {
                        return this.maximize();
                    }
                }
                else if (this._isMaximized) {
                    this._isMaximized = false;
                    update = true;
                }
                this._pos = Object.assign({}, pos);
                if (update) {
                    await this.update();
                }
                else {
                    await this.updateStyles();
                }
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
    normal() {
        let isMaximized = this.state("isMaximized");
        return {
            "background-color": "#2e0150",
            ... !isMaximized && { "border-radius": "6px 6px 0px 0px" },
            "display": "flex",
            "align-items": "center",
            "padding-right": "12px",
            "color": "white"
        };
    }
    async render(element) {
        return `
        <widget-window-menu></widget-window-menu>
        <widget-window-label label="${element.getAttribute("label")}"></widget-window-label>
        <widget-window-close></widget-window-close>`;
    }
};

COMPONENT.UIWidgetWindowLabel = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-label"
        };
    }
    constructor(element) {
        super(element);
        this.drag = this.attach(COMPONENT.UIWidgetWindowMove);
    }
    normal() {
        return {
            "user-select": "none",
            "padding": "6px",
            "display": "flex",
            "flex-grow": "1",
            "min-height": "16px",
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

COMPONENT.UIWidgetWindowMenu = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-menu"
        };
    }
    normal() {
        return {
            "width": "25px",
            "height": "25px",
            "margin": "3px",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center",
            "filter": "invert(100%)"
        };
    }
    events() {
        return {
            click(event) {
                const instance = this.instance;
                instance.emit("menu", instance);
            }
        };
    }
    hover() {
        return {
            filter: "invert(90%)"
        };
    }
    touch() {
        return {
            filter: "invert(80%)"
        };
    }
    render() {
        return "<img title=\"Menu\" width=\"25px\" height=\"25px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgaWQ9InN2ZzgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEyLjcgMTIuNyIgd2lkdGg9IjQ4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBpZD0ibGF5ZXIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yODQuMjk5OTgpIj48cGF0aCBkPSJtIDIuODIyMjIyMywyODcuMTIyMiB2IDEuNDExMTEgaCA3LjA1NTU1NTggdiAtMS40MTExMSB6IG0gMCwyLjgyMjIyIHYgMS40MTExMiBoIDcuMDU1NTU1OCB2IC0xLjQxMTEyIHogbSAwLDIuODIyMjMgdiAxLjQxMTExIGggNy4wNTU1NTU4IHYgLTEuNDExMTEgeiIgaWQ9InJlY3Q0NDg3IiBzdHlsZT0ib3BhY2l0eToxO3ZlY3Rvci1lZmZlY3Q6bm9uZTtmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMDcwNTU1NTU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIvPjwvZz48L3N2Zz4=\"></img>";
    }
};

COMPONENT.UIWidgetWindowClose = class extends COMPONENT.UIWidgetWindowAction {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-close"
        };
    }
    normal() {
        return {
            ...super.normal(),
            filter: "invert(100%)"
        };
    }
    hover() {
        return {
            filter: "invert(50%)"
        };
    }
    touch() {
        return {
            filter: "invert(80%)"
        };
    }
    action() {
        return "close";
    }
    render() {
        return "<img title=\"Close\" width=\"22px\" height=\"22px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNMjU2LDMzQzEzMi4zLDMzLDMyLDEzMy4zLDMyLDI1N2MwLDEyMy43LDEwMC4zLDIyNCwyMjQsMjI0YzEyMy43LDAsMjI0LTEwMC4zLDIyNC0yMjRDNDgwLDEzMy4zLDM3OS43LDMzLDI1NiwzM3ogICAgTTM2NC4zLDMzMi41YzEuNSwxLjUsMi4zLDMuNSwyLjMsNS42YzAsMi4xLTAuOCw0LjItMi4zLDUuNmwtMjEuNiwyMS43Yy0xLjYsMS42LTMuNiwyLjMtNS42LDIuM2MtMiwwLTQuMS0wLjgtNS42LTIuM0wyNTYsMjg5LjggICBsLTc1LjQsNzUuN2MtMS41LDEuNi0zLjYsMi4zLTUuNiwyLjNjLTIsMC00LjEtMC44LTUuNi0yLjNsLTIxLjYtMjEuN2MtMS41LTEuNS0yLjMtMy41LTIuMy01LjZjMC0yLjEsMC44LTQuMiwyLjMtNS42bDc1LjctNzYgICBsLTc1LjktNzVjLTMuMS0zLjEtMy4xLTguMiwwLTExLjNsMjEuNi0yMS43YzEuNS0xLjUsMy41LTIuMyw1LjYtMi4zYzIuMSwwLDQuMSwwLjgsNS42LDIuM2w3NS43LDc0LjdsNzUuNy03NC43ICAgYzEuNS0xLjUsMy41LTIuMyw1LjYtMi4zYzIuMSwwLDQuMSwwLjgsNS42LDIuM2wyMS42LDIxLjdjMy4xLDMuMSwzLjEsOC4yLDAsMTEuM2wtNzUuOSw3NUwzNjQuMywzMzIuNXoiLz48L2c+PC9zdmc+\"></img>";
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