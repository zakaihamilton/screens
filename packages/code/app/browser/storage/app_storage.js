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
        Modal,
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
            return (<Item key={idx} id={idx + 1}>{name}</Item>);
        });
        const rootItem = (<Item id={0}>
            <Text language="eng">Home</Text>
            <Text language="heb">בית</Text>
        </Item>);
        const isMobile = core.device.isMobile();
        const PathOrDropDown = isMobile ? DropDown : Path;
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
                    <PathOrDropDown state={pathState} path={true}>
                        {rootItem}
                        {pathItems}
                    </PathOrDropDown>
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

    const RootItem = ({ children, name, pathState }) => {
        const [path, setPath] = pathState;
        const createFolder = async () => {
            await storage.fs.createFolder(core.path.normalize(me.path, "New Folder"));
            await me.loadItems();
        };
        const gotoParentFolder = () => {
            setPath(path.slice(0, path.length - 1));
        };
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <Menu icon="&#9776;" label={
                        <Element className="app-storage-item-name">{name}</Element>
                    }>
                        <Item onClick={gotoParentFolder} disable={!path.length}>
                            <>
                                <Text language="eng">Goto Parent Folder</Text>
                                <Text language="heb">לך לתיקיה העליונה</Text>
                            </>
                        </Item>
                        <Separator />
                        <Item onClick={createFolder}>
                            <>
                                <Text language="eng">Create Folder</Text>
                                <Text language="heb">יצירת תיקיה</Text>
                            </>
                        </Item>
                    </Menu>
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };
    const StorageItem = ({ name, select }) => {
        const [hoverRef, hover] = react.util.useHover();
        const editRef = React.useRef();
        const editMode = react.util.useState(false);
        const editState = react.util.useState(name);
        const [inEditMode, setEditMode, subscribeEditMode, unsubscribeEditMode] = editMode;
        const [editText, setEditText] = editState;
        const deleteItem = async () => {
            await storage.fs.delete(core.path.normalize(me.path, name));
            await me.loadItems();
        };
        const renameTo = async (text) => {
            if (name === text) {
                return;
            }
            const source = core.path.normalize(me.path, name);
            const target = core.path.normalize(me.path, text);
            await storage.fs.rename(source, target);
            await me.loadItems();
        };
        const onSubmit = (text) => {
            setEditMode(false);
            renameTo(text);
        };
        React.useEffect(() => {
            const handler = inEditMode => {
                if (!inEditMode) {
                    renameTo(editText);
                }
            };
            subscribeEditMode(handler);
            return () => unsubscribeEditMode(handler);
        }, []);
        React.useEffect(() => {
            if (inEditMode && editRef.current) {
                editRef.current.focus();
            }
        }, [inEditMode]);
        const renameItem = async () => {
            setEditMode(true);
        };
        let content = (<Element className="app-storage-item-label">{name}</Element>);
        let onClick = select;
        if (inEditMode) {
            content = (
                <>
                    <Modal open={editMode} />
                    <Input ref={editRef} className="app-storage-item-edit" onSubmit={onSubmit} state={editState} />
                </>
            );
            onClick = null;
        }
        return (<Element className={{ "app-storage-item": true, active: true, hover: !inEditMode && hover }}>
            <Menu icon={(<b>&#8942;</b>)}>
                <Item onClick={deleteItem}>
                    <>
                        <Text language="eng">Delete</Text>
                        <Text language="heb">מחיקה</Text>
                    </>
                </Item>
                <Separator />
                <Item onClick={renameItem}>
                    <>
                        <Text language="eng">Rename</Text>
                        <Text language="heb">שינוי שם</Text>
                    </>
                </Item>
            </Menu>
            <Element title={name} ref={hoverRef} className="app-storage-item-name" onClick={onClick}>{content}</Element>
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
                const select = () => {
                    if (item.type === "folder") {
                        setPath([...path.filter(Boolean), item.name]);
                    }
                    else if (item.type === "file") {

                    }
                }
                return (
                    <StorageItem key={item.name} {...item} select={select} />
                );
            });
            return items;
        }, [counter, path, sort, direction, search]);
        return (<RootItem name={name} pathState={pathState}>
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
        me.path = "";
        await me.loadItems();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.loadItems = async function () {
        me.items = await storage.fs.list("/" + me.path);
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
