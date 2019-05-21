COMPONENT.UIWidgetList = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-list"
        };
    }
    constructor(element) {
        super(element);
    }
    styles(element) {
        const isDefault = element.getAttribute("default");
        return {
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
    groups() {
        return {
            ...super.groups(),
            itemsClass: ".items"
        };
    }
    itemsClass() {
        return {
            "border": "1px solid darkgray",
            "overflow": "scroll",
            "max-height": "150px",
            "padding": "6px",
            "padding-right": "16px",
            "border-radius": "6px",
            "display": "flex",
            "flex-direction": "column"
        };
    }
    async move(pos) {
        if (pos) {
            let region = Object.assign({}, this.region);
            region.left = pos.left + "px";
            region.top = pos.top + "px";
            region.right = "";
            region.bottom = "";
            this.region = region;
            await this.updateStyles();
        }
    }
    render(element) {
        return "<widget-list-handle></widget-list-handle><div class=\"items\"><slot></slot><div>";
    }
};

COMPONENT.UIWidgetListHandle = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-list-handle"
        };
    }
    constructor(parent) {
        super(parent);
        this.move = this.attach(COMPONENT.UIWidgetListMove);
    }
    hover() {
        return {
            filter: "invert(50%)"
        };
    }
    touch() {
        return {
            filter: "invert(25%)"
        };
    }
    normal(element) {
        return {
            "background": "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48Zz48cGF0aCBkPSJNMTYwLDE1My4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMTUzLjN6Ii8+PHBhdGggZD0iTTI4OCwxNTMuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjE1My4zeiIvPjxwYXRoIGQ9Ik00MTYsMTUzLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YxNTMuM3oiLz48L2c+PGc+PHBhdGggZD0iTTE2MCwyODEuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjI4MS4zeiIvPjxwYXRoIGQ9Ik0yODgsMjgxLjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1YyODEuM3oiLz48cGF0aCBkPSJNNDE2LDI4MS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWMjgxLjN6Ii8+PC9nPjxnPjxwYXRoIGQ9Ik0xNjAsNDA5LjNjMCwzLjctMyw2LjctNi43LDYuN2gtNTAuNWMtMy43LDAtNi43LTMtNi43LTYuN3YtNTAuNWMwLTMuNywzLTYuNyw2LjctNi43aDUwLjVjMy43LDAsNi43LDMsNi43LDYuN1Y0MDkuM3oiLz48cGF0aCBkPSJNMjg4LDQwOS4zYzAsMy43LTMsNi43LTYuNyw2LjdoLTUwLjVjLTMuNywwLTYuNy0zLTYuNy02Ljd2LTUwLjVjMC0zLjcsMy02LjcsNi43LTYuN2g1MC41YzMuNywwLDYuNywzLDYuNyw2LjdWNDA5LjN6Ii8+PHBhdGggZD0iTTQxNiw0MDkuM2MwLDMuNy0zLDYuNy02LjcsNi43aC01MC41Yy0zLjcsMC02LjctMy02LjctNi43di01MC41YzAtMy43LDMtNi43LDYuNy02LjdoNTAuNWMzLjcsMCw2LjcsMyw2LjcsNi43VjQwOS4zeiIvPjwvZz48L2c+PC9zdmc+') no-repeat",
            "background-size": "16px 16px",
            width: "16px",
            height: "16px",
            "border-radius": "6px",
            filter: "invert(75%)"
        };
    }
};

COMPONENT.UIWidgetListMove = class extends COMPONENT.UIEventMove {
    static config() {
        return {
            platform: "browser"
        };
    }
    owner() {
        return "widget-list";
    }
};

