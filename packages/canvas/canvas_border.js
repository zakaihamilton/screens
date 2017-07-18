/*
    @author Zakai Hamilton
    @component CanvasBorder
*/

package.canvas.border = function CanvasBorder(me) {
    me.attach = function(object) {

    };
    me.draw = function(object, canvas) {
        var context = me.get(canvas, "context");
        if(object.style.borderColor) {
            var region = me.ui.rect.relative_region(object, canvas);
            context.beginPath();
            context.strokeStyle=object.style.borderColor;
            context.lineWidth=parseInt(object.style.borderWidth);
            context.rect(region.left,region.top,region.width,region.height);
            context.stroke();
        }
    };
};
