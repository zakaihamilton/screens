/*
 @author Zakai Hamilton
 @component WidgetPlayer
 */

screens.widget.player = function WidgetPlayer(me, { core, ui, widget }) {
    me.showError = function (e) {
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                alert("You aborted the playback.");
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                alert("A network error caused the download to fail.");
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                alert("The playback was aborted due to a corruption problem or because the used features your browser did not support.");
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                alert("The media could not be loaded, either because the server or network failed or because the format is not supported.");
                break;
            default:
                alert("An unknown error occurred.");
                break;
        }
    };
    me.duration = function (object) {
        var mainWidget = me.mainWidget(object);
        var player = mainWidget.var.player;
        return player.duration;
    };
    me.path = function (object) {
        var mainWidget = me.mainWidget(object);
        var player = mainWidget.var.player;
        return decodeURI(player.src);
    };
    me.mainWidget = function (object) {
        var container = ui.node.container(object, [
            widget.player.audio.id,
            widget.player.video.id
        ]);
        return container;
    };
    me.type = {
        get: function (object) {
            var mainWidget = me.mainWidget(object);
            return mainWidget.type;
        },
        set: function (object, type) {
            var mainWidget = me.mainWidget(object);
            mainWidget.type = type;
        }
    };
    me.resize = function (object) {
        var mainWidget = me.mainWidget(object);
        core.property.set(mainWidget, "update");
    };
};

