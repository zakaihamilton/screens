/*
 @author Zakai Hamilton
 @component UIArrange
 */

screens.ui.arrange = function UIArrange(me, packages) {
    const { core } = packages;
    me.cascade = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if (window) {
                object = window;
            }
            var windows = core.property.get(object, "widget.window.visibleWindows");
            var left = 0, top = 0, numWindows = windows.length;
            for (let child of windows) {
                me.reposition(child, function (region) {
                    var label_region = me.ui.rect.relativeRegion(child.var.label, child);
                    region.left = left;
                    region.top = top;
                    region.width -= label_region.bottom * numWindows;
                    region.height -= label_region.bottom * numWindows;
                    left += label_region.left;
                    top += label_region.bottom;
                });
            }
        }
    };
    me.reposition = function (object, callback) {
        var window = me.widget.window.get(object);
        core.property.set(window, "unmaximize");
        var parent = me.widget.window.parent(window);
        var container = null;
        if (parent) {
            container = parent.var.container;
        } else {
            container = me.ui.element.workspace();
        }
        var parent_region = me.ui.rect.relativeRegion(container);
        var isFixed = core.property.get(window, "fixed");
        callback(parent_region);
        me.ui.rect.setRelativeRegion(window, parent_region, container, isFixed);
        core.property.set(window, "ui.property.broadcast", {
            "update": null
        });
        core.property.set(parent, "ui.property.broadcast", {
            "update": null
        });
        if (window.child_window) {
            core.property.set(window.child_window, "ui.property.broadcast", {
                "update": null
            });
        }
    };
    me.alignToLeftTop = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = 0;
            parent_region.top = 0;
            parent_region.width /= 2;
            parent_region.height /= 2;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToRightTop = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = parent_region.width / 2;
            parent_region.top = 0;
            parent_region.width /= 2;
            parent_region.height /= 2;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToLeftBottom = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = 0;
            parent_region.top = parent_region.height / 2;
            parent_region.width /= 2;
            parent_region.height /= 2;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToRightBottom = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = parent_region.width / 2;
            parent_region.top = parent_region.height / 2;
            parent_region.width /= 2;
            parent_region.height /= 2;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToLeft = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = 0;
            parent_region.top = 0;
            parent_region.width /= 2;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToRight = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.top = 0;
            parent_region.width /= 2;
            parent_region.left = parent_region.width;
            parent_region.width -= 4;
            parent_region.height -= 4;
            return parent_region;
        });
    };
    me.alignToTop = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = 0;
            parent_region.top = 0;
            parent_region.height /= 2;
            parent_region.height -= 4;
            parent_region.width -= 4;
            return parent_region;
        });
    };
    me.alignToBottom = function (object) {
        me.reposition(object, function (parent_region) {
            parent_region.left = 0;
            parent_region.height /= 2;
            parent_region.top = parent_region.height;
            parent_region.height -= 4;
            parent_region.width -= 4;
            return parent_region;
        });
    };
    me.tileHorizontally = function (object) {
        var window = me.widget.window.mainWindow(object);
        var parent = me.widget.window.parent(window);
        if (parent) {
            window = parent;
        }
        if (window) {
            object = window;
        }
        var windows = core.property.get(object, "widget.window.visibleWindows");
        if (windows) {
            if (windows.length > 0) {
                var left = windows[windows.length - 1];
                core.property.set(left, "ui.arrange.alignToLeft");
            }
            if (windows.length > 1) {
                var right = windows[windows.length - 2];
                core.property.set(right, "ui.arrange.alignToRight");
            }
        }
    };
    me.tileVertically = function (object) {
        var window = me.widget.window.mainWindow(object);
        var parent = me.widget.window.parent(window);
        if (parent) {
            window = parent;
        }
        if (window) {
            object = window;
        }
        var windows = core.property.get(object, "widget.window.visibleWindows");
        if (windows) {
            if (windows.length > 0) {
                var top = windows[windows.length - 1];
                core.property.set(top, "ui.arrange.alignToTop");
            }
            if (windows.length > 1) {
                var bottom = windows[windows.length - 2];
                core.property.set(bottom, "ui.arrange.alignToBottom");
            }
        }
    };
    me.arrangeIcons = function (object) {

    };
    me.center = function (object) {
        var window = me.widget.window.get(object);
        me.reposition(window, function (parent_region) {
            parent_region.width /= 1.5;
            parent_region.height /= 1.5;
            parent_region.left = parent_region.width / 4;
            parent_region.top = parent_region.height / 4;
            return parent_region;
        });
    };
};
