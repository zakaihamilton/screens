/*
 @author Zakai Hamilton
 @component AppZoom
 */

screens.app.zoom = function AppZoom(me, packages) {
    const { core, ui, lib } = packages;
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.meetingInfo = await lib.zoom.meetingInfo();
        me.singleton = ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.joinUrl = function () {
        return me.meetingInfo.join_url;
    };
    me.meetingId = function () {
        return me.meetingInfo.id;
    };
    me.date = function () {
        return core.server.date();
    };
    me.callNumber = function (object, value) {
        return "tel:+" + value + "," + me.meetingInfo.id + ",#,#";
    };
};
