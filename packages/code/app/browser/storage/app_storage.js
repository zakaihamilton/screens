/*
 @author Zakai Hamilton
 @component AppStorage
 */

screens.app.storage = function AppStorage(me, { core, ui, widget, storage, react }) {
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
        Path,
        Separator,
        Menu
    } = react;

    const AppToolbar = ({ pathState, languageState, sortState, searchState, sortDirectionState }) => {
        const [path] = pathState;
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
        const pathItems = (path || []).map((name, idx) => {
            return (<Item key={idx} id={idx}>{name}</Item>);
        });
        const noneItem = (<Item id="none" multiple={false}>
            <Text language="eng">None</Text>
            <Text language="heb">אין</Text>
        </Item>);
        const rootItem = (<Item id="none" multiple={false}>
            <Text language="eng">Home</Text>
            <Text language="heb">בית</Text>
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
                        <Text language="eng">Path</Text>
                        <Text language="heb">נתיב</Text>
                    </>
                }>
                    <Path state={pathState}>
                        {rootItem}
                        {pathItems}
                    </Path>
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

    const RootItem = ({ children, name }) => {
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false }}>
                    <Menu>
                        <Item>Create Folder...</Item>
                    </Menu>
                    <Element className="app-storage-item-name">{name}</Element>
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };
    const FolderItem = ({ name, count, active, select }) => {
        const disabled = count <= 0;
        if (disabled) {
            select = null;
        }
        return (<Element className={{ "app-storage-item": true, active: active && !disabled, disabled }} onClick={select}>
            <Element title={name} className="app-storage-item-name">{name}</Element>
        </Element>);
    };

    const AppHub = ({ pathState, sortState, searchState, sortDirectionState, updateState }) => {
        const [path, setPath] = pathState;
        const [sort] = sortState;
        const [search] = searchState;
        const [direction] = sortDirectionState;
        const [counter] = updateState;
        react.util.useSubscribe(pathState);
        react.util.useSubscribe(sortState);
        react.util.useSubscribe(updateState);
        react.util.useSubscribe(searchState);
        let name = path[path.length - 1];
        if (!name) {
            name = (<>
                <Text language="eng">Home</Text>
                <Text language="heb">בית</Text>
            </>);
        }
        const children = react.util.useData(() => {
            let items = me.items || [];
            items = me.sort.find(item => item.id === sort).sort(items);
            if (search) {
                items = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
            }
            if (direction === "asc") {
                items = items.reverse();
            }
            items = items.map(item => {
                const selectFolder = () => {
                    setPath([...me.path, item.name]);
                }
                return (
                    <FolderItem key={item.name} {...item} select={selectFolder} />
                );
            });
            return items;
        }, [counter, path, sort, direction, search]);
        return (<RootItem name={name}>
            {children}
        </RootItem>);
    };

    const Main = () => {
        const [isOpen, setOpen] = react.util.useState(true);
        const delayState = react.util.useState(5000);
        const languageState = react.util.useState("eng");
        const sortState = react.util.useState("name");
        const sortDirectionState = react.util.useState("desc");
        const updateState = react.util.useState(0);
        const searchState = react.util.useState("");
        const pathState = react.util.makeState([me.path.split("/").filter(Boolean), value => {
            me.path = value.join("/");
            if (!me.path) {
                me.path = "/";
            }
            me.loadItems();
        }]);
        const [language] = languageState;
        const [delay] = delayState;
        const direction = me.languages.find(item => item.id === language).direction;
        me.redraw = () => {
            const [counter, setCounter] = updateState;
            setCounter(counter + 1);
        };
        me.close = () => {
            me.singleton = null;
            setOpen(false);
        };
        const state = {
            pathState,
            languageState,
            sortState,
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
                return items;
            }
        }
    ];
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.path = "/";
        await me.loadItems();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.loadItems = async function () {
        me.items = await storage.fs.list(me.path);
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
            me.loadItems();
        }
    };
    me.render = function (object) {
        return (<Main />);
    };
    me.resize = function (object) {

    };
};
