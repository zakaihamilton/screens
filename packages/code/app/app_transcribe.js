/*
 @author Zakai Hamilton
 @component AppTranscribe
 */

screens.app.transcribe = function AppTranscribe(me) {
    me.init = async function () {
        me.groups = await me.media.file.groups();
    };
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.singleton.args = args;
            me.reload(me.singleton);
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        me.singleton.args = args;
        return me.singleton;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.ui.options.load(me, window, {
                groupName: "American",
                sessionName: "",
                border: true,
                editMode: false
            });
            me.ui.options.toggleSet(me, null, {
                "editMode": me.reload
            });
            me.ui.options.choiceSet(me, null, {
                "fontSize": (object, value) => {
                    var window = me.widget.window.get(object);
                    me.core.property.set(window.var.transcribe, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                },
                groupName: me.updateSessions
            });
            me.core.property.set(window, "app", me);
        }
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "ui.work.state", true);
        me.groups = await me.media.file.groups(true);
        await me.updateSessions(window);
        me.core.property.set(window, "ui.work.state", false);
    };
    me.groupMenuList = {
        get: function (object) {
            var info = {
                list: me.groups,
                property: "name",
                options: { "state": "select" },
                group: "group",
                itemMethod: "app.transcribe.groupName"
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.sessionMenuList = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var list = me.groups.find(group => groupName === group.name).sessions;
            list = list.filter(session => session.extension === "m4a");
            var info = {
                list,
                property: "label",
                options: { "state": "select" },
                group: "session",
                itemMethod: "app.transcribe.session",
                metadata: {
                    "Name": "label",
                    "Duration": "durationText"
                }
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.session = {
        get: function (object, name) {
            var window = me.widget.window.get(object);
            return window.options.sessionName === name;
        },
        set: async function (object, name) {
            var window = me.widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions.length) {
                if (!name) {
                    name = sessions[0].session;
                }
            }
            if (name) {
                me.core.property.set(window, "name", name);
                me.ui.options.save(me, window, { sessionName: name });
            }
            else {
                me.core.property.set(window, "name", "");
                me.contentList = [];
            }
            me.core.property.notify(window, "app.transcribe.updateTranscription");
        }
    };
    me.updateSessions = async function (object) {
        var window = me.widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions && sessions.length) {
                var name = sessions[0].session;
                me.core.property.set(window, "app.transcribe.session", name);
            }
        }
    };
    me.updateTranscription = async function (object) {
        var window = me.widget.window.get(object);
        var path = await me.media.file.path(window.options.groupName, window.options.sessionName);
        var transcription = await me.media.speech.transcription(path);
        window.transcribe_text = transcription;
        me.core.property.set(window.var.transcribe, {
            "ui.style.fontSize": window.options.fontSize,
            "ui.class.edit-mode": window.options.editMode
        });
        if (!window.transcribe) {
            window.transcribe = [];
        }
        if (!window.transcribe_options) {
            window.transcribe_options = {};
        }
        var html = me.html(window);
        me.core.property.set(window.var.transcribe, "ui.basic.html", html);
        me.core.property.notify(window, "update");
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "name", "");
        window.transcribe_text = "";
        me.reload(window);
    };
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "widget.window.name", title);
        window.transcribe_text = text;
        if (!options) {
            options = {};
        }
        window.transcribe_options = options;
        me.reload(window);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        return [window.transcribe_text, window.transcribe_options];
    };
    me.store = function (object, index, key) {
        var window = me.widget.window.get(object);
    };
    me.html = function (object) {
        let html = "";
        let window = me.widget.window.get(object);
        let editMode = window.options.editMode;
        var transcribe_text = window.transcribe_text;
        if (!transcribe_text) {
            return "";
        }
        var lines = transcribe_text.split("\n");
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = lines[lineIndex];
            if (!line) {
                continue;
            }
            let [, timestamp, text] = line.split(/(\d+:\d+:\d+)\s-\s?(.+)/);
            html += me.ui.html.item({
                classes: ["app-transcribe-item", (editMode ? "edit-mode" : "view-mode")],
                attributes: { timestamp }
            }, () => {
                let html = "";
                html += me.ui.html.item({
                    tag: "div",
                    classes: ["app-transcribe-timestamp", (editMode ? "edit-mode" : "view-mode")],
                    attributes: { onclick: "screens.app.transcribe.goto(this, '" + timestamp + "')" },
                    value: timestamp
                });
                if (editMode) {
                    html += me.ui.html.item({
                        tag: "input",
                        classes: ["app-transcribe-value", "input", (editMode ? "edit-mode" : "view-mode")],
                        attributes: { value: text, oninput: "screens.app.transcribe.store(this," + lineIndex + ",'value')" }
                    });
                }
                else {
                    html += me.ui.html.item({
                        tag: "div",
                        classes: ["app-transcribe-vaalue", (editMode ? "edit-mode" : "view-mode")],
                        attributes: { onclick: "screens.app.transcribe.goto(this, '" + timestamp + "')" },
                        value: text
                    });
                }
                return html;
            });
        }
        return html;
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        var args = window.args;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        if (args[0] !== groupName || args[1] !== sessionName) {
            if (args[0]) {
                await me.core.property.set(window, "app.transcribe.groupName", args[0]);
            }
            if (args[1]) {
                await me.core.property.set(window, "app.transcribe.session", args[1]);
            }
            await me.core.property.notify(window, "app.transcribe.updateTranscription");
        }
    };
    me.goto = async function (object, timestamp) {
        var window = me.widget.window.get(object);
        var [, hour, min, sec] = timestamp.split(/(\d+):(\d+):(\d+)/);
        var duration = (parseInt(hour) * 3600) + (parseInt(min) * 60) + parseInt(sec);
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        var player = await me.core.app.launch("player", groupName, sessionName, duration, true);
        if (player && player.var.player) {
            me.core.property.set(player.var.player, "core.link.update", "app.transcribe.playerUpdated");
            me.playerUpdated();
        }
    };
    me.inView = function (object, parent) {
        var region = me.ui.rect.relativeRegion(object, parent);
        var inView = true;
        if (parent.scrollTop > region.top) {
            inView = false;
        }
        if (parent.scrollTop + parent.offsetHeight < region.top + region.height) {
            inView = false;
        }
        return inView;
    };
    me.playerUpdated = function () {
        var window = me.singleton;
        var player = me.core.app.singleton("player");
        if (player && player.var.player) {
            var time = me.widget.player.controls.time(player.var.player);
            var duration = parseInt(time / 10) * 10;
            var scroll = false;
            if (window.duration !== duration) {
                window.duration = duration;
                scroll = true;
            }
            var name = me.core.string.formatDuration(duration);
            me.ui.node.iterate(window, (element) => {
                var match = element.getAttribute("timestamp") === name;
                me.core.property.set(element, "ui.class.now", match);
                if (match && scroll) {
                    var inView = me.inView(element, window.var.container);
                    if (!inView) {
                        me.ui.scroll.toWidget(element, window.var.container, 10);
                    }
                }
            });
        }
    };
    me.transcribe = async function (object) {
        var window = me.widget.window.get(object);
        var path = await me.media.file.path(window.options.groupName, window.options.sessionName);
        me.core.property.set(window, "ui.work.state", true);
        try {
            await me.media.speech.transcribe(path);
            me.updateTranscription(object);
        }
        finally {
            me.core.property.set(window, "ui.work.state", false);
        }
    };
    me.work = {
        set: function (object, value) {
            if (object.workTimeout) {
                clearTimeout(object.workTimeout);
                object.workTimeout = null;
            }
            if (value) {
                object.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    me.core.property.set(object.var.transcribe, "ui.style.visibility", "hidden");
                }, 250);
            } else {
                object.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    me.core.property.set(object.var.transcribe, "ui.style.visibility", "visible");
                }, 250);
            }
        }
    };
};
