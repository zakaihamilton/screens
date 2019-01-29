/*
 @author Zakai Hamilton
 @component UITheme
 */

screens.ui.theme = function UITheme(me) {
    me.themes = [];
    me.currentTheme = null;
    me.init = async function () {
        me.ui.options.load(me, null, {
            nightMode: true,
            theme: "glow",
            colors: {},
            fontSize: "1em"
        });
        me.ui.options.toggleSet(me, me, {
            "nightMode": me.update
        });
        me.ui.options.choiceSet(me, me, {
            "theme": me.update,
            "fontSize": me.updateFontSize
        });
        me.ui.options.listSet(me, me, "colors", me.update);
        me.update();
        me.updateFontSize();
    };
    me.themeList = {
        get: function (object) {
            return me.themes;
        }
    };
    me.menuList = {
        get: function (object) {
            var items = me.themes.map(function (name) {
                var result = [
                    me.core.string.title(name),
                    function () {
                        me.core.property.set(object, "ui.theme.theme", name);
                    },
                    {
                        "state": function () {
                            return me.currentTheme ? me.currentTheme.name === name : false;
                        }
                    },
                    {
                        "group": "themes"
                    }
                ];
                return result;
            });
            return items;
        }
    };
    me.update = function () {
        me.load(me.options.theme);
    };
    me.toggleFontSize = function () {
        var fontSize = me.core.property.get(window.document.body, "ui.style.fontSize");
        me.core.property.set(me, "ui.theme.fontSize", fontSize !== "16px" ? "1em" : "1.5em");
    };
    me.updateFontSize = function () {
        var fontSize = me.options.fontSize;
        me.core.property.set(window.document.body, "ui.style.fontSize", fontSize);
        window.dispatchEvent(new Event("resize"));
    };
    me.updateList = async function () {
        me.themes = ["None"];
        var path = "packages/res/themes";
        var items = await me.core.file.readDir(path);
        if (items) {
            for (let item of items) {
                var period = item.lastIndexOf(".");
                if (period === -1) {
                    continue;
                }
                var name = item.substring(0, period);
                var extension = item.substring(period + 1);
                if (extension !== "json") {
                    continue;
                }
                me.themes.push(name);
            }
        }
    };
    me.applyTheme = function (elementCallback, parent) {
        var nightMode = me.options.nightMode;
        if (!parent) {
            parent = document.body;
        }
        var element = parent.firstElementChild;
        while (element) {
            if (element.classList) {
                if (nightMode) {
                    element.classList.add("night-mode");
                    element.classList.add("is-dark");
                }
                else {
                    element.classList.remove("night-mode");
                    element.classList.remove("is-dark");
                }
                element.classList.forEach(function (classItem) {
                    elementCallback(element, classItem);
                });
                if (element.themeMethod) {
                    element.themeMethod(element, nightMode);
                }
            }
            me.applyTheme(elementCallback, element);
            element = element.nextElementSibling;
        }
    };
    me.unload = function () {
        if (me.currentTheme) {
            me.currentTheme.link.parentNode.removeChild(me.currentTheme.link);
            me.currentTheme.link = null;
            me.applyTheme(function (element, classItem) {
                var mapping = me.findMapping(classItem);
                if (!mapping) {
                    return;
                }
                if (mapping.target === classItem) {
                    element.classList.remove(classItem);
                    if (mapping.replace) {
                        element.classList.add(mapping.source);
                    }
                }
            });
            me.currentTheme = null;
        }
    };
    me.updateElements = function (parent) {
        me.applyTheme(function (element, classItem) {
            var mapping = me.findMapping(classItem);
            if (!mapping) {
                return;
            }
            if (mapping.source === classItem) {
                element.classList.add(mapping.target);
                if (mapping.replace) {
                    element.classList.remove(mapping.source);
                }
            }
        }, parent);
    };
    me.load = async function (name) {
        if (name === "None") {
            me.unload();
            return;
        }
        name = name.toLowerCase();
        var path = "/packages/res/themes/" + name;
        var data = await me.core.json.loadFile(path + ".json", "utf8");
        if (data) {
            me.unload();
            me.currentTheme = data;
            me.currentTheme.name = name;
            me.updateColors();
            me.currentTheme.link = await me.import(path + ".css");
            me.updateElements();
        }
    };
    me.findMapping = function (classItem) {
        if (me.currentTheme) {
            var list = me.currentTheme.mapping;
            for (let item of list) {
                if (item.source === classItem || item.target === classItem) {
                    return item;
                }
            }
        }
        return null;
    };
    me.getMapping = function (source) {
        if (me.currentTheme) {
            var list = me.currentTheme.mapping;
            for (let item of list) {
                if (item.source !== source) {
                    continue;
                }
                if (!item.target) {
                    continue;
                }
                if (item.replace) {
                    return item.target;
                }
                else {
                    return source + " " + item.target;
                }
            }
        }
        return source;
    };
    me.colorList = {
        get: function (object) {
            var colors = {};
            if (me.currentTheme) {
                colors = me.currentTheme.colors;
                if (me.options.nightMode) {
                    colors = Object.assign({}, colors, me.currentTheme["night-mode"]);
                }
            }
            colors = Object.assign({}, colors, me.options.colors);
            return colors;
        },
        set: function (object, colors) {
            me.options.colors = colors;
        }
    };
    me.updateColors = function () {
        var colors = me.colorList.get(null);
        for (var name in colors) {
            var color = colors[name];
            me.ui.color.set(name, color);
        }
    };
};
