COMPONENT.UIWidgetMenu = class extends COMPONENT.UIWidget {
    static config() {
        return {
            platform: "browser",
            tag: "widget-menu"
        };
    }
    normal() {
        return {
            "border-bottom": "1px solid black",
            "width": "100%",
            "height": "300px",
            "overflow": "scroll"
        };
    }
    render(element) {
        let html = "<div>Hello</div><div>Yo!</div>";
        return html;
    }
};