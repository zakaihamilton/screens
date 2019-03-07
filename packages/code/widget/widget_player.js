/*
 @author Zakai Hamilton
 @component WidgetPlayer
 */

screens.widget.player = function WidgetPlayer(me, packages) {
    const { core } = packages;
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
    me.type = {
        get: function (object) {
            var widget = me.mainWidget(object);
            return widget.type;
        },
        set: function (object, type) {
            var widget = me.mainWidget(object);
            widget.type = type;
        }
    };
    me.resize = function (object) {
        var widget = me.mainWidget(object);
        var background = widget.var.controls.var.progress;
        if (widget.wavesurfer) {
            widget.wavesurfer.setHeight(background.offsetHeight);
        }
        core.property.set(widget, "update");
    };
};

screens.widget.player.audio = function WidgetPlayerAudio(me, packages) {
    const { core } = packages;
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
                var extension = core.path.extension(path);
                core.property.set(object.var.source, "ui.attribute.type", "audio/" + extension);
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

screens.widget.player.video = function WidgetPlayerVideo(me, packages) {
    const { core } = packages;
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
        var window = me.widget.window.get(object);
        var widget = me.upper.mainWidget(object);
        var windowRegion = me.ui.rect.absoluteRegion(window);
        var playerRegion = me.ui.rect.relativeRegion(widget, window);
        var controlsRegion = me.ui.rect.relativeRegion(widget.var.controls, window);
        var widthText = "";
        var heightText = "";
        var percent = (((windowRegion.height - playerRegion.top - controlsRegion.height) / windowRegion.height) * 100);
        heightText = parseInt(percent) + "%";
        core.property.set(widget.var.player, "ui.style.width", widthText);
        core.property.set(widget.var.player, "ui.style.height", heightText);
    };
    me.source = {
        get: function (object) {
            return object.src;
        },
        set: function (object, path) {
            if ((!object.src && !path) || object.src === path) {
                return;
            }
            var extension = core.path.extension(path);
            core.property.set(object.var.source, "ui.attribute.src", path);
            core.property.set(object.var.source, "ui.attribute.type", "video/" + extension);
            object.var.player.src = path;
            object.src = path;
            object.var.player.load();
            me.update(object);
            core.property.set(object, "widget.player.controls.load");
            core.property.set(object, "widget.player.controls.update");
        }
    };
};

