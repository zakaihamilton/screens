COMPONENT.UIEventResize = class extends COMPONENT.CoreObject {
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
                let move = instance.cast(COMPONENT.UIEventResize);
                if (!move._isEnabled) {
                    return;
                }
                let owner = move.owner();
                let parent = instance.parent(owner);
                if (!parent) {
                    return;
                }
                let diff = 15;
                let parentRect = parent.element.getBoundingClientRect().toJSON();
                let width = event.clientX - parentRect.width;
                let height = event.clientY - parentRect.height;
                let initialSize = { width: event.clientX - width, height: event.clientY - height };
                let currentSize = { width: initialSize.width, height: initialSize.height };
                let targetSize = null;
                event.preventDefault();
                let resizeCallback = (event) => {
                    currentSize = { width: event.clientX - width, height: event.clientY - height };
                    if (!targetSize || targetSize || currentSize.width < initialSize.width - diff || currentSize.width > initialSize.width + diff ||
                        currentSize.height < initialSize.height - diff || currentSize.height > initialSize.height + diff) {
                        targetSize = { width: currentSize.width, height: currentSize.height };
                        parent.send("resize", targetSize);
                    }
                };
                const events = {
                    move(event) {
                        resizeCallback(event);
                    },
                    up(event) {
                        resizeCallback(event);
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