/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me) {
    me.ready = async function () {
        me.playerCounter = 0;
        await me.ui.content.attach(me);
        me.content.search = me.search;
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
        var params = { args };
        if (args[3]) {
            params.showInBackground = true;
        }
        if (!me.groups) {
            me.groups = await me.media.file.groups();
        }
        me.metadataList = await me.db.shared.metadata.list({ user: "$userId" });
        me.singleton = me.ui.element.create(me.json, "workspace", "self", params);
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
            autoPlay: false,
            jumpTime: 10,
            iconSize: "Normal",
            time: 0
        });
        me.ui.options.toggleSet(me, null, {
            autoPlay: null
        });
        me.ui.options.choiceSet(me, null, {
            speed: me.updatePlayback,
            format: me.updatePlayer,
            groupName: me.updateSessions,
            jumpTime: me.updatePlayback,
            iconSize: me.updatePlayback,
            time: null
        });
        me.core.property.set(window, "app", me);
        await me.reload(window);
        me.updatePlayback(window);
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
        var updateSession = true;
        if (args && (args[0] !== groupName || args[1] !== sessionName)) {
            if (args[0]) {
                groupName = args[0];
                await me.core.property.set(window, "app.player.groupName", groupName);
            }
            if (args[1]) {
                sessionName = args[1];
                await me.core.property.set(window, "app.player.session", sessionName);
                updateSession = false;
            }
            await me.core.property.set(window, "app.player.updatePlayer");
        }
        if (!window.var.player) {
            await me.core.property.set(window, "app.player.session", sessionName);
            updateSession = false;
        }
        if (updateSession) {
            await me.updateSession(object, sessionName);
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
    me.metadataMenuList = {
        get: function (object, property) {
            var window = me.widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var list = me.groups.find(group => groupName === group.name).sessions;
            list = list.filter(session => session.extension === "m4a");
            list = list.filter(session => me.metadataList.find(metadata => metadata.title === session.session &&
                metadata.group === groupName && metadata[property]));
            var info = {
                list,
                property: "label",
                options: {
                    "state": "select"
                },
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
    me.hasMetadata = function (object, property) {
        var window = me.widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        var list = me.groups.find(group => groupName === group.name).sessions;
        list = list.filter(session => session.extension === "m4a");
        list = list.filter(session => me.metadataList.find(metadata => metadata.title === session.session &&
            metadata.group === groupName && metadata[property]));
        return list.length;
    };
    me.refresh = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "ui.work.state", true);
        me.core.property.set(window, "app.player.format", "Audio");
        me.groups = await me.media.file.groups(true);
        me.metadataList = await me.db.shared.metadata.list({ user: "$userId" });
        await me.updateSessions(window);
        me.core.property.set(window, "ui.work.state", false);
    };
    me.updateSession = async function (object, name) {
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
        else {
            name = "";
        }
        me.hasAudio = audioFound !== null && audioFound.length;
        me.hasVideo = videoFound !== null && videoFound.length;
        me.metadata = await me.db.shared.metadata.find({ group: groupName, title: name, user: "$userId" });
        if (!me.metadata) {
            me.metadata = {};
        }
        me.metadata.group = groupName;
        me.metadata.title = name;
        if (audioFound && !videoFound) {
            window.options.format = "Audio";
        } else if (!audioFound && videoFound) {
            window.options.format = "Video";
        }
        me.core.property.set(window, "name", name);
        me.ui.options.save(me, window, { sessionName: name });
        await me.content.associated.update(window, name);
        if (!name) {
            me.contentList = [];
        }
    };
    me.session = {
        get: function (object, name) {
            var window = me.widget.window.get(object);
            return window.options.sessionName === name;
        },
        set: async function (object, name) {
            await me.updateSession(object, name);
            me.core.property.notify(object, "app.player.updatePlayer");
        }
    };
    me.updateSessions = async function (object) {
        var window = me.widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            var name = "";
            if (sessions && sessions.length) {
                name = sessions[0].session;
            }
            me.core.property.set(window, "app.player.session", name);
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
        var audioPath = sessionName + "." + "m4a";
        var videoPath = sessionName + "." + "mp4";
        var source = null;
        var player = null;
        if (showAudioPlayer || showVideoPlayer) {
            player = window.var.audioPlayer;
            var path = audioPath;
            if (showVideoPlayer) {
                player = window.var.videoPlayer;
                path = videoPath;
            }
            source = me.core.property.get(player, "source");
        }
        var time = window.options.time;
        me.core.property.set(window.var.audioPlayer, "source", "");
        me.core.property.set(window.var.videoPlayer, "source", "");
        if (player) {
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
        if ((!source || source === target) && time) {
            me.widget.player.controls.seek(player, time);
        }
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
                    var paths = await me.media.file.paths(window.options.groupName, file.name);
                    await me.storage.upload.file(file, paths.local, (index, count) => {
                        var data = { label: paths.local, max: count, value: index };
                        me.core.property.set(progress, "modal.progress.specific", data);
                    });
                    me.core.property.set(progress, "modal.progress.specific", null);
                    await me.storage.file.uploadFile(paths.local, paths.remote, (offset, size) => {
                        var data = { label: paths.remote, max: size, value: offset };
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
    me.speeds = function (object) {
        var list = [];
        for (var name in me.media.voice.speeds) {
            var speed = me.media.voice.speeds[name];
            list.push({ name, speed: "x" + speed });
        }
        var info = {
            list,
            property: "name",
            options: { "state": "select" },
            group: "speeds",
            itemMethod: "app.player.speed",
            metadata: {
                "Name": "name",
                "Speed": "speed"
            }
        };
        return me.widget.menu.collect(object, info);
    };
    me.jumpTimes = function () {
        var stepList = me.media.voice.jumpTimes;
        stepList = stepList.map(step => {
            var item = [
                step + " Seconds",
                "app.player.jumpTime",
                {
                    "state": "select",
                    "value": step
                },
                {
                    "group": "jump"
                }
            ];
            return item;
        });
        return stepList;
    };
    me.updatePlayback = function () {
        var window = me.singleton;
        var speed = me.media.voice.speeds[window.options.speed];
        var jumpTime = window.options.jumpTime;
        var iconSize = window.options.iconSize;
        [window.var.audioPlayer, window.var.videoPlayer].map(player => {
            me.widget.player.controls.setSpeed(player, speed);
            me.widget.player.controls.setJumpTime(player, jumpTime);
            me.widget.player.controls.setIconSize(player, iconSize);
        });
    };
    me.playerUpdated = async function (object) {
        var window = me.singleton;
        if (!window) {
            return;
        }
        var duration = me.widget.player.duration(object);
        if (window.var.player) {
            var speedName = me.widget.player.controls.speedName(window.var.player);
            if (speedName !== window.options.speed) {
                me.core.property.set(window, "app.player.speed", speedName);
            }
            var time = me.widget.player.controls.time(window.var.player);
            me.core.property.set(window, "app.player.time", time);
        }
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
    var metadataProperties = ["isFavourite", "watchLater"];
    for (let property of metadataProperties) {
        me[property] = {
            get: function () {
                return me.metadata[property];
            },
            set: async function () {
                var metadata = me.metadata;
                metadata[property] = !metadata[property];
                await me.db.shared.metadata.use({ group: metadata.group, title: metadata.title, user: "$userId" }, metadata);
                me.metadataList = await me.db.shared.metadata.list({ user: "$userId" });
            }
        };
    }
    me.search = async function (text) {
        var results = [];
        if (!me.groups) {
            me.groups = await me.media.file.groups();
        }
        me.groups.map(group => {
            var list = group.sessions.filter(session => session.extension === "m4a");
            list = list.filter(session => session.session.toLowerCase().includes(text));
            list = list.map(session => {
                session.title = session.session;
                session.args = [me.id.split(".").pop(), group.name, session.session];
                return session;
            });
            if (list.length) {
                results.push(...list);
            }
        });
        return results;
    };
};
