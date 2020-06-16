/*
 @author Zakai Hamilton
 @component AppSessions
 */

screens.app.sessions = function AppSessions(me, { core, ui, widget, media, react }) {
    const {
        DropDown,
        Item,
        Bar,
        Swimlane,
        Field,
        Element,
        Direction,
        Language,
        Text,
        List,
        Input,
        Clone,
        Separator,
        Spinner
    } = react;

    const AppToolbar = ({ languageState, sortState, sortDirectionState, groupState, yearState, searchState }) => {
        const languageItems = (me.languages || []).map(language => {
            const name = core.string.title(language.name);
            return (<Item key={language.id} id={language.id}>{name}</Item>);
        });
        const sortItems = (me.sort || []).map(sort => {
            return (<Item key={sort.id} id={sort.id}>{sort.name}</Item>);
        });
        const sortDirectionItems = (me.sortDirection || []).map(sort => {
            return (<Item key={sort.id} id={sort.id}>{sort.name}</Item>);
        });
        const groupItems = (me.groups || []).map(group => {
            const name = core.string.title(group.name);
            return (<Item key={group.name} id={group.name}>{name}</Item>);
        });
        const yearItems = (me.years || []).map(year => {
            return (<Item key={year} id={year}>{year}</Item>);
        });
        const allItem = (<Item id="all" multiple={false}>
            <Text language="eng">All</Text>
            <Text language="heb">הכל</Text>
        </Item>);

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
                        <Separator />
                        <Clone state={sortDirectionState} hideCurrent={true}>
                            {sortDirectionItems}
                        </Clone>
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
                        {allItem}
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
                        {allItem}
                        {yearItems}
                    </DropDown>
                </Field>
                <Element style={{ flex: 1 }}></Element>
                <Field label={
                    <>
                        <Text language="eng">Search</Text>
                        <Text language="heb">חיפוש</Text>
                    </>
                }>
                    <Input size="1em" type="Search" state={searchState} />
                </Field>
            </Bar>
        );
    };

    me.imageUrl = function (groupName, sessionName) {
        const [, year] = sessionName.match(/([0-9]*)-.*/);
        return "https://screens.sfo2.cdn.digitaloceanspaces.com/" + groupName + "/" + year + "/" + encodeURIComponent(sessionName) + ".png";
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
        items.sort((a, b) => {
            return b.date.localeCompare(a.date);
        });
        items.map((item, index) => {
            item.index = items.length - index;
        });
        return items;
    };

    const AppHub = ({ groupState, sortState, sortDirectionState, yearState, searchState }) => {
        const [group] = groupState;
        const [sort] = sortState;
        const [direction] = sortDirectionState;
        const [year] = yearState;
        const [search] = searchState;
        let items = me.sessions;
        if (!items) {
            return (<Element className="app-sessions-loading" key="loadingItems">
                <Spinner delay={250}>
                    <Text language="eng">Loading...</Text>
                    <Text language="heb">טוען...</Text>
                </Spinner>
            </Element>);
        }
        const compare = (item, fields, search) => {
            if (!search) {
                return true;
            }
            for (const field of fields) {
                if (core.string.caselessInclude(item[field], search)) {
                    return true;
                }
            }
        };
        items = items.filter(item => group[0] === "all" || group.includes(item.group));
        items = items.filter(item => year[0] === "all" || year.includes(item.year));
        if (search) {
            items = items.filter(item => {
                return compare(item, ["date", "name", "index", "durationText"], search);
            });
        }
        items = me.sort.find(item => item.id === sort).sort(items);
        if (direction === "asc") {
            items = items.reverse();
        }
        items = items.map(item => (
            <Item key={item.id}>
                <Swimlane label={item.label}>
                    {item.content.map(item => {
                        const group = core.string.title(item.group);
                        const loadSession = () => {
                            core.app.launch("player", item.group, item.session);
                        };
                        return (
                            <Item key={item.group + item.session} overlay={item.overlay} image={item.image} title={item.name} onClick={loadSession}>
                                <Element className="app-sessions-row">
                                    <Element>#{item.index}</Element>
                                    {(group[0] === "all" || group.length > 1) && (
                                        <Element direction="auto" key={group}>{group}</Element>
                                    )}
                                </Element>
                                <Element className="app-sessions-row">
                                    <Element>{item.date}</Element>
                                    <Element>{item.durationText}</Element>
                                </Element>
                            </Item>
                        );
                    })}
                </Swimlane>
            </Item>
        ));
        return (<List itemSize={20} unit="em">
            {items}
        </List>);
    };

    const Main = () => {
        const yearState = React.useState(["all"]);
        const groupState = React.useState(["all"]);
        const languageState = React.useState("eng");
        const sortState = React.useState("date");
        const sortDirectionState = React.useState("desc");
        const searchState = React.useState("");
        const updateState = React.useState(0);
        const [language] = languageState;
        const direction = me.languages.find(item => item.id === language).direction;
        React.useEffect(() => {
            me.loadData();
        }, []);
        me.redraw = () => {
            const [counter, setCounter] = updateState;
            setCounter(counter + 1);
        };
        const state = {
            languageState,
            groupState,
            sortState,
            sortDirectionState,
            yearState,
            searchState,
            updateState
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
    me.groups = [];
    me.sessions = null;
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
    me.sortDirection = [
        {
            id: "asc",
            name: (
                <>
                    <Text language="eng">Ascending</Text>
                    <Text language="heb">עולה</Text>
                </>
            )
        },
        {
            id: "desc",
            name: (
                <>
                    <Text language="eng">Descending</Text>
                    <Text language="heb">יורד</Text>
                </>
            )
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
                        const month = date.toLocaleString(locale, { month: "long" });
                        return month + " " + item.year;
                    };
                    swimlane.id = item.month + " " + item.year;
                    swimlane.label = (<Text language={handler} />);
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
                    swimlane.id = item.name[0];
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
                    swimlane.id = unique;
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
    };
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.loadData = async function (update) {
        const { groups, metadataList } = await media.sessions.list(update);
        me.groups = groups;
        me.metadataList = metadataList;
        me.sessions = prepareSessions([].concat.apply([], me.groups.map(group => group.sessions)));
        me.years = Array.from(new Set(me.sessions.map(item => item.year)));
        if (me.redraw) {
            me.redraw();
        }
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            groupName: "American"
        });
        core.property.set(window, "app", me);
        core.property.set(window, "name", "");
    };
    me.visibilityChange = function () {
        const visibilityState = ui.session.visibilityState();
        if (visibilityState === "visible") {
            me.loadData();
        }
    };
    me.render = function Render() {
        return (<Main />);
    };
    me.resize = function () {

    };
};
