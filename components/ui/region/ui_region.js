COMPONENT.UIRegion = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    constructor(parent) {
        super(parent);
    }
    static screen() {
        return {
            left: 0,
            top: 0,
            width: window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth,
            height: window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight
        };
    }
    center() {
        let widget = this.cast(COMPONENT.UIWidget);
        let screenRegion = COMPONENT.UIRegion.screen();
        let region = widget.element.getBoundingClientRect().toJSON();
        let left = ((screenRegion.width - region.width) / 2);
        let top = ((screenRegion.height - region.height) / 2);
        widget.send("move", { left, top });
    }
};