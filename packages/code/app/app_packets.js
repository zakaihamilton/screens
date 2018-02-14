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
        me.ui.options.load(me, null, {
            "autoRefresh": true,
            "packetLoss": "None",
            "dataProfile": "Live"
        });
        me.autoRefresh = me.ui.options.toggleSet(me, "autoRefresh", me.refreshData.set);
        me.dataProfile = me.ui.options.choiceSet(me, "dataProfile", (object, options, key, value) => {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window, "app.packets.refreshData", value);
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
            var window = me.widget.window.mainWindow(object);
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
    me.updateData = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var packetCount = 0;
            var dataSize = 0;
            if (window.packetInfo) {
                packetCount = window.packetInfo.packetCount;
                dataSize = window.packetInfo.dataSize;
                me.core.property.set(window.var.packetCount, "ui.basic.text", packetCount);
                me.core.property.set(window.var.dataSize, "ui.basic.text", dataSize);
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
                me.core.property.set(window, "app.packets.dataProfile", "Live");
            });
        }
    };
    me.data = {
        get: function (object) {
            var window = me.widget.window.window(object);
            if (!window || !window.packetInfo || !window.packetInfo.packets) {
                return [];
            }
            function dateRel(sec) {
                return me.widget.chart.dateRel(sec);
            }
            var colors = ["red", "blue", "green", "yellow", "orange"];
            var data = {datasets: [], labels: []};
            var colorIndex = 0;
            for (var sourceIp in window.packetInfo.packets) {
                var targets = window.packetInfo.packets[sourceIp];
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
                    var dataset = {
                        label: label,
                        backgroundColor: colors[colorIndex],
                        borderColor: colors[colorIndex],
                        fill: false,
                        data: []
                    };
                    colorIndex++;
                    dataset.data = [];
                    for (var time in target.items) {
                        var item = target.items[time];
                        dataset.data.push({
                            x: dateRel(item.end),
                            y: item.len / 1000
                        });
                    }
                    dataset.data.pop();
                }
                data.datasets.push(dataset);
            }
            return data;
        }
    };
    me.affect = {
        set: function (object) {
            var packetLoss = me.options.packetLoss;
            if (packetLoss === "None") {
                packetLoss = "";
            }
            var packetDelay = me.options.packetDelay;
            if (packetDelay === "None") {
                packetDelay = "";
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
            var window = me.widget.window.mainWindow(object);
            var text = JSON.stringify(window.packetInfo);
            return text;
        },
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
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
};
