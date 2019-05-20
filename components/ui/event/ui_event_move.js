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
                let parent = instance.parent(owner);
                if (!parent) {
                    return;
                }
                let diff = 15;
                let superParent = parent.element.parentElement;
                let parentRect = parent.element.getBoundingClientRect().toJSON();
                let superRect = superParent.getBoundingClientRect().toJSON();
                let left = event.clientX - parentRect.left + superRect.left;
                let top = event.clientY - parentRect.top + superRect.top;
                let initialPos = { left: event.clientX - left, top: event.clientY - top };
                let currentPos = { left: initialPos.left, top: initialPos.top };
                let targetPos = null;
                event.preventDefault();
                parent.send("move");
                const events = {
                    move(event) {
                        currentPos = { left: event.clientX - left, top: event.clientY - top };
                        if (targetPos || currentPos.left < initialPos.left - diff || currentPos.left > initialPos.left + diff ||
                            currentPos.top < initialPos.top - diff || currentPos.top > initialPos.top + diff) {
                            parent.element.style.left = currentPos.left + "px";
                            parent.element.style.top = currentPos.top + "px";
                            parent.element.style.right = "";
                            parent.element.style.bottom = "";
                            targetPos = { left: currentPos.left, top: currentPos.top };
                        }
                    },
                    up() {
                        instance.unregisterEvents(events);
                        parent.send("move", targetPos);
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