screens.widget.player.controls = function WidgetPlayerControls(me, packages) {
    const { core } = packages;
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
        },
        draw: function (object) {
            var widget = me.upper.mainWidget(object);
            var background = object.var.controls.var.progress.var.background;
            var plugins = [];
            if (!core.device.isMobile()) {
                let plugin = WaveSurfer.cursor.create({
                    showTime: true,
                    opacity: 0.75,
                    customShowTimeStyle: {
                        "background-color": "var(--chrome-background)",
                        color: "var(--chrome-color)",
                        padding: "0.2em",
                        "margin-left": "0.4em",
                        "z-index": "1000"
                    }
                });
                plugin.instance.prototype.formatTime = function (cursorTime) {
                    return [cursorTime].map(function (time) {
                        return [
                            ("00" + Math.floor(time % (3600 * 60) / 60 / 60)).slice(-2),
                            ("00" + Math.floor(time % 3600 / 60)).slice(-2),
                            ("00" + Math.floor(time % 60)).slice(-2)
                        ].join(":");
                    });
                };
                plugins.push(plugin);
            }
            widget.wavesurfer = WaveSurfer.create({
                container: background,
                waveColor: "#669966",
                progressColor: "#669966",
                backend: "MediaElement",
                plugins
            });
            widget.wavesurfer.on("waveform-ready", () => {
                me.updatePeaks(widget);
            });
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
        me.updatePeaks(object);
    };
    me.updatePlayer = function (object) {
        var widget = me.upper.mainWidget(object);
        core.property.set(widget, "update");
    };
    me.updateFullscreen = function (object) {
        var window = me.widget.window.get(object);
        var widget = me.upper.mainWidget(object);
        var fullscreen = core.property.get(window, "fullscreen");
        core.property.set(widget, "ui.class.fullscreen", fullscreen);
    };
    me.updateLink = function (object) {
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var player = widget.var.player;
        core.property.set(controls.var.download, "ui.attribute.href", player.src);
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
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
        var showPause = !widget.var.player.paused && !widget.var.player.ended;
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
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
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
        widget.var.player.currentTime = parseInt(percent * widget.var.player.duration);
        me.updateProgress(object);
        me.updatePlayer(object);
        event.stopPropagation();
    };
    me.rewind = function (object, seconds) {
        var widget = me.upper.mainWidget(object);
        if (typeof seconds !== "number") {
            seconds = widget.jumpTime;
            if (!seconds) {
                seconds = 10;
            }
        }
        widget.var.player.currentTime -= parseInt(seconds);
        me.update(object);
    };
    me.forward = function (object, seconds) {
        var widget = me.upper.mainWidget(object);
        if (typeof seconds !== "number") {
            seconds = widget.jumpTime;
            if (!seconds) {
                seconds = 10;
            }
        }
        widget.var.player.currentTime += parseInt(seconds);
        me.update(object);
    };
    me.seek = function (object, time) {
        var widget = me.upper.mainWidget(object);
        widget.var.player.currentTime = parseInt(time);
        me.update(object);
    };
    me.time = function (object) {
        var widget = me.upper.mainWidget(object);
        return widget.var.player.currentTime;
    };
    me.fullscreen = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        if (widget.type === "video") {
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
        var widget = me.upper.mainWidget(object);
        core.property.set(widget, "previous");
    };
    me.next = async function (object) {
        var widget = me.upper.mainWidget(object);
        core.property.set(widget, "next");
    };
    me.speedName = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(me.media.voice.speeds);
        var index = speeds.indexOf(rate);
        var name = null;
        if (index !== -1) {
            var names = Object.keys(me.media.voice.speeds);
            name = names[index];
        }
        return name;
    };
    me.speed = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        return player.playbackRate;
    };
    me.setSpeed = function (object, speed) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        player.defaultPlaybackRate = player.playbackRate = speed;
    };
    me.setJumpTime = function (object, jumpTime) {
        var widget = me.upper.mainWidget(object);
        widget.jumpTime = jumpTime;
    };
    me.speedUp = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(me.media.voice.speeds);
        var index = speeds.indexOf(rate);
        if (index !== speeds.length - 1) {
            index++;
            player.defaultPlaybackRate = player.playbackRate = speeds[index];
            me.updatePlayer(object);
            var name = Object.keys(me.media.voice.speeds)[index];
            var message = "Speeding up playback to " + name;
            message += " (x" + me.media.voice.speeds[name] + ")";
            me.widget.toast.show("widget.player.speed", message);
        }
    };
    me.speedDown = function (object) {
        var widget = me.upper.mainWidget(object);
        var player = widget.var.player;
        var rate = player.playbackRate;
        var speeds = Object.values(me.media.voice.speeds);
        var index = speeds.indexOf(rate);
        if (index) {
            index--;
            player.defaultPlaybackRate = player.playbackRate = speeds[index];
            me.updatePlayer(object);
            var name = Object.keys(me.media.voice.speeds)[index];
            var message = "Slowing down playback to " + name;
            message += " (x" + me.media.voice.speeds[name] + ")";
            me.widget.toast.show("widget.player.speed", message);
        }
    };
    me.setIconSize = function (object, iconSize) {
        var widget = me.upper.mainWidget(object);
        var controls = widget.var.controls;
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
        me.update(widget);
    };
    me.enablePeaks = function (object, flag) {
        var widget = me.upper.mainWidget(object);
        var background = widget.var.controls.var.progress.var.background;
        widget.enablePeaks = flag;
        core.property.set(background, "ui.basic.show", flag);
    };
    me.loadPeaks = function (object) {
        var widget = me.upper.mainWidget(object);
        if (!widget.src) {
            return;
        }
        setTimeout(() => {
            me.update(widget);
        }, 500);
        var peaks = null;
        if (widget.item) {
            peaks = widget.item.peaks;
        }
        if (peaks || !core.device.isMobile()) {
            widget.wavesurfer.load(widget.var.player, peaks);
        }
    };
    me.updatePeaks = async function (object) {
        var widget = me.upper.mainWidget(object);
        var item = null;
        if (widget.src) {
            var name = core.path.fileName(widget.src);
            if (!widget.item) {
                item = await me.db.cache.metadata.find({ name });
                if (!item) {
                    item = {};
                }
                widget.item = item;
                me.loadPeaks(widget);
            }
            var background = widget.var.controls.var.progress;
            if (widget.wavesurfer) {
                widget.wavesurfer.setHeight(background.offsetHeight);
                if (widget.item && !widget.item.peaks) {
                    var peaks = JSON.parse(widget.wavesurfer.exportPCM(1024, 1000, true, 0));
                    if (peaks && peaks.length) {
                        widget.item.peaks = peaks;
                        await me.db.cache.metadata.use({ name }, widget.item);
                    }
                }
            }
        }
        else if (widget.wavesurfer) {
            widget.wavesurfer.empty();
            widget.item = null;
        }
    };
};
