COMPONENT.define({
    name: "UIWidgetWindow",
    config: {
        platform: "browser",
        extends: "UIWidgetCustom",
        tag: "widget-window"
    },
    constructor() {
        this.element.innerHTML = "<h1>Hello</h1>";
    }
});