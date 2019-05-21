COMPONENT.UIEventFocus = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
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
        let children = Array.from(widget.element.parentElement.children);
        children = children.sort((a, b) => a.style.zIndex - b.style.zIndex);
        if (children[children.length - 1] === widget.element) {
            return;
        }
        children = children.filter(a => a !== widget.element);
        let current = children[children.length - 1];
        if (current && current.instance) {
            current.instance.send("blurEvent");
        }
        children.push(widget.element);
        children.map((child, index) => child.style.zIndex = index * 100);
        this.send("focusEvent");
    }
    register(instance) {
        instance.registerEvents(this.events);
    }
};