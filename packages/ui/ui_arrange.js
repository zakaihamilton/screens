/*
 @author Zakai Hamilton
 @component UIArrange
 */

package.ui.arrange = function UIArrange(me) {
    me.cascade = {
        set: function (object) {
            var window = me.package.widget.window.mainWindow(object);
            var parent = me.package.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if(window) {
                object = window;
            }
            var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
            var left = 0, top = 0, numWindows = windows.length;
            for(window of windows) {
                me.reposition(window, function(region) {
                    var label_region = me.package.ui.rect.relative_region(window.var.label, window);
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
        var window = me.package.widget.window.window(object);
        me.package.core.property.set(window, "unmaximize");
        var parent = me.package.widget.window.parent(window);
        var content = null;
        var container = null;
        if (parent) {
            container = parent.var.container;
            content = container.var.content;
        } else {
            container = content = me.package.ui.element.workspace();
        }
        var parent_region = me.package.ui.rect.relative_region(container);
        var isFixed = me.package.core.property.get(window, "fixed");
        callback(parent_region);
        me.package.ui.rect.set_relative_region(window, parent_region, content, isFixed);
        me.package.core.property.notify(window, "update");
        me.package.core.property.notify(parent, "update");
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
            var window = me.package.widget.window.mainWindow(object);
            var parent = me.package.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if(window) {
                object = window;
            }
            var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
            if (windows) {
                if(windows.length > 0) {
                    var left = windows[windows.length - 1];
                    me.package.core.property.set(left, "ui.arrange.alignToLeft");
                }
                if(windows.length > 1) {
                    var right = windows[windows.length - 2];
                    me.package.core.property.set(right, "ui.arrange.alignToRight");
                }
            }
        }
    };
    me.tileVertically = {
        set: function (object) {
            var window = me.package.widget.window.mainWindow(object);
            var parent = me.package.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if(window) {
                object = window;
            }
            var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
            if (windows) {
                if(windows.length > 0) {
                    var top = windows[windows.length - 1];
                    me.package.core.property.set(top, "ui.arrange.alignToTop");
                }
                if(windows.length > 1) {
                    var bottom = windows[windows.length - 2];
                    me.package.core.property.set(bottom, "ui.arrange.alignToBottom");
                }
            }
        }
    };
    me.arrangeIcons = {
        set: function (object) {
            
        }
    };
    me.center = {
        set: function(object) {
            var window = me.package.widget.window.window(object);
            me.reposition(window, function(parent_region) {
                parent_region.width /= 1.5;
                parent_region.height /= 1.5;
                parent_region.left = parent_region.width / 4;
                parent_region.top = parent_region.height / 4;
                return parent_region;
            });
        }
    };
};
