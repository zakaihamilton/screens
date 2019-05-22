COMPONENT.AppHome = class extends COMPONENT.UIWidgetWindow {
    static config() {
        return {
            platform: "browser",
            tag: "app-home"
        };
    }
    constructor(element) {
        super(element);
    }
    canClose() {
        return false;
    }
};