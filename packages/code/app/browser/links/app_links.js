/*
 @author Zakai Hamilton
 @component AppLinks
 */

screens.app.links = function AppLinks(me, { core, ui, widget }) {
    me.maxLinkCount = 20;
    me.init = async function () {
        await ui.content.implement(me);
    };
    me.launch = async function (args) {
        if (!args) {
            args = [""];
        }
        await me.content.update();
        var window = ui.element.create(me.json, "workspace", "self");
        if (typeof args[0] === "string") {
            me.content.import(window, args[0], args[1]);
        }
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = widget.window.get(object);
            ui.options.load(me, window, {
                border: true,
                editMode: false
            });
            ui.options.toggleSet(me, null, {
                "border": me.reload,
                "editMode": me.reload
            });
            ui.options.choiceSet(me, null, {
                "fontSize": (object, value) => {
                    var window = widget.window.get(object);
                    core.property.set(window.var.links, "ui.style.fontSize", value);
                    core.property.notify(window, "reload");
                    core.property.notify(window, "update");
                }
            });
            core.property.set(window, "app", me);
        }
    };
    me.clear = function (object) {
        var window = widget.window.get(object);
        core.property.set(window, "name", "");
        window.links = [];
        me.reload(window);
    };
    me.importData = function (object, text, title, options) {
        var window = widget.window.get(object);
        core.property.set(window, "widget.window.name", title);
        window.links = JSON.parse(text);
        if (!options) {
            options = {};
        }
        window.links_options = options;
        me.reload(window);
    };
    me.exportData = function (object) {
        var window = widget.window.get(object);
        return [JSON.stringify(window.links), window.links_options];
    };
    me.store = function (object, index, key) {
        var window = widget.window.get(object);
        var link = window.links[index];
        if (!link) {
            link = window.links[index] = { href: "", label: "" };
        }
        link[key] = object.value;
    };
    me.links = function (object) {
        let html = "";
        let window = widget.window.get(object);
        let editMode = window.options.editMode;
        if (editMode) {
            for (let linkIndex = 0; linkIndex < me.maxLinkCount; linkIndex++) {
                html += ui.html.item({
                    classes: ["app-links-item"]
                }, () => {
                    let html = "";
                    let link = window.links[linkIndex];
                    if (!link) {
                        link = { href: "", label: "" };
                    }
                    html += ui.html.item({
                        classes: ["app-links-key-label"],
                        value: "Label"
                    });
                    html += ui.html.item({
                        tag: "input",
                        classes: ["app-links-key-input", "input"],
                        attributes: { value: link.label, oninput: "screens.app.links.store(this," + linkIndex + ",'label')" }
                    });
                    html += ui.html.item({
                        classes: ["app-links-value-label"],
                        value: "Link"
                    });
                    html += ui.html.item({
                        tag: "input",
                        classes: ["app-links-value-input", "input"],
                        attributes: { value: link.href, oninput: "screens.app.links.store(this," + linkIndex + ",'href')" }
                    });
                    return html;
                });
            }
        }
        else {
            html += ui.html.item({ classes: ["app-links-container"] }, () => {
                var html = "";
                for (let link of window.links) {
                    let attributes = Object.assign({ target: "_blank", href: link.href });
                    let classes = ["app-links-link"];
                    if (window.options.border) {
                        classes.push("border");
                    }
                    html += ui.html.item({ tag: "a", attributes, classes, value: link.label });
                }
                return html;
            });
        }
        return html;
    };
    me.reload = async function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.links, {
            "ui.style.fontSize": window.options.fontSize,
            "ui.class.edit-mode": window.options.editMode
        });
        if (!window.links) {
            window.links = [];
        }
        if (!window.links_options) {
            window.links_options = {};
        }
        var html = me.links(window);
        core.property.set(window.var.links, "ui.basic.html", html);
        core.property.notify(window, "update");
    };
};
