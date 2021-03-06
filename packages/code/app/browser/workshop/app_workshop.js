/*
 @author Zakai Hamilton
 @component AppWorkshop
 */

screens.app.workshop = function AppWorkshop(me, { core, ui, widget, lib, react }) {
    const {
        DropDown,
        Item,
        Bar,
        Field,
        Element,
        Direction,
        Language,
        Text,
        Input,
        Clone,
        Separator
    } = react;

    const AppToolbar = ({ meetingState, languageState, filterState, sortState, searchState, sortDirectionState }) => {
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
        const filterItems = (me.filters || []).map(filter => {
            return (<Item key={filter.id} id={filter.id}>{filter.name}</Item>);
        });
        const meetingItems = (me.meetings || []).map(meeting => {
            return (<Item key={meeting.name} id={meeting.id}>{meeting.name.split(" ")[0]}</Item>);
        });
        const noneItem = (<Item id="none" multiple={false}>
            <Text language="eng">None</Text>
            <Text language="heb">אין</Text>
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
                        <Text language="eng">Filter</Text>
                        <Text language="heb">סינון</Text>
                    </>
                }>
                    <DropDown state={filterState}>
                        {noneItem}
                        {filterItems}
                    </DropDown>
                </Field>
                <Field label={
                    <>
                        <Text language="eng">Meeting</Text>
                        <Text language="heb">פגישה</Text>
                    </>
                }>
                    <DropDown state={meetingState}>
                        <Item id={0} hideInList={true}>
                            <Text language="eng">None</Text>
                            <Text language="heb">בלי</Text>
                        </Item>
                        {meetingItems}
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

    const User = ({ user_name, count, active, select, index }) => {
        const disabled = count <= 0;
        if (disabled) {
            select = null;
        }
        return (<Element className={{ "app-workshop-user": true, active: active && !disabled, disabled }} onClick={select}>
            <Element title={user_name} className="app-workshop-user-long-name">{user_name}</Element>
            <Element className="app-workshop-user-short-name">{user_name.split(/[ @]/)[0]}</Element>
            <Element className="app-workshop-user-index">{index + 1}</Element>
        </Element>);
    };

    const AppHub = ({ meetingState, currentUserState, filterState, sortState, searchState, sortDirectionState }) => {
        const [meeting] = meetingState;
        const [currentUserId, setCurrentUserId] = currentUserState;
        const [sort] = sortState;
        const [filter] = filterState;
        const [search] = searchState;
        const [direction] = sortDirectionState;
        let { users = [] } = me.meetings.find(item => item.id === meeting) || {};
        me.filters.forEach(filterItem => {
            if (filter.includes(filterItem.id)) {
                users = filterItem.filter(users);
            }
        });
        users = me.sort.find(item => item.id === sort).sort(users, meeting);
        if (search) {
            users = users.filter(user => user.user_name.toLowerCase().includes(search.toLowerCase()));
        }
        if (direction === "asc") {
            users = users.reverse();
        }
        const children = users.map((user, index) => {
            const selectUser = () => {
                setCurrentUserId(currentUserId !== user.user_id && user.user_id);
            };
            return (
                <User key={user.user_id} {...user} index={index} active={currentUserId === user.user_id} select={selectUser} />
            );
        });
        return (<Element className="app-workshop-users">
            {children}
        </Element>);
    };

    const Main = () => {
        const firstMeetingId = me.meetings && me.meetings.length && me.meetings[0].id;
        const [isOpen, setOpen] = React.useState(true);
        const delayState = React.useState(5000);
        const meetingState = React.useState(firstMeetingId);
        const currentUserState = React.useState(0);
        const languageState = React.useState("eng");
        const sortState = React.useState("date");
        const filterState = React.useState(["meeting"]);
        const sortDirectionState = React.useState("desc");
        const updateState = React.useState(0);
        const searchState = React.useState("");
        const [meetingId, setMeetingId] = meetingState;
        const [language] = languageState;
        const [delay] = delayState;
        const direction = me.languages.find(item => item.id === language).direction;
        React.useEffect(() => {
            if (me.timerHandle) {
                clearInterval(me.timerHandle);
                me.timerHandle = null;
            }
            if (isOpen && delay) {
                me.timerHandle = setInterval(me.loadMeetings, delay);
            }
            me.loadMeetings();
            if (!meetingId) {
                setMeetingId(firstMeetingId);
            }
            return () => {
                if (me.timerHandle) {
                    clearInterval(me.timerHandle);
                    me.timerHandle = null;
                }
            };
        }, [delay, isOpen]);
        React.useEffect(() => {
            if (!meetingId) {
                setMeetingId(firstMeetingId);
            }
        }, [firstMeetingId]);
        me.redraw = () => {
            const [counter, setCounter] = updateState;
            if (!meetingId) {
                setMeetingId(firstMeetingId);
            }
            setCounter(counter + 1);
        };
        me.close = () => {
            me.singleton = null;
            setOpen(false);
        };
        const state = {
            meetingState,
            currentUserState,
            languageState,
            sortState,
            filterState,
            sortDirectionState,
            updateState,
            delayState,
            searchState
        };
        if (!isOpen) {
            return null;
        }
        return (
            <Direction direction={direction}>
                <Language language={language}>
                    <AppToolbar {...state} />
                    <AppHub {...state} />
                </Language>
            </Direction>
        );
    };
    me.meetings = [];
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
                    return b.index - a.index;
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
                    return a.user_name.localeCompare(b.user_name);
                });
                return items;
            }
        },
        {
            id: "shuffle",
            name: (
                <>
                    <Text language="eng">Shuffle</Text>
                    <Text language="heb">ערבוב</Text>
                </>
            ),
            sort: (items, meeting) => {
                items = [...items];
                const meetingHash = parseInt(core.string.hash(meeting));
                let hashId = function (userId) {
                    const idHash = parseInt(core.string.hash(userId));
                    return meetingHash * idHash;
                };
                items.sort((a, b) => {
                    return hashId(a.user_id) - hashId(b.user_id);
                });
                return items;
            }
        }
    ];
    me.filters = [
        {
            id: "online",
            name: (
                <>
                    <Text language="eng">Online</Text>
                    <Text language="heb">אונליין</Text>
                </>
            ),
            filter: (items) => {
                items = items.filter(item => item.count > 0);
                return items;
            }
        },
        {
            id: "meeting",
            name: (
                <>
                    <Text language="eng">Meeting</Text>
                    <Text language="heb">פגישה</Text>
                </>
            ),
            filter: (items) => {
                items = items.filter(item => item.current);
                return items;
            }
        },
        {
            id: "speak",
            name: (
                <>
                    <Text language="eng">Can Speak</Text>
                    <Text language="heb">יכול לדבר</Text>
                </>
            ),
            filter: (items) => {
                items = items.filter(item => {
                    return !(["listening", "work"].find(term => item.user_name.toLowerCase().includes(term)));
                });
                return items;
            }
        }
    ];
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.loadMeetings = async function () {
        me.meetings = await lib.zoom.meetings() || [];
        if (me.redraw) {
            me.redraw();
        }
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            room: ""
        });
        core.property.set(window, "app", me);
        core.property.set(window, "name", "");
    };
    me.visibilityChange = function () {
        const visibilityState = ui.session.visibilityState();
        if (me.singleton && visibilityState === "visible") {
            me.loadMeetings();
        }
    };
    me.render = function Render() {
        return (<Main />);
    };
    me.resize = function () {

    };
};
