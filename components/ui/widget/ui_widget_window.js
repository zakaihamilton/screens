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
        this._isResizable = true;
        this._region = this.region;
        this._focus = this.attach(COMPONENT.UIEventFocus);
        this._alwaysOnTop = false;
        let inFocus = !this.parent(this.tag(COMPONENT.UIWidgetWindow));
        if (inFocus) {
            this.send("unfocus");
            this._inFocus = inFocus;
        }
    }
    status() {
        return "";
    }
    normal() {
        let isEmbedded = this.state("isEmbedded");
        let inFocus = this.inFocus();
        let borderColor = inFocus ? "#2e0150" : "darkgray";
        let border = (this.alwaysOnTop ? "2px solid" : "1px solid") + " " + borderColor;
        return {
            "min-width": "100px",
            "min-height": "200px",
            ... !isEmbedded && !this._isMaximized && !this._isMinimized && { border, "width": "300px" },
            display: "flex",
            position: isEmbedded ? "relative" : "absolute",
            "flex-direction": "column",
            "flex": "1",
            "align-items": "stretch",
            "align-content": "stretch",
            "justify-content": "stretch",
            "border-radius": (this._isMaximized || this._isMinimized || isEmbedded) ? "0px" : "6px",
            "overflow": this._isMinimized ? "hidden" : "scroll",
            "box-sizing": "border-box",
            "font-family": "Arial, Helvetica, sans-serif"
        };
    }
    styles() {
        let isEmbedded = this.state("isEmbedded");
        let styles = {};
        if (this._isMaximized || this._isMinimized) {
            styles.left = "0px";
            styles.top = "0px";
            styles.width = "100%";
            styles.right = "";
            styles.bottom = "";
            if (this._isMinimized) {
                styles.height = "38px";
                styles["min-height"] = "38px";
            }
            else {
                styles.height = "100%";
                styles["min-height"] = "";
            }
        }
        else if (isEmbedded) {
            styles.left = "";
            styles.top = "";
            styles.right = "";
            styles.bottom = "";
            styles.width = "";
            styles.height = "";
            styles["min-height"] = "";
        }
        else {
            this.region = this._region;
            styles["min-height"] = "";
        }
        return styles;
    }
    canClose() {
        return true;
    }
    isMinimized() {
        return this._isMinimized;
    }
    menu() {
        alert("Hello");
    }
    isMaximized() {
        return this._isMaximized;
    }
    isResizable() {
        return this._isResizable;
    }
    inFocus() {
        return this._inFocus;
    }
    get alwaysOnTop() {
        return this._alwaysOnTop && !this.isMaximized();
    }
    set alwaysOnTop(state) {
        this._alwaysOnTop = state;
        this.update();
    }
    isEmbedded() {
        return this.parent(this.tag(COMPONENT.UIWidgetWindow));
    }
    async close() {
        let isEmbedded = this.state("isEmbedded");
        if (!isEmbedded) {
            this.element.remove();
        }
        return true;
    }
    async minimize() {
        let isEmbedded = this.state("isEmbedded");
        if (!isEmbedded) {
            this._isMinimized = true;
            await this.update();
        }
        return true;
    }
    async maximize() {
        let isEmbedded = this.state("isEmbedded");
        if (!isEmbedded) {
            this._isMaximized = true;
            await this.update();
        }
        return true;
    }
    async restore() {
        let isEmbedded = this.state("isEmbedded");
        if (isEmbedded) {
            document.body.appendChild(this.element);
            await this.update();
            this.send("focus");
        }
        else {
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
            let isEmbedded = this.state("isEmbedded");
            let update = false;
            if (!isEmbedded) {
                if (pos && pos.top <= 0) {
                    if (!this._isMaximized) {
                        return this.maximize();
                    }
                }
                else if (this._isMaximized) {
                    this._isMaximized = false;
                    update = true;
                }
                let region = Object.assign({}, this._region);
                region.left = pos.left + "px";
                region.top = pos.top + "px";
                region.right = "";
                region.bottom = "";
                this.region = region;
                if (!this._isMaximized) {
                    this._region = region;
                }
                if (update) {
                    await this.update();
                }
                else {
                    this.updateStyles();
                }
            }
            return !isEmbedded;
        }
    }
    async resize(size) {
        if (size && !this._isMaximized) {
            let isEmbedded = this.state("isEmbedded");
            let update = false;
            if (!isEmbedded) {
                let region = Object.assign({}, this._region);
                region.width = size.width + "px";
                region.height = size.height + "px";
                region.right = "";
                region.bottom = "";
                this.region = region;
                this._region = region;
                if (update) {
                    await this.update();
                }
                else {
                    this.updateStyles();
                }
            }
            return !isEmbedded;
        }
    }
    focusEvent() {
        this._inFocus = true;
        this.update();
    }
    blurEvent() {
        this._inFocus = false;
        this.update();
    }
    dblclickTitle() {
        if (this._isMaximized) {
            document.body.getElementsByTagName("app-home")[0].instance.send("focus");
        }
        else {
            this._alwaysOnTop = !this._alwaysOnTop;
            this.update();
        }
    }
    render(element) {
        let isEmbedded = this.state("isEmbedded");
        let html = "";
        let hasMenu = "menu" in this;
        let handle = "";
        if (!isEmbedded) {
            html = `<widget-window-title close="${this.canClose()}" menu="${hasMenu}" label="${element.getAttribute("label") || ""}"></widget-window-title>`;
            html += "<widget-window-header></widget-window-header>";
        }
        else {
            handle = "<widget-window-handle></widget-window-handle>";
        }
        html += `<widget-window-content>${handle}${this.content()}</widget-window-content>`;
        if (!isEmbedded) {
            html += "<widget-window-footer></widget-window-footer>";
        }
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
        let inFocus = this.state("inFocus");
        return {
            "background-color": inFocus ? "#2e0150" : "darkgray",
            "display": "flex",
            "height": "36px",
            "align-items": "center",
            "padding-right": "12px",
            "color": inFocus ? "white" : "lightgray"
        };
    }
    async render(element) {
        let inFocus = this.state("inFocus");
        let html = "";
        if (inFocus) {
            html += `<widget-window-menu show="${this.checkAttrib("menu")}"></widget-window-menu>`;
        }
        html += `<widget-window-label>${element.getAttribute("label")}</widget-window-label>`;
        if (inFocus) {
            html += `<widget-window-close show="${this.checkAttrib("close")}"></widget-window-close>`;
        }
        return html;
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
        this._move = this.attach(COMPONENT.UIWidgetWindowMoveEvent);
    }
    events() {
        return {
            dblclick() {
                this.instance.emit("dblclickTitle");
            }
        };
    }
    normal() {
        return {
            "user-select": "none",
            "padding": "6px",
            "text-align": "center",
            "flex-grow": "1",
            "min-height": "16px"
        };
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
            "display": this.checkAttrib("show") ? "flex" : "none",
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
            "display": this.checkAttrib("show") ? "flex" : "none",
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
        return "<img title=\"Menu\" width=\"20px\" height=\"20px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSI0OCIgaWQ9InN2ZzgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEyLjcgMTIuNyIgd2lkdGg9IjQ4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBpZD0ibGF5ZXIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLC0yODQuMjk5OTgpIj48cGF0aCBkPSJtIDIuODIyMjIyMywyODcuMTIyMiB2IDEuNDExMTEgaCA3LjA1NTU1NTggdiAtMS40MTExMSB6IG0gMCwyLjgyMjIyIHYgMS40MTExMiBoIDcuMDU1NTU1OCB2IC0xLjQxMTEyIHogbSAwLDIuODIyMjMgdiAxLjQxMTExIGggNy4wNTU1NTU4IHYgLTEuNDExMTEgeiIgaWQ9InJlY3Q0NDg3IiBzdHlsZT0ib3BhY2l0eToxO3ZlY3Rvci1lZmZlY3Q6bm9uZTtmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMDcwNTU1NTU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIvPjwvZz48L3N2Zz4=\"></img>";
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
        let inFocus = this.state("inFocus");
        return {
            ...super.normal(),
            filter: inFocus ? "invert(100%)" : "invert(0%)"
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
    groups() {
        return {
            ...super.groups(),
            slotted: "::slotted(:not(widget-window))"
        };
    }
    slotted() {
        let isEmbedded = this.state("isEmbedded");
        return {
            ...!isEmbedded && {
                "margin-top": "36px !important"
            }
        };
    }
    normal() {
        let isEmbedded = this.state("isEmbedded");
        return {
            ...!isEmbedded && {
            },
            ...isEmbedded && {
                "border-top": "1px solid darkgray",
                "border-bottom": "1px solid darkgray",
                "padding-top": "20px"
            },
            "background-color": "lightgray",
            "flex": "1",
            "display": "flex",
            "flex-direction": "column"
        };
    }
    render() {
        return "<slot></slot>";
    }
};

COMPONENT.UIWidgetWindowMoveEvent = class extends COMPONENT.UIEventMove {
    static config() {
        return {
            platform: "browser"
        };
    }
    owner() {
        return COMPONENT.UIWidget.tag(this, COMPONENT.UIWidgetWindow);
    }
};

COMPONENT.UIWidgetWindowResizeEvent = class extends COMPONENT.UIEventResize {
    static config() {
        return {
            platform: "browser"
        };
    }
    owner() {
        return COMPONENT.UIWidget.tag(this, COMPONENT.UIWidgetWindow);
    }
};

COMPONENT.UIWidgetWindowFooter = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-footer"
        };
    }
    normal() {
        let isMaximized = this.state("isMaximized");
        return {
            "border-top": "1px solid darkgray",
            "background-color": "lightgray",
            ... !isMaximized && { "border-radius": "0px 0px 6px 6px" },
            "display": "flex",
            "align-items": "center"
        };
    }
    async render(element) {
        let isMaximized = this.state("isMaximized");
        let isResizable = this.state("isResizable");
        let html = "<widget-window-status></widget-window-status>";
        if (!isMaximized && isResizable) {
            html += "<widget-window-resize></widget-window-resize>";
        }
        return html;
    }
};

