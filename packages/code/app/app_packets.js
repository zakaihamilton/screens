/*
 @author Zakai Hamilton
 @component AppPackets
 */

package.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        var window = me.ui.element.create(__json__, "workspace", "self");
        if(me.options.dataProfile !== "Live") {
            me.core.property.set(window.var.title, "ui.basic.text", me.options.dataProfile);
        }
    };
    me.init = function (task) {
        me.colors = [];
        me.ui.options.load(me, null, {
            "autoRefresh": true,
            "packetLoss": "None",
            "dataProfile": "Live"
        });
        me.autoRefresh = me.ui.options.toggleSet(me, "autoRefresh", me.refreshData.set);
        me.dataProfile = me.ui.options.choiceSet(me, "dataProfile", (object, options, key, value) => {
            var window = me.widget.window.window(object);
            if(window.streamIndex > 0) {
                me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
            }
            me.core.property.set(window, "app.packets.refreshData");
            me.core.property.set(window.var.title, "ui.basic.text", "");
        });
        me.packetLoss = me.ui.options.inputSet(me, "packetLoss", me.affect.set);
        me.packetDelay = me.ui.options.inputSet(me, "packetDelay", me.affect.set);
        me.lock(task, (task) => {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.dataList = items;
                me.unlock(task);
            }, "app.packets.data", "date");
        });
    };
    me.refreshDataList = {
        set: function (object) {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.dataList = items;
            }, "app.packets.data", "date");
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
                    window.packetInfo = info;
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
                    setTimeout(() => {
                        me.core.property.set(window, "app.packets.refreshData");
                    }, 5000);
                }
            });
        }
    };
    me.formatAbr = function(number) {
        var set = false;
        if(number < 1000) {
            number = parseInt(number) + "b";
            set = true;
        }
        if(!set) {
            number /= 1000;
            if(number < 1000) {
                number = parseInt(number) + "KB";
                set = true;
            }
        }
        if(!set) {
            number /= 1000;
            if(number < 1000) {
                number = parseInt(number) + "MB";
                set = true;
            }
        }
        return number;
    };
    me.updateData = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if (window.packetInfo) {
                var packetCount = 0;
                var dataSize = 0;
                var abr = 0;
                var duration = 0;
                var streamRequests = window.packetInfo.streamRequests;
                if(streamRequests.length) {
                    var streamIndex = window.streamIndex;
                    if(!streamIndex) {
                        streamIndex = streamRequests.length;
                    }
                    if(streamIndex === -1) {
                        streamRequests.map((streamRequest) => {
                            packetCount += streamRequest.packetCount;
                            dataSize += streamRequest.dataSize;
                            duration += streamRequest.duration;
                        });
                        if(duration) {
                            abr = dataSize / duration;
                        }
                    }
                    else {
                        var streamRequest = streamRequests[streamIndex-1];
                        packetCount = streamRequest.packetCount;
                        dataSize = streamRequest.dataSize;
                        duration = streamRequest.duration;
                        if(duration) {
                            abr = dataSize / duration;
                        }
                    }
                }
                me.core.property.set(window.var.packetCount, "ui.basic.text", packetCount);
                me.core.property.set(window.var.dataSize, "ui.basic.text", dataSize);
                me.core.property.set(window.var.abr, "ui.basic.text", me.formatAbr(abr));
                me.core.property.set(window.var.streamCount, "ui.basic.text", streamRequests.length);
                var durationText = me.lib.moment.moment().startOf('day').seconds(duration).format('HH:mm:ss');
                me.core.property.set(window.var.duration, "ui.basic.text", durationText);
                me.core.property.set(window.var.chart, "data", "@app.packets.data");
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
                if(window.streamIndex > 0) {
                    me.core.property.set(window.var.streamIndex, "ui.basic.text", "Last");
                }
                me.core.property.set(window, "app.packets.dataProfile", "Live");
            });
        }
    };
    me.streamRequestCount = {
        get: function(object) {
            var count = 0;
            var window = me.widget.window.window(object);
            if(window && window.packetInfo) {
                var streamRequests = window.packetInfo.streamRequests;
                if(streamRequests) {
                    count = streamRequests.length;
                }
            }
            return count;
        }
    };
    me.type = {
        get: function (object) {
            return null;
        }
    };
    me.options = {
        get: function (object) {
            return null;
        }
    };
    me.data = {
        get: function (object) {
            var data = {datasets: [], labels: []};
            var window = me.widget.window.window(object);
            if (!window || !window.packetInfo) {
                return data;
            }
            var streamRequests = window.packetInfo.streamRequests;
            if(!streamRequests.length) {
                return data;
            }
            var streamIndex = window.streamIndex;
            if(!streamIndex) {
                streamIndex = streamRequests.length;
            }
            if(streamIndex !== -1) {
                streamRequests = [streamRequests[streamIndex-1]];
            }
            var colorIndex = 0;
            var info = {};
            streamRequests.map((streamRequest) => {
                var packets = streamRequest.packets;
                if(!packets) {
                    return data;
                }
                function dateRel(sec) {
                    return me.widget.chart.dateRel(sec);
                }
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
                        if(!(label in info)) {
                            var color = me.colors[label];
                            if(!color) {
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
                            dataset.data.push({
                                x: dateRel(item.end),
                                y: item.len / 1000
                            });
                        }
                    }
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
    me.affect = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var packetLoss = me.options.packetLoss;
            if (packetLoss === "None") {
                packetLoss = "";
            }
            var packetDelay = me.options.packetDelay;
            if (packetDelay === "None") {
                packetDelay = "";
            }
            if(packetLoss < 0) {
                packetLoss = 0;
                me.core.property.set(window.var.packetLoss, "ui.basic.text", "0");
            }
            if(packetDelay < 0) {
                packetDelay = 0;
                me.core.property.set(window.var.packetDelay, "ui.basic.text", "0");
            }
            var params = {
                packetDelay: packetDelay,
                packetLoss: packetLoss
            };
            me.manager.packet.affect((err) => {
                if (err) {
                    alert("Cannot set packet loss: " + err.message);
                }
            }, params);
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
        set: function(object) {
            var window = me.widget.window.window(object);
            var streamIndex = me.core.property.get(window.var.streamIndex, "ui.basic.text");
            if(streamIndex === "Last") {
                streamIndex = 0;
            }
            if(streamIndex === "Combined") {
                streamIndex = -1;
            }
            window.streamIndex = streamIndex;
            me.core.property.notify(window, "app.packets.refreshData");
        }
    };
};
