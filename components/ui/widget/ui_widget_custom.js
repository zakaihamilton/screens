COMPONENT.define({
    name: "UIWidgetCustom",
    config: {
        platform: "browser",
    },
    stylesToHtml() {
        let styles = typeof this.styles === "function" ? this.styles(this.element) : this.styles;
        let html = "";
        for (let key in styles) {
            html += key + ":" + styles[key] + ";";
        }
        if (html) {
            return `
            <style>
                ${this.config.tag} {
                    ${html}
                }
            </style>`;
        }
    },
    registerEvents() {
        let events = typeof this.events === "function" ? this.events(this.element) : this.events;
        for (let name in events) {
            let callback = events[name];
            this.element.addEventListener(name, callback);
        }
    },
    update() {
        let series = {
            data: "data",
            stylesToHtml: "styles",
            eventsToHtml: null,
            render: null
        };
        let html = "";
        for (let method in series) {
            let result = typeof this[method] === "function" ? this[method](this.element) : this[method];
            let varName = series[method];
            if (typeof result === "string") {
                html += result;
            }
            if (varName) {
                this.element[varName] = result;
            }
        }
        if (html) {
            this.element.innerHTML = html;
        }
    },
    extends(me) {
        window.customElements.define(me.config.tag, class extends HTMLElement {
            constructor() {
                super();

                let instance = new COMPONENT[me.name]();
                instance.element = this;
                this.instance = instance;
                instance.registerEvents();
                instance.update();
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