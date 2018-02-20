/*
 @author Zakai Hamilton
 @component AppPackets
 */

package.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        if (me.options.dataProfile !== "Live") {
            me.core.property.set(me.singleton.var.title, "ui.basic.text", me.options.dataProfile);
        }
        return me.singleton;
    };
    me.init = function (task) {
        me.colors = [];
        me.isPushEnabled = false;
        me.ui.options.load(me, null, {
            "autoRefresh": true,
            "dataProfile": "Live",
            "viewType": "Data / Time"
        });
        me.autoRefresh = me.ui.options.toggleSet(me, "autoRefresh", me.refreshData.set);
        me.viewType = me.ui.options.choiceSet(me, "viewType", (object, options, key, value) => {
            var window = me.widget.window.window(object);
            me.core.property.set(window.var.chart, "reset");
            me.core.property.set(window.var.chart, "type", "@app.packets.chartType");
            me.core.property.set(window.var.chart, "options", "@app.packets.chartOptions");
            me.core.property.set(window, "app.packets.refreshData");
        });
        me.dataProfile = me.ui.options.choiceSet(me, "dataProfile", (object, options, key, value) => {
            var window = me.widget.window.window(object);
            if (window.streamIndex > 0) {
                me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
            }
            me.core.property.set(window, "app.packets.refreshData");
            me.core.property.set(window.var.title, "ui.basic.text", "");
        });
        me.lock(task, (task) => {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.dataList = items;
                me.manager.packet.isPushEnabled((isPushEnabled) => {
                    me.isPushEnabled = isPushEnabled;
                });
                me.unlock(task);
            }, "app.packets.data", "title");
        });
    };
    me.refreshDataList = {
        set: function (object) {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.dataList = items;
            }, "app.packets.data", "title");
        }
    };
    me.dataMenuList = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var dataList = me.dataList;
            if (!dataList) {
                dataList = [];
            }
            var items = dataList.map(function (item) {
                var packetInfo = me.core.string.decode(item.packetInfo);
                var result = [
                    item.title,
                    function () {
                        window.packetInfo = JSON.parse(packetInfo);
                        me.core.property.set(window, "app.packets.dataProfile", item.title);
                        me.core.property.set(window.var.title, "ui.basic.text", item.title);
                    },
                    {
                        "state": function () {
                            return me.core.property.get(window, "app.packets.dataProfile", item.title);
                        }
                    }
                ];
                return result;
            });
            return items;
        }
    };
    me.refreshData = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var autoRefresh = me.options.autoRefresh;
            me.manager.packet.info((info) => {
                if (me.options.dataProfile === "Live") {
                    window.packetInfo = Object.assign({}, info);
                    window.packetInfo.effects = Object.assign({}, info.effects);
                } else if (me.dataList) {
                    var item = me.dataList.find((item) => {
                        return item.title === me.options.dataProfile;
                    });
                    if (item) {
                        window.packetInfo = JSON.parse(me.core.string.decode(item.packetInfo));
                    }
                    autoRefresh = false;
                }
                me.core.property.set(window, "app.packets.updateData");
                if (autoRefresh) {
                    if (me.timer) {
                        clearTimeout(me.timer);
                        me.timer = null;
                    }
                    me.timer = setTimeout(() => {
                        me.core.property.set(window, "app.packets.refreshData");
                    }, 10000);
                }
            });
        }
    };
    me.formatBytes = function (number) {
        var set = false;
        if (number < 1000) {
            number = parseInt(number) + "B";
            set = true;
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + "KB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + "MB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + "GB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + "TB";
                set = true;
            }
        }
        return number;
    };
    me.autoIncreasePacketDelay = {
        get: function (object) {
            var state = false;
            var window = me.widget.window.window(object);
            if (window.packetInfo) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    state = effects.autoIncreasePacketDelay;
                }
            }
            return state;
        },
        set: function (object, value) {
            var window = me.widget.window.window(object);
            if (window.packetInfo) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    effects.autoIncreasePacketDelay = !effects.autoIncreasePacketDelay;
                    me.core.property.notify(window, "app.packets.applyEffects");
                }
            }
        }
    };
    me.updateData = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if (window.packetInfo) {
                var packetCount = 0;
                var dataSize = 0;
                var abr = 0;
                var duration = 0;
                var effects = {};
                var streamRequests = window.packetInfo.streamRequests;
                if (streamRequests.length) {
                    var streamIndex = window.streamIndex;
                    if (!streamIndex) {
                        streamIndex = streamRequests.length;
                    }
                    if (streamIndex === -1) {
                        streamRequests.map((streamRequest) => {
                            packetCount += streamRequest.packetCount;
                            dataSize += streamRequest.dataSize;
                            duration += streamRequest.duration;
                        });
                        if (duration) {
                            abr = dataSize / duration;
                        }
                        effects = window.packetInfo.effects;
                    } else {
                        var streamRequest = streamRequests[streamIndex - 1];
                        packetCount = streamRequest.packetCount;
                        dataSize = streamRequest.dataSize;
                        duration = streamRequest.duration;
                        if (duration) {
                            abr = dataSize / duration;
                        }
                        effects = streamRequest.effects;
                    }
                }
                if (window.var.packetLoss !== document.activeElement) {
                    me.core.property.set(window.var.packetLoss, "ui.basic.text", effects.packetLoss);
                }
                if (window.var.packetDelay !== document.activeElement) {
                    me.core.property.set(window.var.packetDelay, "ui.basic.text", effects.packetDelay);
                }
                me.core.property.set(window.var.packetCount, "ui.basic.text", packetCount);
                me.core.property.set(window.var.dataSize, "ui.basic.text", me.formatBytes(dataSize));
                me.core.property.set(window.var.abr, "ui.basic.text", me.formatBytes(abr));
                me.core.property.set(window.var.streamCount, "ui.basic.text", streamRequests.length);
                var durationText = me.lib.moment.moment().startOf('day').seconds(duration).format('HH:mm:ss');
                me.core.property.set(window.var.duration, "ui.basic.text", durationText);
                me.core.property.set(window.var.chart, "data", "@app.packets.chartData");
                me.core.property.notify(window.var.chart, "update", {
                    "duration": 0
                });
            }
        }
    };
    me.reset = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.manager.packet.reset(() => {
                if (window.streamIndex > 0) {
                    me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
                }
                me.core.property.set(window, "app.packets.dataProfile", "Live");
                me.core.property.set(window, "app.packets.refreshData");
            });
        }
    };
    me.streamRequestCount = {
        get: function (object) {
            var count = 0;
            var window = me.widget.window.window(object);
            if (window && window.packetInfo) {
                var streamRequests = window.packetInfo.streamRequests;
                if (streamRequests) {
                    count = streamRequests.length;
                }
            }
            return count;
        }
    };
    me.chartType = {
        get: function (object) {
            return "line";
        }
    };
    me.chartOptions = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var viewType = me.options.viewType;
            var options = {};
            if (viewType === "Data / Time") {
                options = {
                    "responsive": true,
                    "showLines": true,
                    "spanGaps": true,
                    "title": {
                        "display": true,
                        "text": viewType
                    },
                    "scales": {
                        "xAxes": [{
                                "type": "time",
                                "display": true,
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Time"
                                },
                                "ticks": {
                                    "major": {
                                        "fontStyle": "bold",
                                        "fontColor": "#FF0000"
                                    }
                                }
                            }],
                        "yAxes": [{
                                "display": true,
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Data (KB)"
                                }
                            }]
                    }
                };
            } else if (viewType === "ABR / Packet Delay") {
                options = {
                    "responsive": true,
                    "showLines": true,
                    "spanGaps": true,
                    "title": {
                        "display": true,
                        "text": viewType
                    },
                    "scales": {
                        "xAxes": [{
                                "type": "linear",
                                "display": true,
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Packet Delay"
                                },
                                "ticks": {
                                    "major": {
                                        "fontStyle": "bold",
                                        "fontColor": "#FF0000"
                                    }
                                }
                            }],
                        "yAxes": [{
                                "display": true,
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "ABR (KB)"
                                }
                            }]
                    }
                };
            }
            return options;
        }
    };
    me.chartData = {
        get: function (object) {
            var data = {datasets: [], labels: []};
            var window = me.widget.window.window(object);
            if (!window || !window.packetInfo) {
                return data;
            }
            var viewType = me.options.viewType;
            var streamRequests = window.packetInfo.streamRequests;
            if (!streamRequests.length) {
                return data;
            }
            var streamIndex = window.streamIndex;
            if (!streamIndex) {
                streamIndex = streamRequests.length;
            }
            if (streamIndex !== -1) {
                streamRequests = [streamRequests[streamIndex - 1]];
            }
            var colorIndex = 0;
            var info = {};
            streamRequests.map((streamRequest) => {
                var packets = streamRequest.packets;
                if (!packets) {
                    return data;
                }
                function dateRel(sec) {
                    return me.widget.chart.dateRel(sec);
                }
                if (viewType === "Data / Time") {
                    for (var sourceIp in packets) {
                        var targets = packets[sourceIp];
                        for (var targetIp in targets) {
                            var target = targets[targetIp];
                            var label = "";
                            if (target.sourceIsService) {
                                label = "service";
                            } else {
                                label = "device";
                            }
                            label += "(" + sourceIp + ") => ";
                            if (target.targetIsService) {
                                label += "service";
                            } else {
                                label += "device";
                            }
                            label += "(" + targetIp + ")";
                            if (!(label in info)) {
                                var color = me.colors[label];
                                if (!color) {
                                    color = me.colors[label] = me.ui.color.randomInSet(colorIndex++);
                                }
                                var dataset = {
                                    label: label,
                                    backgroundColor: color,
                                    borderColor: color,
                                    fill: false,
                                    data: []
                                };
                                info[label] = dataset;
                            }
                            var dataset = info[label];
                            for (var time in target.items) {
                                var item = target.items[time];
                                var data = {
                                    x: dateRel(item.end),
                                    y: parseInt(item.len / 1000)
                                };
                                dataset.data.push(data);
                            }
                        }
                    }
                } else if (viewType === "ABR / Packet Delay") {
                    var dataSize = streamRequest.dataSize;
                    var duration = streamRequest.duration;
                    var abr = 0;
                    if (duration) {
                        abr = dataSize / duration;
                    }
                    var effects = streamRequest.effects;
                    var packetDelay = 0;
                    if (effects && effects.packetDelay) {
                        packetDelay = effects.packetDelay;
                    }
                    var label = "default";
                    var dataset = info[label];
                    if (!dataset) {
                        var color = me.colors[label];
                        if (!color) {
                            color = me.colors[label] = me.ui.color.randomInSet(colorIndex++);
                        }
                        dataset = info[label] = {
                            label: "",
                            backgroundColor: color,
                            borderColor: color,
                            fill: false,
                            data: []
                        };
                    }
                    var data = {
                        x: packetDelay,
                        y: parseInt(abr / 1000)
                    };
                    dataset.data.push(data);
                }
            });
            Object.keys(info).sort().map((label) => {
                var dataset = info[label];
                dataset.data.pop();
                data.datasets.push(dataset);
            });
            return data;
        }
    };
    me.effects = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if (window.packetInfo && window.streamIndex <= 0) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    effects.packetLoss = me.core.property.get(window.var.packetLoss, "ui.basic.text");
                    effects.packetDelay = me.core.property.get(window.var.packetDelay, "ui.basic.text");
                    if (effects.packetLoss < 0) {
                        effects.packetLoss = 0;
                        me.core.property.set(window.var.packetLoss, "ui.basic.text", "0");
                    }
                    if (effects.packetDelay < 0) {
                        effects.packetDelay = 0;
                        me.core.property.set(window.var.packetDelay, "ui.basic.text", "0");
                    }
                    me.manager.packet.applyEffects((err) => {
                        if (err) {
                            alert("Cannot apply effects: " + err.message);
                        }
                    }, effects);
                }
            }
        }
    };
    me.save = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var text = JSON.stringify(window.packetInfo);
            return text;
        },
        set: function (object) {
            var window = me.widget.window.window(object);
            var text = JSON.stringify(window.packetInfo);
            var date = new Date();
            var title = me.core.property.get(window.var.title, "ui.basic.text");
            if (!title) {
                title = date.toLocaleDateString();
            }
            var data = {
                packetInfo: me.core.string.encode(text),
                date: date.toString(),
                title: title
            };
            me.storage.data.save(err => {
                if (err) {
                    me.core.console.error("Cannot save data: " + err.message);
                } else {
                    me.refreshDataList.set(object);
                }
            }, data, "app.packets.data", title, ["packetInfo"]);
        }
    };
    me.onChangeStream = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var streamIndex = me.core.property.get(window.var.streamIndex, "ui.basic.text");
            if (streamIndex === "Last") {
                streamIndex = 0;
            }
            if (streamIndex === "Combined") {
                streamIndex = -1;
            }
            window.streamIndex = streamIndex;
            me.core.property.notify(window, "app.packets.refreshData");
        }
    };
    me.pushPackets = {
        get: function (object) {
            return me.isPushEnabled;
        },
        set: function (object, value) {
            me.isPushEnabled = !me.isPushEnabled;
            me.manager.packet.enablePush((err) => {
                if (err) {
                    alert("Cannot set packet loss: " + err.message);
                }
            }, me.isPushEnabled);
        }
    };
};
