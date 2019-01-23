/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me) {
    me.init = async function () {
        me.groups = await me.media.file.groups();
        me.playerCounter = 0;
        await me.ui.content.attach(me);
    };
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.singleton.args = args;
            me.reload(me.singleton);
            if (!args[3]) {
                me.core.property.set(me.singleton, "widget.window.show", true);
            }
            return me.singleton;
        }
        var params = {};
        if (args[3]) {
            params.showInBackground = true;
            params.args = args;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self", params);
        await new Promise(resolve => {
            me.singleton.resolve = resolve;
        });
        return me.singleton;
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            groupName: "American",
            sessionName: "",
            speed: "Normal",
            format: "Audio",
            autoPlay: false
        });
        me.ui.options.toggleSet(me, null, {
            autoPlay: null
        });
        me.ui.options.choiceSet(me, null, {
            speed: me.updatePlayback,
            format: me.updatePlayer,
            groupName: me.updateSessions
        });
        me.core.property.set(window, "app", me);
        await me.reload(window);
        window.resolve();
    };
    me.setArgs = function (object, args) {
        var window = me.widget.window.get(object);
        window.args = args;
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        var args = window.args;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        if (args && (args[0] !== groupName || args[1] !== sessionName)) {
            if (args[0]) {
                await me.core.property.set(window, "app.player.groupName", args[0]);
            }
            if (args[1]) {
                await me.core.property.set(window, "app.player.session", args[1]);
            }
            await me.core.property.set(window, "app.player.updatePlayer");
        }
        if (!window.var.player) {
            await me.core.property.set(window, "app.player.session", sessionName);
            await me.core.property.set(window, "app.player.updatePlayer");
        }
        if (args && args[2] && window.var.player) {
            me.widget.player.controls.seek(window.var.player, args[2]);
            if (window.options.autoPlay && !me.core.property.get(window.var.player, "widget.player.controls.isPlaying")) {
                me.core.property.set(window.var.player, "widget.player.controls.play");
            }
        }
    };
    me.groupMenuList = {
        get: function (object) {
            var info = {
                list: me.groups,
                property: "name",
                options: { "state": "select" },
                group: "group",
                itemMethod: "app.player.groupName"
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
                itemMethod: "app.player.session",
                metadata: {
                    "Name": "label",
                    "Duration": "durationText"
                }
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "ui.work.state", true);
        me.core.property.set(window, "app.player.format", "Audio");
        me.groups = await me.media.file.groups(true);
        await me.updateSessions(window);
        me.core.property.set(window, "ui.work.state", false);
    };
    me.session = {
        get: function (object, name) {
            var window = me.widget.window.get(object);
            return window.options.sessionName === name;
        },
        set: async function (object, name) {
            var window = me.widget.window.get(object);
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
            me.hasAudio = audioFound !== null && audioFound.length;
            me.hasVideo = videoFound !== null && videoFound.length;
            if (audioFound && !videoFound) {
                window.options.format = "Audio";
            } else if (!audioFound && videoFound) {
                window.options.format = "Video";
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
    me.updateSessions = async function (object) {
        var window = me.widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            if (sessions && sessions.length) {
                var name = sessions[0].session;
                me.core.property.set(window, "app.player.session", name);
            }
        }
    };
    me.updatePlayer = async function (object) {
        var window = me.widget.window.get(object);
        var counter = ++me.playerCounter;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        var showAudioPlayer = groupName && sessionName && window.options.format === "Audio";
        var showVideoPlayer = groupName && sessionName && window.options.format === "Video";
        if (!me.hasVideo && me.hasAudio) {
            window.options.format = "Audio";
            showAudioPlayer = true;
            showVideoPlayer = false;
        }
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
            try {
                if (window.isDownloading) {
                    me.core.property.set(window, "ui.work.state", false);
                }
                window.isDownloading = true;
                me.core.property.set(window, "ui.work.state", true);
                var target = await me.media.file.download(groupName, path);
            }
            catch (err) {
                alert("Failed to download file. Error: " + JSON.stringify(err));
            }
            finally {
                me.core.property.set(window, "ui.work.state", false);
                window.isDownloading = false;
            }
        }
        if (counter !== me.playerCounter) {
            me.log("counter: " + counter + " does not match: " + me.playerCounter);
            return;
        }
        me.core.property.set(player, "source", target);
        me.core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "" : "none");
        me.core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "" : "none");
        window.var.player = player;
        if (window.options.autoPlay) {
            me.core.property.set(player, "widget.player.controls.play");
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
        var speedList = Object.keys(me.media.voice.speeds);
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
        var speed = me.media.voice.speeds[window.options.speed];
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
