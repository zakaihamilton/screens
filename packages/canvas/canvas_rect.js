/*
    @author Zakai Hamilton
    @component CanvasRect
*/

package.canvas.rect = function CanvasStyle(me) {
    me.attach = function(object) {
        object.getBoundingClientRect = function() {
            return me.getBoundingClientRect(this);
        };
        Object.defineProperty(object, "clientLeft", {
            get: function () {
                return parseInt(object.style.borderWidth);
            }
        });
        Object.defineProperty(object, "clientTop", {
            get: function () {
                return parseInt(object.style.borderWidth);
            }
        });
        Object.defineProperty(object, "clientWidth", {
            get: function () {
                return object.offsetWidth - (parseInt(object.style.borderWidth) * 2);
            }
        });
        Object.defineProperty(object, "clientHeight", {
            get: function () {
                return object.offsetHeight - (parseInt(object.style.borderWidth) * 2);
            }
        });
        Object.defineProperty(object, "scrollLeft", {
            get: function () {
                return 0;
            }
        });
        Object.defineProperty(object, "scrollTop", {
            get: function () {
                return 0;
            }
        });        
        Object.defineProperty(object, "scrollWidth", {
            get: function () {
                return object.offsetWidth - (object.style.borderWidth * 2);
            }
        });
        Object.defineProperty(object, "scrollHeight", {
            get: function () {
                return object.offsetHeight - (object.style.borderWidth * 2);
            }
        });
        object.offsetLeft = 0;
        object.offsetTop = 0;
        object.offsetWidth = 0;
        object.offsetHeight = 0;
    };
    me.getBoundingClientRect = function(object) {
        return {
            "left":object.offsetLeft,
            "top":object.offsetTop,
            "width":object.offsetWidth,
            "height":object.offsetHeight
        };
    };
};
