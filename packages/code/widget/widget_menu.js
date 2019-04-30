/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

screens.widget.menu = function WidgetMenu(me, packages) {
    const { core } = packages;
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
            core.property.set(window, "ui.property.broadcast", {
                "ui.class.add": "has-menu"
            });
        }
        else {
            core.property.set(window, "ui.property.broadcast", {
                "ui.class.remove": "has-menu"
            });
        }
    };
    me.collect = function (object, info) {
        var parseItems = (items) => {
            if (!items) {
                items = [];
            }
            if (info.listMethod) {
                items = core.property.get(object, info.listMethod, items);
                if (!items) {
                    items = [];
                }
            }
            if (info.emptyMsg && !items.length) {
                var properties = {};
                if (info.group) {
                    properties.group = info.group;
                }
                return [{
                    text: info.emptyMsg,
                    select: null,
                    options: {
                        enabled: false,
                        separator: info.separator
                    },
                    properties
                }];
            }
            if (info.sort) {
                if (info.property) {
                    items = items.sort((a, b) => String(a[info.property]).localeCompare(String(b[info.property])));
                }
                else {
                    items = items.sort();
                }
            }
            if (info.reverse) {
                items = Array.from(items);
                items.reverse();
            }
            var first = true;
            items = items.map(function (item) {
                var title = item;
                if (info.property) {
                    title = String(item[info.property]);
                }
                if (!title) {
                    return null;
                }
                var ref = title;
                if (!info.keepCase) {
                    title = title.charAt(0).toUpperCase() + title.slice(1);
                }
                if (info.title) {
                    title = core.string.title(title);
                }
                var properties = {};
                var item_metadata = {};
                if (info.group) {
                    properties.group = info.group;
                }
                if (info.metadata) {
                    for (var key in info.metadata) {
                        item_metadata[key] = item[info.metadata[key]];
                    }
                    properties.metadata = item_metadata;
                    title = "";
                }
                var options = Object.assign({}, info.options);
                if (info.separator && first) {
                    options.separator = true;
                }
                var result = {
                    ref,
                    text: title,
                    select: info.itemMethod,
                    options,
                    properties
                };
                first = false;
                return result;
            });
            return items;
        };
        return [{
            text: "",
            select: null,
            options: {
                "header": true,
                "visible": info.metadata ? true : false
            },
            properties: {
                "group": info.group,
                "metadata": info.metadata,
                "promise": { promise: info.list, callback: parseItems }
            }
        }];
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
            core.property.set(window.var.menu, "ui.group.data", {
                "ui.data.keyList": ["ui.basic.html", "select", "options", "properties"],
                "ui.data.mapping": { "text": "ui.basic.html", "tooltip": "ui.attribute.title" },
                "ui.data.values": value
            });
            me.updateTheme(window);
        }
    };
    me.back = {
        set: function (object, value) {
            core.property.set(object, "ui.style.zIndex", "");
            core.property.set(object.var.modal, "ui.style.display", "none");
            core.property.set(object.var.menu, "ui.node.parent");
            core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": null
            });
            core.property.set(object.var.menu, "ui.property.broadcast", {
                "close": null
            });
            object.var.menu = null;
            object.selected_item = null;
        }
    };
    me.select = {
        set: async function (object, value) {
            var item = value[0];
            var info = value[1];
            if (item === object.selected_item) {
                core.property.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            core.property.set(object, "ui.style.zIndex", "10");
            core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": "widget.menu.item.hover"
            });
            core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            core.property.set(item, "ui.class.add", "selected");
            core.property.set(object.var.menu, "ui.property.broadcast", {
                "close": null
            });
            core.property.set(object.var.menu, "ui.node.parent");
            object.var.menu = null;
            await core.util.sleep(10);
            core.property.set(object.var.modal, "ui.style.display", "block");
            if (typeof info === "string") {
                core.property.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = core.property.get(object, "widget.window.active");
                let trail = me.core.property.get(object, "trail");
                let label = core.property.get(item, "ui.basic.html");
                if (!trail) {
                    trail = [];
                }
                trail.push(label);
                object.var.menu = me.create_menu(window, object, me.ui.rect.absoluteRegion(item), info, trail);
            }
        }
    };
    me.create_menu = function (window, object, region, values, trail, bottomUp = false) {
        var menu = me.ui.element.create({
            "ui.basic.var": "menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.bottom + "px",
            "ui.basic.window": window,
            "ui.basic.target": object,
            "trail": trail,
            "values": values,
        });
        if (bottomUp) {
            core.property.set(menu, "ui.class.add", "bottom-up");
        }
        return menu;
    };
};

