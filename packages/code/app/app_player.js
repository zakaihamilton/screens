/*
 @author Zakai Hamilton
 @component AppPlayer
 */

package.app.player = function AppPlayer(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.groupListData = [];
        me.sessionListData = [];
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        me.core.file.makeDir(null, me.cachePath);
        return me.singleton;
    };
    me.refresh = {
        set: function(object) {
            var window = me.singleton;
            var group = me.core.property.get(window.var.groupList, "ui.basic.text");
            me.core.message.send_server("core.cache.reset", () => {
                me.core.message.send_server("core.cache.reset", () => {
                    me.core.property.set(window, "app.player.update");
                }, me.id + "-" + group);
            }, me.id);
        }
    };
    me.update = {
        set: function (object) {
            var window = me.singleton;
            me.core.property.set(window.var.tree, "clear");
            me.core.message.send_server("core.cache.use", (root) => {
                console.log("groupListData:" + JSON.stringify(root));
                me.groupListData = root;
                me.core.property.set(window, "app.player.onChangeGroup", "");
            }, me.id, "storage.file.getChildren", me.rootPath, false);
        }
    };
    me.onChangeGroup = {
        set: function (object, string) {
            var window = me.singleton;
            me.core.property.set(window.var.sessionList, "ui.basic.text", "");
            me.core.property.set([window.var.audioType,window.var.videoType], "ui.style.visibility", "hidden");
            me.core.property.set([window.var.audioPlayer,window.var.videoPlayer], "ui.style.display", "none");
            me.core.property.set(window.var.groupList, "ui.basic.save", null);
            me.updateSessions();
        }
    };
    me.onChangeSession = {
        set: function (object, string) {
            me.updateSession();
        }
    };
    me.updateSession = function () {
        var audioFound = false, videoFound = false;
        var window = me.singleton;
        var name = me.core.property.get(window.var.sessionList, "ui.basic.text");
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
        me.core.property.set(window.var.audioType, "ui.style.visibility", audioFound ? "visible" : "hidden");
        me.core.property.set(window.var.videoType, "ui.style.visibility", videoFound ? "visible" : "hidden");
        if (audioFound && !videoFound) {
            me.core.property.set(window.var.audioType, "state", true);
        } else if (!audioFound && videoFound) {
            me.core.property.set(window.var.videoType, "state", true);
        }
        me.core.property.notify(window, "app.player.updatePlayer");
    };
    me.updateSessions = function () {
        var window = me.singleton;
        var group = me.core.property.get(window.var.groupList, "ui.basic.text");
        if (group) {
            me.core.message.send_server("core.cache.use", (root) => {
                me.sessionListData = root;
                var sessions = me.core.property.get(window, "app.player.sessionList");
                var sessionCount = 0;
                if(sessions && sessions.length) {
                    sessionCount = sessions.length;
                    var name = sessions[0][0];
                    if (name) {
                        me.core.property.set(window.var.sessionList, "ui.basic.text", name);
                        me.updateSession();
                    }
                }
                me.core.property.set(window.var.sessionCount, "ui.basic.text", sessionCount);
            }, me.id + "-" + group, "storage.file.getChildren", me.rootPath + "/" + group.toLowerCase(), false);
        }
    };
    me.groupList = {
        get: function (object) {
            if(!me.groupListData) {
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
        set: function (object) {
            var window = me.singleton;
            var showAudioPlayer = me.core.property.get(window.var.audioType, "state");
            var showVideoPlayer = me.core.property.get(window.var.videoType, "state");
            me.core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "block" : "none");
            me.core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "block" : "none");
            me.core.property.set(window.var.audioPlayer, "source", "");
            me.core.property.set(window.var.videoPlayer, "source", "");
            var groupName = me.core.property.get(window.var.groupList, "ui.basic.text");
            var sessionName = me.core.property.get(window.var.sessionList, "ui.basic.text");
            var audioPath = sessionName + "." + "m4a";
            var videoPath = sessionName + "." + "mp4";
            if(showAudioPlayer || showVideoPlayer) {
                var player = window.var.audioPlayer;
                var path = audioPath;
                if(showVideoPlayer) {
                    player = window.var.videoPlayer;
                    path = videoPath;
                }
                me.core.property.set(window, "ui.work.state", true);
                me.manager.download.push(function(err, target) {
                    if(err) {
                       me.core.app.launch(null, "info", [target, err]);
                    }
                    else {
                        me.core.property.set(player, "source", target);
                    }
                    me.core.property.set(window, "ui.work.state", false);
                }, me.rootPath + "/" + groupName + "/" + path, me.cachePath + "/" + path);
            }
        }
    };
    me.work = {
        set: function (object, value) {
            if(me.workTimeout) {
                clearTimeout(me.workTimeout);
                me.workTimeout = null;
            }
            if (value) {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                }, 250);
            } else {
                me.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                }, 500);
            }
        }
    };
};
