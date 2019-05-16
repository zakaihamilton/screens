COMPONENT.UIEventTouch = class UIEventTouch extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    static init(me) {
        if (window.PointerEvent) {
            me.mapping = {
                down: "pointerdown",
                enter: "pointerenter",
                leave: "pointerleave",
                move: "pointermove",
                out: "pointerout",
                over: "pointerover",
                up: "pointerup",
                cancel: "pointercancel"
            };
        }
        else {
            me.mapping = {
                down: "mousedown",
                enter: "mouseenter",
                leave: "mouseleave",
                move: "mousemove",
                out: "mouseout",
                over: "mouseover",
                up: "mouseup",
                cancel: "mousecancel"
            };
        }
        me.isWindow = {
            move: true,
            up: true
        };
    }
};
