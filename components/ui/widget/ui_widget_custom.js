COMPONENT.define({
    name: "UIWidgetCustom",
    config: {
        platform: "browser",
    },
    init(me) {
    },
    stylesToHtml() {
        let styles = "";
        for (let key in this.styles) {
            styles += key + ":" + this.styles[key] + ";";
        }
        if (styles) {
            return `
            <style>
                ${this.config.tag} {
                    ${styles}
                }
            </style>`;
        }
    },
    extends(me) {
        window.customElements.define(me.config.tag, class extends HTMLElement {
            constructor() {
                super();

                let instance = new COMPONENT[me.name]();
                instance.element = this;
                this.instance = instance;
                let series = {
                    data: "data",
                    stylesToHtml: "styles",
                    render: null
                };
                let html = "";
                for (let method in series) {
                    let result = typeof instance[method] === "function" ? instance[method](this) : instance[method];
                    let varName = series[method];
                    if (typeof result === "string") {
                        html += result;
                    }
                    if (varName) {
                        this[varName] = result;
                    }
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