COMPONENT.UIWidgetMenu = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-menu"
        };
    }
    normal() {
        return {
            "border-top": "1px solid black",
            "border-right": "1px solid black",
            "background-color": "red",
            "width": "70%",
            "height": "100%",
            "top": "31px",
            "overflow": "scroll",
            "box-sizing": "border-box",
            "position": "absolute"
        };
    }
    render(element) {
        let html = "<div>Hello</div><div>Yo!</div><div>Hello</div><div>Yo!</div><div>Hello</div><div>Yo!</div><div>Hello</div><div>Yo!</div>";
        return html;
    }
};