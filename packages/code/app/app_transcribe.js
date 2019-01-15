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
        var html = me.transcribe(window);
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
    me.transcribe = function (object) {
        let html = "";
        let window = me.widget.window.get(object);
        let editMode = window.options.editMode;
        var transcribe_text = window.transcribe_text;
        if (!transcribe_text) {
            return "";
        }
        var lines = transcribe_text.split("\n");
        if (editMode) {
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                let line = lines[lineIndex];
                if (!line) {
                    continue;
                }
                let [, timestamp, text] = line.split(/(\d+:\d+:\d+) - (.+)/);
                html += me.ui.html.item({
                    classes: ["app-transcribe-item"]
                }, () => {
                    let html = "";
                    html += me.ui.html.item({
                        tag: "div",
                        classes: ["app-transcribe-timestamp"],
                        attributes: { onclick: "screens.app.transcribe.goto(this, '" + timestamp + "')" },
                        value: timestamp
                    });
                    html += me.ui.html.item({
                        tag: "input",
                        classes: ["app-transcribe-value", "input"],
                        attributes: { value: text, oninput: "screens.app.transcribe.store(this," + lineIndex + ",'value')" }
                    });
                    return html;
                });
            }
        }
        else {
            html += me.ui.html.item({ classes: ["app-transcribe-container"] }, () => {
                var html = "";
                for (let line of lines) {
                    let classes = ["app-transcribe-text"];
                    if (window.options.border) {
                        classes.push("border");
                    }
                    html += me.ui.html.item({ tag: "div", classes, value: line });
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
    me.goto = function (object, timestamp) {
        var window = me.widget.window.get(object);
        var [, hour, min, sec] = timestamp.split(/(\d+):(\d+):(\d+)/);
        var duration = (parseInt(hour) * 3600) + (parseInt(min) * 60) + parseInt(sec);
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        me.core.app.launch("player", groupName, sessionName, duration);
    };
};
