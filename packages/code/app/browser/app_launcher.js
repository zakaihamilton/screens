/*
 @author Zakai Hamilton
 @component AppLauncher
 */

screens.app.launcher = function AppLauncher(me, packages) {
    const { core } = packages;
    me.init = function () {
        me.searchCounter = 0;
    };
    me.launch = async function () {
        var window = me.ui.element.create(me.json, "workspace", "self");
        if (core.device.isMobile()) {
            core.property.set(window, "maximize");
        }
        return window;
    };
    me.resIcon = function (object, value) {
        var name = null, extension = null, label = null, tooltip = null;
        if (typeof value === "string") {
            label = value;
            name = value.toLowerCase();
        }
        else if (Array.isArray(value)) {
            label = value[0];
            name = value[0].toLowerCase();
            extension = value[1];
        }
        else {
            label = value.label;
            name = value.label.toLowerCase();
            extension = value.extension;
            tooltip = value.tooltip;
        }
        if (!extension) {
            extension = "png";
        }
        var available = core.app.available(name);
        core.property.set(object, "text", label);
        core.property.set(object, "ui.basic.src", `${name}`);
        core.property.set(object, "ui.basic.display", available);
        core.property.set(object, "ui.touch.click", "core.app." + name);
        core.property.set(object, "ui.attribute.title", tooltip);
    };
    me.search = async function (object) {
        var window = me.widget.window.get(object);
        var text = object.value.toLowerCase().trim();
        if (text) {
            var progress = me.ui.node.findByName(window, "progress");
            core.property.set(window, "temp", false);
            core.property.set(progress, "ui.class.progress", true);
            clearTimeout(window.searchTimer);
            window.searchTimer = setTimeout(() => {
                core.property.set(window, "name", object.value.trim());
                me.searchNow(object, text);
                core.property.set(progress, "ui.class.progress", false);
            }, 500);
            core.property.set(window, "title", "Search");
            core.property.set(window.var.results, "ui.style.display", "flex");
        }
        else {
            core.property.set(window, "name", "");
            core.property.set(window, "title", "Launcher");
            core.property.set(window, "temp", true);
            core.property.set(window.var.results, "ui.style.display", "");
            core.property.set(window.var.results, "ui.basic.html", "");
        }
    };
    me.searchNow = async function (object, text) {
        var window = me.widget.window.get(object);
        var results = [];
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
            lists = await Promise.all(lists);
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
            if (results.length) {
                message = me.tree(object, results, text, true);
            }
            else {
                message = "<br><b style='text-align:center;'>No Matching Results</b>";
            }
            core.property.set(window.var.results, "ui.basic.html", message);
        }
    };
    me.tree = function (object, list, search, root) {
        if (!Array.isArray(list)) {
            list = [list];
        }
        let html = "";
        for (let item of list) {
            let classes = ["app-launcher-results-collection"];
            if (root) {
                classes.push("root");
            }
            html += me.ui.html.item({
                classes,
            }, () => {
                let html = "";
                let title = item.title;
                var onclick = null;
                if (!root) {
                    title = me.ui.html.mark(title, search);
                }
                let classes = [];
                if (root) {
                    classes.push("root");
                }
                if (item.members && item.members.length) {
                    classes.push("members");
                    onclick = "screens.app.launcher.collapseSearchCollection(this)";
                }
                html += me.ui.html.item({
                    tag: "div",
                    classes: [...classes, "app-launcher-results-branch"],
                    attributes: {
                        onclick
                    }
                }, () => {
                    let html = "";
                    html += me.ui.html.item({
                        tag: "div",
                        classes: [...classes, "app-launcher-results-collapse"]
                    });
                    html += me.ui.html.item({
                        tag: "div",
                        value: title,
                        classes: [...classes, "app-launcher-results-label"]
                    });
                    return html;
                });
                if (!item.members) {
                    return html;
                }
                for (let child of item.members) {
                    if (child.members) {
                        html += me.tree(object, child, search);
                        continue;
                    }
                    let classes = ["app-launcher-results-item"];
                    if (child.private) {
                        classes.push("private");
                    }
                    let styles = { direction: core.string.direction(child.title) };
                    html += me.ui.html.item({
                        value: me.ui.html.mark(child.title, search),
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
        var args = core.property.get(object, "ui.attribute.#args");
        if (args) {
            args = args.replace(/'/g, "\"");
            args = JSON.parse(args);
            core.message.send.apply(null, args);
        }
    };
    me.collapseSearchCollection = function (object) {
        core.property.set(object.parentNode, "ui.class.toggle", "collapse");
        core.property.set(object.firstElementChild, "ui.class.toggle", "collapse");
        core.property.set(object, "ui.class.toggle", "collapse");
    };
};
