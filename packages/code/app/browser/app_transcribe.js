/*
 @author Zakai Hamilton
 @component AppTranscribe
 */

screens.app.transcribe = function AppTranscribe(me, packages) {
    const { core } = packages;
    me.launch = async function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            me.singleton.args = args;
            me.reload(me.singleton);
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.groups = await me.media.file.groups();
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
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
                "editMode": me.updateTable,
                "border": me.updateTable
            });
            me.ui.options.choiceSet(me, null, {
                "fontSize": (object, value) => {
                    var window = me.widget.window.get(object);
                    core.property.set(window.var.transcribe, "ui.style.fontSize", value);
                    me.updateTable(window);
                    core.property.notify(window, "update");
                },
                groupName: me.updateSessions
            });
            core.property.set(window, "app", me);
        }
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window, "ui.work.state", true);
        me.groups = await me.media.file.groups(true);
        await me.updateSessions(window);
        core.property.set(window, "ui.work.state", false);
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
                core.property.set(window, "name", name);
                me.ui.options.save(me, window, { sessionName: name });
            }
            else {
                core.property.set(window, "name", "");
                me.contentList = [];
            }
            core.property.notify(window, "app.transcribe.loadTranscription");
        }
    };
    me.updateSessions = async function (object) {
        var window = me.widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions && sessions.length) {
                var name = sessions[0].session;
                core.property.set(window, "app.transcribe.session", name);
            }
        }
    };
    me.loadTranscription = async function (object) {
        var window = me.widget.window.get(object);
        var { local } = await me.media.file.paths(window.options.groupName, window.options.sessionName);
        var transcription = await me.media.speech.load(local);
        window.transcribe_text = transcription;
        me.updateTable(window);
    };
    me.saveTranscription = async function (object) {
        var window = me.widget.window.get(object);
        var { local } = await me.media.file.paths(window.options.groupName, window.options.sessionName);
        await me.media.speech.save(local, window.transcribe_text);
    };
    me.updateTable = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window.var.transcribe, {
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
        core.property.set(window.var.transcribe, "ui.basic.html", html);
        core.property.notify(window, "update");
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window, "name", "");
        window.transcribe_text = "";
        me.reload(window);
    };
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        core.property.set(window, "widget.window.name", title);
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
    me.store = function (object, lineIndex) {
        var window = me.widget.window.get(object);
        var transcribe_text = window.transcribe_text;
        var lines = transcribe_text.split("\n");
        var line = lines[lineIndex];
        let [, timestamp] = line.split(/(\d+:\d+:\d+)\s-\s?(.+)/);
        lines[lineIndex] = timestamp + " - " + object.value.trim();
        window.transcribe_text = lines.join("\n");
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
            text = text.trim();
            var baseClasses = [(editMode ? "edit-mode" : "view-mode")];
            if (window.options.border) {
                baseClasses.push("border");
            }
            html += me.ui.html.item({
                classes: ["app-transcribe-item", ...baseClasses],
                attributes: { timestamp, lineIndex }
            }, () => {
                let html = "";
                html += me.ui.html.item({
                    tag: "div",
                    classes: ["app-transcribe-timestamp", ...baseClasses],
                    attributes: { timestamp, onclick: "screens.app.transcribe.goto(this, '" + timestamp + "')" },
                    value: timestamp
                });
                if (editMode) {
                    var method = "screens.app.transcribe.store(this," + lineIndex + ")";
                    html += me.ui.html.item({
                        tag: "input",
                        classes: ["app-transcribe-value", "input", ...baseClasses],
                        attributes: { type: "search", value: text, onsearch: method, oninput: method }
                    });
                    html += me.ui.html.item({
                        tag: "div",
                        classes: ["app-transcribe-speech", ...baseClasses],
                        attributes: { onclick: "screens.app.transcribe.toggleSpeech(this)" }
                    });
                }
                else {
                    html += me.ui.html.item({
                        tag: "div",
                        classes: ["app-transcribe-value", ...baseClasses],
                        attributes: { onclick: "screens.app.transcribe.goto(this, '" + timestamp + "')" },
                        value: text
                    });
                }
                return html;
            });
        }
        return html;
    };
    me.toggleSpeech = function (object) {
        var window = me.widget.window.get(object);
        var input = me.ui.node.findByTag(object.parentNode, "input");
        core.property.object.create(me.widget.input, input);
        var result = me.ui.speech.toggle(input);
        core.property.set(object, "ui.class.speechActive", result);
        me.ui.node.iterate(window, (element) => {
            if (element !== object && element !== input) {
                me.ui.speech.stop(element);
                core.property.set(element, "ui.class.speechActive", false);
            }
        });
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        var args = window.args;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        if (args[0] !== groupName || args[1] !== sessionName) {
            if (args[0]) {
                await core.property.set(window, "app.transcribe.groupName", args[0]);
            }
            if (args[1]) {
                await core.property.set(window, "app.transcribe.session", args[1]);
            }
            await core.property.notify(window, "app.transcribe.loadTranscription");
        }
    };
    me.goto = async function (object, timestamp) {
        var window = me.widget.window.get(object);
        var [, hour, min, sec] = timestamp.split(/(\d+):(\d+):(\d+)/);
        var duration = (parseInt(hour) * 3600) + (parseInt(min) * 60) + parseInt(sec);
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        var player = await core.app.launch("player", groupName, sessionName, duration, true);
        if (player && player.var.player) {
            core.property.set(player.var.player, "core.link.update", "app.transcribe.playerUpdated");
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
    me.hasPlayer = function () {
        var player = core.app.singleton("player");
        if (player && player.var.player) {
            return true;
        }
    };
    me.action = function (object, name) {
        var player = core.app.singleton("player");
        if (player && player.var.player) {
            var list = {
                play: null,
                stop: null,
                shortForward: {
                    method: "forward", args: [2]
                },
                shortRewind: {
                    method: "rewind", args: [2]
                }
            };
            var args = [player.var.player];
            var item = list[name];
            var method = name;
            if (item) {
                if (item.args) {
                    args.push(...item.args);
                }
                if (item.method) {
                    method = item.method;
                }
                me.widget.player.controls[method].apply(null, args);
            }
        }
    };
    me.playerUpdated = function () {
        var window = me.singleton;
        var player = core.app.singleton("player");
        if (player && player.var.player) {
            var time = me.widget.player.controls.time(player.var.player);
            var duration = parseInt(time / 10) * 10;
            var scroll = false;
            if (window.duration !== duration) {
                window.duration = duration;
                scroll = true;
            }
            var name = core.string.formatDuration(duration);
            me.ui.node.iterate(window, (element) => {
                var match = element.getAttribute("timestamp") === name;
                core.property.set(element, "ui.class.now", match);
                if (match && scroll) {
                    var inView = me.inView(element, window.var.container);
                    if (!inView) {
                        me.ui.scroll.toWidget(element, window.var.container, 10);
                    }
                }
            });
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
                    core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    core.property.set(object.var.transcribe, "ui.style.visibility", "hidden");
                }, 250);
            } else {
                object.workTimeout = setTimeout(function () {
                    core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    core.property.set(object.var.transcribe, "ui.style.visibility", "visible");
                }, 250);
            }
        }
    };
};
