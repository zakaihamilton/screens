/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

screens.widget.menu = function WidgetMenu(me) {
    me.element = {
        properties: {
            "ui.class.class": "horizontal",
            "ui.basic.elements": {
                "ui.basic.var": "modal",
                "ui.element.component": "widget.modal",
                "ui.style.display": "none"
            }
        }
    };
    me.updateTheme = function (window) {
        if (window.var.menu) {
            me.core.property.set(window, "ui.property.broadcast", {
                "ui.class.add": "menu"
            });
        }
        else {
            me.core.property.set(window, "ui.property.broadcast", {
                "ui.class.remove": "menu"
            });
        }
    };
    me.collect = function (object, list, property, properties, group, listMethod, itemMethod) {
        var parseItems = (items) => {
            if (!items) {
                items = [];
            }
            if (listMethod) {
                items = me.core.property.get(object, listMethod, items);
                if (!items) {
                    items = [];
                }
            }
            var isFirst = true;
            items = items.map(function (item) {
                var title = item[property];
                if (!title) {
                    return null;
                }
                title = [title.charAt(0).toUpperCase() + title.slice(1)];
                var result = [
                    title,
                    itemMethod,
                    properties,
                    {
                        "group": group
                    }
                ];
                return result;
            });
            return items;
        }
        if (!list) {
            return null;
        }
        return [[
            "",
            null,
            {
                "visible": false
            },
            {
                "group": group,
                "promise": { promise: list, callback: parseItems }
            }
        ]];
    };
    me.items = {
        set: function (object, value) {
            var window = me.widget.window(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if (!window.var.menu) {
                var parent = window;
                if (window.var.header) {
                    parent = window.var.header;
                }
                if (!window.var.menu) {
                    window.var.menu = me.ui.element({
                        "ui.element.component": "widget.menu",
                        "ui.style.position": "relative"
                    }, parent);
                }
            }
            me.core.property.set(window.var.menu, "ui.group.data", {
                "ui.data.keyList": ["ui.basic.text", "select", "options", "properties"],
                "ui.data.values": value
            });
            me.updateTheme(window);
        }
    };
    me.back = {
        set: function (object, value) {
            me.core.property.set(object, "ui.style.zIndex", "");
            me.core.property.set(object.var.modal, "ui.style.display", "none");
            me.core.property.set(object.var.menu, "ui.node.parent");
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": null
            });
            object.selected_item = null;
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            if (item === object.selected_item) {
                me.core.property.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            me.core.property.set(object, "ui.style.zIndex", "10");
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": "widget.menu.item.hover"
            });
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            me.core.property.set(item, "ui.class.add", "selected");
            me.core.property.set(object.var.menu, "ui.node.parent");
            me.core.property.set(object.var.modal, "ui.style.display", "initial");
            if (typeof info === "string") {
                me.core.property.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = me.core.property.get(object, "widget.window.active");
                object.var.menu = me.create_menu(window, object, me.ui.rect.absoluteRegion(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values, bottomUp) {
        var menu = me.ui.element({
            "ui.basic.var": "menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.bottom + "px",
            "ui.basic.window": window,
            "ui.basic.target": object,
            "values": values
        });
        if (bottomUp) {
            me.core.property.set(menu, "ui.class.add", "bottom-up");
        }
        if (object.component === me.id) {
            me.core.property.set(menu.var.modal, "ui.style.display", "none");
        }
        return menu;
    };
};

screens.widget.menu.popup = function WidgetMenuPopup(me) {
    me.element = {
        properties: {
            "ui.class.class": "widget.menu.vertical",
            "ui.basic.elements": {
                "ui.basic.var": "modal",
                "ui.element.component": "widget.modal"
            }
        }
    };
    me.values = function (object, values) {
        if (me.core.property.get(object, "ui.node.parent")) {
            me.core.property.set(object, "ui.group.data", {
                "ui.data.keyList": ["ui.basic.text", "select", "options", "properties"],
                "ui.data.values": values
            });
        }
    }
    me.back = {
        set: function (object, value) {
            me.core.property.set(object.target, "back", value);
            me.core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var method = value[1];
            me.core.property.set(object, "back", item);
            var prefix = me.core.property.get(item, "prefix");
            var text = me.core.property.get(item, "ui.basic.text");
            if (prefix) {
                text = prefix + text;
            }
            me.core.property.set(object.window, method, text);
        }
    };
};

screens.widget.menu.list = function WidgetMenuList(me) {
    me.filterMinCount = 15;
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "widget.menu.vertical",
            "ui.class.add": "list",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "headers"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "widget.menu.progress.bar",
                    "ui.basic.var": "progress"
                },
                {
                    "ui.basic.tag": "ul",
                    "ui.basic.var": "members"
                }
            ]
        }
    };
    me.work = function (object, state) {
        me.log("menu state: " + state);
        me.core.property.set(object.var.progress, "ui.style.display", state ? "block" : "none");
    };
    me.use = function (object, name, member) {
        if (!object.lists) {
            object.lists = [];
        }
        var list = object.lists[name];
        if (!list) {
            list = me.ui.element({
                "ui.element.component": "widget.menu.list"
            }, object);
            object.lists[name] = list;
        }
        if (list.var.filter) {
            member.parentList = list;
            list.members.push(member);
            return "none";
        }
        else if (list.var.members.childNodes.length >= me.filterMinCount) {
            list.members = [];
            me.ui.element({
                "ui.element.component": "widget.filter",
                "filter": "widget.menu.list.filter",
                "prefixes": "widget.menu.list.prefixes",
                "ui.basic.var": "filter"
            }, list.var.headers, list);
            var members = list.var.members;
            while (members.firstChild) {
                list.members.push(members.firstChild);
                members.firstChild.parentList = list;
                members.removeChild(members.firstChild);
            }
            member.parentList = list;
            list.members.push(member);
            return "none";
        }
        return list.var.members;
    };
    me.prefixes = function (object) {
        var prefixes = [];
        var list = me.ui.node.container(object, "widget.menu.list");
        for (var child of list.members) {
            var prefix = me.core.property.get(child, "prefix");
            if (!prefix) {
                continue;
            }
            if (!prefixes.includes(prefix)) {
                prefixes.push(prefix);
            }
        }
        return prefixes;
    };
    me.filter = function (object, info) {
        var list = me.ui.node.container(object, "widget.menu.list");
        var members = list.var.members;
        while (members.firstChild) {
            members.removeChild(members.firstChild);
        }
        for (var child of list.members) {
            var prefix = me.core.property.get(child, "prefix");
            var childText = me.core.property.get(child, "ui.basic.text");
            if (!childText) {
                continue;
            }
            var mark = !info.prefix || prefix.toUpperCase() === info.prefix.toUpperCase();
            mark = mark && (!info.text || childText.toUpperCase().includes(info.text.toUpperCase()));
            if (mark) {
                me.ui.mark.widget(child, info.text);
                members.appendChild(child);
            }
        }
    };
};

