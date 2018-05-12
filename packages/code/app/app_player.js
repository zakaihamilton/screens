/*
 @author Zakai Hamilton
 @component AppPlayer
 */

screens.app.player = function AppPlayer(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.useFormat = "Audio";
    me.init = async function() {
        me.groupListData = me.core.message.send_server(
            "core.cache.use",
            me.id,
            "storage.file.getChildren",
            me.rootPath,
            false);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.sessionListData = [];
        var params = {};
        if (args.length > 0) {
            params.groupName = args[0];
        }
        if (args.length > 1) {
            params.sessionName = args[1];
        }
        me.singleton = me.ui.element(__json__, "workspace", "self", params);
        try {
            me.core.file.makeDir(me.cachePath);
        }
        catch (err) {
            me.log(me.cachePath + " err: " + err.message || err);
        }
        return me.singleton;
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
        me.ui.options.load(me, window, {
            groupName:"American",
            sessionName:"",
        });
    };
    me.sortSessions = function(object, items) {
        if(!items || items.then) {
            return [];
        }
        items = items.map(function (item) {
            var name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            return me.core.path.fileName(name);
        }).reverse();
        items = Array.from(new Set(items));
        items = items.map(function (item) {
            return {name:item};
        });
        return items;
    };
    me.groupMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.groupListData, "name", {"state":"select"}, "group", null, "app.player.onChangeGroup");
        }
    };
    me.sessionMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.sessionListData, "name", {"state":"select"}, "session", me.sortSessions, "app.player.onChangeSession");
        }
    };
    me.refresh = {
        set: async function (object) {
            var window = me.singleton;
            await me.core.message.send_server("core.cache.reset", me.id);
            await me.core.message.send_server("core.cache.reset", me.id + "-" + window.options.groupName);
            me.core.property.set(window, "app.player.onChangeGroup", window.options.groupName);
        }
    };
    me.onChangeGroup = {
        get: function(object, value) {
            var window = me.singleton;
            return window.options.groupName === value;
        },
        set: function (object, name) {
            var window = me.singleton;
            if(name) {
                me.ui.options.save(me, window, {groupName:name});
            }
            me.core.property.set([window.var.audioPlayer, window.var.videoPlayer], "ui.style.display", "none");
            me.updateSessions();
        }
    };
    me.onChangeSession = {
        get: function (object, name) {
            var window = me.singleton;
            return window.options.sessionName === name;
        },
        set: function (object, name) {
            var audioFound = false, videoFound = false;
            var window = me.singleton;
            var sessions = me.sortSessions(object, me.sessionListData);
            if(sessions.length) {
                if(!name) {
                    name = sessions[0].name;
                }
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
            if(name) {
                me.core.property.set(window, "title", "Player - " + name);
            }
            else {
                me.core.property.set(window, "title", "Player");
            }
            me.ui.options.save(me, window, {sessionName:name});
            me.hasAudio = audioFound;
            me.hasVideo = videoFound;
            if (audioFound && !videoFound) {
                me.useFormat = "Audio";
            } else if (!audioFound && videoFound) {
                me.useFormat = "Video";
            }
            me.core.property.notify(window, "app.player.updatePlayer");
        }
    };
    me.setFormat = {
        get: function(object, value) {
            return me.useFormat === value;
        },
        set: function(object, value) {
            me.useFormat = value;
            me.core.property.notify(window, "app.player.updatePlayer");
        }
    };
    me.updateSessions = async function (sessionName) {
        var window = me.singleton;
        var group = window.options.groupName;
        if (group) {
            me.sessionListData = me.core.message.send_server(
                "core.cache.use",
                me.id + "-" + group,
                "storage.file.getChildren",
                me.rootPath + "/" + group.toLowerCase(),
                false);
            me.sessionListData = await me.sessionListData;
            var sessions = me.core.property.get(window, "app.player.sessionList");
            var sessionCount = 0;
            if (sessions && sessions.length) {
                sessionCount = sessions.length;
                var name = sessions[0][0];
                if (sessionName) {
                    name = sessionName;
                }
                if (name) {
                    me.core.property.set(window, "app.player.onChangeSession", name);
                }
            }
            me.core.property.set(window.var.sessionCount, "ui.basic.text", sessionCount);
        }
    };
    me.groupList = {
        get: function (object) {
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
        get: function (object) {
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
        set: async function (object) {
            var window = me.singleton;
            var groupName = window.options.groupName;
            var sessionName = window.options.sessionName;
            var showAudioPlayer = groupName && sessionName && me.useFormat === "Audio";
            var showVideoPlayer = groupName && sessionName && me.useFormat === "Video";
            me.core.property.set([window.var.audioPlayer,window.var.videoPlayer], "ui.style.display", "none");
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
                var target = null;
                while (true) {
                    target = await me.manager.download.get(me.rootPath + "/" + groupName + "/" + path, me.cachePath + "/" + path);
                    if (target) {
                        break;
                    }
                    await me.core.util.sleep(5000);
                }
                me.core.property.set(player, "source", target);
                me.core.property.set(window, "ui.work.state", false);
                me.core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "" : "none");
                me.core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "" : "none");
            }
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
                }, 500);
            }
        }
    };
};
