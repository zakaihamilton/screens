/*
 @author Zakai Hamilton
 @component AppZoom
 */

screens.app.zoom = function AppZoom(me) {
    me.init = async function() {
        me.meetingInfo = await me.lib.zoom.meetingInfo();
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
    me.joinUrl = function (object) {
        return me.meetingInfo.join_url;
    };
    me.meetingId = function(object) {
        return me.meetingInfo.id;
    };
    me.date = function (object) {
        return me.core.server.date();
    };
    me.callNumber = function(object, value) {
        return "tel:+" + value + "," + me.meetingInfo.id + ",#,#";
    };
};
