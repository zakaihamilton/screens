/*
 @author Zakai Hamilton
 @component AppZoom
 */

screens.app.zoom = function AppZoom(me) {
    me.launch = async function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.meetingInfo = await me.lib.zoom.meetingInfo();
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.joinUrl = function () {
        return me.meetingInfo.join_url;
    };
    me.meetingId = function () {
        return me.meetingInfo.id;
    };
    me.date = function () {
        return me.core.server.date();
    };
    me.callNumber = function (object, value) {
        return "tel:+" + value + "," + me.meetingInfo.id + ",#,#";
    };
};
