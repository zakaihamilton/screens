COMPONENT.UIEventMove = class extends COMPONENT.CoreObject {
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
                let owner = instance.cast(COMPONENT.UIEventMove).owner();
                let parent = target.getRootNode().host;
                while (parent && (!parent.tagName || parent.tagName.toLowerCase() !== owner)) {
                    parent = parent.getRootNode().host;
                }
                if (!parent) {
                    return;
                }
                let superParent = parent.parentElement;
                let parentRect = parent.getBoundingClientRect().toJSON();
                let superRect = superParent.getBoundingClientRect().toJSON();
                let left = event.clientX - parentRect.left + superRect.left;
                let top = event.clientY - parentRect.top + superRect.top;
                event.preventDefault();
                parent.instance.send("move", true);
                const events = {
                    move(event) {
                        parent.style.left = (event.clientX - left) + "px";
                        parent.style.top = (event.clientY - top) + "px";
                        parent.style.right = "";
                        parent.style.bottom = "";
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