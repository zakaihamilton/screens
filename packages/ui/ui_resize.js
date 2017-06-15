/*
 @author Zakai Hamilton
 @component UIResize
 */

package.ui.resize = function UIResize(me) {
    me.element = {
        set: function (object, value) {
            console.log("resize_element object: " + object + " value: " + value);
            var window = me.ui.element.to_object(value);
            object.addEventListener('mousedown', function (e) {
                var info = {target: window, left: e.clientX, top: e.clientY, width: window.offsetWidth, height: window.offsetHeight};
                console.log("info: " + JSON.stringify(info));
                var move_method = function (e) {
                    var window_region = me.ui.rect.absolute_region(window);
                    var object_region = me.ui.rect.absolute_region(object);
                    var shift_region = {};
                    me.ui.rect.empty_region(shift_region);
                    var is_absolute = info.target.style.position === "absolute";
                    if(object_region.left < window_region.left + (window_region.width / 2)) {
                        if(is_absolute) {
                            window_region.width = window_region.width + (window_region.left - e.clientX);
                            window_region.left = e.clientX;
                        }
                    }
                    else {
                        window_region.width = e.clientX - info.left + info.width;
                    }
                    if(object_region.top < window_region.top + (window_region.height / 2)) {
                        if(is_absolute) {
                            window_region.height = window_region.height + (window_region.top - e.clientY);
                            window_region.top = e.clientY;
                        }
                    }
                    else {
                        window_region.height = e.clientY - info.top + info.height;
                    }
                    me.ui.rect.set_absolute_region(info.target, window_region);
                };
                var release_method = function (e) {
                    removeEventListener('mousemove', move_method);
                    removeEventListener('mouseup', release_method);
                };
                addEventListener('mousemove', move_method);
                addEventListener('mouseup', release_method);
                e.preventDefault();
            });
        }
    };
}
