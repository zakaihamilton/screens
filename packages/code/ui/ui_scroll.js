/*
 @author Zakai Hamilton
 @component UIScroll
 */

screens.ui.scroll = function UIScroll(me, { core, widget, ui }) {
    me.isScrollable = function (object) {
        var result = true;
        if (object.scrollWidth > object.offsetWidth) {
            result = false;
        }
        if (object.scrollHeight > object.offsetHeight) {
            result = false;
        }
        return result;
    };
    me.by = function (object, distance) {
        if (object.scrollTop + distance < 0) {
            object.scrollTop = 0;
        } else if (object.scrollTop + distance > object.scrollHeight) {
            object.scrollTop = object.scrollHeight;
        } else {
            object.scrollTop += distance;
        }
        core.property.set(object, "scrolled");
    };
    me.container = function (object) {
        var container = null;
        if (object.component === widget.window.id) {
            container = object.var.container;
        } else {
            container = ui.node.container(object, widget.container.id);
        }
        return container;
    };
    me.firstPage = function (object) {
        me.to(object, 0);
    };
    me.lastPage = function (object) {
        var container = me.container(object);
        let offset = container.scrollHeight - (container.ui_scroll_pageSize - 1);
        me.to(object, offset);
    };
    me.previousPage = function (object) {
        var container = me.container(object);
        me.by(container, -container.ui_scroll_pageSize);
        core.property.set(container, "scrolled");
    };
    me.nextPage = function (object) {
        var container = me.container(object);
        me.by(container, container.ui_scroll_pageSize);
        core.property.set(container, "scrolled");
    };
    me.isLastPage = function (object) {
        var container = me.container(object);
        if (container.scrollTop + container.ui_scroll_pageSize >= container.scrollHeight) {
            return true;
        }
        return false;
    };
    me.to = function (object, value) {
        var container = me.container(object);
        container.scrollTop = value;
        core.property.set(container, "scrolled");
    };
    me.pageSize = {
        get: function (object) {
            var container = me.container(object);
            return container.ui_scroll_pageSize;
        },
        set: function (object, value) {
            var container = me.container(object);
            container.ui_scroll_pageSize = value;
        }
    };
    me.snap = {
        get: function (object) {
            var container = me.container(object);
            return container.ui_scroll_snap;
        },
        set: function (object, value) {
            var container = me.container(object);
            container.ui_scroll_snap = value;
        }
    };
    me.scrolled = {
        set: function (object) {
            var container = me.container(object);
            var pageSize = container.ui_scroll_pageSize;
            if (container.ui_scroll_snapTimeout) {
                clearTimeout(container.ui_scroll_snapTimeout);
                container.ui_scroll_snapTimeout = null;
            }
            if (container.ui_scroll_pageSize && container.ui_scroll_snap) {
                container.ui_scroll_snapTimeout = setTimeout(function () {
                    var currentPos = container.scrollTop;
                    var targetPos = currentPos;
                    var delta = currentPos % pageSize;
                    if (delta && currentPos) {
                        targetPos = Math.round(currentPos / pageSize) * pageSize;
                    }
                    var params = {
                        top: targetPos,
                        behavior: "smooth"
                    };
                    container.scroll(params);
                    core.property.notify(container, "scrolled");
                }, 1000);
            }
        }
    };
    me.positions = {
        get: function (object) {
            var list = [];
            ui.node.iterate(object, (element) => {
                list.push({ element, scrollLeft: element.scrollLeft, scrollTop: element.scrollTop });
            }, true);
            return list;
        },
        set: function (object, list) {
            ui.node.iterate(object, (element) => {
                var item = list.shift();
                for (let key in item) {
                    element[key] = item[key];
                }
            }, true);
            return list;
        }
    };
    me.toWidget = function (widget, target, delta) {
        if (widget) {
            var region = ui.rect.relativeRegion(widget, target);
            var offset = region.top;
            if (offset) {
                offset -= delta;
            }
            me.to(target, offset);
        }
    };
};
