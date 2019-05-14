COMPONENT.define({
    name: "UIWidgetCustom",
    config: {
        platform: "browser",
    },
    init(me) {
    },
    stylesToHtml(element) {
        let data = element.data;
        if (!data.styles) {
            return "";
        }
        let styles = "";
        for (let key in data.styles) {
            styles += key + ":" + data.styles[key] + ";";
        }
        return `
        <style>
            ${this.config.tag} {
                ${styles}
            }
        </style>`;
    },
    extends(me) {
        window.customElements.define(me.config.tag, class extends HTMLElement {
            constructor() {
                super();

                let instance = new COMPONENT[me.name]();
                instance.element = this;
                this.instance = instance;
                let data = typeof instance.data === "function" ? instance.data(this) : instance.data;
                this.data = data;
                let html = "";
                let styles = instance.stylesToHtml(this);
                if (styles) {
                    html += styles;
                }
                let content = typeof instance.render === "function" ? instance.render(this) : instance.render;
                if (content) {
                    html += content;
                }
                if (html) {
                    this.innerHTML = html;
                }
            }
        });
    },
    show() {
        this.element.style.visibility = "visible";
    },
    hide() {
        this.element.style.visibility = "hidden";
    },
    render() {

    },
    data() {
        return {};
    }
});