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
    updateClasses() {
        let classes = typeof this.classes === "function" ? this.classes(this.element) : this.classes;
        if (this.prevClasses) {
            for (let name of this.prevClasses) {
                if (!classes || !classes.includes(name)) {
                    this.element.classList.remove(name);
                }
            }
        }
        if (classes) {
            for (let name of classes) {
                this.element.classList.add(name);
            }
        }
        this.prevClasses = classes;
    },
    registerEvents(events) {
        events = typeof events === "function" ? events(this.element) : events;
        for (let name in events) {
            let callback = events[name];
            let mapping = this.package.UIEventTouch.mapping[name];
            if (mapping) {
                name = mapping;
            }
            this.element.addEventListener(name, callback);
        }
    },
    update() {
        let series = {
            data: "data",
            stylesToHtml: null,
            updateClasses: null,
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
                instance.send("register", instance);
                instance.send("update", instance);
            }
        });
    },
    register() {
        this.registerEvents(this.events);
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