COMPONENT.UIWidgetListItem = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-list-item"
        };
    }
    members() {
        let children = Array.from(this.element.children);
        children = children.filter(child => child.tagName && child.tagName.toLowerCase() === "widget-list-item");
        return children;
    }
    isExpanded() {
        let children = this.members();
        let isExpanded = children.some(child => child.style.display !== "none");
        return isExpanded;
    }
    hasParent() {
        return this.parent("widget-list-item");
    }
    hasChildren() {
        return this.members().length;
    }
    groups() {
        return {
            ...super.groups(),
            itemClass: ".item",
            itemHoverClass: ".item:hover",
            itemTouchClass: ".item:hover:active"
        };
    }
    itemClass() {
        return {
            width: "100%",
            height: "24px",
            display: "flex",
            "border-radius": "6px"
        };
    }
    press() {
        alert("Hello");
    }
    normal() {
        return {
            "padding": "3px",
            "display": "block",
            "user-select": "none",
            "left": "0px",
            "right": "0px",
            "position": "relative",
            ... this.hasParent() && { "margin-left": "22px", "margin-right": "-3px" }
        };
    }
    render(element) {
        let html = "<div class=\"item\">";
        if (this.hasChildren()) {
            html += "<widget-list-item-expand></widget-list-item-expand>";
        }
        let label = element.getAttribute("label");
        if (label) {
            html += `<widget-list-item-label>${label}</widget-list-item-label>`;
        }
        html += "</div><slot></slot>";
        return html;
    }
};

COMPONENT.UIWidgetListItemExpand = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-list-item-expand"
        };
    }
    hover() {
        return {
            filter: "invert(20%)"
        };
    }
    touch() {
        return {
            filter: "invert(10%)"
        };
    }
    toggle() {
        let children = this.state("members");
        let isExpanded = this.state("isExpanded");
        for (let child of children) {
            if (!isExpanded) {
                child.style.display = "block";
            }
            else {
                child.style.display = "none";
            }
        }
        this.update();
    }
    events() {
        return {
            click() {
                this.instance.toggle();
            }
        };
    }
    normal(element) {
        let isExpanded = this.state("isExpanded");
        let hasChildren = this.state("hasChildren");
        return {
            "border-radius": "6px",
            "user-select": "none",
            "padding-left": "3px",
            "padding-right": "3px",
            "border": "1px solid lightgray",
            "width": "20px",
            "height": "20px",
            "visibility": hasChildren ? "visible" : "hidden",
            ...!isExpanded && { "background": "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNMTg0LjcsNDEzLjFsMi4xLTEuOGwxNTYuNS0xMzZjNS4zLTQuNiw4LjYtMTEuNSw4LjYtMTkuMmMwLTcuNy0zLjQtMTQuNi04LjYtMTkuMkwxODcuMSwxMDFsLTIuNi0yLjMgIEMxODIsOTcsMTc5LDk2LDE3NS44LDk2Yy04LjcsMC0xNS44LDcuNC0xNS44LDE2LjZoMHYyODYuOGgwYzAsOS4yLDcuMSwxNi42LDE1LjgsMTYuNkMxNzkuMSw0MTYsMTgyLjIsNDE0LjksMTg0LjcsNDEzLjF6Ii8+PC9zdmc+) no-repeat" },
            ...isExpanded && { "background": "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNOTguOSwxODQuN2wxLjgsMi4xbDEzNiwxNTYuNWM0LjYsNS4zLDExLjUsOC42LDE5LjIsOC42YzcuNywwLDE0LjYtMy40LDE5LjItOC42TDQxMSwxODcuMWwyLjMtMi42ICBjMS43LTIuNSwyLjctNS41LDIuNy04LjdjMC04LjctNy40LTE1LjgtMTYuNi0xNS44djBIMTEyLjZ2MGMtOS4yLDAtMTYuNiw3LjEtMTYuNiwxNS44Qzk2LDE3OS4xLDk3LjEsMTgyLjIsOTguOSwxODQuN3oiLz48L3N2Zz4=) no-repeat" },
            "background-size": "20px 20px",
        };
    }
};

COMPONENT.UIWidgetListItemLabel = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-list-item-label"
        };
    }
    hover() {
        return {
            "background-color": "darkgray"
        };
    }
    touch() {
        return {
            "background-color": "white"
        };
    }
    events() {
        return {
            click(event) {
                let target = event.currentTarget;
                let parent = target.instance.parent("widget-list-item");
                if (parent) {
                    parent.trigger("press");
                }
            }
        };
    }
    normal(element) {
        return {
            "border-radius": "6px",
            "user-select": "none",
            "width": "100%",
            "padding": "3px",
            "padding-left": "6px",
            "padding-right": "6px"
        };
    }
};
