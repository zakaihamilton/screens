/*
 @author Zakai Hamilton
 @component WidgetEditor
 */

package.widget.editor = function WidgetEditor(me) {
    me.default = {
        "ui.basic.tag": "canvas",
        "ui.theme.class": "border"
    };
    me.draw = {
        set: function (object) {
            var region = me.ui.rect.absolute_region(object.parentNode);
            object.width = region.width;
            object.height = region.height;
            var bw = object.width;
            var bh = object.height;
            
            var context = object.getContext("2d");
            context.clearRect(0, 0, object.width, object.height);
            context.fillStyle = 'green';
            context.fillRect(0,0,object.width, object.height);

            for (var x = 0; x <= bw; x += 40) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, bh);
            }

            for (var x = 0; x <= bh; x += 40) {
                context.moveTo(0, 0.5 + x);
                context.lineTo(bw, 0.5 + x);
            }

            context.strokeStyle = "black";                    
            context.stroke();
        }
    };
};
