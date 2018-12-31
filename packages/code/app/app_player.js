/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.useFormat = "Audio";
    me.init = async function () {
        me.groupListData = me.media.file.groups();
        me.playerCounter = 0;
        me.ui.content.attach(me);
    };
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.sessionListData = [];
        if (!me.core.file.exists(me.cachePath)) {
            me.core.file.makeDir(me.cachePath);
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
            speed: "Normal"
        });
        me.ui.options.choiceSet(me, null, {
            speed: me.updatePlayback,
        });
        var args = me.singleton.args;
        await me.core.property.set(window, "app.player.onChangeGroup", args[0]);
        await me.core.property.set(window, "app.player.onChangeSession", args[1]);
        await me.core.property.notify(window, "app.player.updatePlayer", null, true);
        if (args[2] && window.var.player) {
            me.widget.player.controls.seek(window.var.player, args[2]);
        }
    };
    me.sortSessions = function (object, items) {
        if (!items || items.then) {
            return [];
        }
        items = items.map(item => {
            var name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            item.label = me.core.path.fileName(name);
            if (item.duration) {
                item.durationText = me.core.string.formatDuration(item.duration);
            }
            return item;
        });
        items = items.filter(item => {
            return item.name.includes(".m4a");
        }).reverse();
        return items;
    };
    me.groupMenuList = {
        get: function (object) {
            var info = {
                list: me.groupListData,
                property: "name",
                attributes: { "state": "select" },
                group: "group",
                itemMethod: "app.player.onChangeGroup"
            };
            return me.widget.menu.collect(object, info);
        }
    };
    me.sessionMenuList = {
        get: function (object) {
            var info = {
                list: me.sessionListData,
                property: "label",
                attributes: { "state": "select" },
                group: "session",
                listMethod: me.sortSessions,
                itemMethod: "app.player.onChangeSession",
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
        await me.media.file.update();
        me.groupListData = await me.media.file.groups();
        await me.updateSessions();
        me.core.property.set(window, "ui.work.state", false);
    };
    me.onChangeGroup = {
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
    me.onChangeSession = {
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
            var sessions = me.sortSessions(object, await me.sessionListData);
            if (sessions.length) {
                if (!name) {
                    name = me.core.path.fileName(sessions[0].name);
                }
                if (name) {
                    me.sessionListData.map(function (item) {
                        if (item.name.indexOf(name) !== -1) {
                            var extension = me.core.path.extension(item.name);
                            if (extension === "m4a") {
                                audioFound = true;
                            }
                            if (extension === "mp4") {
                                videoFound = true;
                            }
                        }
                    });
                }
            }
            me.hasAudio = audioFound;
            me.hasVideo = videoFound;
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
        var group = window.options.groupName;
        if (group && typeof group === "string") {
            me.core.property.set(window, "ui.work.state", true);
            me.sessionListData = await me.media.file.listing(me.rootPath + "/" + group.toLowerCase());
            me.core.property.set(window, "ui.work.state", false);
            var sessions = me.core.property.get(window, "app.player.sessionList");
            var sessionCount = 0;
            if (sessions && sessions.length) {
                sessionCount = sessions.length;
                var name = sessions[0][0];
                if (sessionName) {
                    name = sessionName;
                }
                me.core.property.set(window, "app.player.onChangeSession", name);
            }
            me.core.property.set(window.var.sessionCount, "ui.basic.text", sessionCount);
        }
    };
    me.groupList = {
        get: function () {
            if (!me.groupListData) {
                return [];
            }
            var items = me.groupListData.map(function (item) {
                return [item.name.charAt(0).toUpperCase() + item.name.slice(1)];
            });
            return items;
        }
    };
    me.sessionList = {
        get: function () {
            var items = me.sessionListData.map(function (item) {
                var name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
                return me.core.path.fileName(name);
            }).reverse();
            items = Array.from(new Set(items));
            items = items.map(function (item) {
                return [item];
            });
            return items;
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
            var groupName = window.options.groupName;
            if (!object.files.length) {
                return;
            }
            var progress = me.ui.modal.launch("progress", {
                "title": "Uploading",
                "delay": "250"
            });
            try {
                for (var file of object.files) {
                    var serverPath = me.cachePath + "/" + file.name;
                    var remotePath = me.rootPath + "/" + groupName + "/" + file.name;
                    await me.storage.upload.file(file, serverPath, (index, count) => {
                        var data = { label: serverPath, max: count, value: index };
                        me.core.property.set(progress, "modal.progress.specific", data);
                    });
                    me.core.property.set(progress, "modal.progress.specific", null);
                    await me.storage.file.uploadFile(serverPath, remotePath, (offset, size) => {
                        var data = { label: remotePath, max: size, value: offset };
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
        var duration = me.widget.player.duration(object);
        var path = me.widget.player.path(object);
        var fileName = me.core.path.fullName(path);
        if (duration) {
            me.sessionListData = await me.sessionListData;
            var session = me.sessionListData.find(session => {
                return fileName === session.name;
            });
            if (session) {
                session.duration = duration;
            }
        }
    };
    me.copyUrl = function () {
        var window = me.singleton;
        var time = window.var.player ? me.widget.player.controls.time(window.var.player) : null;
        me.core.util.copyUrl("player", [window.options.groupName, window.options.sessionName, time]);
    };
};
