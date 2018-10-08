/*
 @author Zakai Hamilton
 @component AppPackets
 */

screens.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        if (me.options.dataProfile !== "Live" && me.options.dataProfile !== "Combined") {
            me.core.property.set(me.singleton.var.title, "ui.basic.text", me.options.dataProfile);
        }
        return me.singleton;
    };
    me.init = async function () {
        me.colors = [];
        me.monitorOptions = {};
        me.ui.options.load(me, null, {
            "autoRefresh": true,
            "dataProfile": "Live",
            "viewType": "Auto"
        });
        me.ui.options.toggleSet(me, null, "autoRefresh", me.refreshData.set);
        me.ui.options.choiceSet(me, null, "viewType", (object, value, key, options) => {
            var window = me.widget.window(object);
            me.core.property.set(window, "app.packets.refreshChart");
            me.core.property.set(window, "app.packets.refreshData");
        });
        me.ui.options.choiceSet(me, null, "dataProfile", (object, value, key, options) => {
            var window = me.widget.window(object);
            if (window.streamIndex > 0) {
                me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
            }
            me.core.property.set(window, "app.packets.refreshData");
            me.core.property.set(window.var.title, "ui.basic.text", "");
        });
        me.dataList = await me.storage.data.query("app.packets.data");
        me.monitorOptions = await me.manager.packet.getMonitorOptions();
        if(!me.monitorOptions) {
            me.monitorOptions = {};
        }
        await screens.include("lib.moment");
    };
    me.refreshDataList = {
        set: async function (object) {
            me.dataList = await me.storage.data.query("app.packets.data");
        }
    };
    me.dataMenuList = {
        get: function (object) {
            var window = me.widget.window(object);
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
    me.refreshChart = function(object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.chart, {
            "reset": null,
            "type": "@app.packets.chartType",
            "options": "@app.packets.chartOptions"
        });
    };
    me.refreshData = {
        set: async function (object) {
            var window = me.widget.window(object);
            var autoRefresh = me.options.autoRefresh;
            var info = await me.manager.packet.info();
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
            if (me.timer) {
                clearTimeout(me.timer);
                me.timer = null;
            }
            if (autoRefresh) {
                me.timer = setTimeout(() => {
                    me.core.property.set(window, "app.packets.refreshData");
                }, 5000);
            }
        }
    };
    me.formatNumber = function (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    me.formatDuration = function (duration) {
        var sec = duration % 60;
        var min = parseInt(duration / 60) % 60;
        var hour = parseInt(duration / (60 * 60)) % 24;
        var days = parseInt(duration / (24 * 60 * 60));
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        if (days) {
            return days + " days" + " + " + hour + ":" + min + ":" + sec;
        }
        else {
            return hour + ":" + min + ":" + sec;
        }
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
            var window = me.widget.window(object);
            if (window.packetInfo) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    state = effects.autoIncreasePacketDelay;
                }
            }
            return state;
        },
        set: async function (object, value) {
            var window = me.widget.window(object);
            if (window.packetInfo) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    effects.autoIncreasePacketDelay = !effects.autoIncreasePacketDelay;
                    await me.manager.packet.applyEffects(effects);
                }
            }
        }
    };
    me.updateData = {
        set: function (object) {
            var window = me.widget.window(object);
            if (window.packetInfo) {
                var packetCount = 0;
                var dataSize = 0;
                var abr = 0;
                var searchMatch = "";
                var duration = 0;
                var effects = {};
                var streamRequests = [];
                if (me.options.dataProfile === "Combined") {
                    me.dataList.map(function (item) {
                        var packetInfo = JSON.parse(me.core.string.decode(item.packetInfo));
                        streamRequests.push(...packetInfo.streamRequests);
                    });
                }
                else {
                    streamRequests = window.packetInfo.streamRequests;
                }
                var streamRequests = streamRequests;
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
                            searchMatch = streamRequest.searchMatch;
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
                        searchMatch = streamRequest.searchMatch;
                        if (duration) {
                            abr = dataSize / duration;
                        }
                        effects = streamRequest.effects;
                    }
                }
                var widgets = ["packetLoss", "packetDelay", "bandwidthRate", "bandwidthBurst", "bandwidthLatency"];
                for(var widget of widgets) {
                    if (window.var[widget] !== document.activeElement) {
                        me.core.property.set(window.var[widget], "ui.basic.text", effects[widget]);
                    }
                }
                me.core.property.set(window.var.packetCount, "ui.basic.text", me.formatNumber(packetCount));
                me.core.property.set(window.var.dataSize, "ui.basic.text", me.formatBytes(dataSize));
                me.core.property.set(window.var.abr, "ui.basic.text", me.formatBytes(abr) + "/s");
                me.core.property.set(window.var.searchMatch, "ui.basic.text", searchMatch);
                me.core.property.set(window.var.streamCount, "ui.basic.text", streamRequests.length);
                me.core.property.set(window.var.duration, "ui.basic.text", me.formatDuration(duration));
                me.core.property.set(window.var.chart, "data", "@app.packets.chartData");
                me.core.property.notify(window.var.chart, "update", {
                    "duration": 0
                });
            }
        }
    };
    me.reset = {
        set: async function (object) {
            var window = me.widget.window(object);
            await me.manager.packet.reset();
            if (window.streamIndex > 0) {
                me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
            }
            me.core.property.set(window, {
                "app.packets.dataProfile": "Live",
                "app.packets.refreshChart": null,                
                "app.packets.refreshData": null
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
        var defaultViewType = "Data by Time";
        if (viewType === "Auto") {
            if(window.packetInfo && window.packetInfo.streamRequests && window.packetInfo.streamRequests.length == 1) {
                viewType = defaultViewType;
            }
            else if (window.streamIndex === -1) {
                viewType = "Average Duration % by Packet Delay";
            }
            else {
                viewType = defaultViewType;
            }
        }
        else if (window.streamIndex !== -1) {
            viewType = defaultViewType;
        }
        return viewType;
    };
    me.chartOptions = {
        get: function (object) {
            var window = me.widget.window(object);
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
                                "labelString": "Data (KB)"
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
            var chartData = { datasets: [], labels: [] };
            var window = me.widget.window(object);
            if (!window || !window.packetInfo) {
                return chartData;
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
            var combinedCallback = false;
            Object.keys(dataProfiles).map((dataProfileName) => {
                var dataProfile = dataProfiles[dataProfileName];
                var effects = dataProfile.effects;
                var dataProfilePacketLoss = effects.packetLoss || 0;
                var streamRequests = dataProfile.streamRequests;
                if (!streamRequests.length) {
                    return;
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
                        return;
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
                        var streamName = dataProfileName;
                        if (streamRequest.runIndex && !dataProfileName.includes("#")) {
                            streamName += " #" + (streamRequest.runIndex + 1);
                        }
                        var label = streamName + " (" + dataProfilePacketLoss + "%)";
                        if (yAxis.includes("Average")) {
                            label = dataProfilePacketLoss + "% Packet Loss";
                            combinedCallback = arr => parseInt(arr.reduce((a, b) => a + b, 0) / arr.length);
                        }
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
                                fill: false
                            };
                            if (combinedCallback) {
                                dataset.data = {};
                            }
                            else {
                                dataset.data = [];
                            }
                        }
                        var videoDuration = me.videoDuration(window);
                        var durationPercentage = duration;
                        if (videoDuration && duration) {
                            durationPercentage = parseInt(duration * 100 / videoDuration);
                            durationPercentage = 100 - parseInt(durationPercentage / 10);
                        }
                        var values = {
                            Duration: duration,
                            ABR: parseInt(abr / 1000),
                            "Packet Delay": packetDelay,
                            "Duration %": durationPercentage
                        };
                        var xValue = values[xAxis];
                        var yValue = values[yAxis.replace(/Average\s/g, "")];
                        var dataArray = dataset.data;
                        if (combinedCallback) {
                            var data = dataset.data[xValue];
                            if (!data) {
                                data = [];
                                dataset.data[xValue] = data;
                            }
                            data.push(yValue);
                        }
                        else {
                            var data = {
                                x: xValue,
                                y: yValue
                            };
                            dataset.data.push(data);
                        }
                    }
                });
            });
            Object.keys(info).sort().map((label) => {
                var dataset = info[label];
                if (combinedCallback) {
                    var data = [];
                    Object.keys(dataset.data).sort((a, b) => a - b).map((x) => {
                        data.push({
                            x: x,
                            y: combinedCallback(dataset.data[x])
                        });
                    });
                    dataset.data = data;
                }
                dataset.data.shift();
                dataset.data.pop();
                chartData.datasets.push(dataset);
            });
            return chartData;
        }
    };
    me.effects = {
        set: async function (object) {
            var window = me.widget.window(object);
            if (window.packetInfo && window.streamIndex <= 0) {
                var effects = window.packetInfo.effects;
                if (effects) {
                    var widgets = ["packetLoss", "packetDelay", "bandwidthRate", "bandwidthBurst", "bandwidthLatency"];
                    for(var widget of widgets) {
                        effects[widget] = me.core.property.get(window.var[widget], "ui.basic.text");
                    }
                    await me.manager.packet.applyEffects(effects);
                }
            }
        }
    };
    me.loadMonitorOptions = function (object) {
        var window = me.widget.window(object);
        var widgets = ["monitorFilter", "searchFilter"];
        for(var widget of widgets) {
            me.core.property.set(window.var[widget], "ui.basic.text", me.monitorOptions[widget]);
        }
    };
    me.updateMonitorOptions = {
        set: async function (object) {
            var window = me.widget.window(object);
            var widgets = ["monitorFilter", "searchFilter"];
            for(var widget of widgets) {
                me.monitorOptions[widget] = me.core.property.get(window.var[widget], "ui.basic.text");
            }
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.splitPacketInfo = async function (callback, window) {
        var runCount = window.packetInfo.runIndex + 1;
        for (var runIndex = 0; runIndex < runCount; runIndex++) {
            var packetInfo = Object.assign({}, window.packetInfo);
            var streamRequests = packetInfo.streamRequests.filter((streamRequest) => {
                return streamRequest.runIndex === runIndex;
            });
            packetInfo.streamRequests = streamRequests;
            if (streamRequests.length) {
                await callback(packetInfo, runIndex);
            }
        }
    };
    me.save = {
        get: function (object) {
            var window = me.widget.window(object);
            var text = JSON.stringify(window.packetInfo);
            return text;
        },
        set: async function (object) {
            var window = me.widget.window(object);
            await me.splitPacketInfo(async (packetInfo, runIndex) => {
                var text = JSON.stringify(packetInfo);
                var date = new Date();
                var title = me.core.property.get(window.var.title, "ui.basic.text");
                if (!title) {
                    title = date.toLocaleDateString();
                }
                if (runIndex) {
                    title = title += " #" + (runIndex + 1);
                }
                var data = {
                    packetInfo: me.core.string.encode(text),
                    date: date.toString(),
                    title: title
                };
                await me.storage.data.save(data, "app.packets.data", title, ["packetInfo"]);
                me.refreshDataList.set(object);
            }, window);
        }
    };
    me.onChangeStream = {
        set: function (object) {
            var window = me.widget.window(object);
            var streamIndex = me.core.property.get(window.var.streamIndex, "ui.basic.text").split(":")[0];
            if (streamIndex === "Last") {
                streamIndex = 0;
            }
            if (streamIndex === "Combined") {
                streamIndex = -1;
            }
            window.streamIndex = streamIndex;
            me.core.property.set(window.var.chart, {
                "reset": null,
                "type": "@app.packets.chartType",
                "options": "@app.packets.chartOptions"
            });
            me.core.property.notify(window, "app.packets.refreshData");
        }
    };
    me.pushPackets = {
        get: function (object) {
            return me.monitorOptions.pushPackets;
        },
        set: async function (object, value) {
            me.monitorOptions.pushPackets = !me.monitorOptions.pushPackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.collectPackets = {
        get: function (object) {
            return me.monitorOptions.collectPackets;
        },
        set: async function (object, value) {
            me.monitorOptions.collectPackets = !me.monitorOptions.collectPackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.combinePackets = {
        get: function (object) {
            return me.monitorOptions.combinePackets;
        },
        set: async function (object, value) {
            me.monitorOptions.combinePackets = !me.monitorOptions.combinePackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.videoDuration = function (window) {
        var videoDuration = me.core.property.get(window.var.videoDuration, "ui.basic.text");
        var secs = videoDuration.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
        return secs;
    };
    me.export = {
        set: function (object) {
            var window = me.widget.window(object);
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
            var window = me.widget.window(object);
            if (window && window.packetInfo && me.options.dataProfile !== "Combined") {
                var streamRequests = window.packetInfo.streamRequests;
                if (streamRequests) {
                    var items = streamRequests.map(function (streamRequest, index) {
                        var title = "";
                        if (typeof streamRequest.runIndex === "undefined") {
                            title = index + 1;
                        }
                        else {
                            title = (streamRequest.streamIndex + 1) + ":" + (streamRequest.runIndex + 1);
                        }
                        return [title];
                    });
                    items.unshift(["Last"]);
                    return items;
                }
            }
        }
    };
};
