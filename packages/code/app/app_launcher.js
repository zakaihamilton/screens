/*
 @author Zakai Hamilton
 @component AppLauncher
 */

screens.app.launcher = function AppLauncher(me) {
    me.init = function () {
        me.searchCounter = 0;
    };
    me.ready = async function () {
        me.ui.image.preload("packages/res/icons");
    };
    me.launch = async function () {
        let config = await me.core.util.config();
        var params = {
            version: config.version
        };
        return me.ui.element.create(me.json, "workspace", "self", params);
    };
    me.resIcon = function (object, value) {
        var name = null, extension = null, label = null;
        if (typeof value === "string") {
            label = value;
            name = value.toLowerCase();
        }
        else if (Array.isArray(value)) {
            label = value[0];
            name = value[0].toLowerCase();
            extension = value[1];
        }
        if (!extension) {
            extension = "png";
        }
        var available = me.core.app.available(name);
        me.core.property.set(object, "text", label);
        me.core.property.set(object, "ui.basic.src", `/packages/res/icons/${name}.${extension}`);
        me.core.property.set(object, "ui.basic.display", available);
        me.core.property.set(object, "ui.touch.click", "core.app." + name);
    };
    me.search = async function (object) {
        var window = me.widget.window.get(object);
        var text = object.value.toLowerCase().trim();
        var results = [];
        var names = [];
        var lists = [];
        var message = "";
        var counter = ++me.searchCounter;
        if (text) {
            me.core.property.set(window, "temp", false);
            var components = screens.components.sort();
            for (let name of components) {
                if (name === "ui.content") {
                    continue;
                }
                let component = me.browse(name);
                if ("content" in component) {
                    if ("search" in component.content) {
                        let label = null;
                        if ("name" in component.content) {
                            if (typeof component.content.name === "function") {
                                label = component.content.name();
                            }
                            else if (typeof component.content.name === "string") {
                                label = component.content.name;
                            }
                        }
                        if (!label) {
                            label = name.split(".").pop();
                        }
                        names.push(label);
                        let result = component.content.search(text);
                        lists.push(result);
                    }
                }
            }
            var progress = me.ui.node.findByName(window, "progress");
            me.core.property.set(progress, "ui.class.progress", true);
            lists = await Promise.all(lists);
            me.core.property.set(progress, "ui.class.progress", false);
            if (counter !== me.searchCounter) {
                return;
            }
            for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
                let name = names[nameIndex];
                let list = lists[nameIndex];
                if (list && list.length) {
                    results.push({ title: name, members: list });
                }
            }
            message = me.tree(object, results);
        }
        if (message) {
            me.core.property.set(window.var.results, "ui.style.display", "flex");
            me.core.property.set(window.var.results, "ui.basic.html", message);
        }
        else {
            me.core.property.set(window, "temp", true);
            me.core.property.set(window.var.results, "ui.style.display", "");
        }
    };
    me.tree = function (object, list) {
        if (!Array.isArray(list)) {
            list = [list];
        }
        let html = "";
        for (let item of list) {
            html += me.ui.html.item({
                classes: ["app-launcher-results-collection"],
            }, () => {
                let html = "";
                html += me.ui.html.item({
                    value: me.core.string.title(item.title),
                    classes: ["app-launcher-results-label"],
                    attributes: {
                        onclick: "screens.app.launcher.collapseSearchCollection(this)"
                    }
                });
                if (!item.members) {
                    return html;
                }
                for (let child of item.members) {
                    if (child.members) {
                        html += me.tree(object, child);
                        continue;
                    }
                    let classes = ["app-launcher-results-item"];
                    if (child.private) {
                        classes.push("private");
                    }
                    let styles = { direction: me.core.string.direction(child.title) };
                    html += me.ui.html.item({
                        value: child.title,
                        classes,
                        styles,
                        attributes: {
                            args: JSON.stringify(child.args),
                            onclick: "screens.app.launcher.launchSearchItem(this)"
                        }
                    });
                }
                return html;
            });
        }
        return html;
    };
    me.launchSearchItem = function (object) {
        var args = me.core.property.get(object, "ui.attribute.#args");
        if (args) {
            args = args.replace(/'/g, "\"");
            me.core.message.send.apply(null, JSON.parse(args));
        }
    };
    me.collapseSearchCollection = function (object) {
        me.core.property.set(object.parentNode, "ui.class.toggle", "collapse");
        me.core.property.set(object, "ui.class.toggle", "collapse");
    };
};
