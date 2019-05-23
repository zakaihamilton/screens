COMPONENT.AppHome = class extends COMPONENT.UIWidgetWindow {
    static config() {
        return {
            platform: "browser",
            tag: "app-home"
        };
    }
    constructor(element) {
        element.setAttribute("label", "Screens");
        element.setAttribute("maximize", "true");
        super(element);
    }
    canClose() {
        return false;
    }
    dblclickTitle() {
        this.send("sendToBack");
    }
};