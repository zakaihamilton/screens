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
                }, 1000);
            }
            me.manager.packet.info((info) => {
                me.core.property.set(window.var.packetCount, "ui.basic.text", info.packetCount);
                me.core.property.set(window.var.dataSize, "ui.basic.text", info.dataSize);
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
            function dateNow(sec) {
                return me.widget.chart.dateNow(sec, "d");
            }
            function dateNowString(sec) {
                return me.widget.chart.dateNowString(sec, "d");
            }
            return [
                [
                    {x: dateNow(1), y: 1},
                    {x: dateNow(2), y: 20},
                    {x: dateNow(3), y: 50},
                    {x: dateNow(4), y: -30},
                    {x: dateNow(5), y: 60},
                    {x: dateNow(6), y: 76},
                    {x: dateNow(7), y: 32},
                    {x: dateNow(8), y: 24},
                    {x: dateNow(9), y: 72},
                    {x: dateNow(10), y: 34}
                ],
                [
                    {x: dateNowString(1), y: 10},
                    {x: dateNowString(2), y: 5},
                    {x: dateNowString(3), y: 20},
                    {x: dateNowString(4), y: 30},
                    {x: dateNowString(5), y: 40},
                    {x: dateNowString(6), y: 86},
                    {x: dateNowString(7), y: 22},
                    {x: dateNowString(8), y: 14},
                    {x: dateNowString(9), y: 42},
                    {x: dateNowString(10), y: 34}
                ]                
            ];
        }
    };
};
