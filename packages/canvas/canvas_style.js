/*
    @author Zakai Hamilton
    @component CanvasStyle
*/

package.canvas.style = function CanvasStyle(me) {
    me.attach = function(object) {
        object.style = {"display":"inline"};
        object._getComputedStyle = me.getComputedStyle;
        Object.defineProperty(object.style, "border", {
            set: function (value) {
                var args = value.split(" ");
                if(args.length === 3) {
                    object.style.borderWidth = args[0];
                    object.style.borderStyle = args[1];
                    object.style.borderColor = args[2];
                }
            }
        });
        Object.defineProperty(object.style, "left", {
            set: function(value) {
                object.offsetLeft = parseInt(value);
            }
        });
        Object.defineProperty(object.style, "top", {
            set: function(value) {
                object.offsetTop = parseInt(value);
            }
        });
        Object.defineProperty(object.style, "width", {
            set: function(value) {
                object.offsetWidth = parseInt(value);
            }
        });
        Object.defineProperty(object.style, "height", {
            set: function(value) {
                object.offsetHeight = parseInt(value);
            }
        });
    };
    me.getComputedStyle = function(object) {
        return object.style;
    };
};
