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
    me.collect = function (object, list, property, attributes, group, listMethod, itemMethod, metadata) {
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
            items = items.map(function (item) {
                var title = String(item[property]);
                if (!title) {
                    return null;
                }
                var properties = {};
                var item_metadata = {};
                if (metadata) {
                    for (var key in metadata) {
                        item_metadata[key] = item[metadata[key]];
                    }
                    properties.metadata = item_metadata;
                    title = "";
                }
                if (group) {
                    properties.group = group;
                }
                title = [title.charAt(0).toUpperCase() + title.slice(1)];
                var result = [
                    title,
                    itemMethod,
                    attributes,
                    properties
                ];
                return result;
            });
            return items;
        };
        if (!list) {
            return null;
        }
        return [[
            "",
            null,
            {
                "header": true,
                "visible": metadata ? true : false
            },
            {
                "group": group,
                "metadata": metadata,
                "promise": { promise: list, callback: parseItems }
            }
        ]];
    };
    me.items = {
        set: function (object, value) {
            var window = me.widget.window.get(object);
            var parent = me.widget.window.parent(window);
            if (parent) {
                window = parent;
            }
            if (!window.var.menu) {
                parent = window;
                if (window.var.header) {
                    parent = window.var.header;
                }
                if (!window.var.menu) {
                    window.var.menu = me.ui.element.create({
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
            me.core.property.set(object.var.menu, "ui.property.broadcast", {
                "close": null
            });
            object.var.menu = null;
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
            me.core.property.set(object.var.menu, "ui.property.broadcast", {
                "close": null
            });
            me.core.property.set(object.var.menu, "ui.node.parent");
            object.var.menu = null;
            me.core.property.set(object.var.modal, "ui.style.display", "block");
            if (typeof info === "string") {
                me.core.property.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = me.core.property.get(object, "widget.window.active");
                object.var.menu = me.create_menu(window, object, me.ui.rect.absoluteRegion(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values, bottomUp) {
        var menu = me.ui.element.create({
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
    };
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
            var text = undefined;
            if (item.menu_options) {
                text = item.menu_options.value;
            }
            if (typeof text === "undefined") {
                if (me.core.property.get(item, "ui.basic.tag") === "tr") {
                    text = me.core.property.get(item.firstChild, "ui.basic.text");
                }
                else {
                    text = me.core.property.get(item, "ui.basic.text");
                }
            }
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
            "ui.class.add": "menu-list",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "headers"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": "widget.menu.progress.bar",
                    "ui.basic.var": "progress"
                }
            ]
        }
    };
    me.work = function (object, state) {
        me.log("menu state: " + state);
        me.core.property.set(object.var.progress, "ui.style.display", state ? "block" : "none");
        me.core.property.set(object.var.members, "ui.style.display", state ? "none" : "");
    };
    me.use = function (object, name, member, properties) {
        if (!object.lists) {
            object.lists = [];
        }
        var list = object.lists[name];
        if (!list) {
            list = me.ui.element.create({
                "ui.element.component": "widget.menu.list",
                "ui.basic.window": object.window,
            }, object);
            object.lists[name] = list;
        }
        if (!list.var.members) {
            var membersTag = "div";
            if (properties.metadata) {
                membersTag = "table";
            }
            me.ui.element.create({
                "ui.basic.var": "members",
                "ui.basic.tag": membersTag
            }, list, list);
        }
        if (list.var.filter) {
            member.parentList = list;
            list.members.push(member);
            return "none";
        }
        else if (list.var.members.childNodes.length >= me.filterMinCount) {
            list.members = [];
            me.ui.element.create({
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
        if (list.filterTimer) {
            clearTimeout(list.filterTimer);
            list.filterTimer = null;
        }
        var updateFunc = () => {
            var members = list.var.members;
            while (members.firstChild) {
                members.removeChild(members.firstChild);
            }
            var isFirst = me.core.property.get(list.var.members, "ui.basic.tag") === "table";
            for (var child of list.members) {
                var prefix = me.core.property.get(child, "prefix");
                var childText = me.core.property.get(child, "ui.basic.text");
                if (!childText) {
                    continue;
                }
                if (isFirst) {
                    members.appendChild(child);
                    isFirst = false;
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
        if (info.text) {
            list.filterTimer = setTimeout(updateFunc, 1000);
        }
        else {
            updateFunc();
        }
    };
    me.sort = function (object) {
        var list = me.ui.node.container(object, "widget.menu.list");
        var members = list.var.members;
        var columnIndex = Array.from(object.parentNode.children).indexOf(object);
        var direction = "desc";
        if (list.direction) {
            me.core.property.set(members.rows[0].cells[list.columnIndex], "ui.class." + list.direction, false);
        }
        if (list.columnIndex === columnIndex && list.direction !== "asc") {
            direction = list.direction = "asc";
        }
        else {
            direction = list.direction = "desc";
        }
        me.core.property.set(object, "ui.class." + direction, true);
        list.columnIndex = columnIndex;
        var rows = [];
        for (var rowIndex = 0; rowIndex < members.rows.length; rowIndex++) {
            rows.push(members.rows[rowIndex].cells[columnIndex]);
        }
        var firstRow = rows[0];
        rows = rows.sort((source, target) => {
            var result = 0;
            if (direction == "asc") {
                if (!source.textContent) {
                    result = 1;
                }
                else if (!target.textContent) {
                    result = -1;
                }
                else if (source.textContent > target.textContent) {
                    result = 1;
                }
                else if (source.textContent < target.textContent) {
                    result = -1;
                }
            } else if (direction == "desc") {
                if (source.textContent < target.textContent) {
                    result = 1;
                }
                else if (source.textContent > target.textContent) {
                    result = -1;
                }
            }
            return result;
        });
        members.appendChild(firstRow.parentNode);
        for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            if (rows[rowIndex] === firstRow) {
                continue;
            }
            members.appendChild(rows[rowIndex].parentNode);
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
            var unique = true;
            var options = properties["options"];
            if (options) {
                unique = options.unique;
                if (options.edit) {
                    unique = false;
                }
                if (!unique) {
                    return null;
                }
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
            var metadata = properties["metadata"];
            if (metadata) {
                return "tr";
            }
            var groupName = properties["group"];
            if (groupName) {
                return "span";
            }
            if (properties.options && properties.options.edit) {
                return "input";
            }
        },
        container: function (object, parent, properties) {
            var groupName = properties["group"];
            if (groupName) {
                return me.widget.menu.list.use(parent, groupName, object, properties);
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
        if (!items) {
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
            var param = values[key];
            if (typeof param === "string" || typeof param === "function") {
                var method = param;
                if (method === "select") {
                    method = object.menu_select;
                }
                var value = values.value;
                if (typeof value === "undefined") {
                    value = me.core.property.get(object, "ui.basic.text");
                }
                if (method === "admin") {
                    param = me.core.util.isAdmin;
                }
                else {
                    param = me.core.property.get(parentMenu.window || object, method, value);
                }
            }
            if (param && param.then) {
                callback(false);
                param.then(callback);
            }
            else {
                callback(param);
            }
        }
    };
    me.options = {
        set: function (object, options) {
            object.menu_options = Object.assign({}, object.menu_options, options);
            if (options) {
                if (options.var) {
                    var window = me.widget.window.get(object);
                    if (!window.var) {
                        window.var = {};
                    }
                    options.var.split(",").map(value => {
                        window.var[value] = object;
                    });
                }
                if (options.column) {
                    me.core.property.set(object, "ui.style.gridColumn", options.column);
                }
                me.handleValue(object, options, "debugger", (value) => {
                    if (value) {
                        debugger;
                    }
                });
                me.handleValue(object, options, "enabled", (value) => {
                    me.core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "disabled", (value) => {
                    me.core.property.set(object, "ui.basic.enabled", !value);
                });
                me.handleValue(object, options, "visible", (value) => {
                    me.core.property.set(object, "ui.style.display", value ? "" : "none");
                });
                me.handleValue(object, options, "state", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "checked");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "checked");
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
                me.handleValue(object, options, "label", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "label");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "label");
                    }
                });
                me.handleValue(object, options, "edit", (value) => {
                    if (options.edit) {
                        me.core.property.set(object, {
                            "ui.class.add": "edit",
                            "ui.attribute.contenteditable": true,
                            "core.link.close": options.edit,
                            "ui.basic.text": value,
                            "ui.attribute.placeholder": me.core.property.get(object, "ui.basic.text")
                        });
                    }
                    else {
                        me.core.property.set(object, {
                            "ui.class.remove": "edit",
                            "ui.attribute.contenteditable": false,
                            "core.link.close": null,
                            "ui.attribute.placeholder": null
                        });
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
                }
                object.menu_select = object.menu_select.concat(menu_select);
            }
            else {
                object.menu_select = value;
            }
            var optionNames = ["header", "label"];
            for (var optionName of optionNames) {
                if (object.menu_select !== optionName) {
                    continue;
                }
                var options = { "enabled": false };
                options[optionName] = true;
                me.core.property.set(object, "options", options);
            }
        }
    };
    me.parentMenu = function (object) {
        var parent = object.parentNode;
        if (!parent) {
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
            if (object.menu_select) {
                me.core.property.set(parentMenu, "select", [object, object.menu_select]);
            }
        }
    };
    me.upload = {
        set: function (object, value) {
            if (!object.var.upload) {
                me.ui.element.create({
                    "ui.basic.tag": "input",
                    "ui.basic.type": "file",
                    "ui.basic.text": "",
                    "ui.class.add": "upload",
                    "ui.basic.var": "upload",
                    "ui.style.userSelect": "none",
                    "ui.attribute.multiple": "multiple",
                    "core.event.change": value
                }, object, object);
            }
        }
    };
    me.metadata = function (object, value) {
        if (!value) {
            return;
        }
        var elements = [];
        var tag = "td";
        if (object.menu_options && object.menu_options.header) {
            tag = "th";
        }
        for (var key in value) {
            elements.push({
                "ui.basic.tag": tag,
                "ui.basic.text": tag === "th" ? key : value[key],
                "ui.touch.click": "widget.menu.list.sort"
            });
        }
        me.ui.element.create(elements, object, object);
    };
};
