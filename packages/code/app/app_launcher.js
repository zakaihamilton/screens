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
        var results = {};
        var names = [];
        var lists = [];
        var message = "";
        var counter = ++me.searchCounter;
        if (text) {
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
                            label = component.content.name();
                        }
                        if (!label) {
                            label = name.split(".").pop();
                        }
                        names.push(label);
                        lists.push(component.content.search(text));
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
                if (list.length) {
                    results[name] = list;
                }
            }
            for (let name in results) {
                message += me.ui.html.item({
                    classes: ["app-launcher-results-collection"],
                }, () => {
                    var html = "";
                    html += me.ui.html.item({
                        value: me.core.string.title(name),
                        classes: ["app-launcher-results-label"],
                        attributes: {
                            onclick: "screens.app.launcher.collapseSearchCollection(this)"
                        }
                    });
                    for (let item of results[name]) {
                        let classes = ["app-launcher-results-item"];
                        if (item.private) {
                            classes.push("private");
                        }
                        html += me.ui.html.item({
                            value: item.title,
                            classes,
                            attributes: {
                                args: JSON.stringify(item.args),
                                onclick: "screens.app.launcher.launchSearchItem(this)"
                            }
                        });
                    }
                    return html;
                });
            }
        }
        if (message) {
            me.core.property.set(window.var.results, "ui.style.display", "flex");
            me.core.property.set(window.var.results, "ui.basic.html", message);
        }
        else {
            me.core.property.set(window.var.results, "ui.style.display", "");
        }
    };
    me.launchSearchItem = function (object) {
        var args = me.core.property.get(object, "ui.attribute.#args");
        args = args.replace(/'/g, "\"");
        me.core.app.launch.apply(null, JSON.parse(args));
    };
    me.collapseSearchCollection = function (object) {
        me.core.property.set(object.parentNode, "ui.class.toggle", "collapse");
        me.core.property.set(object, "ui.class.toggle", "collapse");
    };
};
