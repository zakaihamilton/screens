/*
 @author Zakai Hamilton
 @component WidgetPlayer
 */

screens.widget.player = function WidgetPlayer(me) {

}

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
                    "core.event.timeupdate": "widget.player.controls.update",
                    "core.event.play": "widget.player.controls.update",
                    "core.event.pause": "widget.player.controls.update",
                    "ui.basic.var": "player",
                    "ui.class.class":"player"
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
            var extension = me.core.path.extension(path);
            me.core.property.set(object.var.source, "ui.attribute.src", path);
            me.core.property.set(object.var.source, "ui.attribute.type", "audio/" + extension);
            object.var.player.src = path;
            object.var.player.load();
            me.core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.video = function WidgetPlayerVideo(me) {
    me.init = function() {
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
                    "core.event.timeupdate": "widget.player.controls.update",
                    "core.event.play": "widget.player.controls.update",
                    "core.event.pause": "widget.player.controls.update",
                    "ui.resize.event": "update",
                    "ui.basic.var": "player",
                    "ui.class.class":"player"
                },
                {
                    "ui.element.component": "widget.player.controls",
                    "ui.basic.var": "controls"
                }
            ]
        }
    };
    me.update = function(object) {
        var window = me.widget.window(object);
        var left = object.parentNode.offsetLeft;
        var top = object.parentNode.offsetTop;
        var width = object.parentNode.clientWidth;
        var height = object.parentNode.clientHeight;
        var windowRegion = me.ui.rect.absolute_region(window);
        var playerRegion = me.ui.rect.relative_region(object, window);
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
                    "ui.basic.tag": "div",
                    "ui.basic.var": "play",
                    "ui.class.class": [
                        "button",
                        "play"
                    ],
                    "ui.touch.click": "play"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "stop",
                    "ui.class.class": [
                        "button",
                        "stop"
                    ],
                    "ui.touch.click": "stop"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "rewind",
                    "ui.class.class": [
                        "button",
                        "rewind"
                    ],
                    "ui.touch.click": "rewind"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "forward",
                    "ui.class.class": [
                        "button",
                        "forward"
                    ],
                    "ui.touch.click": "forward"
                },
                {
                    "ui.basic.tag": "a",
                    "ui.basic.var": "download",
                    "ui.class.class": [
                        "button",
                        "download"
                    ],
                    "ui.attribute.download":""
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "fullscreen",
                    "ui.class.class": [
                        "button",
                        "fullscreen"
                    ],
                    "ui.touch.click": "widget.window.fullscreen"
                },
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
                    "showPercentage":false
                }
            ]
        }
    };
    me.mainWidget = function (object) {
        var widget = me.ui.node.container(object, [
            me.widget.player.audio.id,
            me.widget.player.video.id
        ]);
        return widget;
    };
    me.play = function (object) {
        var widget = me.mainWidget(object);
        if (widget.var.player.paused || widget.var.player.ended) {
            widget.var.player.play();
        }
        else {
            widget.var.player.pause();
        }
        me.updateButtons(widget.var.player);
    };
    me.stop = function (object) {
        var widget = me.mainWidget(object);
        widget.var.player.pause();
        widget.var.player.currentTime = 0;
        me.updateProgress(widget);
        me.updateButtons(widget);
    };
    me.update = function (object) {
        me.updateProgress(object);
        me.updateButtons(object);
        me.updateLink(object);
        me.updateFullscreen(object);
    };
    me.updateFullscreen = function (object) {
        var window = me.widget.window(object);
        var widget = me.mainWidget(object);
        var controls = widget.var.controls;
        var player = widget.var.player;
        var fullscreen = me.core.property.get(window, "fullscreen");
        me.core.property.set(widget, "ui.class.fullscreen", fullscreen);
    };
    me.updateLink = function (object) {
        var widget = me.mainWidget(object);
        var controls = widget.var.controls;
        var player = widget.var.player;
        me.core.property.set(controls.var.download, "ui.attribute.href", player.src);
    }
    me.formatTime = function (currentTime) {
        var current_hour = parseInt(currentTime / 3600) % 24,
            current_minute = parseInt(currentTime / 60) % 60,
            current_seconds_long = currentTime % 60,
            current_seconds = current_seconds_long.toFixed(),
            current_time = current_hour + ":" + (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
        return current_time;
    };
    me.updateProgress = function (object) {
        var widget = me.mainWidget(object);
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
        var widget = me.mainWidget(object);
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
        var widget = me.mainWidget(object);
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
    };
    me.rewind = function (object) {
        var widget = me.mainWidget(object);
        widget.var.player.currentTime -= 10;
        me.update(object);
    };
    me.forward = function (object) {
        var widget = me.mainWidget(object);
        widget.var.player.currentTime += 10;
        me.update(object);
    };
};