COMPONENT.UIWidgetWindowStatus = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-status"
        };
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
        let status = this.state("status");
        return status;
    }
};

COMPONENT.UIWidgetWindowResize = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-resize"
        };
    }
    constructor(element) {
        super(element);
        this._move = this.attach(COMPONENT.UIWidgetWindowResizeEvent);
    }
    normal() {
        return {
            "align-items": "flex-start",
            "margin-top": "-20px",
            "margin-right": "10px",
            filter: "invert(60%)"
        };
    }
    hover() {
        return {
            filter: "invert(50%)"
        };
    }
    touch() {
        return {
            filter: "invert(20%)"
        };
    }
    render() {
        return "<img title=\"Resize\" width=\"32px\" height=\"32px\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNOTguOSwxODQuN2wxLjgsMi4xbDEzNiwxNTYuNWM0LjYsNS4zLDExLjUsOC42LDE5LjIsOC42YzcuNywwLDE0LjYtMy40LDE5LjItOC42TDQxMSwxODcuMWwyLjMtMi42ICBjMS43LTIuNSwyLjctNS41LDIuNy04LjdjMC04LjctNy40LTE1LjgtMTYuNi0xNS44djBIMTEyLjZ2MGMtOS4yLDAtMTYuNiw3LjEtMTYuNiwxNS44Qzk2LDE3OS4xLDk3LjEsMTgyLjIsOTguOSwxODQuN3oiLz48L3N2Zz4=\"></img>";
    }
};


COMPONENT.UIWidgetWindowHandle = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-window-handle"
        };
    }
    normal() {
        return {
            "background": "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggM0g1YTIgMiAwIDAgMC0yIDJ2M20xOCAwVjVhMiAyIDAgMCAwLTItMmgtM20wIDE4aDNhMiAyIDAgMCAwIDItMnYtM00zIDE2djNhMiAyIDAgMCAwIDIgMmgzIi8+PC9zdmc+') no-repeat",
            "background-size": "16px 16px",
            "position": "absolute",
            "top": "6px",
            "left": "6px",
            width: "16px",
            height: "16px",
            "border-radius": "6px",
            filter: "invert(70%)"
        };
    }
    events() {
        return {
            click(event) {
                const instance = this.instance;
                instance.emit("restore", instance);
            }
        };
    }
    hover() {
        return {
            filter: "invert(40%)"
        };
    }
    touch() {
        return {
            filter: "invert(0%)"
        };
    }
};