/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.useFormat = "Audio";
    me.init = async function () {
        me.groups = await me.media.file.groups();
        me.playerCounter = 0;
        me.ui.content.attach(me);
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
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            groupName: "American",
            sessionName: "",
            speed: "Normal",
            autoPlay: false
        });
        me.ui.options.toggleSet(me, null, {
            autoPlay: null
        });
        me.ui.options.choiceSet(me, null, {
            speed: me.updatePlayback,
        });
        me.core.property.set(window, "app", me);
        await me.reload(window);
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        var args = window.args;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        if (args[0] !== groupName || args[1] !== sessionName) {
            await me.core.property.set(window, "app.player.group", args[0]);
            await me.core.property.set(window, "app.player.session", args[1]);
            await me.core.property.notify(window, "app.player.updatePlayer", null, true);
        }
        if (args[2] && window.var.player) {
            me.widget.player.controls.seek(window.var.player, args[2]);
        }
    };
    me.groupMenuList = {
        get: function (object) {
            var info = {
                list: me.groups,
                property: "name",
                attributes: { "state": "select" },
                group: "group",
                itemMethod: "app.player.group"
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
                attributes: { "state": "select" },
                group: "session",
                itemMethod: "app.player.session",
                metadata: {
                    "Name": "label",
                    "Duration": "durationText"
                }
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.refresh = async function () {
        var window = me.singleton;
        me.core.property.set(window, "ui.work.state", true);
        me.groups = await me.media.file.groups(true);
        await me.updateSessions();
        me.core.property.set(window, "ui.work.state", false);
    };
    me.group = {
        get: function (object, value) {
            var window = me.singleton;
            return window.options.groupName === value;
        },
        set: async function (object, name) {
            var window = me.singleton;
            if (name) {
                me.ui.options.save(me, window, { groupName: name });
            }
            me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
            await me.updateSessions();
        }
    };
    me.session = {
        get: function (object, name) {
            var window = me.singleton;
            return window.options.sessionName === name;
        },
        set: async function (object, name) {
            var window = me.singleton;
            if (name && window.options.sessionName === name) {
                return;
            }
            var audioFound = false, videoFound = false;
            var groupName = window.options.groupName.toLowerCase();
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions.length) {
                if (!name) {
                    name = sessions[0].session;
                }
                if (name) {
                    audioFound = sessions.filter(session => session.session === name && session.extension === "m4a");
                    videoFound = sessions.filter(session => session.session === name && session.extension === "mp4");
                }
            }
            me.hasAudio = audioFound !== null;
            me.hasVideo = videoFound !== null;
            if (audioFound && !videoFound) {
                me.useFormat = "Audio";
            } else if (!audioFound && videoFound) {
                me.useFormat = "Video";
            }
            if (name) {
                me.core.property.set(window, "name", name);
                me.ui.options.save(me, window, { sessionName: name });
                await me.content.associated.update(window, name);
            }
            else {
                me.core.property.set(window, "name", "");
                me.contentList = [];
            }
            me.core.property.notify(window, "app.player.updatePlayer");
        }
    };
    me.setFormat = {
        get: function (object, value) {
            return me.useFormat === value;
        },
        set: function (object, value) {
            me.useFormat = value;
            me.core.property.notify(window, "app.player.updatePlayer");
        }
    };
    me.updateSessions = async function (sessionName) {
        var window = me.singleton;
        var groupName = window.options.groupName.toLowerCase();
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions && sessions.length) {
                var name = sessions[0].session;
                if (sessionName) {
                    name = sessionName;
                }
                me.core.property.set(window, "app.player.session", name);
            }
        }
    };
    me.updatePlayer = {
        set: async function () {
            var counter = ++me.playerCounter;
            var window = me.singleton;
            var groupName = window.options.groupName;
            var sessionName = window.options.sessionName;
            var showAudioPlayer = groupName && sessionName && me.useFormat === "Audio";
            var showVideoPlayer = groupName && sessionName && me.useFormat === "Video";
            me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
            me.core.property.set(window.var.audioPlayer, "source", "");
            me.core.property.set(window.var.videoPlayer, "source", "");
            var audioPath = sessionName + "." + "m4a";
            var videoPath = sessionName + "." + "mp4";
            if (showAudioPlayer || showVideoPlayer) {
                var player = window.var.audioPlayer;
                var path = audioPath;
                if (showVideoPlayer) {
                    player = window.var.videoPlayer;
                    path = videoPath;
                }
                me.core.property.set(window, "ui.work.state", true);
                try {
                    var target = await me.manager.download.get(me.rootPath + "/" + groupName + "/" + path,
                        me.cachePath + "/" + path);
                }
                catch (err) {
                    alert("Failed to download file. Error: " + JSON.stringify(err));
                }
                me.core.property.set(window, "ui.work.state", false);
            }
            if (counter !== me.playerCounter) {
                me.log("counter: " + counter + " does not match: " + me.playerCounter);
                return;
            }
            me.core.property.set(player, "source", target);
            if (window.options.autoPlay) {
                me.core.property.set(player, "widget.player.controls.play");
            }
            me.core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "" : "none");
            me.core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "" : "none");
            window.var.player = player;
        }
    };
    me.work = {
        set: function (object, value) {
            if (me.workTimeout) {
                clearTimeout(me.workTimeout);
                me.workTimeout = null;
            }
            if (value) {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    me.core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.visibility", "hidden");
                }, 250);
            } else {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    me.core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.visibility", "visible");
                }, 250);
            }
        }
    };
    me.upload = {
        get: function () {
            return true;
        },
        set: async function (object) {
            var window = me.singleton;
            if (!object.files.length) {
                return;
            }
            var progress = me.ui.modal.launch("progress", {
                "title": "Uploading",
                "delay": "250"
            });
            try {
                for (var file of object.files) {
                    await me.storage.upload.file(file, file.local, (index, count) => {
                        var data = { label: file.local, max: count, value: index };
                        me.core.property.set(progress, "modal.progress.specific", data);
                    });
                    me.core.property.set(progress, "modal.progress.specific", null);
                    await me.storage.file.uploadFile(file.local, file.remote, (offset, size) => {
                        var data = { label: file.remote, max: size, value: offset };
                        me.core.property.set(progress, "modal.progress.specific", data);
                    });
                }
                await me.refresh(window);
            }
            finally {
                me.core.property.set(progress, "close");
            }
        }
    };
    me.speeds = function () {
        var speedList = Object.keys(me.widget.player.controls.speeds);
        speedList = speedList.map(name => {
            var item = [
                name,
                "app.player.speed",
                {
                    "state": "select"
                },
                {
                    "group": "speed"
                }
            ];
            return item;
        });
        return speedList;
    };
    me.updatePlayback = function () {
        var window = me.singleton;
        var speed = me.widget.player.controls.speeds[window.options.speed];
        me.widget.player.controls.setSpeed(window.var.audioPlayer, speed);
        me.widget.player.controls.setSpeed(window.var.videoPlayer, speed);
    };
    me.playerUpdated = async function (object) {
        var window = me.singleton;
        var duration = me.widget.player.duration(object);
        var path = me.widget.player.path(object);
        if (duration) {
            var groupName = window.options.groupName.toLowerCase();
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            var session = sessions.find(session => path === session.local);
            if (session) {
                session.duration = duration;
            }
        }
    };
    me.url = function () {
        var window = me.singleton;
        var time = window.var.player ? me.widget.player.controls.time(window.var.player) : null;
        return me.core.util.url("player", [window.options.groupName, window.options.sessionName, time], true);
    };
    me.copyLocalUrl = function () {
        var window = me.singleton;
        var time = window.var.player ? me.widget.player.controls.time(window.var.player) : null;
        me.core.util.copyUrl("player", [window.options.groupName, window.options.sessionName, time], true);
    };
    me.copyRemoteUrl = function () {
        var window = me.singleton;
        var time = window.var.player ? me.widget.player.controls.time(window.var.player) : null;
        me.core.util.copyUrl("player", [window.options.groupName, window.options.sessionName, time]);
    };
    me.copyName = function () {
        var window = me.singleton;
        me.ui.clipboard.copy(window.options.sessionName);
    };
};
