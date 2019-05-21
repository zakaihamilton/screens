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
                let instance = new COMPONENT[me.name](this);
                instance.send("register", instance);
                instance.send("update", instance);
            }
        });
    }
    constructor(element) {
        super();
        this.element = element;
        element.instance = this;
    }
    groups() {
        return {
            normal: ":host",
            hover: ":host(:hover)",
            touch: ":host(:active:hover)"
        };
    }
    updateCss() {
        let groups = this.groups(this.element);
        let html = "";
        for (let method in groups) {
            let result = method in this ? this[method](this.element) : "";
            if (result) {
                html += groups[method] + "{\n";
                for (let key in result) {
                    html += key + ":" + result[key] + ";\n";
                }
                html += "}\n";
            }
        }
        if (html) {
            html = "<style>\n" + html + "</style>";
        }
        return html;
    }
    updateClasses() {
        let classes = typeof this.classes === "function" ? this.classes(this.element) : null;
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
    updateStyles() {
        let styles = typeof this.styles === "function" ? this.styles(this.element) : null;
        if (styles) {
            for (let key in styles) {
                this.element.style[key] = styles[key];
            }
        }
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
    async update() {
        let series = {
            data: "data",
            updateCss: null,
            updateStyles: null,
            updateClasses: null,
            render: null
        };
        let html = "";
        for (let method in series) {
            let result = typeof this[method] === "function" ? await this[method](this.element) : "";
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
            let shadowRoot = this.element.shadowRoot;
            if (!shadowRoot) {
                shadowRoot = this.element.attachShadow({ mode: "open" });
            }
            shadowRoot.innerHTML = "";
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
    content() {
        return "<slot></slot>";
    }
    render() {
        if (this.content) {
            return `${this.content()}`;
        }
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
            parent = parent.parentNode;
            if (!parent || parent === window.document.body) {
                parent = null;
                break;
            }
            if (!parent.parentElement && parent.host) {
                parent = parent.host;
            }
            tagName = parent.tagName ? parent.tagName.toLowerCase() : "";
        } while (filter && tagName !== filter);
        return parent ? parent.instance : null;
    }
    emit(method, params) {
        let args = Array.prototype.slice.call(arguments, 0);
        let parent = this;
        let results = [];
        do {
            results = parent.send.apply(parent, args);
            results = results.filter(e => typeof e !== "undefined");
            if (results.length) {
                break;
            }
            parent = parent.parent();
        } while (parent);
        return results;
    }
    state(method, params) {
        return this.emit(method, params)[0];
    }
    get region() {
        let style = this.element.style;
        return {
            left: style.left,
            top: style.top,
            right: style.right,
            bottom: style.bottom,
            width: style.width,
            height: style.height
        };
    }
    set region(region) {
        let style = this.element.style;
        style.left = region.left || "";
        style.top = region.top || "";
        style.right = region.right || "";
        style.bottom = region.bottom || "";
        style.width = region.width || "";
        style.height = region.height || "";
    }
    checkAttrib(name) {
        let result = this.element.getAttribute(name);
        return !(!result || result === "" || result === "0" || result.toLowerCase() === "false");
    }
};
