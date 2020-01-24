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
        Swimlane,
        Field,
        Element,
        Direction,
        Language,
        Text,
        List
    } = react;

    const AppToolbar = ({ languageState, sortState, groupState, yearState }) => {
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
        const yearItems = (me.years || []).map(year => {
            return (<Item key={year} id={year}>{year}</Item>);
        });
        return (
            <Bar>
                <Field label={
                    <>
                        <Text language="eng">Language</Text>
                        <Text language="heb">שפה</Text>
                    </>
                }>
                    <DropDown state={languageState}>
                        {languageItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Sort</Text>
                        <Text language="heb">מיון</Text>
                    </>
                }>
                    <DropDown state={sortState}>
                        {sortItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Group</Text>
                        <Text language="heb">קבוצה</Text>
                    </>
                }>
                    <DropDown state={groupState} multiple={
                        <Item>
                            <Text language="eng">Multiple</Text>
                            <Text language="heb">מספר</Text>
                        </Item>
                    }>
                        <Item id="all" multiple={false}>
                            <Text language="eng">All</Text>
                            <Text language="heb">הכל</Text>
                        </Item>
                        {groupItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Year</Text>
                        <Text language="heb">שנה</Text>
                    </>
                }>
                    <DropDown state={yearState}>
                        <Item id="all" multiple={false}>
                            <Text language="eng">All</Text>
                            <Text language="heb">הכל</Text>
                        </Item>
                        {yearItems}
                    </DropDown>
                </Field>
            </Bar>
        );
    };

    me.imageUrl = function (groupName, sessionName) {
        return "https://screens.sfo2.cdn.digitaloceanspaces.com/" + groupName + "/" + encodeURIComponent(sessionName) + ".png";
    };

    const prepareSessions = (sessions) => {
        var items = [];
        sessions.map(session => {
            let item = items.find(item => item.session === session.session);
            if (!item) {
                item = { extensions: [] };
                items.push(item);
            }
            const { extension, ...map } = session;
            Object.assign(item, { ...item, ...map });
            item.extensions.push(extension);
        });
        items = items.map(item => {
            const tokens = me.sessionTokens(item);
            if (item.extensions.includes("mp4")) {
                item.image = me.imageUrl(item.group, item.session);
            }
            else {
                item.overlay = ui.image.get("mic");
            }
            return { ...item, ...tokens };
        });
        return items;
    };

    const AppHub = ({ groupState, sortState, yearState }) => {
        const [group] = groupState;
        const [sort] = sortState;
        const [year] = yearState;
        react.util.useSubscribe(groupState);
        react.util.useSubscribe(sortState);
        react.util.useSubscribe(yearState);
        let items = me.sessions;
        items = items.filter(item => group[0] === "all" || group.includes(item.group));
        items = items.filter(item => year[0] === "all" || year.includes(item.year));
        items = me.sort.find(item => item.id === sort).sort(items);
        items = items.map(item => (
            <Item key={item.name}>
                <Swimlane label={item.label}>
                    {item.content.map(item => {
                        const title = core.string.title(item.group);
                        const loadSession = () => {
                            core.app.launch("player", item.group, item.session);
                        }
                        return (
                            <Item key={item.session} overlay={item.overlay} image={item.image} onClick={loadSession}>
                                {(group[0] === "all" || group.length > 1) && <Element>{title}</Element>}
                                <Element>{item.date}</Element>
                                <Element className="app-sessions-label" title={item.name}>{item.name}</Element>
                                <Element>{item.durationText}</Element>
                            </Item>
                        );
                    })}
                </Swimlane>
            </Item>
        ));
        return (<List itemSize={377}>
            {items}
        </List>);
    };

    const Main = () => {
        const yearState = react.util.useState(["all"]);
        const groupState = react.util.useState(["all"]);
        const languageState = react.util.useState("eng");
        const sortState = react.util.useState("date");
        const [language] = languageState;
        const direction = me.languages.find(item => item.id === language).direction;
        const state = {
            languageState,
            groupState,
            sortState,
            yearState
        };
        return (
            <Direction direction={direction}>
                <Language language={language}>
                    <AppToolbar {...state} />
                    <AppHub {...state} />
                </Language>
            </Direction>
        );
    };
    me.languages = [
        {
            id: "eng",
            name: "English",
            direction: "ltr",
            locale: "en-US"
        },
        {
            id: "heb",
            name: "עברית",
            direction: "rtl",
            locale: "he-IL"
        }
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
                    return b.date.localeCompare(a.date);
                });
                const swimlanes = {};
                items.map(item => {
                    const unique = item.year + "-" + item.month;
                    let swimlane = swimlanes[unique];
                    if (!swimlane) {
                        swimlane = swimlanes[unique] = { content: [] };
                    }
                    const handler = language => {
                        const date = new Date(item.year, item.month - 1, item.day);
                        const { locale } = me.languages.find(obj => obj.id === language);
                        const month = date.toLocaleString(locale, { month: 'long' });
                        return month + " " + item.year;
                    };
                    swimlane.label = (<Text language={handler} />);
                    item.month + " " + item.year;
                    swimlane.content.push(item);
                });
                return Object.keys(swimlanes).map(unique => swimlanes[unique]);
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
                    return a.name.localeCompare(b.name);
                });
                const swimlanes = {};
                items.map(item => {
                    const unique = item.name[0];
                    let swimlane = swimlanes[unique];
                    if (!swimlane) {
                        swimlane = swimlanes[unique] = { content: [] };
                    }
                    swimlane.label = item.name[0];
                    swimlane.content.push(item);
                });
                return Object.keys(swimlanes).map(unique => swimlanes[unique]);
            }
        },
        {
            id: "duration",
            name: (
                <>
                    <Text language="eng">Duration</Text>
                    <Text language="heb">זמן</Text>
                </>
            ),
            sort: (items) => {
                items = [...items];
                items.sort((a, b) => {
                    return a.duration - b.duration;
                });
                const swimlanes = {};
                items.map(item => {
                    const unique = parseInt(item.duration / 900);
                    let swimlane = swimlanes[unique];
                    if (!swimlane) {
                        swimlane = swimlanes[unique] = { content: [] };
                    }
                    if (!swimlane.label) {
                        if (item.duration) {
                            const time = parseInt(item.duration / 900) * 900;
                            swimlane.label = core.string.formatDuration(time, false, true);
                        }
                        else {
                            swimlane.label = (
                                <>
                                    <Text language="eng">Unknown</Text>
                                    <Text language="heb">לא ידוע</Text>
                                </>
                            );
                        }
                    }
                    swimlane.content.push(item);
                });
                return Object.keys(swimlanes).map(unique => swimlanes[unique]);
            }
        }
    ];
    me.sessionTokens = function (item) {
        let [year, month, day, name = ""] = item.name.split(/(\d{4})-(\d{2})-(\d{2})\s(.+)/g).slice(1);
        const date = [year, month, day].join("-");
        return { year, month, day, date, name: core.path.fileName(name).trim() };
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
        me.sessions = prepareSessions([].concat.apply([], me.groups.map(group => group.sessions)));
        me.years = Array.from(new Set(me.sessions.map(item => item.year)));
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
