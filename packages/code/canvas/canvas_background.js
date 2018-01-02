/*
    @author Zakai Hamilton
    @component CanvasBackground
*/

package.canvas.background = function CanvasBackground(me) {
    me.attach = function(object) {

    };
    me.draw = function(object, canvas) {
        var context = me.core.property.get(canvas, "context");
        if(object.style.background) {
            var region = me.ui.rect.relative_region(object, canvas);
            context.fillStyle=object.style.background;
            context.fillRect(region.left,region.top,region.width,region.height);
        }
    };
};
