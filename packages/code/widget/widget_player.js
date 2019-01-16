/*
 @author Zakai Hamilton
 @component WidgetPlayer
 */

screens.widget.player = function WidgetPlayer(me) {
    me.log_errorEvent = function (e) {
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
        var widget = me.mainWidget(object);
        var player = widget.var.player;
        return player.duration;
    };
    me.path = function (object) {
        var widget = me.mainWidget(object);
        var player = widget.var.player;
        return decodeURI(player.src);
    };
    me.mainWidget = function (object) {
        var widget = me.ui.node.container(object, [
            me.widget.player.audio.id,
            me.widget.player.video.id
        ]);
        return widget;
    };
};

screens.widget.player.audio = function WidgetPlayerAudio(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "widget",
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
                    "core.event.error": "widget.player.errorEvent",
                    "core.event.timeupdate": "widget.player.controls.update",
                    "core.event.play": "widget.player.controls.update",
                    "core.event.pause": "widget.player.controls.update",
                    "core.event.canplay": "widget.player.controls.update",
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
        set: function (object, path) {
            if (path) {
                var extension = me.core.path.extension(path);
                me.core.property.set(object.var.source, "ui.attribute.type", "audio/" + extension);
            }
            me.core.property.set(object.var.source, "ui.attribute.src", path);
            object.var.player.src = path;
            object.var.player.load();
            me.core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.video = function WidgetPlayerVideo(me) {
    me.init = function () {
        me.core.property.link("ui.style.display", "update", false);
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "widget",
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
                    "ui.resize.event": "update",
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
    me.update = function (object) {
        var window = me.widget.window.get(object);
        var windowRegion = me.ui.rect.absoluteRegion(window);
        var playerRegion = me.ui.rect.relativeRegion(object, window);
        var widthText = "";
        var heightText = "";
        var percent = (((windowRegion.height - playerRegion.top) / windowRegion.height) * 100) - 10;
        heightText = parseInt(percent) + "%";
        me.core.property.set(object.var.player, "ui.style.width", widthText);
        me.core.property.set(object.var.player, "ui.style.height", heightText);
    };
    me.source = {
        set: function (object, path) {
            var extension = me.core.path.extension(path);
            me.core.property.set(object.var.source, "ui.attribute.src", path);
            me.core.property.set(object.var.source, "ui.attribute.type", "video/" + extension);
            object.var.player.src = path;
            object.var.player.load();
            me.update(object);
            me.core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.controls = function WidgetPlayerControls(me) {
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
                    "ui.basic.tag": "a",
                    "ui.basic.var": "download",
                    "ui.class.class": [
                        "button",
                        "download"
                    ],
                    "ui.attribute.download": "",
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
                }
            ]
        }
    };
    me.isPlaying = function (object) {
        var widget = me.upper.mainWidget(object);
        return !(widget.var.player.paused || widget.var.player.ended);
    };
    me.play = function (object) {
        var widget = me.upper.mainWidget(object);
        if (widget.var.player.paused || widget.var.player.ended) {
            widget.var.player.play();
        }
        else {
            widget.var.player.pause();
        }
        me.updateButtons(widget.var.player);
        me.updatePlayer(widget.var.player);
    };
    me.stop = function (object) {
        var widget = me.upper.mainWidget(object);
        widget.var.player.pause();
        widget.var.player.currentTime = 0;
        me.updateProgress(widget);
        me.updateButtons(widget);
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
        var widget = me.upper.mainWidget(object);
        me.core.property.set(widget, "update");
    };
    me.updateFullscreen = function (object) {
        var window = me.widget.window.get(object);
        var widget = me.upper.mainWidget(object);
        var fullscreen = me.core.property.get(window, "fullscreen");
        me.core.property.set(widget, "ui.class.fullscreen", fullscreen);
    };
    me.updateLink = function (object) {
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var player = widget.var.player;
        me.core.property.set(controls.var.download, "ui.attribute.href", player.src);
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
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var progress = controls.var.progress;
        var player = widget.var.player;
        var percentage = 0;
        if (player.duration) {
            percentage = Math.floor((100 / player.duration) * player.currentTime);
        }
        me.core.property.set(progress, "value", percentage);
        var label = me.formatTime(player.currentTime);
        if (player.duration) {
            label += " / " + me.formatTime(player.duration) +
                " ( " + me.formatTime(player.duration - player.currentTime) + " left)";
        }
        me.core.property.set(progress, "label", label);
    };
    me.updateButtons = function (object) {
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var showPause = !widget.var.player.paused && !widget.var.player.ended;
        me.core.property.set(controls.var.play, "ui.class.pause", showPause);
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
        if (object.seeking) {
            me.seekEvent(object, event);
            object.seeking = false;
            object.over = false;
        }
    };
    me.seekEvent = function (object, event) {
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var percent = event.offsetX / controls.var.progress.offsetWidth;
        if (percent < 0) {
            percent = 0;
        }
        if (percent > 1) {
            percent = 1;
        }
        widget.var.player.currentTime = percent * widget.var.player.duration;
        me.updateProgress(object);
        me.updatePlayer(object);
    };
    me.rewind = function (object, seconds = 10) {
        var widget = me.upper.mainWidget(object);
        widget.var.player.currentTime -= seconds;
        me.update(object);
    };
    me.forward = function (object, seconds = 10) {
        var widget = me.upper.mainWidget(object);
        widget.var.player.currentTime += seconds;
        me.update(object);
    };
    me.seek = function (object, time) {
        var widget = me.upper.mainWidget(object);
        widget.var.player.currentTime = time;
        me.update(object);
    };
    me.time = function (object) {
        var widget = me.upper.mainWidget(object);
        return widget.var.player.currentTime;
    };
    me.fullscreen = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        if (player.requestFullscreen) {
            player.requestFullscreen();
        }
        else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen();
        } else if (player.webkitRequestFullScreen) {
            player.webkitRequestFullScreen();
        }
    };
    me.timestamp = async function (object) {
        var widget = me.upper.mainWidget(object);
        var method = me.core.property.get(object, "widget.window.method", "url");
        var url = me.core.property.get(object, method);
        var notes = me.core.app.singleton("notes");
        if (!notes) {
            notes = await me.core.app.launch("notes");
        }
        if (notes) {
            var label = me.formatTime(widget.var.player.currentTime);
            me.core.property.set(notes, "ui.property.after", {
                "app.notes.insertLink": {
                    label,
                    url
                }
            });
        }
    };
    me.speeds = {
        "Slow": 0.5,
        "Slower": 0.75,
        "Normal": 1.0,
        "Faster": 1.25,
        "Fast": 1.5
    };
    me.speed = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        return player.playbackRate;
    };
    me.setSpeed = function (object, speed) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        player.playbackRate = speed;
    };
};
