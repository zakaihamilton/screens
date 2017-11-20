/*
 @author Zakai Hamilton
 @component AppPlayer
 */

package.app.player = function AppPlayer(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.groupListData = [];
        me.sessionListData = [];
        me.singleton = me.package.ui.element.create(__json__, "workspace", "self");
    };
    me.refresh = {
        set: function (object) {
            var window = me.singleton;
            me.package.core.property.set(window.var.tree, "clear");
            me.package.storage.remote.getChildren(function (root) {
                me.groupListData = root;
                me.package.core.property.set(window, "app.player.onChangeGroup", "");
            }, me.rootPath, false);
        }
    };
    me.onChangeGroup = {
        set: function (object, string) {
            var window = me.singleton;
            me.package.core.property.set(window.var.sessionList, "ui.basic.text", "");
            me.package.core.property.set(window.var.audioType, "ui.style.visibility", "hidden");
            me.package.core.property.set(window.var.videoType, "ui.style.visibility", "hidden");
            me.package.core.property.set(window.var.audioPlayer, "ui.style.display", "none");
            me.package.core.property.set(window.var.videoPlayer, "ui.style.display", "none");
            me.package.core.property.set(window.var.groupList, "ui.basic.save", null);
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
        var name = me.package.core.property.get(window.var.sessionList, "ui.basic.text");
        me.sessionListData.filter(function (item) {
            if (item.name.indexOf(name) !== -1) {
                var extension = me.package.core.path.extension(item.name);
                if (extension === "m4a") {
                    audioFound = true;
                }
                if (extension === "mp4") {
                    videoFound = true;
                }
            }
        });
        me.package.core.property.set(window.var.audioType, "ui.style.visibility", audioFound ? "visible" : "hidden");
        me.package.core.property.set(window.var.videoType, "ui.style.visibility", videoFound ? "visible" : "hidden");
        if (audioFound && !videoFound) {
            me.package.core.property.set(window.var.audioType, "state", true);
        } else if (!audioFound && videoFound) {
            me.package.core.property.set(window.var.videoType, "state", true);
        }
        me.package.core.property.set(window, "app.player.updatePlayer");
    };
    me.updateSessions = function () {
        var window = me.singleton;
        var group = me.package.core.property.get(window.var.groupList, "ui.basic.text");
        if (group) {
            me.package.storage.remote.getChildren(function (root) {
                me.sessionListData = root;
                if (me.sessionListData.length) {
                    var name = me.sessionListData[me.sessionListData.length - 1].name;
                    if (name) {
                        name = name.charAt(0).toUpperCase() + name.slice(1);
                        name = me.package.core.path.name(name);
                        me.package.core.property.set(window.var.sessionList, "ui.basic.text", name);
                        me.updateSession();
                    }
                }
            }, me.rootPath + "/" + group.toLowerCase(), false);
        }
    };
    me.groupList = {
        get: function (object) {
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
                return me.package.core.path.name(name);
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
            var showAudioPlayer = me.package.core.property.get(window.var.audioType, "state");
            var showVideoPlayer = me.package.core.property.get(window.var.videoType, "state");
            me.package.core.property.set(window.var.audioPlayer, "ui.style.display", showAudioPlayer ? "block" : "none");
            me.package.core.property.set(window.var.videoPlayer, "ui.style.display", showVideoPlayer ? "block" : "none");
            me.package.core.property.set(window.var.audioPlayer, "source", "");
            me.package.core.property.set(window.var.videoPlayer, "source", "");
            var groupName = me.package.core.property.get(window.var.groupList, "ui.basic.text");
            var sessionName = me.package.core.property.get(window.var.sessionList, "ui.basic.text");
            var audioPath = sessionName + "." + "m4a";
            var videoPath = sessionName + "." + "mp4";
            if(showAudioPlayer || showVideoPlayer) {
                var player = window.var.audioPlayer;
                var path = audioPath;
                if(showVideoPlayer) {
                    player = window.var.videoPlayer;
                    path = videoPath;
                }
                me.package.core.property.set(window, "ui.work.state", true);
                me.package.manager.download.push(function(err) {
                    if(err) {
                       me.package.core.app.launch(null, "info", [path, err]);
                    }
                    else {
                        me.package.core.property.set(player, "source", me.cachePath + "/" + path);
                    }
                    me.package.core.property.set(window, "ui.work.state", false);
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
                    me.package.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                }, 250);
            } else {
                me.workTimeout = setTimeout(function () {
                    me.package.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                }, 500);
            }
        }
    };
};
