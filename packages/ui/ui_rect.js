/*
 @author Zakai Hamilton
 @component UIRect
 */

package.ui.rect = function UIRect(me) {
    me.move = {
        set: function (object, value) {
            var window = me.ui.element.to_object(value);
            object.addEventListener('mousedown', function (e) {
                me.ui.element.set(window, "ui.focus.active", true);
                var window_region = me.ui.rect.absolute_region(window);
                var info = {target: window,
                    left: e.clientX-window_region.left,
                    top: e.clientY-window_region.top,
                    width: window.offsetWidth,
                    height: window.offsetHeight};
                var move_method = function (e) {
                    var window_region = me.ui.rect.absolute_region(window);
                    var shift_region = {};
                    me.ui.rect.empty_region(shift_region);
                    window_region.left = e.clientX - info.left;
                    window_region.top = e.clientY - info.top;
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
    me.resize = {
        set: function (object, value) {
            var window = me.ui.element.to_object(value);
            object.addEventListener('mousedown', function (e) {
                me.ui.element.set(window, "ui.focus.active", true);
                var info = {target: window, left: e.clientX, top: e.clientY, width: window.offsetWidth, height: window.offsetHeight};
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
    me.relative_region = function (object) {
        object = me.ui.element.to_object(object);
        var parent_region = me.absolute_region(object.parentNode);
        var region = me.absolute_region(object);
        var xPos = region.left - parent_region.left;
        var yPos = region.top - parent_region.top;
        var width = object.clientWidth;
        var height = object.clientHeight;
        return {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
    };
    me.absolute_region = function (object) {
        object = me.ui.element.to_object(object);
        var xPos = 0;
        var yPos = 0;
        var width = object.clientWidth;
        var height = object.clientHeight;

        while (object) {
            if (object.tagName === "BODY") {
                // deal with browser quirks with body/window/document and page scroll
                var xScroll = object.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = object.scrollTop || document.documentElement.scrollTop;

                xPos += (object.offsetLeft - xScroll + object.clientLeft);
                yPos += (object.offsetTop - yScroll + object.clientTop);
            } else {
                // for all other non-BODY elements
                xPos += (object.offsetLeft - object.scrollLeft + object.clientLeft);
                yPos += (object.offsetTop - object.scrollTop + object.clientTop);
            }

            object = object.offsetParent;
        }
        return {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
    };
    me.empty_region = function(region) {
        region.left = 0;
        region.top = 0;
        region.width = 0;
        region.height = 0;
    };
    me.set_relative_region = function(object, region) {
        object = me.ui.element.to_object(object);
        var parent_region = me.absolute_region(object.parentNode);
        object.style.left = region.left - parent_region.left + "px";
        object.style.top = region.top - parent_region.top + "px";
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.set_absolute_region = function(object, region) {
        object = me.ui.element.to_object(object);
        if(object.style.position === "absolute") {
            if(object.parentNode === document.body) {
                object.style.left = region.left - object.clientLeft + "px";
                object.style.top = region.top - object.clientTop + "px";
            }
            else {
                var parent_region = me.absolute_region(object.parentNode);
                object.style.left = region.left - object.clientLeft - parent_region.left + "px";
                object.style.top = region.top - object.clientLeft - parent_region.top + "px";
            }
        }
        else if(object.style.position === "relative") {
            object.style.left = region.left + "px";
            object.style.top = region.top + "px";
        }
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.in_region = function (region, x, y) {
        return !(x < region.left || y < region.top || x > region.right || y > region.bottom);
    };
    me.in_view_bounds = function(region) {
        var view = me.viewport();
        return !(region.left < view.left || region.top < view.top || region.right > view.right || region.bottom > view.bottom);
    };
    me.viewport = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window))
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        var width = e[ a + 'Width' ];
        var height = e[ a + 'Height' ];
        return {left:0,top:0,width:width,height:height,right:width,bottom:height};
    };
};
