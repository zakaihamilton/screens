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
                let children = Array.from(parent.element.parentElement.children);
                children = children.sort((a, b) => a.style.zIndex - b.style.zIndex);
                children = children.filter(a => a !== target);
                children.push(target);
                children.map((child, index) => child.style.zIndex = index * 100);
            }
        };
    }
    register(instance) {
        instance.registerEvents(this.events);
    }
};