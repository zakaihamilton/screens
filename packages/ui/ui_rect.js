/*
 @author Zakai Hamilton
 @component UIRect
 */

package.ui.rect = function UIRect(me) {
    me.movable = {
        get: function(object) {
            return object.rect_movable;
        },
        set: function(object, value) {
            object.rect_movable = value;
        }
    };
    me.resizable = {
        get: function(object) {
            return object.rect_resizable;
        },
        set: function(object, value) {
            object.rect_resizable = value;
        }
    };
    me.move = {
        set: function (object, value) {
            if(!value) {
                value = me.widget.window.window(object);
            }
            object.addEventListener('mousedown', function (e) {
                if(!value.rect_movable) {
                    e.preventDefault();
                    return;
                }
                var target_region = me.ui.rect.absolute_region(value);
                var info = {
                    target: value,
                    left: e.clientX-target_region.left,
                    top: e.clientY-target_region.top,
                    width: value.offsetWidth,
                    height: value.offsetHeight
                };
                me.ui.property.notifyAll("ui.theme.add", "transition");
                var move_method = function (e) {
                    var target_region = me.ui.rect.absolute_region(value);
                    var shift_region = {};
                    me.ui.rect.empty_region(shift_region);
                    target_region.left = e.clientX - info.left;
                    target_region.top = e.clientY - info.top;
                    me.ui.rect.set_absolute_region(info.target, target_region);
                    me.ui.property.notify(info.target, "draw", null);
                };
                var release_method = function (e) {
                    removeEventListener('mousemove', move_method);
                    removeEventListener('mouseup', release_method);
                    me.ui.property.notifyAll("ui.theme.remove", "transition");
                };
                addEventListener('mousemove', move_method);
                addEventListener('mouseup', release_method);
            });
        }
    };
    me.resize = {
        set: function (object, value) {
            if(!value) {
                value = me.widget.window.window(object);
            }
            object.addEventListener('mousedown', function (e) {
                if(!value.rect_resizable) {
                    e.preventDefault();
                    return;
                }
                var info = {
                    target: value,
                    left: e.clientX,
                    top: e.clientY,
                    width: value.offsetWidth,
                    height: value.offsetHeight
                };
                me.ui.property.notifyAll("ui.theme.add", "transition");
                var move_method = function (e) {
                    var target_region = me.ui.rect.absolute_region(value);
                    var object_region = me.ui.rect.absolute_region(object);
                    var shift_region = {};
                    me.ui.rect.empty_region(shift_region);
                    var min_width = parseInt(getComputedStyle(value).minWidth, 10);
                    var min_height = parseInt(getComputedStyle(value).minHeight, 10);
                    if(object_region.left < target_region.left + (target_region.width / 2)) {
                        target_region.width = target_region.width + (target_region.left - e.clientX);
                        if(target_region.width >= min_width) {
                            target_region.left = e.clientX;
                        }
                    }
                    else {
                        target_region.width = e.clientX - info.left + info.width;
                    }
                    if(object_region.top < target_region.top + (target_region.height / 2)) {
                        target_region.height = target_region.height + (target_region.top - e.clientY);
                        if(target_region.height >= min_height) {
                            target_region.top = e.clientY;
                        }
                    }
                    else {
                        target_region.height = e.clientY - info.top + info.height;
                    }
                    me.ui.rect.set_absolute_region(info.target, target_region);
                    me.ui.property.notify(info.target, "draw", null);
                };
                var release_method = function (e) {
                    removeEventListener('mousemove', move_method);
                    removeEventListener('mouseup', release_method);
                    me.ui.property.notifyAll("ui.theme.remove", "transition");
                };
                addEventListener('mousemove', move_method);
                addEventListener('mouseup', release_method);
                e.preventDefault();
            });
        }
    };
    me.relative_region = function (object, parent=object.parentNode) {
        var parent_region = me.absolute_region(parent);
        var region = me.absolute_region(object);
        var xPos = region.left - parent_region.left;
        var yPos = region.top - parent_region.top;
        var width = region.width;
        var height = region.height;
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
        if(object === document.body) {
            return me.viewport();
        }
        var clientRect = object.getBoundingClientRect();
        var xPos = 0;
        var yPos = 0;
        var width = object.clientWidth;
        var height = object.clientHeight;
        if(!width) {
            width = clientRect.width;
        }
        if(!height) {
            height = clientRect.height;
        }
        var parent = object;
        while (parent) {
            if (parent === document.body) {
                // deal with browser quirks with body/window/document and page scroll
                var xScroll = parent.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = parent.scrollTop || document.documentElement.scrollTop;

                xPos += (parent.offsetLeft - xScroll + parent.clientLeft);
                yPos += (parent.offsetTop - yScroll + parent.clientTop);
            } else {
                // for all other non-BODY elements
                xPos += (parent.offsetLeft - parent.scrollLeft + parent.clientLeft);
                yPos += (parent.offsetTop - parent.scrollTop + parent.clientTop);
            }

            parent = parent.offsetParent;
        }
        var absoluteRect = {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
        return absoluteRect;
    };
    me.empty_region = function(region) {
        region.left = 0;
        region.top = 0;
        region.width = 0;
        region.height = 0;
    };
    me.set_relative_region = function(object, region, relative_to=null) {
        if(!object || !region) {
            return;
        }
        var parent_region = me.absolute_region(object.parentNode);
        if(relative_to) {
            var relative_to_region = me.absolute_region(relative_to);
            parent_region.left -= relative_to_region.left;
            parent_region.top -= relative_to_region.top;
        }
        object.style.left = region.left - parent_region.left + "px";
        object.style.top = region.top - parent_region.top + "px";
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.set_absolute_region = function(object, region) {
        if(object.parentNode === document.body) {
            object.style.left = region.left - object.clientLeft + "px";
            object.style.top = region.top - object.clientTop + "px";
        }
        else {
            var parent_region = me.absolute_region(object.parentNode);
            object.style.left = region.left - object.clientLeft - parent_region.left + "px";
            object.style.top = region.top - object.clientLeft - parent_region.top + "px";
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
