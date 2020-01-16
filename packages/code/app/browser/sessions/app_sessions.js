/*
 @author Zakai Hamilton
 @component AppSessions
 */

screens.app.sessions = function AppSessions(me, { core, ui, widget, react }) {
    const { Tabs, Item } = react;

    const Main = () => {
        const state = React.useState("american");
        const groupItems = (me.groups || []).map(group => {
            const name = core.string.title(group.name);
            return (<Item key={group.name} id={group.name}>{name}</Item>);
        });
        return (<Tabs state={state}>
            {groupItems}
        </Tabs>);
    };
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.ready = function (methods) {
        methods["app.sessions.setGroups"] = ["media.file.groups"];
        methods["app.sessions.setMetadataList"] = ["db.shared.metadata.list", { user: "$userId" }];
    };
    me.setGroups = function (groups) {
        me.groups = groups;
    };
    me.setMetadataList = function (metadataList) {
        me.metadataList = metadataList;
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            groupName: "American"
        });
        core.property.set(window, "app", me);
        core.property.set(window, "name", "");
    };
    me.render = function (object) {
        return (<Main />);
    };
    me.resize = function (object) {

    };
};
