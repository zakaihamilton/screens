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
            me.package.core.property.set(me.singleton.var.tree, "clear");
            me.package.storage.remote.getChildren(function (root) {
                me.groupListData = root;
                me.package.core.property.set(me.singleton, "app.player.onChangeGroup", "");
            }, me.rootPath, false);
        }
    };
    me.onChangeGroup = {
        set: function (object, string) {
            me.package.core.property.set(me.singleton.var.sessionList, "ui.basic.text", "");
            me.package.core.property.set(me.singleton.var.audioType, "ui.style.visibility", "hidden");
            me.package.core.property.set(me.singleton.var.videoType, "ui.style.visibility", "hidden");
            me.package.core.property.set(me.singleton.var.audioPlayer, "ui.style.display", "none");
            me.package.core.property.set(me.singleton.var.videoPlayer, "ui.style.display", "none");
            me.package.core.property.set(me.singleton.var.groupList, "ui.basic.save", null);
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
        var name = me.package.core.property.get(me.singleton.var.sessionList, "ui.basic.text");
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
        me.package.core.property.set(me.singleton.var.audioType, "ui.style.visibility", audioFound ? "visible" : "hidden");
        me.package.core.property.set(me.singleton.var.videoType, "ui.style.visibility", videoFound ? "visible" : "hidden");
        if (audioFound && !videoFound) {
            me.package.core.property.set(me.singleton.var.audioType, "state", true);
        } else if (!audioFound && videoFound) {
            me.package.core.property.set(me.singleton.var.videoType, "state", true);
        }
        me.package.core.property.set(me.singleton, "app.player.updatePlayer");
    };
    me.updateSessions = function () {
        var group = me.package.core.property.get(me.singleton.var.groupList, "ui.basic.text");
        if (group) {
            me.package.storage.remote.getChildren(function (root) {
                me.sessionListData = root;
                if (me.sessionListData.length) {
                    var name = me.sessionListData[me.sessionListData.length - 1].name;
                    if (name) {
                        name = name.charAt(0).toUpperCase() + name.slice(1);
                        name = me.package.core.path.name(name);
                        me.package.core.property.set(me.singleton.var.sessionList, "ui.basic.text", name);
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
            var showAudioPlayer = me.package.core.property.get(me.singleton.var.audioType, "state");
            var showVideoPlayer = me.package.core.property.get(me.singleton.var.videoType, "state");
            me.package.core.property.set(me.singleton.var.audioPlayer, "ui.style.display", showAudioPlayer ? "block" : "none");
            me.package.core.property.set(me.singleton.var.videoPlayer, "ui.style.display", showVideoPlayer ? "block" : "none");
            me.package.core.property.set(me.singleton.var.audioPlayer, "source", "");
            me.package.core.property.set(me.singleton.var.videoPlayer, "source", "");
            var groupName = me.package.core.property.get(me.singleton.var.groupList, "ui.basic.text");
            var sessionName = me.package.core.property.get(me.singleton.var.sessionList, "ui.basic.text");
            var audioPath = sessionName + "." + "m4a";
            var videoPath = sessionName + "." + "mp4";
            if(showAudioPlayer || showVideoPlayer) {
                var player = me.singleton.var.audioPlayer;
                var path = audioPath;
                if(showVideoPlayer) {
                    player = me.singleton.var.videoPlayer;
                    path = videoPath;
                }
                me.package.manager.download.push(function(err) {
                    if(err) {
                       me.package.core.app.launch(null, "info", [path, err]);
                    }
                    else {
                        me.package.core.property.set(player, "source", me.cachePath + "/" + path);
                    }
                }, me.rootPath + "/" + groupName + "/" + path, me.cachePath + "/" + path);
            }
        }
    };
};
