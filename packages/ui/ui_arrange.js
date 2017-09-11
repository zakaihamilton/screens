/*
 @author Zakai Hamilton
 @component UIArrange
 */

package.ui.arrange = function UIArrange(me) {
    me.cascade = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.get(window, "widget.window.visibleWindows");
            var left = 0, top = 0, numWindows = windows.length;
            for(window of windows) {
                me.reposition(window, function(region) {
                    var label_region = me.ui.rect.relative_region(window.var.label, window);
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
        var window = me.widget.window.window(object);
        me.set(window, "unmaximize");
        var parent = me.widget.window.parent(window);
        var content = null;
        var container = null;
        if (parent) {
            container = parent.var.container;
            content = container.var.content;
        } else {
            container = content = me.ui.element.desktop();
        }
        var parent_region = me.ui.rect.relative_region(container);
        callback(parent_region);
        me.ui.rect.set_relative_region(window, parent_region, content);
        me.notify(window, "update");
        me.notify(parent, "update");
    };
    me.alignToLeft = {
        set: function (object) {
            me.reposition(object, function(parent_region) {
                parent_region.left = 0;
                parent_region.top = 0;
                parent_region.width /= 2;
                parent_region.width -= 4;
                parent_region.height -= 4;
                return parent_region;
            });
        }
    };
    me.alignToRight = {
        set: function (object) {
            me.reposition(object, function(parent_region) {
                parent_region.top = 0;
                parent_region.width /= 2;
                parent_region.left = parent_region.width;
                parent_region.width -= 4;
                parent_region.height -= 4;
                return parent_region;
            });
        }
    };
    me.alignToTop = {
        set: function (object) {
            me.reposition(object, function(parent_region) {
                parent_region.left = 0;
                parent_region.top = 0;
                parent_region.height /= 2;
                parent_region.height -= 4;
                parent_region.width -= 4;
                return parent_region;
            });
        }
    };
    me.alignToBottom = {
        set: function (object) {
            me.reposition(object, function(parent_region) {
                parent_region.left = 0;
                parent_region.height /= 2;
                parent_region.top = parent_region.height;
                parent_region.height -= 4;
                parent_region.width -= 4;
                return parent_region;
            });
        }
    };
    me.tileHorizontally = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.get(window, "widget.window.visibleWindows");
            if (windows && windows.length > 1) {
                var left = windows[windows.length - 1];
                var right = windows[windows.length - 2];
                me.set(left, "ui.arrange.alignToLeft");
                me.set(right, "ui.arrange.alignToRight");
            }
        }
    };
    me.tileVertically = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.get(window, "widget.window.visibleWindows");
            if (windows && windows.length > 1) {
                var top = windows[windows.length - 1];
                var bottom = windows[windows.length - 2];
                me.set(top, "ui.arrange.alignToTop");
                me.set(bottom, "ui.arrange.alignToBottom");
            }
        }
    };
    me.arrangeIcons = {
        set: function (object) {
            
        }
    };
};