screens.widget.player.audio = function WidgetPlayerAudio(me, { core }) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "widget",
            "widget.player.type": "audio",
            "ui.basic.elements": [
                {
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "source",
                            "ui.basic.var": "source"
                        }
                    ],
                    "ui.basic.tag": "audio",
                    "ui.attribute.controls": null,
                    "ui.attribute.preload": "auto",
                    "ui.attribute.crossOrigin": "anonymous",
                    "core.event.error": "widget.player.errorEvent",
                    "core.event.timeupdate": "widget.player.controls.update",
                    "core.event.play": "widget.player.controls.update",
                    "core.event.pause": "widget.player.controls.update",
                    "core.event.canplay": "widget.player.controls.update",
                    "ui.resize.event": "widget.player.resize",
                    "ui.basic.var": "player",
                    "ui.class.class": "player"
                },
                {
                    "ui.element.component": "widget.player.controls",
                    "ui.basic.var": "controls"
                }
            ]
        }
    };
    me.source = {
        get: function (object) {
            return object.src;
        },
        set: async function (object, path) {
            if ((!object.src && !path) || object.src === path) {
                return;
            }
            if (path) {
                core.property.set(object.var.source, "ui.attribute.type", "audio/mp4");
            }
            core.property.set(object.var.source, "ui.attribute.src", path);
            object.var.player.src = path;
            object.src = path;
            object.var.player.load();
            core.property.set(object, "widget.player.controls.load");
            core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.video = function WidgetPlayerVideo(me, { core, ui, widget }) {
    me.init = function () {
        core.property.link("ui.style.display", "update", false);
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "widget",
            "widget.player.type": "video",
            "ui.basic.elements": [
                {
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "source",
                            "ui.basic.var": "source"
                        }
                    ],
                    "ui.basic.tag": "video",
                    "ui.attribute.controls": null,
                    "ui.attribute.preload": "auto",
                    "core.event.error": "widget.player.errorEvent",
                    "core.event.timeupdate": "widget.player.controls.update",
                    "core.event.play": "widget.player.controls.update",
                    "core.event.pause": "widget.player.controls.update",
                    "core.event.canplay": "widget.player.controls.update",
                    "ui.resize.event": "widget.player.resize",
                    "ui.basic.var": "player",
                    "ui.class.class": "player"
                },
                {
                    "ui.element.component": "widget.player.controls",
                    "ui.basic.var": "controls",
                    "type": "video"
                }
            ]
        }
    };
    me.update = function (object) {
        var window = widget.window.get(object);
        var mainWidget = me.upper.mainWidget(object);
        var windowRegion = ui.rect.absoluteRegion(window);
        var playerRegion = ui.rect.relativeRegion(mainWidget, window);
        var controlsRegion = ui.rect.relativeRegion(mainWidget.var.controls, window);
        var widthText = "";
        var heightText = "";
        var percent = (((windowRegion.height - playerRegion.top - controlsRegion.height) / windowRegion.height) * 100);
        heightText = parseInt(percent) + "%";
        core.property.set(mainWidget.var.player, "ui.style.width", widthText);
        core.property.set(mainWidget.var.player, "ui.style.height", heightText);
    };
    me.source = {
        get: function (object) {
            return object.src;
        },
        set: function (object, path) {
            if ((!object.src && !path) || object.src === path) {
                return;
            }
            core.property.set(object.var.source, "ui.attribute.src", path);
            core.property.set(object.var.source, "ui.attribute.type", "video/mp4");
            object.var.player.src = path;
            object.src = path;
            object.var.player.load();
            me.update(object);
            core.property.set(object, "widget.player.controls.load");
            core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.controls = function WidgetPlayerControls(me, { core, media, widget }) {
    me.element = {
        properties: {
            "ui.basic.var": "controls",
            "ui.class.class": "container",
            "ui.basic.elements": [
                {
                    "ui.element.component": "widget.progress",
                    "ui.class.classExtra": "progress",
                    "ui.basic.var": "progress",
                    "min": "0",
                    "max": "100",
                    "value": "0",
                    "ui.touch.down": "seekStart",
                    "ui.touch.move": "seekMove",
                    "ui.touch.up": "seekEnd",
                    "ui.touch.over": "seekOver",
                    "ui.touch.leave": "seekLeave",
                    "showPercentage": false
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "play",
                    "ui.class.class": [
                        "button",
                        "play"
                    ],
                    "ui.touch.click": "play",
                    "ui.attribute.title": "Play"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "stop",
                    "ui.class.class": [
                        "button",
                        "stop"
                    ],
                    "ui.touch.click": "stop",
                    "ui.attribute.title": "Stop"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "rewind",
                    "ui.class.class": [
                        "button",
                        "rewind"
                    ],
                    "ui.touch.click": "rewind",
                    "ui.attribute.title": "Rewind"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "forward",
                    "ui.class.class": [
                        "button",
                        "forward"
                    ],
                    "ui.touch.click": "forward",
                    "ui.attribute.title": "Fast Forward"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "speedDown",
                    "ui.class.class": [
                        "button",
                        "speed-down"
                    ],
                    "ui.touch.click": "speedDown",
                    "ui.attribute.title": "Slow Down"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "speedUp",
                    "ui.class.class": [
                        "button",
                        "speed-up"
                    ],
                    "ui.touch.click": "speedUp",
                    "ui.attribute.title": "Speed Up"
                },
                {
                    "ui.basic.tag": "a",
                    "ui.basic.var": "download",
                    "ui.class.class": [
                        "button",
                        "download"
                    ],
                    "ui.attribute.title": "Download"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "fullscreen",
                    "ui.class.class": [
                        "button",
                        "fullscreen"
                    ],
                    "ui.touch.click": "fullscreen",
                    "ui.attribute.title": "Fullscreen"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "timestamp",
                    "ui.class.class": [
                        "button",
                        "timestamp"
                    ],
                    "ui.touch.click": "timestamp",
                    "ui.attribute.title": "Timestamp"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "previous",
                    "ui.class.class": [
                        "button",
                        "previous"
                    ],
                    "ui.touch.click": "previous",
                    "ui.attribute.title": "Previous Session"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "next",
                    "ui.class.class": [
                        "button",
                        "next"
                    ],
                    "ui.touch.click": "next",
                    "ui.attribute.title": "Next Session"
                }
            ]
        }
    };
    me.isPlaying = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        return !(mainWidget.var.player.paused || mainWidget.var.player.ended);
    };
    me.play = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        if (mainWidget.var.player.paused || mainWidget.var.player.ended) {
            try {
                mainWidget.var.player.play();
            }
            catch (err) {
                alert(err);
            }
        }
        else {
            mainWidget.var.player.pause();
        }
        me.updateButtons(mainWidget.var.player);
        me.updatePlayer(mainWidget.var.player);
    };
    me.stop = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        mainWidget.var.player.pause();
        mainWidget.var.player.currentTime = 0;
        me.updateProgress(mainWidget);
        me.updateButtons(mainWidget);
        me.updatePlayer(object);
    };
    me.update = function (object) {
        me.updateProgress(object);
        me.updateButtons(object);
        me.updateLink(object);
        me.updateFullscreen(object);
        me.updatePlayer(object);
    };
    me.updatePlayer = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        core.property.set(mainWidget, "update");
    };
    me.updateFullscreen = function (object) {
        var window = widget.window.get(object);
        var mainWidget = me.upper.mainWidget(object);
        var fullscreen = core.property.get(window, "fullscreen");
        core.property.set(mainWidget, "ui.class.fullscreen", fullscreen);
    };
    me.updateLink = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var controls = mainWidget.var.controls;
        var player = mainWidget.var.player;
        const fileName = core.path.fileName(me.upper.path(object));
        core.property.set(controls.var.download, "ui.attribute.href", player.src);
        core.property.set(controls.var.download, "ui.attribute.download", fileName);
        core.property.set(controls.var.download, "ui.attribute.target", "_blank");
    };
    me.formatTime = function (currentTime) {
        var current_hour = parseInt(currentTime / 3600) % 24,
            current_minute = parseInt(currentTime / 60) % 60,
            current_seconds_long = currentTime % 60,
            current_seconds = current_seconds_long.toFixed(),
            current_time = current_hour + ":" + (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
        return current_time;
    };
    me.updateProgress = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var controls = mainWidget.var.controls;
        var progress = controls.var.progress;
        var player = mainWidget.var.player;
        var percentage = 0;
        if (player.duration) {
            percentage = (100 / player.duration) * player.currentTime;
        }
        if (percentage < 0) {
            percentage = 0;
        }
        core.property.set(progress, "value", percentage);
        var label = me.formatTime(player.currentTime);
        if (player.duration) {
            label += " / " + me.formatTime(player.duration) +
                " ( " + me.formatTime(player.duration - player.currentTime) + " left)";
        }
        core.property.set(progress, "label", label);
    };
    me.updateButtons = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var controls = mainWidget.var.controls;
        var showPause = !mainWidget.var.player.paused && !mainWidget.var.player.ended;
        core.property.set(controls.var.play, "ui.class.pause", showPause);
    };
    me.seekStart = function (object, event) {
        object.seeking = true;
        object.over = true;
        me.seekEvent(object, event);
    };
    me.seekMove = function (object, event) {
        if (object.seeking && object.over) {
            me.seekEvent(object, event);
        }
    };
    me.seekOver = function (object, event) {
        if (object.seeking) {
            object.over = true;
        }
    };
    me.seekLeave = function (object, event) {
        if (object.seeking) {
            object.over = false;
        }
    };
    me.seekEnd = function (object, event) {
        if (object.seeking && object.over) {
            me.seekEvent(object, event);
        }
        object.seeking = false;
        object.over = false;
    };
    me.seekEvent = function (object, event) {
        var mainWidget = me.upper.mainWidget(object);
        var controls = mainWidget.var.controls;
        var percent = 0;
        if (event.offsetX >= 0 && controls.var.progress.clientWidth) {
            percent = event.offsetX / controls.var.progress.clientWidth;
        }
        if (percent < 0) {
            percent = 0;
        }
        if (percent > 1) {
            percent = 1;
        }
        mainWidget.var.player.currentTime = parseInt(percent * mainWidget.var.player.duration);
        me.updateProgress(object);
        me.updatePlayer(object);
        event.stopPropagation();
    };
    me.rewind = function (object, seconds) {
        var mainWidget = me.upper.mainWidget(object);
        if (typeof seconds !== "number") {
            seconds = mainWidget.jumpTime;
            if (!seconds) {
                seconds = 10;
            }
        }
        mainWidget.var.player.currentTime -= parseInt(seconds);
        me.update(object);
    };
    me.forward = function (object, seconds) {
        var mainWidget = me.upper.mainWidget(object);
        if (typeof seconds !== "number") {
            seconds = mainWidget.jumpTime;
            if (!seconds) {
                seconds = 10;
            }
        }
        mainWidget.var.player.currentTime += parseInt(seconds);
        me.update(object);
    };
    me.seek = function (object, time) {
        var mainWidget = me.upper.mainWidget(object);
        mainWidget.var.player.currentTime = parseInt(time);
        me.update(object);
    };
    me.time = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        return mainWidget.var.player.currentTime;
    };
    me.fullscreen = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        if (mainWidget.type === "video") {
            if (player.requestFullscreen) {
                player.requestFullscreen();
            }
            else if (player.mozRequestFullScreen) {
                player.mozRequestFullScreen();
            } else if (player.webkitRequestFullScreen) {
                player.webkitRequestFullScreen();
            }
        }
        else {
            core.property.set(object, "widget.window.fullscreen");
        }
    };
    me.timestamp = async function (object) {
        var url = core.property.get(object, core.property.get(object, "widget.window.method", "url"));
        var label = core.property.get(object, core.property.get(object, "widget.window.method", "timestampLabel"));
        var notes = await core.app.launch("notes");
        if (notes) {
            core.property.set(notes, "ui.property.after", {
                "app.notes.insertLink": {
                    label,
                    url
                }
            });
        }
    };
    me.previous = async function (object) {
        var mainWidget = me.upper.mainWidget(object);
        core.property.set(mainWidget, "previous");
    };
    me.next = async function (object) {
        var mainWidget = me.upper.mainWidget(object);
        core.property.set(mainWidget, "next");
    };
    me.speedName = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(media.voice.speeds);
        var index = speeds.indexOf(rate);
        var name = null;
        if (index !== -1) {
            var names = Object.keys(media.voice.speeds);
            name = names[index];
        }
        return name;
    };
    me.speed = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        return player.playbackRate;
    };
    me.setSpeed = function (object, speed) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        player.defaultPlaybackRate = player.playbackRate = speed;
    };
    me.setJumpTime = function (object, jumpTime) {
        var mainWidget = me.upper.mainWidget(object);
        mainWidget.jumpTime = jumpTime;
    };
    me.speedUp = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(media.voice.speeds);
        var index = speeds.indexOf(rate);
        if (index !== speeds.length - 1) {
            index++;
            player.defaultPlaybackRate = player.playbackRate = speeds[index];
            me.updatePlayer(object);
            var name = Object.keys(media.voice.speeds)[index];
            var message = "Speeding up playback to " + name;
            message += " (x" + media.voice.speeds[name] + ")";
            widget.toast.show("widget.player.speed", message);
        }
    };
    me.speedDown = function (object) {
        var mainWidget = me.upper.mainWidget(object);
        var player = mainWidget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(media.voice.speeds);
        var index = speeds.indexOf(rate);
        if (index) {
            index--;
            player.defaultPlaybackRate = player.playbackRate = speeds[index];
            me.updatePlayer(object);
            var name = Object.keys(media.voice.speeds)[index];
            var message = "Slowing down playback to " + name;
            message += " (x" + media.voice.speeds[name] + ")";
            widget.toast.show("widget.player.speed", message);
        }
    };
    me.setIconSize = function (object, iconSize) {
        var mainWidget = me.upper.mainWidget(object);
        var controls = mainWidget.var.controls;
        iconSize = iconSize.toLowerCase();
        var sizes = ["small", "normal", "large"];
        sizes.map(size => {
            var flag = iconSize === size;
            var id = "ui.class." + size;
            var properties = {};
            properties[id] = flag;
            core.property.set(controls, "ui.property.broadcast", properties);
        });
        var isSmall = iconSize === "small";
        var isNormal = iconSize === "normal";
        var isLarge = iconSize === "large";
        core.property.set(controls, "ui.property.broadcast", {
            "ui.class.small": isSmall,
            "ui.class.normal": isNormal,
            "ui.class.large": isLarge
        });
        me.update(mainWidget);
    };
};
