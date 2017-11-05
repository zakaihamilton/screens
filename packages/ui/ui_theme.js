/*
 @author Zakai Hamilton
 @component UITheme
 */

package.ui.theme = function UITheme(me) {
    me.themes = [];
    me.currentTheme = null;
    me.init = function() {
        me.updateList();
        var current_theme = me.package.core.property.get(me.package.storage.cache.local, "ui-theme-current");
        if(!current_theme) {
            current_theme = "glow";
        }
        if(current_theme !== "none") {
            me.load(null, current_theme);
        }
    };
    me.themeList = {
        get: function(object) {
            return me.themes;
        }
    };
    me.updateList = function() {
        me.themes = [];
        var path = "packages/res/themes";
        me.package.core.file.readDir(function(err, items) {
            if(items) {
                for(let item of items) {
                    var period = item.lastIndexOf(".");
                    if(period === -1) {
                        continue;
                    }
                    var name = item.substring(0, period);
                    var extension = item.substring(period+1);
                    if(extension !== "json") {
                        continue;
                    }
                    me.themes.push(name);
                }
            }
        }, path);
    };
    me.applyTheme = function(elementCallback, parent) {
        if(!parent) {
            parent = document.body;
        }
        var element = parent.firstChild;
        while(element) {
            if(element.classList) {
                element.classList.forEach(function(classItem) {
                    elementCallback(element, classItem);
                });
            }
            me.package.applyTheme(elementCallback, element);
            element = element.nextSibling;
        }
    };
    me.unload = function() {
        if(me.currentTheme) {
            me.currentTheme.link.parentNode.removeChild(me.currentTheme.link);
            me.currentTheme.link = null;
            me.package.applyTheme(function(element, classItem) {
                var mapping = me.findMapping(classItem);
                if(!mapping) {
                    return;
                }
                if(mapping.target === classItem) {
                    element.classList.remove(classItem);
                    if(mapping.replace) {
                        element.classList.add(mapping.source);
                    }
                }
            });
            me.currentTheme = null;
            me.package.core.property.set(me.package.storage.cache.local, "ui-theme-current", "none");
        }
    };
    me.load = function(callback, name) {
        var path = "/packages/res/themes/" + name.toLowerCase();
        me.package.core.json.loadFile(function(data) {
            if(data) {
                me.unload();
                me.currentTheme = data;
                me.currentTheme.link = me.package.ui.class.loadStylesheet(path + ".css");
                me.package.applyTheme(function(element, classItem) {
                    var mapping = me.findMapping(classItem);
                    if(!mapping) {
                        return;
                    }
                    if(mapping.source === classItem) {
                        element.classList.add(mapping.target);
                        if(mapping.replace) {
                            element.classList.remove(mapping.source);
                        }
                    }
                });
                me.package.core.property.set(me.package.storage.cache.local, "ui-theme-current", name);
            }
            if(callback) {
                callback(data);
            }
        }, path + ".json", "utf8");
    };
    me.findMapping = function(classItem) {
        if(me.currentTheme) {
            var list = me.currentTheme.mapping;
            for(let item of list) {
                if(item.source === classItem || item.target === classItem) {
                    return item;
                }
            }
        }
        return null;
    };
    me.getMapping = function(source) {
        if(me.currentTheme) {
            var list = me.currentTheme.mapping;
            for(let item of list) {
                if(item.source !== source) {
                    continue;
                }
                if(!item.target) {
                    continue;
                }
                if(item.replace) {
                    return item.target;
                }
                else {
                    return source + " " + item.target;
                }
            }
        }
        return source;
    };
};
