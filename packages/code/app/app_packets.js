/*
 @author Zakai Hamilton
 @component AppPackets
 */

package.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.init = function () {
        me.ui.options.load(me, null, {
            "autoRefresh": true
        });
        me.autoRefresh = me.ui.options.toggleSet(me, "autoRefresh", me.refresh.set);
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if (me.options.autoRefresh) {
                setTimeout(() => {
                    me.core.property.set(window, "app.packets.refresh");
                }, 5000);
            }
            me.manager.packet.info((info) => {
                me.core.property.set(window.var.packetCount, "ui.basic.text", info.packetCount);
                me.core.property.set(window.var.dataSize, "ui.basic.text", info.dataSize);
                window.packetInfo = info;
                me.core.property.set(window.var.chart, "data", "@app.packets.data");
                me.core.property.notify(window.var.chart, "update", {"duration":0});
            });
        }
    };
    me.reset = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.manager.packet.reset(() => {
                me.core.property.notify(window, "app.packets.refresh");
            });
        }
    };
    me.data = {
        get: function (object) {
            var window = me.widget.window.window(object);
            if(!window || !window.packetInfo || !window.packetInfo.packets) {
                return [];
            }
            function dateRel(sec) {
                return me.widget.chart.dateRel(sec);
            }
            var colors = ["red","blue","green","yellow","orange"];
            var data = {datasets:[],labels:[]};
            var colorIndex = 0;
            for(var sourceIp in window.packetInfo.packets) {
                var targets = window.packetInfo.packets[sourceIp];
                for(var targetIp in targets) {
                    var target = targets[targetIp];
                    var dataset = {
                        label: sourceIp + " -> " + targetIp,
                        backgroundColor: colors[colorIndex],
                        borderColor: colors[colorIndex],
                        fill: false,
                        lineTension:0,
                        data: []
                    };
                    colorIndex++;
                    dataset.data = [];
                    for(var time in target.items) {
                        var item = target.items[time];
                        dataset.data.push({
                            x: dateRel(item.end),
                            y: item.len/1000
                        });
                    }
                    data.datasets.push(dataset);
                }
            }
            return data;
        }
    };
};
