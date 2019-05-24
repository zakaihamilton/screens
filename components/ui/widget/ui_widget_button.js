COMPONENT.UIWidgetButton = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button"
        };
    }
    constructor(element) {
        super(element);
    }
    styles(element) {
        const isDefault = element.getAttribute("default");
        return {
            border: "1px solid darkgray",
            "background-color": isDefault ? "white" : "lightgray",
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "align-content": "center",
            "justify-content": "center",
            padding: "3px",
            "border-radius": "6px",
            ...this.region
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
    async move(pos) {
        if (pos) {
            let region = Object.assign({}, this.region);
            var style = this.element.currentStyle || window.getComputedStyle(this.element);
            region.left = pos.left + "px";
            region.top = pos.top - parseInt(style.marginTop) + "px";
            region.right = "";
            region.bottom = "";
            this.region = region;
            await this.updateStyles();
        }
    }
    render(element) {
        let html = "";
        let style = getComputedStyle(element);
        if (style.position === "absolute") {
            html += "<widget-button-handle></widget-button-handle>";
        }
        html += `<widget-button-label label="${element.getAttribute("label")}"></widget-button-label>`;
        return html;
    }
};

COMPONENT.UIWidgetButtonHandle = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button-handle"
        };
    }
    constructor(parent) {
        super(parent);
        this.move = this.attach(COMPONENT.UIWidgetButtonMove);
    }
    styles(element) {
        const isDefault = element.getRootNode().host.getAttribute("default");
        return {
            "background": "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48Zz48cGF0aCBkPSJNMTYwLDE1My4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMTUzLjN6Ii8+PHBhdGggZD0iTTI4OCwxNTMuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjE1My4zeiIvPjxwYXRoIGQ9Ik00MTYsMTUzLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YxNTMuM3oiLz48L2c+PGc+PHBhdGggZD0iTTE2MCwyODEuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjI4MS4zeiIvPjxwYXRoIGQ9Ik0yODgsMjgxLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YyODEuM3oiLz48cGF0aCBkPSJNNDE2LDI4MS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMjgxLjN6Ii8+PC9nPjxnPjxwYXRoIGQ9Ik0xNjAsNDA5LjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1Y0MDkuM3oiLz48cGF0aCBkPSJNMjg4LDQwOS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWNDA5LjN6Ii8+PHBhdGggZD0iTTQxNiw0MDkuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjQwOS4zeiIvPjwvZz48L2c+PC9zdmc+') no-repeat",
            "background-size": "16px 16px",
            width: "16px",
            height: "16px",
            "border-radius": "6px",
            filter: isDefault ? "invert(25%)" : "invert(75%)"
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
    normal() {
        return {
            "user-select": "none",
            margin: "3px"
        };
    }
    events() {
        return {
            click(event) {
                let target = event.currentTarget;
                let parent = target.instance.parent("widget-button");
                if (parent) {
                    parent.trigger("press");
                }
            }
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