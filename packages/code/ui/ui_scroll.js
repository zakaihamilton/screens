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
            var top = me.core.property.get(object, "ui.style.top");
            if (top !== pos) {
                me.core.property.set(object, "ui.style.top", pos);
                changed = true;
            }
        } else if (type === "horizontal") {
            var left = me.core.property.get(object, "ui.style.left");
            if (left !== pos) {
                me.core.property.set(object, "ui.style.left", pos);
                changed = true;
            }
        }
        return changed;
    };
    me.set_size = function (object, type, size) {
        size += "px";
        var changed = false;
        if (type === "vertical") {
            var height = me.core.property.get(object, "ui.style.height");
            if (height !== size) {
                me.core.property.set(object, "ui.style.height", size);
                changed = true;
            }
        } else if (type === "horizontal") {
            var width = me.core.property.get(object, "ui.style.width");
            if (width !== size) {
                me.core.property.set(object, "ui.style.width", size);
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
    me.size = function (type, track_region, thumb_region=null) {
        var size = null;
        if (type === "vertical") {
            size = track_region.height;
            if(thumb_region) {
                size -= thumb_region.height;
            }
        } else if (type === "horizontal") {
            size = track_region.width;
            if(thumb_region) {
                size -= thumb_region.width;
            }
        }
        return size;
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
    };
    me.overflow = function (object) {
        var members = me.ui.node.members(object, me.widget.window.id);
        var window_region = me.ui.rect.absolute_region(object);
        if (members) {
            members = members.filter(function (member) {
                var member_region = me.ui.rect.absolute_region(member);
                var h_overflow = member_region.left < window_region.left || member_region.right > window_region.right;
                var v_overflow = member_region.top < window_region.top || member_region.bottom > window_region.bottom;
                return h_overflow || v_overflow;
            });
        }
        return members;
    };
    me.thumb = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var scroll_type = value;
            var scrollbar = null;
            if(!scroll_type) {
                me.core.property.set(object, "ui.touch.down", null);
                return;
            }
            if(value.startsWith("vertical") || value.startsWith("horizontal")) {
                scrollbar = container.var[scroll_type];
            }
            else {
                var method = me.ui.element.to_full_name(object, value);
                scroll_type = me.core.property.get(object, method);
                scrollbar = object.parentNode.parentNode;
            }
            var thumb = scrollbar.var.thumb;
            me.core.property.set(object, "ui.touch.down", function(object, event) {
                if (object.getAttribute('disabled')) {
                    event.preventDefault();
                    return;
                }
                if(event.handled) {
                    return;
                }
                event.handled = true;
                var thumb_region = me.ui.rect.absolute_region(thumb);
                var info = {
                    target: thumb,
                    left: event.clientX - thumb_region.left,
                    top: event.clientY - thumb_region.top,
                    origLeft: event.clientX,
                    origTop: event.clientY,
                    width: thumb.offsetWidth,
                    height: thumb.offsetHeight
                };
                var scroll_method = function (object, event) {
                    var track_region = me.ui.rect.absolute_region(scrollbar.var.track);
                    var thumb_region = me.ui.rect.absolute_region(thumb);
                    var size = me.size(scroll_type, track_region, thumb_region);
                    var thumb_pos = null;
                    if (scroll_type === "vertical") {
                        var y_pos = event.clientY;
                        var thumb_pos = (y_pos - info.top) - track_region.top;
                        if(thumb_pos < 0) {
                            thumb_pos = 0;
                        }
                        if(thumb_pos > track_region.height - thumb_region.height) {
                            thumb_pos = track_region.height - thumb_region.height;
                        }
                        me.core.property.set(thumb, "ui.style.top", thumb_pos + "px");
                    } else if (scroll_type === "horizontal") {
                        var thumb_pos = (event.clientX - info.left) - track_region.left;
                        if(thumb_pos < 0) {
                            thumb_pos = 0;
                        }
                        if(thumb_pos > track_region.width - thumb_region.width) {
                            thumb_pos = track_region.width - thumb_region.width;
                        }
                        me.core.property.set(thumb, "ui.style.left", thumb_pos + "px");
                    }
                    var percent = me.pos_to_percent(size, thumb_pos);
                    me.shift(me.widget.container.content(container), scroll_type, percent);
                    me.core.property.set(container, "update");
                };
                var release_method = function (object, event) {
                    me.core.property.set(object, "ui.touch.move", null);
                    me.core.property.set(object, "ui.touch.up", null);
                    me.core.property.set(object, "ui.touch.contextmenu", null);
                    me.core.property.set(object, "ui.touch.cancel", null);
                    me.core.property.set(scrollbar, "snap");
                };
                var block_method = function(object, event) {
                    event.preventDefault();
                    event.stopPropagation();
                };
                me.core.property.set(object, "ui.touch.move", scroll_method);
                me.core.property.set(object, "ui.touch.up", release_method);
                me.core.property.set(object, "ui.touch.contextmenu", block_method);
                me.core.property.set(object, "ui.touch.cancel", block_method);
                event.preventDefault();
            });
        }
    };
    me.swipe = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var scroll_type = value;
            var scrollbar = null;
            if(!value) {
                me.core.property.set(object, "ui.touch.down", null);
                return;
            }
            var division=5;
            if(value.startsWith("vertical") || value.startsWith("horizontal")) {
                scrollbar = container.var[scroll_type];
            }
            else {
                var method = me.ui.element.to_full_name(object, value);
                scroll_type = me.core.property.get(object, method);
                scrollbar = object.parentNode.parentNode;
            }
            var thumb = scrollbar.var.thumb;
            me.core.property.set(object, "ui.touch.down", function(object, event) {
                if (object.getAttribute('disabled')) {
                    event.preventDefault();
                    return;
                }
                if(event.handled) {
                    return;
                }
                event.handled = true;
                var thumb_region = me.ui.rect.absolute_region(thumb);
                var info = {
                    target: thumb,
                    left: event.clientX - thumb_region.left,
                    top: event.clientY - thumb_region.top,
                    origLeft: event.clientX,
                    origTop: event.clientY,
                    width: thumb.offsetWidth,
                    height: thumb.offsetHeight
                };
                var scroll_method = function (object, event) {
                    var track_region = me.ui.rect.absolute_region(scrollbar.var.track);
                    var thumb_region = me.ui.rect.absolute_region(thumb);
                    var size = me.size(scroll_type, track_region, thumb_region);
                    var thumb_pos = null;
                    if (scroll_type === "vertical") {
                        var y_pos = event.clientY;
                        var distance = y_pos - info.origTop;
                        if(Math.abs(distance) < division) {
                            return;
                        }
                        y_pos = info.origTop - distance / division;
                        var thumb_pos = (y_pos - info.top) - track_region.top;
                        if(thumb_pos < 0) {
                            thumb_pos = 0;
                        }
                        if(thumb_pos > track_region.height - thumb_region.height) {
                            thumb_pos = track_region.height - thumb_region.height;
                        }
                        me.core.property.set(thumb, "ui.style.top", thumb_pos + "px");
                    } else if (scroll_type === "horizontal") {
                        var thumb_pos = (event.clientX - info.left) - track_region.left;
                        if(thumb_pos < 0) {
                            thumb_pos = 0;
                        }
                        if(thumb_pos > track_region.width - thumb_region.width) {
                            thumb_pos = track_region.width - thumb_region.width;
                        }
                        me.core.property.set(thumb, "ui.style.left", thumb_pos + "px");
                    }
                    var percent = me.pos_to_percent(size, thumb_pos);
                    me.shift(me.widget.container.content(container), scroll_type, percent);
                    me.core.property.set(container, "update");
                };
                var release_method = function (object, event) {
                    me.core.property.set(object, "ui.touch.move", null);
                    me.core.property.set(object, "ui.touch.up", null);
                    me.core.property.set(object, "ui.touch.contextmenu", null);
                    me.core.property.set(object, "ui.touch.cancel", null);
                    me.core.property.set(scrollbar, "snap");
                };
                var block_method = function(object, event) {
                    event.preventDefault();
                    event.stopPropagation();
                };
                me.core.property.set(object, "ui.touch.move", scroll_method);
                me.core.property.set(object, "ui.touch.up", release_method);
                me.core.property.set(object, "ui.touch.contextmenu", block_method);
                me.core.property.set(object, "ui.touch.cancel", block_method);
                event.preventDefault();
            });
        }
    };
};
