COMPONENT.UIWidgetButton = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-button"
        };
    }
    styles(element) {
        const isDefault = element.getAttribute("default");
        return {
            height: "30px",
            border: "1px solid darkgray",
            "background-color": isDefault ? "white" : "lightgray",
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "align-content": "center",
            "justify-content": "center",
            padding: "3px",
            "border-radius": "6px"
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
    constructor(parent) {
        super(parent);
        this.drag = this.attach(COMPONENT.UIWidgetButtonMove);
    }
    styles(element) {
        const isDefault = element.getRootNode().host.getAttribute("default");
        return {
            "background": "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48Zz48cGF0aCBkPSJNMTYwLDE1My4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMTUzLjN6Ii8+PHBhdGggZD0iTTI4OCwxNTMuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjE1My4zeiIvPjxwYXRoIGQ9Ik00MTYsMTUzLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YxNTMuM3oiLz48L2c+PGc+PHBhdGggZD0iTTE2MCwyODEuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjI4MS4zeiIvPjxwYXRoIGQ9Ik0yODgsMjgxLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YyODEuM3oiLz48cGF0aCBkPSJNNDE2LDI4MS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMjgxLjN6Ii8+PC9nPjxnPjxwYXRoIGQ9Ik0xNjAsNDA5LjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1Y0MDkuM3oiLz48cGF0aCBkPSJNMjg4LDQwOS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWNDA5LjN6Ii8+PHBhdGggZD0iTTQxNiw0MDkuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjQwOS4zeiIvPjwvZz48L2c+PC9zdmc+') no-repeat",
            width: "32px",
            height: "32px",
            "border-radius": "6px",
            filter: isDefault ? "invert(25%)" : "invert(75%)",
            "background-size": "32px 32px"
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
    constructor(parent) {
        super(parent);
        this.drag = this.attach(COMPONENT.UIWidgetWindowMove);
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
                let parent = target.getRootNode().host;
                if (parent) {
                    parent.instance.trigger("press");
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