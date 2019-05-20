COMPONENT.UIWidgetMenu = class extends COMPONENT.UIWidgetWindow {
    static config() {
        return {
            platform: "browser",
            tag: "widget-menu"
        };
    }
    content() {
        return "<div>Hello</div>";
    }
};