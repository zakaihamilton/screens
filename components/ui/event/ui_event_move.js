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
                let moveCallback = (event) => {
                    currentPos = { left: event.clientX - left, top: event.clientY - top };
                    if (targetPos || currentPos.left < initialPos.left - diff || currentPos.left > initialPos.left + diff ||
                        currentPos.top < initialPos.top - diff || currentPos.top > initialPos.top + diff) {
                        targetPos = { left: currentPos.left, top: currentPos.top };
                        parent.send("move", targetPos);
                    }
                };
                const events = {
                    move(event) {
                        moveCallback(event);
                    },
                    up(event) {
                        moveCallback(event);
                        instance.unregisterEvents(events);
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