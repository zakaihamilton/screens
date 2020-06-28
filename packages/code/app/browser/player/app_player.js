/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me, { core, media, ui, widget, storage, db, cache }) {
    me.init = async function () {
        await ui.content.implement(me);
        me.content.search = me.search;
    };
    me.launch = async function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            me.singleton.args = args;
            me.reload(me.singleton);
            if (!args[3]) {
                core.property.set(me.singleton, "widget.window.show", true);
            }
            return me.singleton;
        }
        var params = { args };
        if (args[3]) {
            params.showInBackground = true;
        }
        const { groups, metadataList } = await media.sessions.list();
        me.groups = groups;
        me.metadataList = metadataList;
        await me.content.update();
        me.singleton = ui.element.create(me.json, "workspace", "self", params);
        await new Promise(resolve => {
            me.singleton.resolve = resolve;
        });
        return me.singleton;
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            groupName: "American",
            sessionName: "",
            speed: "Normal",
            format: "Audio",
            autoPlay: false,
            jumpTime: 10,
            iconSize: "Normal",
            time: 0,
            resolution: "Auto"
        });
        ui.options.toggleSet(me, null, {
            autoPlay: null
        });
        ui.options.choiceSet(me, null, {
            speed: me.updatePlayback,
            format: me.updatePlayer,
            groupName: me.updateSessions,
            jumpTime: me.updatePlayback,
            iconSize: me.updateSize,
            time: null,
            resolution: me.updatePlayer
        });
        core.property.set(window, "app", me);
        me.updateSize(window);
        await me.reload(window);
        me.updatePlayback(window);
        window.resolve();
    };
    me.setArgs = function (object, args) {
        var window = widget.window.get(object);
        window.args = args;
    };
    me.updateSize = function (object) {
        var window = widget.window.get(object);
        var iconSize = window.options.iconSize;
        [window.var.audioPlayer, window.var.videoPlayer].map(player => {
            widget.player.controls.setIconSize(player, iconSize);
        });
    };
    me.reload = async function (object) {
        var window = widget.window.get(object);
        var args = window.args;
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        var updateSession = true;
        if (args && (args[0] !== groupName || args[1] !== sessionName)) {
            if (args[0]) {
                groupName = args[0];
                await core.property.set(window, "app.player.groupName", groupName);
            }
            if (args[1]) {
                sessionName = args[1];
                await core.property.set(window, "app.player.session", sessionName);
                updateSession = false;
            }
            await core.property.set(window, "app.player.updatePlayer");
        }
        if (!window.var.player) {
            await core.property.set(window, "app.player.session", sessionName);
            updateSession = false;
        }
        if (updateSession) {
            await me.updateSession(object, sessionName);
        }
        if (args && args[2] && window.var.player) {
            widget.player.controls.seek(window.var.player, args[2]);
            if (window.options.autoPlay && !core.property.get(window.var.player, "widget.player.controls.isPlaying")) {
                core.property.set(window.var.player, "widget.player.controls.play");
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
            return widget.menu.collect(object, info);
        }
    };
    me.sessionMenuList = {
        get: function (object, property) {
            var window = widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var list = me.groups.find(group => groupName === group.name).sessions;
            list = list.filter(session => session.extension === "m4a");
            let count = list.length.toString().length;
            list = list.map((session, index) => {
                session.number = core.string.padNumber(list.length - index, count);
                return session;
            });
            if (property && typeof property === "string") {
                list = list.filter(session => me.metadataList.find(metadata => metadata.title === session.session &&
                    metadata.group === groupName && metadata[property]));
            }
            list.map(session => session.year = session.session.split("-")[0]);
            var info = {
                list,
                property: "label",
                options: { "state": "select" },
                group: "session",
                itemMethod: "app.player.session",
                metadata: {
                    "Name": "label",
                    "Duration": "durationText",
                    "Number": "number"
                },
                split: {
                    name: "Year",
                    property: "year",
                    min: 100
                }
            };
            return widget.menu.collect(object, info);
        }
    };
    me.hasMetadata = function (object, property) {
        var window = widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        var list = me.groups.find(group => groupName === group.name).sessions;
        list = list.filter(session => session.extension === "m4a");
        list = list.filter(session => me.metadataList.find(metadata => metadata.title === session.session &&
            metadata.group === groupName && metadata[property]));
        return list.length;
    };
    me.refresh = async function (object, type) {
        var window = widget.window.get(object);
        core.property.set(window, "ui.work.state", true);
        core.property.set(window, "app.player.format", "Audio");
        let update = {};
        update[type] = true;
        const { groups, metadataList } = await media.sessions.list(update);
        me.groups = groups;
        me.metadataList = metadataList;
        await me.updateSessions(window);
        core.property.set(window, "ui.work.state", false);
    };
    me.updateResolutions = async function () {
        await media.file.convertListing();
    };
    me.updateSession = async function (object, name) {
        var window = widget.window.get(object);
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
        me.audioItem = audioFound && audioFound[0];
        me.hasVideo = videoFound !== null && videoFound.length;
        me.videoItem = videoFound && videoFound[0];
        me.metadata = me.metadataList.find(metadata => metadata.title === name && metadata.group === groupName);
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
        core.property.set(window, "name", name);
        ui.options.save(me, window, { sessionName: name });
        await me.content.associated.update(window, name);
        if (!name) {
            me.contentList = [];
        }
    };
    me.session = {
        get: function (object, name) {
            var window = widget.window.get(object);
            return window.options.sessionName === name;
        },
        set: async function (object, name) {
            await me.updateSession(object, name);
            core.property.notify(object, "app.player.updatePlayer");
        }
    };
    me.updateSessions = async function (object) {
        var window = widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        if (groupName && typeof groupName === "string") {
            var sessions = me.groups.find(group => groupName === group.name).sessions;
            sessions = sessions.filter(session => session.extension === "m4a");
            var name = "";
            if (sessions && sessions.length) {
                name = sessions[0].session;
            }
            core.property.set(window, "app.player.session", name);
        }
    };
    me.updatePlayer = async function (object) {
        var window = widget.window.get(object);
        var groupName = window.options.groupName;
        var sessionName = window.options.sessionName;
        var showAudioPlayer = groupName && sessionName && window.options.format === "Audio";
        var showVideoPlayer = groupName && sessionName && window.options.format === "Video";
        if (!me.hasVideo && me.hasAudio) {
            window.options.format = "Audio";
            showAudioPlayer = true;
            showVideoPlayer = false;
        }
        core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
        var source = null;
        var player = null;
        var extension = null;
        if (showAudioPlayer || showVideoPlayer) {
            player = window.var.audioPlayer;
            extension = "m4a";
            if (showVideoPlayer) {
                player = window.var.videoPlayer;
                extension = "mp4";
            }
            source = core.property.get(player, "source");
        }
        var time = window.options.time;
        let resolution = window.options.resolution;
        if (resolution === "Auto") {
            if (me.videoItem && me.videoItem.resolutions) {
                resolution = ["640x480", "800x600", "1024x768"].find(res => {
                    return me.videoItem.resolutions.includes(res);
                });
            }
            else {
                resolution = "";
            }
        }
        if (resolution === "Original") {
            resolution = "";
        }
        else if (!me.videoItem || !me.videoItem.resolutions || !me.videoItem.resolutions.includes(resolution)) {
            resolution = "";
        }
        if (extension !== "mp4") {
            resolution = "";
        }
        var target = await media.file.streamingPath(groupName, sessionName, extension, resolution);
        me.streamingList = await media.file.streamingList(groupName, sessionName);
        core.property.set(window.var.audioPlayer, "source", "");
        core.property.set(window.var.videoPlayer, "source", "");
        core.property.set(player, "source", target || "");
        core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "" : "none");
        core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "" : "none");
        window.var.player = player;
        if ((!source || source === target) && time) {
            widget.player.controls.seek(player, time);
        }
        if (window.options.autoPlay) {
            core.property.set(player, "widget.player.controls.play");
        }
        widget.toast.show(me.id, sessionName + (resolution ? " - " + resolution : ""));
    };
    me.work = {
        set: function (object, value) {
            if (me.workTimeout) {
                clearTimeout(me.workTimeout);
                me.workTimeout = null;
            }
            if (value) {
                me.workTimeout = setTimeout(function () {
                    core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                    core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.visibility", "hidden");
                    core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.opacity", "0");
                }, 250);
            } else {
                me.workTimeout = setTimeout(function () {
                    core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.visibility", "visible");
                    core.property.set([object.var.audioPlayer, object.var.videoPlayer], "ui.style.opacity", "1");
                }, 250);
            }
        }
    };
    me.upload = {
        get: function () {
            return true;
        },
        set: async function (object, event) {
            var window = me.singleton;
            if (!event.files.length) {
                return;
            }
            var progress = ui.modal.launch("progress", {
                "title": "Uploading",
                "delay": "250"
            });
            try {
                for (var file of event.files) {
                    var paths = await media.file.paths(window.options.groupName, file.name);
                    await storage.upload.file(file, paths.local, (index, count) => {
                        var data = { label: paths.local, max: count, value: index };
                        core.property.set(progress, "modal.progress.specific", data);
                    });
                    core.property.set(progress, "modal.progress.specific", null);
                    await storage.dropbox.uploadFile(paths.local, paths.remote, (offset, size) => {
                        var data = { label: paths.remote, max: size, value: offset };
                        core.property.set(progress, "modal.progress.specific", data);
                    });
                }
                await me.refresh(window, "new");
            }
            finally {
                core.property.set(progress, "close");
            }
        }
    };
    me.resolutions = function (object) {
        let session = me.videoItem;
        let list = ["Auto", "Original"];
        if (session && session.resolutions) {
            list.push(...session.resolutions);
        }
        var info = {
            list,
            options: { "state": "select" },
            group: "resolutions",
            itemMethod: "app.player.resolution"
        };
        return widget.menu.collect(object, info);
    };
    me.speeds = function (object) {
        var list = [];
        for (var name in media.voice.speeds) {
            var speed = media.voice.speeds[name];
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
        return widget.menu.collect(object, info);
    };
    me.jumpTimes = function () {
        var stepList = media.voice.jumpTimes;
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
        var speed = media.voice.speeds[window.options.speed];
        var jumpTime = window.options.jumpTime;
        [window.var.audioPlayer, window.var.videoPlayer].map(player => {
            widget.player.controls.setSpeed(player, speed);
            widget.player.controls.setJumpTime(player, jumpTime);
        });
    };
    me.resize = function () {
        var window = me.singleton;
        if (window && window.var.player) {
            core.property.set(window.var.player, "resize");
        }
    };
    me.playerUpdated = async function (object) {
        var window = me.singleton;
        if (!window) {
            return;
        }
        var duration = widget.player.duration(object);
        if (window.var.player) {
            var speedName = widget.player.controls.speedName(window.var.player);
            if (speedName !== window.options.speed) {
                core.property.set(window, "app.player.speed", speedName);
            }
            var time = widget.player.controls.time(window.var.player);
            core.property.set(window, "app.player.time", time);
        }
        var path = widget.player.path(object);
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
        var time = window.var.player ? widget.player.controls.time(window.var.player) : null;
        return core.util.url("player", [window.options.groupName, window.options.sessionName, time], true);
    };
    me.timestampLabel = function () {
        var window = me.singleton;
        var time = window.var.player ? widget.player.controls.time(window.var.player) : null;
        var label = window.options.sessionName + " - " + widget.player.controls.formatTime(time);
        return label;
    };
    me.copyLocalUrl = function () {
        var window = me.singleton;
        var time = window.var.player ? widget.player.controls.time(window.var.player) : null;
        core.util.copyUrl("player", [window.options.groupName, window.options.sessionName, time], true);
    };
    me.copyRemoteUrl = function () {
        var window = me.singleton;
        var time = window.var.player ? widget.player.controls.time(window.var.player) : null;
        core.util.copyUrl("player", [window.options.groupName, window.options.sessionName, time]);
    };
    me.copyName = function () {
        var window = me.singleton;
        ui.clipboard.copy(window.options.sessionName);
    };
    var metadataProperties = ["isFavourite", "watchLater"];
    for (let property of metadataProperties) {
        me[property] = {
            get: function () {
                return me.metadata ? me.metadata[property] : null;
            },
            set: async function () {
                var metadata = me.metadata;
                if (!metadata) {
                    metadata = {};
                }
                metadata[property] = !metadata[property];
                await cache.playlists.set("$userId/" + metadata.group + "/" + metadata.title, metadata);
                me.metadataList = await media.sessions.updateMetadata();
            }
        };
    }
    me.search = async function (text) {
        var results = [];
        if (!me.groups) {
            me.groups = await media.sessions.groups();
        }
        me.groups.map(group => {
            var list = group.sessions.filter(session => session.extension === "m4a");
            list = list.filter(session => session.session.toLowerCase().includes(text));
            list = list.map(session => {
                session.title = session.session;
                session.args = ["core.app.launch", "player", group.name, session.session];
                return session;
            });
            if (list.length) {
                list = list.sort((a, b) => a.title.localeCompare(b.title));
                list.reverse();
                results.push({ title: core.string.title(group.name), members: list });
            }
        });
        return results;
    };
    me.latestSession = {
        get: async function (object) {
            var window = widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var list = me.groups.find(group => groupName === group.name).sessions;
            list = list.filter(session => session.extension === "m4a");
            if (!list.length) {
                return;
            }
            return "<b>Latest:</b>\t" + list[0].session;
        },
        set: async function (object) {
            var window = widget.window.get(object);
            var groupName = window.options.groupName.toLowerCase();
            var list = me.groups.find(group => groupName === group.name).sessions;
            list = list.filter(session => session.extension === "m4a");
            if (!list.length) {
                return;
            }
            await me.updateSession(object, list[0].session);
            core.property.notify(object, "app.player.updatePlayer");
        }
    };
    me.nextSession = async function (object) {
        var window = widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        var list = me.groups.find(group => groupName === group.name).sessions;
        list = list.filter(session => session.extension === "m4a");
        var index = list.findIndex(session => session.session === window.options.sessionName);
        if (index >= list.length) {
            return;
        }
        await me.updateSession(object, list[index + 1].session);
        core.property.notify(object, "app.player.updatePlayer");
    };
    me.previousSession = async function (object) {
        var window = widget.window.get(object);
        var groupName = window.options.groupName.toLowerCase();
        var list = me.groups.find(group => groupName === group.name).sessions;
        list = list.filter(session => session.extension === "m4a");
        var index = list.findIndex(session => session.session === window.options.sessionName);
        if (index <= 0) {
            return;
        }
        await me.updateSession(object, list[index - 1].session);
        core.property.notify(object, "app.player.updatePlayer");
    };
    me.currentGroupName = function (object) {
        var window = widget.window.get(object);
        return core.string.title(window.options.groupName);
    };
    me.currentSessionDate = function (object) {
        var window = widget.window.get(object);
        let sessionName = window.options.sessionName;
        let [date] = sessionName.split(/(\d{4}-\d{2}-\d{2})\s(.+)/g).slice(1);
        return date;
    };
    me.streamMenuList = {
        get: function (object) {
            var info = {
                list: me.streamingList,
                options: { "state": "select" },
                group: "group"
            };
            return widget.menu.collect(object, info);
        }
    };
};
