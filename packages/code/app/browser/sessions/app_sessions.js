/*
 @author Zakai Hamilton
 @component AppSessions
 */

screens.app.sessions = function AppSessions(me, { core, ui, widget, react }) {
    const {
        DropDown,
        Tabs,
        Item,
        Bar,
        Field,
        Element,
        Direction,
        Language,
        Text,
        List
    } = react;

    const AppToolbar = ({ languageState, sortState, groupState }) => {
        const languageItems = (me.languages || []).map(language => {
            const name = core.string.title(language.name);
            return (<Item key={language.id} id={language.id}>{name}</Item>);
        });
        const sortItems = (me.sort || []).map(sort => {
            return (<Item key={sort.id} id={sort.id}>{sort.name}</Item>);
        });
        const groupItems = (me.groups || []).map(group => {
            const name = core.string.title(group.name);
            return (<Item key={group.name} id={group.name}>{name}</Item>);
        });
        return (
            <Bar>
                <Field label={
                    <>
                        <Text language="eng">Language:</Text>
                        <Text language="heb">שפה:</Text>
                    </>
                }>
                    <DropDown state={languageState}>
                        {languageItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Sort:</Text>
                        <Text language="heb">מיון:</Text>
                    </>
                }>
                    <DropDown state={sortState}>
                        {sortItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Group:</Text>
                        <Text language="heb">קבוצה:</Text>
                    </>
                }>
                    <DropDown state={groupState}>
                        <Item id="all" multiple={false}>
                            <Text language="eng">All</Text>
                            <Text language="heb">הכל</Text>
                        </Item>
                        {groupItems}
                    </DropDown>
                </Field>
            </Bar>
        );
    };

    const filterSessions = (sessions) => {
        var name_map = new Map(sessions.map(obj => [obj.name, obj]));
        var unique_names = [...name_map.values()];
        return unique_names;
    };

    const AppHub = ({ groupState, sortState }) => {
        const [groups] = groupState;
        const [sort] = sortState;
        react.util.useSubscribe(groupState);
        react.util.useSubscribe(sortState);
        let items = filterSessions([].concat.apply([], me.groups.filter(group => groups[0] === "all" || groups.includes(group.name)).map(group => group.sessions)));
        console.log("sort", sort);
        items = me.sort.find(item => item.id === sort).sort(items);
        const names = items.map(item => (<Item key={item.name}>{item.name}</Item>));
        return (<List>
            {names}
        </List>);
    };

    const Main = () => {
        const groupState = react.util.useState(["american"]);
        const languageState = react.util.useState("eng");
        const sortState = react.util.useState("date");
        const [language] = languageState;
        const direction = me.languages.find(item => item.id === language).direction;
        const state = {
            languageState,
            groupState,
            sortState
        };
        return (
            <Direction direction={direction}>
                <Language language={language}>
                    <Element className="app-sessions-main">
                        <AppToolbar {...state} />
                        <AppHub {...state} />
                    </Element>
                </Language>
            </Direction>
        );
    };
    me.languages = [
        { id: "eng", name: "English", direction: "ltr" },
        { id: "heb", name: "עברית", direction: "rtl" }
    ];
    me.sort = [
        {
            id: "date",
            name: (
                <>
                    <Text language="eng">Date</Text>
                    <Text language="heb">תאריך</Text>
                </>
            ),
            sort: (items) => {
                items = [...items];
                items.sort((a, b) => {
                    const aTokens = me.sessionTokens(a);
                    const bTokens = me.sessionTokens(b);
                    return bTokens.date.localeCompare(aTokens.date);
                });
                return items;
            }
        },
        {
            id: "name",
            name: (
                <>
                    <Text language="eng">Name</Text>
                    <Text language="heb">שם</Text>
                </>
            ),
            sort: (items) => {
                items = [...items];
                items.sort((a, b) => {
                    const aTokens = me.sessionTokens(a);
                    const bTokens = me.sessionTokens(b);
                    return aTokens.name.localeCompare(bTokens.name);
                });
                return items;
            }
        }
    ];
    me.sessionTokens = function (item) {
        let [year, month, day, name = ""] = item.name.split(/(\d{4})-(\d{2})-(\d{2})\s(.+)/g).slice(1);
        const date = [year, month, day].join("-");
        return { year, month, day, date, name };
    }
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
