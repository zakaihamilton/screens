/*
 @author Zakai Hamilton
 @component AppPackets
 */

screens.app.packets = function AppPackets(me) {
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.dataList = await me.storage.data.query("app.packets.data");
        me.monitorOptions = await me.manager.packet.getMonitorOptions();
        if (!me.monitorOptions) {
            me.monitorOptions = {};
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
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
        me.ui.options.choiceSet(me, null, "viewType", (object) => {
            var window = me.widget.window.get(object);
            me.core.property.set(window, "app.packets.refreshChart");
            me.core.property.set(window, "app.packets.refreshData");
        });
        me.ui.options.choiceSet(me, null, "dataProfile", (object) => {
            var window = me.widget.window.get(object);
            if (window.streamIndex > 0) {
                me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
            }
            me.core.property.set(window, "app.packets.refreshData");
            window.dataTitle = "";
        });
    };
    me.refreshDataList = {
        set: async function (object) {
            me.dataList = await me.storage.data.query("app.packets.data");
        }
    };
    me.dataTitle = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return window.dataTitle;
        },
        set: function (object, value) {
            var window = me.widget.window.get(object);
            if (value && value.currentTarget) {
                value = me.core.property.get(value.currentTarget, "ui.basic.text");
            }
            else {
                value = me.core.property.get(object, "ui.basic.text");
            }
            if (value) {
                window.dataTitle = value.trim();
            }
        }
    };
    me.monitorMenuOption = function (name) {
        return {
            get: function () {
                return me.monitorOptions[name];
            },
            set: async function (object, value) {
                if (value && value.currentTarget) {
                    value = me.core.property.get(value.currentTarget, "ui.basic.text");
                }
                else {
                    value = me.core.property.get(object, "ui.basic.text");
                }
                if (value) {
                    value = value.trim();
                }
                me.monitorOptions[name] = value;
                await me.manager.packet.setMonitorOptions(me.monitorOptions);
            }
        };
    };
    me.effectMenuOption = function (name, isState) {
        return {
            get: function (object) {
                var window = me.widget.window.get(object);
                return window.packetInfo.effects[name];
            },
            set: async function (object, value) {
                var window = me.widget.window.get(object);
                var target = object;
                if (value && value.currentTarget) {
                    target = value.currentTarget;
                }
                var effects = window.packetInfo.effects;
                if (isState) {
                    value = !effects[name];
                }
                else {
                    value = me.core.property.get(target, "ui.basic.text");
                    if (value) {
                        value = value.trim();
                    }
                    else {
                        value = "";
                    }
                }
                var setEffects = false;
                if (effects[name] !== value) {
                    effects[name] = value;
                    setEffects = true;
                }
                if (setEffects) {
                    clearTimeout(me.effectsTimer);
                    me.effectsTimer = setTimeout(() => {
                        me.applyEffects(window);
                    }, 1000);
                }
            }
        };
    };
    me.applyEffects = async function (object) {
        var window = me.widget.window.get(object);
        var effects = window.packetInfo.effects;
        try {
            await me.manager.packet.applyEffects(effects);
            window.packetInfo.effects = await me.manager.packet.retrieveEffects();
            me.core.property.set(window, "app.packets.updateData");
        }
        catch (err) {
            alert("Failed to apply effects: " + JSON.stringify(effects) + " err: " + err);
        }
    };
    me.monitorFilter = me.monitorMenuOption("monitorFilter");
    me.searchFilter = me.monitorMenuOption("searchFilter");
    me.packetLoss = me.effectMenuOption("packetLoss");
    me.packetDelay = me.effectMenuOption("packetDelay");
    me.bandwidthRate = me.effectMenuOption("bandwidthRate");
    me.bandwidthBurst = me.effectMenuOption("bandwidthBurst");
    me.bandwidthLatency = me.effectMenuOption("bandwidthLatency");
    me.toggleInterval = me.effectMenuOption("toggleInterval");
    me.useEffects = me.effectMenuOption("useEffects", true);
    me.dataMenuList = {
        get: function (object) {
            var window = me.widget.window.get(object);
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
                        window.dataTitle = item.title;
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
    me.refreshChart = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.chart, {
            "reset": null,
            "type": "@app.packets.chartType",
            "options": "@app.packets.chartOptions"
        });
    };
    me.refreshData = {
        set: async function (object) {
            var window = me.widget.window.get(object);
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
    me.updateData = {
        set: function (object) {
            var window = me.widget.window.get(object);
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
                    effects = window.packetInfo.effects;
                }
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
                me.core.property.set(window.var.chart, "data", "@app.packets.chartData");
                me.core.property.notify(window.var.chart, "update", {
                    "duration": 0
                });
                window.packetCount = me.formatNumber(packetCount);
                window.streamSize = me.core.string.formatBytes(dataSize);
                window.streamCount = streamRequests.length;
                window.streamDuration = me.core.string.formatDuration(duration);
                window.averageByteRate = me.core.string.formatBytes(abr) + "/s";
                window.searchMatch = searchMatch;
                if (effects) {
                    me.core.property.set(window.var.effectsMenu, "ui.class.mark", effects.useEffects);
                }
            }
        }
    };
    me.reset = {
        set: async function (object) {
            var window = me.widget.window.get(object);
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
        get: function () {
            return "line";
        }
    };
    me.calcViewType = function (window) {
        var viewType = me.options.viewType;
        var defaultViewType = "Data by Time";
        if (viewType === "Auto") {
            if (!window.packetInfo || !window.packetInfo.streamRequests || window.packetInfo.streamRequests.length <= 1) {
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
            var window = me.widget.window.get(object);
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
            var window = me.widget.window.get(object);
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
                                let label = dataProfileName + ": ";
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
                                    let dataset = {
                                        label: label,
                                        backgroundColor: color,
                                        borderColor: color,
                                        data: [],
                                        fill: false
                                    };
                                    info[label] = dataset;
                                }
                                let dataset = info[label];
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
                        let label = streamName + " (" + dataProfilePacketLoss + "%)";
                        if (yAxis.includes("Average")) {
                            label = dataProfilePacketLoss + "% Packet Loss";
                            combinedCallback = arr => parseInt(arr.reduce((a, b) => a + b, 0) / arr.length);
                        }
                        var dataset = info[label];
                        if (!dataset) {
                            let color = me.colors[label];
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
                        var durationPercentage = duration;
                        var values = {
                            Duration: duration,
                            ABR: parseInt(abr / 1000),
                            "Packet Delay": packetDelay,
                            "Duration %": durationPercentage
                        };
                        var xValue = values[xAxis];
                        var yValue = values[yAxis.replace(/Average\s/g, "")];
                        if (combinedCallback) {
                            let data = dataset.data[xValue];
                            if (!data) {
                                data = [];
                                dataset.data[xValue] = data;
                            }
                            data.push(yValue);
                        }
                        else {
                            let data = {
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
            var window = me.widget.window.get(object);
            var text = JSON.stringify(window.packetInfo);
            return text;
        },
        set: async function (object) {
            var window = me.widget.window.get(object);
            await me.splitPacketInfo(async (packetInfo, runIndex) => {
                var text = JSON.stringify(packetInfo);
                var date = new Date();
                var title = window.dataTitle;
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
        set: function (object, stream) {
            var window = me.widget.window.get(object);
            if (!stream) {
                stream = "Combined";
            }
            var streamIndex = stream.split(":")[0];
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
        get: function () {
            return me.monitorOptions.pushPackets;
        },
        set: async function () {
            me.monitorOptions.pushPackets = !me.monitorOptions.pushPackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.collectPackets = {
        get: function () {
            return me.monitorOptions.collectPackets;
        },
        set: async function () {
            me.monitorOptions.collectPackets = !me.monitorOptions.collectPackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.combinePackets = {
        get: function () {
            return me.monitorOptions.combinePackets;
        },
        set: async function () {
            me.monitorOptions.combinePackets = !me.monitorOptions.combinePackets;
            await me.manager.packet.setMonitorOptions(me.monitorOptions);
        }
    };
    me.export = {
        set: function (object) {
            var window = me.widget.window.get(object);
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
            me.file.csv.export(me.options.dataProfile + ".csv", csvData);
        }
    };
    me.streamMenuList = {
        get: function (object) {
            var window = me.widget.window.get(object);
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
                        return [title, "app.packets.onChangeStream"];
                    });
                    items.unshift(["Last", "app.packets.onChangeStream"]);
                    items.unshift(["Combined", "app.packets.onChangeStream", {
                        separator: true
                    }]);
                    var info = {
                        "Count": window.streamCount,
                        "Duration": window.streamDuration,
                        "Size": window.streamSize,
                        "Packet Count": window.packetCount,
                        "Average Byte Rate": window.averageByteRate,
                        "Current Search Match": window.searchMatch ? window.searchMatch : "None"
                    };
                    for (var title of Object.keys(info).reverse()) {
                        items.unshift([title + ": " + info[title], null, {
                            enabled: false
                        }]);
                    }
                    return items;
                }
            }
        }
    };
    return "browser";
};
