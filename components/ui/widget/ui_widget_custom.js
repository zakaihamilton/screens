COMPONENT.define({
    name: "UIWidgetCustom",
    config: {
        platform: "browser",
    },
    init(me) {

    },
    extends(me) {
        window.customElements.define(me.config.tag, class extends HTMLElement {

        });
    },
    constructor() {
        this.element = document.createElement(this.config.tag);
    },
    show() {
        this.element.style.visibility = "visible";
    },
    hide() {
        this.element.style.visibility = "hidden";
    }
});