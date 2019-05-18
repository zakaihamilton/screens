COMPONENT.UIWidget = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    static start(me) {
        let config = me.config();
        if (!config.tag) {
            return;
        }
        window.customElements.define(config.tag, class extends HTMLElement {
            constructor() {
                super();
                let instance = new COMPONENT[me.name]();
                instance.element = this;
                this.instance = instance;
                instance.send("register", instance);
                instance.send("update", instance);
            }
        });
    }
    stylesToHtml() {
        let styles = typeof this.styles === "function" ? this.styles(this.element) : {};
        let css = typeof this.css === "function" ? this.css(this.element) : "";
        let html = "";
        for (let key in styles) {
            html += "\n\t" + key + ":" + styles[key] + ";";
        }
        if (html) {
            return `
            <style>:host {${html}\n}\n${css}</style>`;
        }
    }
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
    }
    eventListenerManage(events, method) {
        events = typeof events === "function" ? events(this.element) : events;
        for (let name in events) {
            let callback = events[name];
            let touch = this.package.UIEventTouch;
            let mapping = touch.mapping[name];
            let isWindow = touch.isWindow[name];
            if (mapping) {
                name = mapping;
            }
            let target = isWindow ? window : this.element;
            target[method](name, callback);
        }
    }
    registerEvents(events) {
        this.eventListenerManage(events, "addEventListener");
    }
    unregisterEvents(events) {
        this.eventListenerManage(events, "removeEventListener");
    }
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
            let template = document.createElement("template");
            template.innerHTML = html;
            let shadowRoot = this.element.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }
    }
    register() {
        this.registerEvents(this.events);
    }
    show() {
        this.element.style.visibility = "visible";
    }
    hide() {
        this.element.style.visibility = "hidden";
    }
    render() {

    }
    data() {
        return {};
    }
    trigger(name, event) {
        var method = new Function("e", "with(document) { with(this) {" + this.element.getAttribute("on" + name) + "}}");
        method.call(this.element, event);
    }
    parent(filter) {
        let parent = this.element;
        var tagName = "";
        do {
            tagName = parent.tagName ? parent.tagName.toLowerCase() : "";
            parent = parent.parentNode;
            if (parent === window.document.body) {
                parent = null;
                break;
            }
            if (parent) {
                continue;
            }
            let root = this.element.getRootNode();
            if (root) {
                parent = root.host;
            }
        } while (filter && tagName !== filter);
        return parent;
    }
};