COMPONENT.UIRegion = class extends COMPONENT.CoreObject {
    static config() {
        return {
            platform: "browser"
        };
    }
    constructor(parent) {
        super(parent);
    }
    center() {
        let widget = this.cast(COMPONENT.UIWidget);
        let style = widget.element.style;
        style.left = "25%";
        style.top = "25%";
        style.right = "25%";
        style.bottom = "25%";
        style.width = "";
        style.height = "";
    }
};