screens.widget.menu.popup = function WidgetMenuPopup(me, packages) {
    const { core } = packages;
    me.element = {
        properties: {
            "ui.class.class": "widget.menu.vertical",
            "ui.basic.elements": {
                "ui.basic.var": "modal",
                "ui.element.component": "widget.modal"
            }
        }
    };
    me.trail = {
        get: function (object) {
            return object.trail;
        },
        set: function (object, trail) {
            if (trail) {
                object.trail = [...trail];
            }
            else {
                object.trail = [];
            }
        }
    };
    me.values = function (object, values) {
        if (core.property.get(object, "ui.node.parent")) {
            core.property.set(object, "ui.group.data", {
                "ui.data.keyList": ["ui.basic.html", "select", "options", "properties"],
                "ui.data.mapping": { "text": "ui.basic.html" },
                "ui.data.values": values,
            });
            core.property.set(object, "ui.property.broadcast", {
                "update": null
            });
        }
    };
    me.back = {
        set: function (object, value) {
            if (value || !core.property.get(object, "ui.class.has-menu")) {
                core.property.set(object.target, "back", value);
            }
            core.property.set(object.target, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            core.property.set(object.target, "ui.style.display", "");
            core.property.set(object, "ui.node.parent");
        }
    };
    me.subMenu = async function (object, value) {
        var item = value[0];
        var values = value[1];
        core.property.set(object, "ui.property.broadcast", {
            "ui.class.remove": "selected"
        });
        var label = core.property.get(item, "ui.basic.text");
        let trail = core.property.get(object, "trail");
        if (!trail) {
            trail = [];
        }
        trail.push(label);
        values = [{ text: label, select: "header" }, ...values];
        core.property.set(item, "ui.class.add", "selected");
        core.property.set(object.var.modal, "ui.style.display", "block");
        var window = core.property.get(object, "widget.window.active");
        var region = me.ui.rect.absoluteRegion(object);
        region.bottom = region.top;
        core.property.set(object, "ui.style.display", "none");
        object.var.menu = me.upper.create_menu(window, object, region, values, trail);
        core.property.set(object.var.menu, "ui.class.has-menu", true);
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var method = value[1];
            if (Array.isArray(method)) {
                return me.subMenu(object, value);
            }
            core.property.set(object, "back", item);
            var text = undefined;
            if (item.menu_options) {
                text = item.menu_options.value;
            }
            if (typeof text === "undefined") {
                text = item.menu_ref;
            }
            if (typeof text === "undefined") {
                if (core.property.get(item, "ui.basic.tag") === "tr") {
                    text = core.property.get(item.firstElementChild, "ui.basic.html");
                }
                else {
                    text = core.property.get(item, "ui.basic.html");
                }
            }
            let trail = me.core.property.get(object, "trail");
            let label = "";
            if (core.property.get(item, "ui.basic.tag") === "tr") {
                label = core.property.get(item.firstElementChild, "ui.basic.html");
            }
            else {
                label = core.property.get(item, "ui.basic.html");
            }
            if (!trail) {
                trail = [];
            }
            trail.push(label);
            me.widget.toast.show(me.id, trail.join(" &#x2799; "));
            core.property.set(object.window, method, text);
        }
    };
};

