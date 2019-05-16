COMPONENT.UIEventMove = class UIEventMove extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    events() {
        return {
            down(event) {
                let target = event.currentTarget;
                let instance = target.instance;
                let selector = instance.cast(COMPONENT.UIEventMove).selector();
                let parent = target.closest(selector);
                parent.startRect = parent.getBoundingClientRect().toJSON();
                parent.startRect.left = event.clientX - parent.startRect.left;
                parent.startRect.top = event.clientY - parent.startRect.top;
                event.preventDefault();
                parent.instance.send("move", true);
                const events = {
                    move(event) {
                        parent.style.left = (event.clientX - parent.startRect.left) + "px";
                        parent.style.top = (event.clientY - parent.startRect.top) + "px";
                    },
                    up() {
                        instance.unregisterEvents(events);
                        parent.instance.send("move", false);
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