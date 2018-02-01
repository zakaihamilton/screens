/*
 @author Zakai Hamilton
 @component AppPackets
 */

package.app.packets = function AppPackets(me) {
    me.launch = function (args) {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.init = function() {
        me.ui.options.load(me, null, {
            "autoRefresh": true
        });
        me.autoRefresh = me.ui.options.toggleSet(me, "autoRefresh", me.refresh.set);
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if(me.options.autoRefresh) {
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
    me.clearall = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.manager.packet.reset(() => {
                me.core.property.notify(window, "app.packets.refresh");
            });
        }
    };
};
