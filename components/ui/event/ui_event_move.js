COMPONENT.UIEventMove = class extends COMPONENT.CoreObject {
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
                let move = instance.cast(COMPONENT.UIEventMove);
                if (!move._isEnabled) {
                    return;
                }
                let owner = move.owner();
                let parent = target.getRootNode().host;
                while (parent && (!parent.tagName || parent.tagName.toLowerCase() !== owner)) {
                    parent = parent.getRootNode().host;
                }
                if (!parent) {
                    return;
                }
                let diff = 15;
                let superParent = parent.parentElement;
                let targetRect = target.getBoundingClientRect().toJSON();
                let parentRect = parent.getBoundingClientRect().toJSON();
                let superRect = superParent.getBoundingClientRect().toJSON();
                let left = event.clientX - parentRect.left;
                let top = event.clientY - parentRect.top;
                let initialPos = { left: event.clientX - left, top: event.clientY - top };
                let currentPos = { left: initialPos.left, top: initialPos.top };
                let targetPos = null;
                event.preventDefault();
                parent.instance.send("move");
                const events = {
                    move(event) {
                        currentPos = { left: event.clientX - left, top: event.clientY - top };
                        if (targetPos || currentPos.left < initialPos.left - diff || currentPos.left > initialPos.left + diff ||
                            currentPos.top < initialPos.top - diff || currentPos.top > initialPos.top + diff) {
                            parent.style.left = currentPos.left + "px";
                            parent.style.top = currentPos.top + "px";
                            parent.style.right = "";
                            parent.style.bottom = "";
                            targetPos = { left: currentPos.left, top: currentPos.top };
                        }
                    },
                    up() {
                        instance.unregisterEvents(events);
                        parent.instance.send("move", targetPos);
                    }
                };
                instance.registerEvents(events);
            }
        };
    }
    register(instance) {
        instance.registerEvents(this.events);
    }
};