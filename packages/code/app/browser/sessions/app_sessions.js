/*
 @author Zakai Hamilton
 @component AppSessions
 */

screens.app.sessions = function AppSessions(me, { core, ui, widget, react }) {
    const { DropDown, Tabs, Item, Bar, Field, Element, Direction } = react;

    const AppToolbar = ({ languageState, groupState }) => {
        const languageItems = (me.languages || []).map(language => {
            const name = core.string.title(language.name);
            return (<Item key={language.id} id={language.id}>{name}</Item>);
        });
        const groupItems = (me.groups || []).map(group => {
            const name = core.string.title(group.name);
            return (<Item key={group.name} id={group.name}>{name}</Item>);
        });
        return (
            <Bar>
                <Field label="Language:">
                    <DropDown state={languageState}>
                        {languageItems}
                    </DropDown>
                </Field>
                <Field label="Group:">
                    <DropDown state={groupState}>
                        <Item id="all" multiple={false}>All</Item>
                        {groupItems}
                    </DropDown>
                </Field>

            </Bar>
        );
    };
    const Main = () => {
        const languageState = React.useState("eng");
        const [language] = languageState;
        const direction = me.languages.find(item => item.id === language).direction;
        const groupState = React.useState(["american"]);
        const state = {
            languageState,
            groupState
        };
        return <Direction direction={direction}>
            <Element className="app-sessions-main">
                <AppToolbar {...state} />
            </Element>
        </Direction>;
    };
    me.languages = [
        { id: "eng", name: "English", direction: "ltr" },
        { id: "heb", name: "עברית", direction: "rtl" }
    ];
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
