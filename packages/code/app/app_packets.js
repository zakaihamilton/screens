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
        if (me.options.dataProfile !== "Live" && me.options.dataProfile !== "Combined") {
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
            "viewType": "Auto"
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
                me.include("lib.moment", function (info) {
                    if (info.complete) {
                        me.unlock(task);
                    }
                });
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
                var result = [
                    item.title,
                    function () {
                        window.packetInfo = JSON.parse(me.core.string.decode(item.packetInfo));
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
                if (me.options.dataProfile === "Live" || me.options.dataProfile === "Combined") {
                    window.packetInfo = Object.assign({}, info);
                    window.packetInfo.effects = Object.assign({}, info.effects);
                    if (me.options.dataProfile === "Combined") {
                        autoRefresh = false;
                    }
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
    me.formatNumber = function (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    me.formatBytes = function (number) {
        var set = false;
        if (number < 1000) {
            number = parseInt(number) + " B";
            set = true;
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " KB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " MB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " GB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " TB";
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
                    if (!streamIndex || streamIndex > streamRequests.length) {
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
                me.core.property.set(window.var.packetCount, "ui.basic.text", me.formatNumber(packetCount));
                me.core.property.set(window.var.dataSize, "ui.basic.text", me.formatBytes(dataSize));
                me.core.property.set(window.var.abr, "ui.basic.text", me.formatBytes(abr) + "/s");
                me.core.property.set(window.var.streamCount, "ui.basic.text", streamRequests.length);
                var durationText = me.lib.moment().startOf('day').seconds(duration).format('HH:mm:ss');
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
    me.chartType = {
        get: function (object) {
            return "line";
        }
    };
    me.calcViewType = function (window) {
        var viewType = me.options.viewType;
        if (viewType === "Auto") {
            if (window.streamIndex === -1) {
                if (me.videoDuration(window)) {
                    viewType = "Duration % by Packet Delay";
                }
                else {
                    viewType = "Duration by Packet Delay";
                }
            }
            else {
                viewType = "Data by Time";
            }
        }
        return viewType;
    };
    me.chartOptions = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var viewType = me.calcViewType(window);
            var options = {};
            if (viewType.includes("Data by Time")) {
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
                                "labelString": "Data"
                            }
                        }]
                    }
                };
            }
            else {
                var axis = viewType.split("by");
                var xAxis = axis[1].trim();
                var yAxis = axis[0].trim();
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
                                "labelString": xAxis
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
                                "labelString": yAxis
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
            me.colors = [];
            var data = { datasets: [], labels: [] };
            var window = me.widget.window.window(object);
            if (!window || !window.packetInfo) {
                return data;
            }
            var viewType = me.calcViewType(window);
            var dataProfiles = {};
            if (me.options.dataProfile === "Combined") {
                me.dataList.map(function (item) {
                    var packetInfo = JSON.parse(me.core.string.decode(item.packetInfo));
                    dataProfiles[item.title] = packetInfo;
                });
            }
            else {
                dataProfiles[me.options.dataProfile] = window.packetInfo;
            }
            var info = {};
            var colorIndex = 0;
            Object.keys(dataProfiles).map((dataProfileName) => {
                var dataProfile = dataProfiles[dataProfileName];
                var effects = dataProfile.effects;
                var dataProfilePacketLoss = effects.packetLoss || 0;
                var streamRequests = dataProfile.streamRequests;
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
                streamRequests.map((streamRequest) => {
                    var packets = streamRequest.packets;
                    if (!packets) {
                        return data;
                    }
                    function dateRel(sec) {
                        return me.widget.chart.dateRel(sec);
                    }
                    if (viewType.includes("Data by Time")) {
                        for (var sourceIp in packets) {
                            var targets = packets[sourceIp];
                            for (var targetIp in targets) {
                                var target = targets[targetIp];
                                var label = dataProfileName + ": ";
                                if (target.sourceIsService) {
                                    label += "service";
                                } else {
                                    label += "device";
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
                                        color = me.colors[label] = me.ui.color.colors[colorIndex++];
                                    }
                                    var dataset = {
                                        label: label,
                                        backgroundColor: color,
                                        borderColor: color,
                                        data: [],
                                        fill: false
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
                    } else {
                        var axis = viewType.split("by");
                        var xAxis = axis[1].trim();
                        var yAxis = axis[0].trim();
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
                        var label = dataProfileName + "(" + dataProfilePacketLoss + "%)";
                        var dataset = info[label];
                        if (!dataset) {
                            var color = me.colors[label];
                            if (!color) {
                                color = me.colors[label] = me.ui.color.colors[colorIndex++];
                            }
                            dataset = info[label] = {
                                label: label,
                                backgroundColor: color,
                                borderColor: color,
                                fill: false,
                                data: []
                            };
                        }
                        var videoDuration = me.videoDuration(window);
                        var durationPercentage = duration;
                        if (videoDuration && duration) {
                            durationPercentage = parseInt(videoDuration * 100 / duration);
                        }
                        var values = {
                            Duration: duration,
                            ABR: parseInt(abr / 1000),
                            "Packet Delay": packetDelay,
                            "Duration %": durationPercentage
                        };
                        var data = {
                            x: values[xAxis],
                            y: values[yAxis]
                        };
                        dataset.data.push(data);
                    }
                });
            });
            Object.keys(info).sort().map((label) => {
                var dataset = info[label];
                dataset.data.shift();
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
            var streamIndex = me.core.property.get(window.var.streamIndex, "ui.basic.text").split(":")[0];
            if (streamIndex === "Last") {
                streamIndex = 0;
            }
            if (streamIndex === "Combined") {
                streamIndex = -1;
            }
            window.streamIndex = streamIndex;
            me.core.property.set(window.var.chart, "reset");
            me.core.property.set(window.var.chart, "type", "@app.packets.chartType");
            me.core.property.set(window.var.chart, "options", "@app.packets.chartOptions");
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
    me.videoDuration = function (window) {
        var videoDuration = me.core.property.get(window.var.videoDuration, "ui.basic.text");
        var secs = videoDuration.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
        return secs;
    };
    me.export = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var chartData = me.core.property.get(window, "app.packets.chartData");
            var csvColumns = [];
            chartData.datasets.map((dataset) => {
                dataset.data.map((data) => {
                    if (!csvColumns.includes(data.x)) {
                        csvColumns.push(data.x);
                    }
                });
            });
            csvColumns = csvColumns.sort((a, b) => a - b);
            csvColumns.unshift("label");
            var csvRows = chartData.datasets.map((dataset) => {
                var row = {};
                dataset.data.map((data) => {
                    row[data.x] = data.y;
                });
                row.label = dataset.label;
                return row;
            });
            var csvData = csvRows.map((row) => {
                return csvColumns.map((column) => {
                    var val = row[column];
                    if (!val) {
                        val = "";
                    }
                    return val;
                });
            });
            csvData.unshift(csvColumns);
            me.content.csv.export(me.options.dataProfile + ".csv", csvData);
        }
    };
    me.streamList = {
        get: function (object) {
            var count = 0;
            var window = me.widget.window.window(object);
            if (window && window.packetInfo) {
                var streamRequests = window.packetInfo.streamRequests;
                if (streamRequests) {
                    var items = streamRequests.map(function (streamRequest, index) {
                        var title = "";
                        if(typeof streamRequest.runIndex === "undefined") {
                            title = index+1;
                        }
                        else {
                            title = (streamRequest.streamIndex+1) + ":" + (streamRequest.runIndex+1);
                        }
                        var result = [
                            title,
                        ];
                        isFirst = false;
                        return result;
                    });
                    return items;
                }
            }
        }
    };
};