screens.widget.menu.item = function WidgetMenuItem(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "span",
            "ui.touch.click": "click"
        },
        dependencies: {
            parent: ["widget.menu", "widget.menu.popup"],
            properties: ["ui.basic.text"]
        },
        use: (properties, parent) => {
            if (properties["options"] && properties["options"].unique === false) {
                return null;
            }
            var text = properties["ui.basic.text"];
            if (!text) {
                return null;
            }
            var element = me.ui.node.findByText(parent, text);
            if (element) {
                me.core.property.set(element, properties);
            }
            return element;
        },
        tag: function (properties) {
            var groupName = properties["group"];
            if (groupName) {
                return "li";
            }
        },
        container: function (object, parent, properties) {
            var groupName = properties["group"];
            if (groupName) {
                return me.widget.menu.list.use(parent, groupName, object);
            }
        }
    };
    me.init = function () {
        me.sleepThreshold = { length: 50, sleep: 500 };
    };
    me.promise = async function (object, info) {
        if (!info) {
            return;
        }
        var parent = me.ui.node.container(object, me.widget.menu.list.id);
        if (!parent) {
            return;
        }
        me.core.property.set(parent, "ui.work.state", true);
        var items = await info.promise;
        if(!items) {
            items = [];
        }
        if (items.length > me.sleepThreshold.length) {
            await me.core.util.sleep(me.sleepThreshold.sleep);
        }
        me.core.property.set(parent, "ui.work.state", false);
        items = info.callback(items);
        me.core.property.set(me.parentMenu(object), "values", items);
    };
    me.handleValue = function (object, values, key, callback) {
        var parentMenu = me.parentMenu(object);
        if (key in values) {
            var value = values[key];
            if (typeof value === "string" || typeof value === "function") {
                if (value === "select") {
                    value = object.menu_select;
                }
                value = me.core.property.get(parentMenu.window, value, me.core.property.get(object, "ui.basic.text"));
            }
            if (value && value.then) {
                callback(false);
                value.then(callback);
            }
            else {
                callback(value);
            }
        }
    };
    me.options = {
        set: function (object, options) {
            if (options) {
                me.handleValue(object, options, "debugger", (value) => {
                    if (value) {
                        debugger;
                    }
                });
                me.handleValue(object, options, "enabled", (value) => {
                    me.core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "visible", (value) => {
                    me.core.property.set(object, "ui.style.display", value ? "block" : "none");
                });
                me.handleValue(object, options, "state", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "checked");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "checked");
                    }
                });
                me.handleValue(object, options, "mark", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "mark");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "mark");
                    }
                });
                me.handleValue(object, options, "separator", (value) => {
                    if (value && object.parentNode.firstChild !== object.previousSibling) {
                        me.core.property.set(object, "ui.class.add", "separator");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "separator");
                    }
                });
                me.handleValue(object, options, "header", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "header");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "header");
                    }
                });
            }
        }
    };
    me.prefix = {
        get: function (object) {
            return object.menu_prefix;
        },
        set: function (object, value) {
            object.menu_prefix = value;
        }
    };
    me.select = {
        get: function (object) {
            return object.menu_select;
        },
        set: function (object, value) {
            if (object.menu_select && value && Array.isArray(object.menu_select) && Array.isArray(value)) {
                var menu_select = [];
                for (var target of value) {
                    if (!object.menu_select.find((source) => source[0] === target[0])) {
                        menu_select.push(target);
                    }
                    object.menu_select = object.menu_select.concat(menu_select);
                }
            }
            else {
                object.menu_select = value;
            }
        }
    };
    me.parentMenu = function (object) {
        var parent = object.parentNode;
        if(!parent) {
            parent = object.parentList;
        }
        var popup = me.ui.node.container(object, "widget.menu.popup");
        if (popup) {
            parent = popup;
        }
        return parent;
    };
    me.hover = {
        set: function (object, value) {
            var parentMenu = me.parentMenu(object);
            if (parentMenu.selected_item !== object && object.menu_select) {
                me.ui.mark.widget(object, null);
                me.core.property.set(parentMenu, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            var parentMenu = me.parentMenu(object);
            me.ui.mark.widget(object, null);
            me.core.property.set(parentMenu, "select", [object, object.menu_select]);
        }
    };
    me.upload = {
        set: function (object, value) {
            if (!object.var.upload) {
                me.ui.element({
                    "ui.basic.tag": "input",
                    "ui.basic.type": "file",
                    "ui.basic.text": "",
                    "ui.class.class": "widget.menu.item.upload",
                    "ui.basic.var": "upload",
                    "ui.style.userSelect": "none",
                    "ui.attribute.multiple": "multiple",
                    "core.event.change": value
                }, object, object);
            }
        }
    };
};
