/*
    @author Zakai Hamilton
    @component CanvasText
*/

package.canvas.text = function CanvasText(me) {
    me.attach = function(object) {

    };
    me.draw = function(object, canvas) {
        var context = me.core.property.get(canvas, "context");
        if(object.textContent) {
            me.core.console.log("textContent: " +object.textContent);
            var region = me.ui.rect.relative_region(object, canvas);
            var textPos = me.textPos(object, context, region);
            context.textAlign = object.style.textAlign || "left";
            context.fillStyle = object.style.textColor || "black";
            context.textBaseline = object.style.verticalAlign || "top";
            context.font = object.style.font || "16px MS Sans Serif";
            context.fillText(object.textContent, textPos.left, textPos.top);
        }
    };
    me.textPos = function(object, context, region) {
        var textPos = {left:region.left,top:region.top};
        var textAlign = object.style.textAlign;
        var verticalAlign = object.style.verticalAlign;
        if(textAlign === "center") {
            textPos.left = region.left + (region.width / 2);
        }
        else if(textAlign === "right") {
            textPos.left = region.right;
        }
        if(verticalAlign === "middle") {
            textPos.top = region.top + (region.height / 2);
        }
        else if(verticalAlign === "bottom") {
            textPos.top = region.bottom;
        }
        return textPos;
    };
};
