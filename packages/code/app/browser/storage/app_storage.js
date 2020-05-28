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
        TextArea,
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

    const FolderHeader = ({ children, name, pathState }) => {
        const [path, setPath] = pathState;
        const createFolder = async () => {
            me.create = { type: "folder", name: "" };
            await me.updateView();
        };
        const createFile = async () => {
            me.create = { type: "file", name: "" };
            await me.updateView();
        };
        const gotoFolder = () => {
            setPath(path.slice(0, path.length - 1));
        };
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <Menu icon="&#9776;" label={
                        <Element className="app-storage-item-name">{name}</Element>
                    }>
                        <Item onClick={gotoFolder} disable={!path.length}>
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
                        <Item onClick={createFile}>
                            <>
                                <Text language="eng">Create File</Text>
                                <Text language="heb">יצירת קובץ</Text>
                            </>
                        </Item>
                    </Menu>
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };

    const StorageItem = ({ name, select, edit, type }) => {
        const [hoverRef, hover] = react.util.useHover();
        const editVisibility = React.useState(edit && edit.editVisibility);
        const editTextState = React.useState(name);
        const editModeState = React.useState(edit && edit.editMode);
        const [editMode, setEditMode] = editModeState;
        const [isEditVisibile, showEdit] = editVisibility;
        const [editText, setEditText] = editTextState;
        const deleteItem = async () => {
            await storage.fs.delete(core.path.normalize(me.path, name));
            await me.updateView();
        };
        const renameTo = async (text) => {
            if (name !== text && text) {
                const source = core.path.normalize(me.path, name);
                const target = core.path.normalize(me.path, text);
                try {
                    if (name) {
                        await storage.fs.rename(source, target);
                    }
                    else if (type === "folder") {
                        await storage.fs.mkdir(target);
                    }
                    else if (type === "file") {
                        await storage.fs.writeFile(target, "", "utf8");
                    }
                }
                catch (err) {
                    setEditText(name);
                }
            }
            me.create = null;
            await me.updateView();
        };
        const onSubmit = async (text) => {
            await renameTo(text);
            showEdit(false);
            setEditMode(false);
        };
        React.useEffect(() => {
            if (editMode && !isEditVisibile) {
                renameTo(editText);
                setEditMode(false);
            }
        }, [editText, isEditVisibile]);
        const renameItem = async () => {
            showEdit(true);
            setEditMode(true);
        };
        let content = (<Element className="app-storage-item-label">{name}</Element>);
        let onClick = select;
        if (isEditVisibile) {
            content = (
                <>
                    <Modal open={editVisibility} />
                    <Input className="app-storage-item-edit" onSubmit={onSubmit} state={editTextState} focus={true} />
                </>
            );
            onClick = null;
        }
        return (<Element className={{ "app-storage-item": true, active: true, hover: !isEditVisibile && hover }}>
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
            <Element title={name} ref={hoverRef} className="app-storage-item-name" onClick={onClick}>
                <Element title={core.string.title(type)} width="32px" height="32px" className={`app-storage-icon app-storage-${type}-icon`}></Element>
                {content}
            </Element>
        </Element>);
    };

    const FolderView = ({ pathState, viewTypeState, sortState, searchState, sortDirectionState, updateState }) => {
        const [path, setPath] = pathState;
        const [viewType, setViewType] = viewTypeState;
        const [sort] = sortState;
        const [search] = searchState;
        const [direction] = sortDirectionState;
        const [counter] = updateState;
        let name = path[path.length - 1];
        if (!name) {
            name = (<>
                <Text language="eng">Home</Text>
                <Text language="heb">בית</Text>
            </>);
        }
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
                setPath([...path.filter(Boolean), item.name]);
                setViewType(item.type);
            }
            return (
                <StorageItem key={item.name} {...item} select={select} />
            );
        });
        if (me.create) {
            items.unshift(<StorageItem {...me.create} key="new folder" edit={{ editVisibility: true, editMode: true }} />);
        }
        return (<FolderHeader name={name} pathState={pathState}>
            {items}
        </FolderHeader>);
    };

    const FileHeader = ({ children, name, pathState, viewTypeState }) => {
        const [viewType, setViewType] = viewTypeState;
        const [path, setPath] = pathState;
        const gotoFolder = () => {
            setPath(path.slice(0, path.length - 1));
            setViewType("folder");
        };
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <Menu icon="&#9776;" label={
                        <Element className="app-storage-item-name">{name}</Element>
                    }>
                        <Item onClick={gotoFolder}>
                            <>
                                <Text language="eng">Goto Folder</Text>
                                <Text language="heb">לך לתיקיה</Text>
                            </>
                        </Item>
                    </Menu>
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };

    const FileView = ({ pathState, viewTypeState }) => {
        const counter = react.util.useResize();
        const [ref, width, height] = react.util.useSize(counter);
        const textState = [me.content, async (content) => {
            await storage.fs.writeFile("/" + me.path, content);
        }];
        const style = {
            width: width + "px",
            height: height + "px",
            resize: "none",
            flex: "1",
            backgroundColor: "var(--chrome-background)",
            color: "var(--chrome-color)"
        };
        return (<FileHeader name={name} pathState={pathState} viewTypeState={viewTypeState}>
            <TextArea ref={ref} focus={true} wrap="off" state={textState} style={style} />
        </FileHeader>);
    };

    const Main = () => {
        const [isOpen, setOpen] = React.useState(true);
        const delayState = React.useState(5000);
        const languageState = React.useState("eng");
        const sortState = React.useState("name");
        const sortDirectionState = React.useState("desc");
        const updateState = React.useState(0);
        const searchState = React.useState("");
        const pathState = React.useState(me.path.split("/").filter(Boolean));
        const viewTypeState = React.useState(me.viewType);
        const [path, setPath] = pathState;
        const [viewType, setViewType] = viewTypeState;
        pathState[1] = React.useCallback(path => {
            me.viewType = "folder";
            setViewType(me.viewType);
            setPath(path);
        });
        React.useEffect(() => {
            me.path = path.join("/");
        }, [path]);
        React.useEffect(() => {
            me.viewType = viewType;
        }, [viewType]);
        React.useEffect(() => {
            me.updateView();
        }, [path, viewType]);
        const [language] = languageState;
        const [delay] = delayState;
        const direction = me.languages.find(item => item.id === language).direction;
        React.useEffect(() => {
            me.redraw = () => {
                setTimeout(() => {
                    const [counter, setCounter] = updateState;
                    setCounter(counter + 1);
                });
            };
            me.close = () => {
                me.singleton = null;
                setOpen(false);
            };
        });
        const state = {
            pathState,
            viewTypeState,
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
                    {viewType === "folder" && <FolderView {...state} />}
                    {viewType === "file" && <FileView {...state} />}
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
        me.viewType = "folder";
        await me.updateView();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.updateView = async function () {
        console.log("viewType: " + me.viewType + " path: " + me.path);
        if (me.viewType === "folder") {
            me.items = await storage.fs.list("/" + me.path);
        }
        else if (me.viewType === "file") {
            me.content = await storage.fs.readFile("/" + me.path, "utf8");
        }
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
            me.updateView();
        }
    };
    me.render = function (object) {
        return (<Main />);
    };
    me.resize = function (object) {

    };
};
