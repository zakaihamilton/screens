/*
 @author Zakai Hamilton
 @component CanvasBorder
 */

package.canvas.border = function CanvasBorder(me) {
    me.attach = function (object) {

    };
    me.draw = function (object, canvas) {
        var context = me.core.property.get(canvas, "context");
        if (object.style.borderColor) {
            var region = me.ui.rect.relative_region(object, canvas);
            var colors = me.ui.style.values(object.style.borderColor);
            var widths = me.ui.style.values(object.style.borderWidth);
            context.save();
            context.lineJoin = "miter";
            var lineWidth = parseInt(widths.left);
            region.left -= lineWidth / 2;
            region.top -= lineWidth / 2;
            region.width += lineWidth;
            region.height += lineWidth;
            var left = region.left - (lineWidth / 2);
            var right = region.left + (lineWidth / 2);
            var top = region.top - (lineWidth / 2);
            var bottom = region.top + (lineWidth / 2);
            var width = region.width;
            var height = region.height;
            me.trapezoid(context, colors.top, left, top, right + width, top, left + width, bottom, right, bottom);
            me.trapezoid(context, colors.right, right + width, top, right + width, bottom + height, left + width, top + height, left + width, bottom);
            me.trapezoid(context, colors.bottom, right + width, bottom + height, left, bottom + height, right, top + height, left + width, top + height);
            me.trapezoid(context, colors.left, left, bottom + height, left, top, right, bottom, right, top + height);
            context.restore();
            context.beginPath();
        }
    };
    me.trapezoid = function (context, color, x1, y1, x2, y2, x3, y3, x4, y4) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    };
};