screens.widget.menu.list = function WidgetMenuList(me, packages) {
    const { core } = packages;
    me.filterMinCount = 30;
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
        if (object.workTimeout) {
            clearTimeout(object.workTimeout);
            object.workTimeout = null;
        }
        if (state) {
            object.workTimeout = setTimeout(function () {
                core.property.set(object.var.progress, "ui.style.display", "block");
                core.property.set(object.var.members, "ui.style.display", "none");
            }, 250);
        } else {
            core.property.set(object.var.progress, "ui.style.display", "none");
            core.property.set(object.var.members, "ui.style.display", "");
        }
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
                "ui.class.class": "widget.menu.members",
                "ui.basic.tag": membersTag
            }, list, list);
        }
        if (!list.var.filter && list.var.members.childNodes.length >= me.filterMinCount) {
            me.ui.element.create({
                "ui.element.component": "widget.filter",
                "filter": "widget.menu.list.filter",
                "ui.basic.var": "filter"
            }, list.var.headers, list);
            member.parentList = list;
        }
        return list.var.members;
    };
    me.filter = function (object, info) {
        var list = me.ui.node.container(object, "widget.menu.list");
        if (list.filterTimer) {
            clearTimeout(list.filterTimer);
            list.filterTimer = null;
        }
        var updateFunc = () => {
            let found = false;
            var members = Array.from(list.var.members.childNodes);
            var isFirst = core.property.get(list.var.members, "ui.basic.tag") === "table";
            for (var child of members) {
                var childText = core.property.get(child, "ui.basic.text");
                if (!childText) {
                    continue;
                }
                if (isFirst) {
                    isFirst = false;
                    continue;
                }
                var mark = !info.text || childText.toUpperCase().includes(info.text.toUpperCase());
                me.ui.html.markElement(child, mark ? info.text : "");
                if (mark) {
                    found = true;
                }
                me.core.property.set(child, "ui.basic.display", mark);
            }
            if (!found) {
                if (!list.var.noMatch) {
                    list.var.noMatch = list.var.members.appendChild(me.ui.element.create({
                        "ui.basic.tag": "div",
                        "ui.basic.html": "No Match Found",
                        "ui.class.add": "no-match"
                    }));
                }
            }
            me.core.property.set(list.var.noMatch, "ui.basic.display", !found);
        };
        if (info.text) {
            list.filterTimer = setTimeout(updateFunc, 250);
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
            core.property.set(members.rows[0].cells[list.columnIndex], "ui.class." + list.direction, false);
        }
        if (list.columnIndex === columnIndex && list.direction !== "asc") {
            direction = list.direction = "asc";
        }
        else {
            direction = list.direction = "desc";
        }
        core.property.set(object, "ui.class." + direction, true);
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

screens.widget.menu.item = function WidgetMenuItem(me, packages) {
    const { core } = packages;
    me.element = {
        properties: {
            "ui.basic.tag": "span",
            "ui.touch.click": "click"
        },
        dependencies: {
            parent: ["widget.menu", "widget.menu.popup"],
            properties: ["ui.basic.html"]
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
            var text = properties["ui.basic.html"];
            if (!text) {
                return null;
            }
            var element = me.ui.node.findByText(parent, text);
            if (element) {
                if (!element.menu_options || !element.menu_options.edit) {
                    core.property.set(element, properties);
                }
                else {
                    element = null;
                }
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
    me.promise = async function (object, info) {
        var parent = me.ui.node.container(object, me.widget.menu.list.id);
        if (!parent) {
            return;
        }
        core.property.set(parent, "ui.work.state", true);
        var items = await info.promise;
        if (!items) {
            items = [];
        }
        core.property.set(parent, "ui.work.state", false);
        if (info.callback) {
            items = info.callback(items);
        }
        core.property.set(me.parentMenu(object), "values", items);
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
                    value = object.menu_ref;
                }
                if (typeof value === "undefined") {
                    value = core.property.get(object, "ui.basic.html");
                }
                if (method === "admin") {
                    param = core.util.info.admin;
                }
                else {
                    param = core.property.get(parentMenu.window || object, method, value);
                }
            }
            if (param && param.then) {
                callback("");
                param.then(param => {
                    if (param && Array.isArray(param) && !param.length) {
                        param = "";
                    }
                    callback(param);
                });
            }
            else {
                if (param && Array.isArray(param) && !param.length) {
                    param = "";
                }
                callback(param);
            }
        }
    };
    me.options = {
        set: function (object, options) {
            if (!options) {
                return;
            }
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
                    core.property.set(object, "ui.style.gridColumn", options.column);
                }
                me.handleValue(object, options, "debugger", (value) => {
                    if (value) {
                        debugger;
                    }
                });
                me.handleValue(object, options, "enabled", (value) => {
                    core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "disabled", (value) => {
                    core.property.set(object, "ui.basic.enabled", !value);
                });
                me.handleValue(object, options, "visible", (value) => {
                    core.property.set(object, "ui.style.display", value ? "" : "none");
                });
                me.handleValue(object, options, "state", (value) => {
                    core.property.set(object, "ui.class.checked", value);
                });
                me.handleValue(object, options, "mark", (value) => {
                    core.property.set(object, "ui.class.mark", value);
                });
                me.handleValue(object, options, "status", (value) => {
                    core.property.set(object, "ui.attribute.#widget-menu-status", value);
                });
                me.handleValue(object, options, "menu", (value) => {
                    core.property.set(object, "ui.class.has-menu", value);
                });
                me.handleValue(object, options, "separator", (value) => {
                    core.property.set(object, "ui.class.separator", value);
                });
                me.handleValue(object, options, "header", (value) => {
                    core.property.set(object, "ui.class.header", value);
                });
                me.handleValue(object, options, "label", (value) => {
                    core.property.set(object, "ui.class.label", value);
                });
                me.handleValue(object, options, "search", (value) => {
                    core.property.set(object, "ui.attribute.type", value ? "search" : "text");
                });
                me.handleValue(object, options, "edit", (value) => {
                    if (options.edit) {
                        core.property.set(object, {
                            "ui.class.add": ["edit", "input", "inherit-font"],
                            "ui.attribute.contenteditable": true,
                            "core.link.close": () => {
                                core.property.set(object, options.edit, object.value);
                            },
                            "ui.basic.html": value ? value : "",
                            "ui.attribute.placeholder": core.property.get(object, "ui.basic.html")
                        });
                    }
                    else {
                        core.property.set(object, {
                            "ui.class.remove": ["edit", "input", "inherit-font"],
                            "ui.attribute.contenteditable": false,
                            "core.link.close": null,
                            "ui.attribute.placeholder": null
                        });
                    }
                });
            }
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
                    if (Array.isArray(target)) {
                        if (!object.menu_select.find((source) => source[0] === target[0])) {
                            menu_select.push(target);
                        }
                    }
                    else if (typeof target === "string") {
                        if (!object.menu_select.find((source) => source === target)) {
                            menu_select.push(target);
                        }
                    }
                    else {
                        if (!object.menu_select.find((source) => source.text === target.text)) {
                            menu_select.push(target);
                        }
                    }
                }
                object.menu_select = object.menu_select.concat(menu_select);
            }
            else {
                object.menu_select = value;
            }
            if (Array.isArray(value)) {
                core.property.set(object, "ui.class.has-menu", true);
            }
            var optionNames = ["header", "label"];
            for (var optionName of optionNames) {
                if (object.menu_select !== optionName) {
                    continue;
                }
                var options = { "enabled": false };
                options[optionName] = true;
                core.property.set(object, "options", options);
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
                me.ui.html.markElement(object, null);
                core.property.set(parentMenu, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            var parentMenu = me.parentMenu(object);
            me.ui.html.markElement(object, null);
            if (object.menu_select) {
                core.property.set(parentMenu, "select", [object, object.menu_select]);
            }
        }
    };
    me.upload = {
        set: function (object, value) {
            if (!object.var.upload) {
                me.ui.element.create({
                    "ui.basic.tag": "input",
                    "ui.basic.type": "file",
                    "ui.basic.html": "",
                    "ui.class.add": "upload",
                    "ui.basic.var": "upload",
                    "ui.style.userSelect": "none",
                    "ui.attribute.multiple": "multiple",
                    "core.event.change": (files) => {
                        core.property.set(me.ui.node.container(object, "widget.menu.popup"), "back");
                        core.property.set(object, value, files);
                    }
                }, object, object);
            }
        }
    };
    me.metadata = function (object, values) {
        if (!values) {
            return;
        }
        var elements = [];
        var tag = "td";
        if (object.menu_options && object.menu_options.header) {
            tag = "th";
        }
        for (var key in values) {
            let value = values[key];
            if (typeof value !== "string" && typeof value !== "number") {
                value = "";
            }
            elements.push({
                "ui.basic.tag": tag,
                "ui.basic.html": tag === "th" ? key : value,
                "ui.touch.down": tag === "th" ? "widget.menu.list.sort" : undefined
            });
        }
        me.ui.element.create(elements, object, object);
    };
    me.ref = {
        get: function (object) {
            return object.menu_ref;
        },
        set: function (object, value) {
            object.menu_ref = value;
        }
    };
};
