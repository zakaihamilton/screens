/*
 @author Zakai Hamilton
 @component UIScroll
 */

package.ui.scroll = function UIScroll(me) {
    me.other_scroll = function(type) {
        if (type === "vertical") {
            return "horizontal";
        } else if (type === "horizontal") {
            return "vertical";
        }
    };
    me.has_scroll = function (object, type) {
        if (type === "vertical") {
            return object.scrollHeight > object.clientHeight;
        } else if (type === "horizontal") {
            return object.scrollWidth > object.clientWidth;
        }
    };
    me.direction = function (event, type, thumb_region) {
        var direction = 0;
        if (type === "vertical") {
            if (event.clientY < thumb_region.top) {
                direction = -1;
            } else if (event.clientY > thumb_region.bottom) {
                direction = 1;
            }
        } else if (type === "horizontal") {
            if (event.clientX < thumb_region.left) {
                direction = -1;
            } else if (event.clientX > thumb_region.right) {
                direction = 1;
            }
        }
        return direction;
    };
    me.thumb_percent = function (object, type) {
        if (type === "vertical") {
            return 100 / (object.scrollHeight / object.clientHeight);
        } else if (type === "horizontal") {
            return 100 / (object.scrollWidth / object.clientWidth);
        }
    };
    me.scroll_percent = function (object, type, pos = - 1) {
        if (type === "vertical") {
            if (pos === -1) {
                pos = object.scrollTop;
            }
            return me.pos_to_percent(object.scrollHeight - object.clientHeight, pos);
        } else if (type === "horizontal") {
            if (pos === -1) {
                pos = object.scrollLeft;
            }
            return me.pos_to_percent(object.scrollWidth - object.clientWidth, pos);
        }
    };
    me.set_pos = function (object, type, pos) {
        pos += "px";
        var changed = false;
        if (type === "vertical") {
            var top = me.package.core.property.get(object, "ui.style.top");
            if (top !== pos) {
                me.package.core.property.set(object, "ui.style.top", pos);
                changed = true;
            }
        } else if (type === "horizontal") {
            var left = me.package.core.property.get(object, "ui.style.left");
            if (left !== pos) {
                me.package.core.property.set(object, "ui.style.left", pos);
                changed = true;
            }
        }
        return changed;
    };
    me.set_size = function (object, type, size) {
        size += "px";
        var changed = false;
        if (type === "vertical") {
            var height = me.package.core.property.get(object, "ui.style.height");
            if (height !== size) {
                me.package.core.property.set(object, "ui.style.height", size);
                changed = true;
            }
        } else if (type === "horizontal") {
            var width = me.package.core.property.get(object, "ui.style.width");
            if (width !== size) {
                me.package.core.property.set(object, "ui.style.width", size);
                changed = true;
            }
        }
        return changed;
    };
    me.scroll_pos = function (object, type, percent) {
        if (type === "vertical") {
            return me.percent_to_pos(object.scrollHeight - object.clientHeight, percent);
        } else if (type === "horizontal") {
            return me.percent_to_pos(object.scrollWidth - object.clientWidth, percent);
        }
    };
    me.length = function (type, track_region, thumb_region=null) {
        var length = null;
        if (type === "vertical") {
            length = track_region.height;
            if(thumb_region) {
                length -= thumb_region.height;
            }
        } else if (type === "horizontal") {
            length = track_region.width;
            if(thumb_region) {
                length -= thumb_region.width;
            }
        }
        return length;
    };
    me.pos_to_percent = function (length, pos) {
        return ((pos / length) * 100);
    };
    me.percent_to_pos = function (length, percent) {
        return (length / 100) * percent;
    };
    me.current_pos = function (object, type) {
        if (type === "vertical") {
            return object.scrollTop;
        } else if (type === "horizontal") {
            return object.scrollLeft;
        }
    };
    me.set_current_pos = function (object, type, value) {
        if (type === "vertical") {
            object.scrollTop = value;
        } else if (type === "horizontal") {
            object.scrollLeft = value;
        }
    };
    me.by = function (object, type, distance) {
        if (type === "vertical") {
            if (object.scrollTop + distance < 0) {
                object.scrollTop = 0;
            } else if (object.scrollTop + distance > object.scrollHeight) {
                object.scrollTop = object.scrollHeight;
            } else {
                object.scrollTop += distance;
            }
        } else if (type === "horizontal") {
            if (object.scrollLeft + distance < 0) {
                object.scrollLeft = 0;
            } else if (object.scrollLeft + distance > object.scrollWidth) {
                object.scrollLeft = object.scrollWidth;
            } else {
                object.scrollLeft += distance;
            }
        }
    };
    me.shift = function (object, type, percent) {
        var pos = me.scroll_pos(object, type, percent);
        if (type === "vertical") {
            if (pos < 0) {
                object.scrollTop = 0;
            } else if (pos > object.scrollHeight) {
                object.scrollTop = object.scrollHeight;
            } else {
                object.scrollTop = pos;
            }
        } else if (type === "horizontal") {
            if (pos < 0) {
                object.scrollLeft = 0;
            } else if (pos > object.scrollWidth) {
                object.scrollLeft = object.scrollWidth;
            } else {
                object.scrollLeft = pos;
            }
        }
    }
    me.overflow = function (object) {
        var members = me.package.ui.node.members(object, me.package.widget.window.id);
        var window_region = me.package.ui.rect.absolute_region(object);
        if (members) {
            members = members.filter(function (member) {
                var member_region = me.package.ui.rect.absolute_region(member);
                var h_overflow = member_region.left < window_region.left || member_region.right > window_region.right;
                var v_overflow = member_region.top < window_region.top || member_region.bottom > window_region.bottom;
                return h_overflow || v_overflow;
            });
        }
        return members;
    };
    me.thumb = {
        set: function (object, value) {
            var method = me.package.ui.element.to_full_name(object, value);
            var type = me.package.core.property.get(object, method);
            object.addEventListener('mousedown', function (e) {
                if (object.getAttribute('disabled')) {
                    e.preventDefault();
                    return;
                }
                var container = me.package.ui.node.container(object, me.package.widget.container.id);
                var thumb_region = me.package.ui.rect.absolute_region(object);
                var info = {
                    target: object,
                    left: e.clientX - thumb_region.left,
                    top: e.clientY - thumb_region.top,
                    width: object.offsetWidth,
                    height: object.offsetHeight
                };
                var scroll_method = function (e) {
                    var track_region = me.package.ui.rect.absolute_region(object.parentNode);
                    var thumb_region = me.package.ui.rect.absolute_region(object);
                    var length = me.length(type, track_region, thumb_region);
                    var thumb_pos = null;
                    if (type === "vertical") {
                        var thumb_pos = (e.clientY - info.top) - track_region.top;
                    } else if (type === "horizontal") {
                        var thumb_pos = (e.clientX - info.left) - track_region.left;
                    }
                    var percent = me.pos_to_percent(length, thumb_pos);
                    me.shift(me.package.widget.container.content(container), type, percent);
                    me.package.core.property.set(container, "update");
                };
                var release_method = function (e) {
                    removeEventListener('mousemove', scroll_method);
                    removeEventListener('mouseup', release_method);
                    me.package.core.property.set(object.parentNode.parentNode, "snap");
                };
                addEventListener('mousemove', scroll_method);
                addEventListener('mouseup', release_method);
                e.preventDefault();
            });
        }
    };
};
