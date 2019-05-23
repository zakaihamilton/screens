COMPONENT.UIEventFocus = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    static start() {
        COMPONENT.UIEventFocus.focus();
    }
    static focus() {
        let children = Array.from(document.body.children);
        children[children.length - 1].instance.send("focus");
    }
    constructor(parent) {
        super(parent);
        this._isEnabled = true;
    }
    isEnabled() {
        return this._isEnabled;
    }
    enable(isEnabled) {
        this._isEnabled = isEnabled;
    }
    events() {
        return {
            down(event) {
                let target = event.currentTarget;
                let instance = target.instance;
                let move = instance.cast(COMPONENT.UIEventFocus);
                if (!move._isEnabled) {
                    return;
                }
                let parent = instance;
                if (move.owner) {
                    let owner = move.owner();
                    parent = instance.parent(owner);
                    if (!parent) {
                        return;
                    }
                }
                parent.send("focus");
            }
        };
    }
    unfocus() {
        let widget = this.cast(COMPONENT.UIWidget);
        let children = Array.from(widget.element.parentElement.children);
        children = children.sort((a, b) => a.style.zIndex - b.style.zIndex);
        for (let child of children) {
            let instance = child.instance;
            if (instance && instance.inFocus()) {
                instance.send("blurEvent");
            }
        }
    }
    focus() {
        let widget = this.cast(COMPONENT.UIWidget);
        if (widget.parent()) {
            return;
        }
        let children = Array.from(widget.element.parentElement.children);
        children = children.sort((a, b) => a.style.zIndex - b.style.zIndex);
        children = children.filter(child => child !== widget.element && child.instance);
        children.map(child => {
            if (child.instance.inFocus && child.instance.inFocus()) {
                child.instance.send("blurEvent");
            }
        });
        let current = children[children.length - 1];
        children.push(widget.element);
        children.map((child, index) => {
            if (!child.instance) {
                return;
            }
            if (child.instance.alwaysOnTop) {
                child.style.zIndex = (index + 1) * 1000;
            }
            else {
                child.style.zIndex = (index + 1) * 100;
            }
        });
        children = children.sort((a, b) => a.style.zIndex - b.style.zIndex);
        if (current && current.instance && current.instance.inFocus && current.instance.inFocus()) {
            current.instance.send("blurEvent");
        }
        if (widget && widget.inFocus && !widget.inFocus()) {
            this.send("focusEvent");
        }
    }
    register(instance) {
        instance.registerEvents(this.events);
    }
};