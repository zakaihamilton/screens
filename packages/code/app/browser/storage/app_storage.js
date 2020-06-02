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

    const AppToolbar = ({ state }) => {
        const { sourceState, filterState, pathState, languageState, sortState, searchState, sortDirectionState } = state;
        const [path] = pathState;
        const languageItems = (me.languages || []).map(language => {
            const name = core.string.title(language.name);
            return (<Item key={language.id} id={language.id}>{name}</Item>);
        });
        const sortItems = (me.sort || []).map(sort => {
            return (<Item key={sort.id} id={sort.id}>{sort.name}</Item>);
        });
        const filterItems = (me.filter || []).map(filter => {
            return (<Item key={filter.id} id={filter.id}>{filter.name}</Item>);
        });
        const sortDirectionItems = (me.sortDirection || []).map(sort => {
            return (<Item key={sort.id} id={sort.id}>{sort.name}</Item>);
        });
        const pathItems = (path || []).map((name, idx) => {
            return (<Item key={idx} id={idx + 1}>{name}</Item>);
        });
        const sourceItems = (me.sources || []).map(source => {
            return (<Item key={source.id} id={source.id}>{source.name}</Item>);
        });
        const rootItem = (<Item id={0}>
            <Text language="eng">Home</Text>
            <Text language="heb">בית</Text>
        </Item>);
        const noneItem = (<Item id="none" multiple={false}>
            <Text language="eng">None</Text>
            <Text language="heb">אין</Text>
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
                        <Text language="eng">Source</Text>
                        <Text language="heb">מקור</Text>
                    </>
                }>
                    <DropDown state={sourceState}>
                        {sourceItems}
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

    const MenuActions = ({ name, state, type, parent = false, root = false }) => {
        const { dialogState, viewTypeState, pathState } = state;
        const [viewType, setViewType] = viewTypeState;
        const [path, setPath] = pathState;
        const [dialog, setDialog] = dialogState;
        const currentPath = me.path;
        let parentPath = me.path;
        if (parent) {
            parentPath = parentPath.split("/").slice(0, -1).join("/");
        }
        const source = core.path.normalize(parentPath, name);
        const dialogObject = {
            source, name, parent, path: me.path, cancel: () => {
                setPath(currentPath.split("/"));
                setDialog(null);
            }
        };
        const createFolder = async () => {
            setDialog({ mode: "create", type: "folder", name: "" });
        };
        const createFile = async () => {
            setDialog({ mode: "create", type: "file", name: "" });
        };
        const gotoFolder = () => {
            setViewType("folder");
            setPath(path.slice(0, path.length - 1));
        };
        const renameItem = async () => {
            setDialog({ ...dialogObject, mode: "rename" });
        };
        const moveItem = async () => {
            if (parent) {
                gotoFolder();
            }
            setDialog({
                ...dialogObject, type, mode: "move", done: async () => {
                    const target = core.path.normalize(me.path, name);
                    await me.send("storage.fs.move", source, target);
                    setDialog(null);
                    await me.updateView();
                }
            });
        };
        const copyItem = async () => {
            if (parent) {
                gotoFolder();
            }
            setDialog({
                ...dialogObject, type, mode: "copy", done: async () => {
                    const target = core.path.normalize(me.path, name);
                    await me.send("storage.fs.copy", source, target);
                    setDialog(null);
                    await me.updateView();
                }
            });
        };
        const deleteItem = async () => {
            if (parent) {
                gotoFolder();
            }
            await storage.fs.delete(source);
            await me.updateView();
        };
        return (
            <>
                {parent && <>
                    <Item onClick={gotoFolder} disable={!path.length}>
                        <>
                            <Text language="eng">Goto Parent Folder</Text>
                            <Text language="heb">לך לתיקיה העליונה</Text>
                        </>
                    </Item>
                    {type === "folder" && <>
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
                    </>}
                </>}
                {!root && <>
                    {parent && <Separator />}
                    <Item onClick={renameItem}>
                        <>
                            <Text language="eng">Rename</Text>
                            <Text language="heb">שינוי שם</Text>
                        </>
                    </Item>
                    <Item onClick={copyItem}>
                        <>
                            <Text language="eng">Copy To...</Text>
                            <Text language="heb">...העתק אל</Text>
                        </>
                    </Item>
                    <Item onClick={moveItem}>
                        <>
                            <Text language="eng">Move To...</Text>
                            <Text language="heb">...העבר אל</Text>
                        </>
                    </Item>
                    <Separator />
                    <Item onClick={deleteItem}>
                        <>
                            <Text language="eng">Delete</Text>
                            <Text language="heb">מחיקה</Text>
                        </>
                    </Item>
                </>}
            </>
        );
    };

    const Button = ({ onClick, disable, children, border, ...props }) => {
        if (disable) {
            onClick = undefined;
        }
        return (<Element onClick={onClick} className={{
            "app-storage-button": true,
            disable,
            border
        }} {...props}>
            {children}
        </Element>);
    };

    const FolderHeader = ({ children, name, count, root, state }) => {
        const { pathState, dialogState, viewTypeState } = state;
        const [dialog, setDialog] = dialogState;
        const isTransfer = dialog && (dialog.mode === "move" || dialog.mode === "copy");
        let disableTooltip = null;
        let disable = !dialog;
        const hebrewModeText = dialog && dialog.mode === "copy" ? "להעתיק" : "להעביר";
        const hebrewTypeText = dialog && dialog.type === "folder" ? "תיקיה" : "קובץ";
        if (!disable) {
            disable = me.path === dialog.path;
            if (disable) {
                disableTooltip = {
                    eng: `Cannot ${dialog.mode} ${dialog.type} to the same folder it is in`,
                    heb: `אי אפשר ${hebrewModeText} ${hebrewTypeText} לאותו תיקיה`
                };
            }
        }
        if (!disable) {
            disable = (dialog.type === "folder" && dialog.path && me.path.includes(dialog.path));
            if (disable) {
                disableTooltip = {
                    eng: `Cannot ${dialog.mode} ${dialog.type} to a child folder`,
                    heb: `אי אפשר ${hebrewModeText} ${hebrewTypeText} לתת תיקיה`
                };
            }
        }
        if (!disable) {
            disable = me.items.find(item => item.name === dialog.name);
            if (disable) {
                disableTooltip = {
                    eng: `Cannot ${dialog.mode} ${dialog.type} to a folder which contains an item with the same name`,
                    heb: `אי אפשר ${hebrewModeText} ${hebrewTypeText} לתיקיה שיש בה פריט עם אותו שם`
                };
            }
        }
        const labels = isTransfer && [
            {
                mode: "copy",
                footer: <>
                    <Text language="eng">Copy</Text>
                    <Text language="heb">העתק</Text>
                    <StorageItem key={dialog.name} name={dialog.name} location={dialog.source} type={dialog.type} transfer={true} footer={true} state={state} />
                    <Text language="eng">to</Text>
                    <Text language="heb">למקום</Text>
                    <StorageItem key={name} name={name} type="folder" location={"/" + me.path} transfer={true} footer={true} state={state} />
                    <Element style={{ flex: 1 }}></Element>
                    <Button border={true} onClick={dialog.cancel}>
                        <Text language="eng">Cancel</Text>
                        <Text language="heb">ביטול</Text>
                    </Button>
                    <Button border={true} disable={disable} title={disableTooltip} onClick={dialog.done}>
                        <Text language="eng">Copy</Text>
                        <Text language="heb">העתק</Text>
                    </Button>
                </>
            },
            {
                mode: "move",
                footer: <>
                    <Text language="eng">Move</Text>
                    <Text language="heb">העבר</Text>
                    <StorageItem key={dialog.name} name={dialog.name} location={dialog.source} type={dialog.type} transfer={true} footer={true} state={state} />
                    <Text language="eng">to</Text>
                    <Text language="heb">למקום</Text>
                    <StorageItem key={name} name={name} type="folder" location={"/" + me.path} transfer={true} footer={true} state={state} />
                    <Element style={{ flex: 1 }}></Element>
                    <Button border={true} onClick={dialog.cancel}>
                        <Text language="eng">Cancel</Text>
                        <Text language="heb">ביטול</Text>
                    </Button>
                    <Button border={true} disable={disable} title={disableTooltip} onClick={dialog.done}>
                        <Text language="eng">Move</Text>
                        <Text language="heb">העבר</Text>
                    </Button>
                </>
            }
        ];
        const { footer } = (labels && labels.find(item => item.mode === dialog.mode)) || {};
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <StorageItem key={name} name={name} type="folder" parent={true} root={root} state={state} />
                    <Element style={{ flex: 1 }}></Element>
                    <b>{count}</b>
                    &nbsp;
                    {count === 1 && (
                        <>
                            <Text language="eng">Item</Text>
                            <Text language="heb">פריט</Text>
                        </>)}
                    {count !== 1 && (
                        <>
                            <Text language="eng">Items</Text>
                            <Text language="heb">פריטים</Text>
                        </>)}
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
                {isTransfer && <Element className={{ "app-storage-item": true, active: false, root: true, transfer: true }}>
                    {footer}
                </Element>}
            </Element >
        );
    };

    const StorageItem = ({ name, select, type, parent, location, root, footer, state }) => {
        const { dialogState, pathState, viewTypeState } = state;
        const [path, setPath] = pathState;
        const [dialog, setDialog] = dialogState;
        const [hoverRef, hover] = react.util.useHover();
        const editTextState = React.useState(name);
        const [editText, setEditText] = editTextState;
        const renameTo = async (text) => {
            if (name !== text && text) {
                const { source } = dialog;
                let parentPath = me.path;
                if (parent) {
                    parentPath = parentPath.split("/").slice(0, -1).join("/");
                }
                const target = core.path.normalize(parentPath, text);
                try {
                    if (name) {
                        await me.send("storage.fs.rename", source, target);
                    }
                    else if (type === "folder") {
                        await me.send("storage.fs.mkdir", target);
                    }
                    else if (type === "file") {
                        await me.send("storage.fs.writeFile", target, "", "utf8");
                    }
                    if (parent) {
                        setPath(target.split("/").filter(Boolean));
                    }
                    await me.updateView();
                }
                catch (err) {
                    setEditText(name);
                }
            }
            setDialog(null);
        };
        const showEdit = (flag) => {
            if (!flag) {
                renameTo(editText);
            }
        };
        const isEditVisible = dialog && (dialog.mode === "rename" || dialog.mode === "create") && dialog.name === name && !dialog.parent === !parent;
        const modalState = [isEditVisible, showEdit];
        const onSubmit = async (text) => {
            await renameTo(text);
        };
        let content = (<Element title={location} className="app-storage-item-label">{name}</Element>);
        let onClick = select;
        if (isEditVisible) {
            content = (
                <>
                    <Modal open={modalState} />
                    <Input className="app-storage-item-edit" onSubmit={onSubmit} state={editTextState} focus={true} />
                </>
            );
            onClick = null;
        }
        const typeLabel = me.types.find(item => item.id === type).title;
        const icon = parent ? (<b>&#9776;</b>) : (<b>&#8942;</b>);
        const gotoParentFolder = () => {
            setPath(path.slice(0, path.length - 1));
        };
        return (<Element className={{ "app-storage-item": true, active: true, hover: !parent && !footer && !isEditVisible && hover }}>
            {!footer && <Menu icon={icon} label={parent && !isEditVisible && <Element title={location} className="app-storage-item-name">{name}</Element>}>
                <MenuActions name={name} root={root} type={type} parent={parent} state={state} />
            </Menu>}
            {(!parent || isEditVisible) && <Element title={name} ref={hoverRef} className="app-storage-item-name" onClick={onClick}>
                {!parent && <Element title={typeLabel} width="32px" height="32px" className={`app-storage-icon app-storage-${type}-icon`}></Element>}
                {content}
            </Element>}
            {parent && !root && <Button onClick={gotoParentFolder}><b>&#8682;</b></Button>}
        </Element >);
    };

    const FolderView = ({ state }) => {
        const { filterState, pathState, viewTypeState, sortState, searchState, sortDirectionState, updateState, dialogState } = state;
        const [dialog, setDialog] = dialogState;
        const [path, setPath] = pathState;
        const [viewType, setViewType] = viewTypeState;
        const [sort] = sortState;
        const [search] = searchState;
        const [direction] = sortDirectionState;
        const [counter] = updateState;
        const [filter] = filterState;
        let name = path[path.length - 1];
        let root = false;
        if (!name) {
            name = (<>
                <Text language="eng">Home</Text>
                <Text language="heb">בית</Text>
            </>);
            root = true;
        }
        let items = me.items || [];
        const count = items.length;
        items = me.sort.find(item => item.id === sort).sort(items);
        if (search) {
            items = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
        }
        me.filter.map(filterItem => {
            const hasFilter = filter.includes(filterItem.id);
            items = filterItem.filter(items, hasFilter);
        });
        if (direction === "asc") {
            items = items.reverse();
        }
        items = items.map(item => {
            const select = () => {
                setPath([...path.filter(Boolean), item.name]);
                setViewType(item.type);
            }
            return (
                <StorageItem key={item.name} {...item} select={select} state={state} />
            );
        });
        if (dialog && dialog.mode === "create") {
            items.unshift(<StorageItem key="new item" name={dialog.name} type={dialog.type} state={state} />);
        }
        return (<FolderHeader name={name} root={root} count={count} state={state}>
            {items}
        </FolderHeader>);
    };

    const FileHeader = ({ children, name, state }) => {
        const { pathState, viewTypeState, dialogState } = state;
        const [viewType, setViewType] = viewTypeState;
        const [path, setPath] = pathState;
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <StorageItem key={name} name={name} type="file" parent={true} root={false} state={state} />
                </Element>
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };

    const FileView = ({ state }) => {
        const { pathState, viewTypeState, dialogState } = state;
        const [path] = pathState;
        const counter = react.util.useResize();
        const [ref, width, height] = react.util.useSize(counter);
        const textState = [me.content, async (content) => {
            await me.send("storage.fs.writeFile", "/" + me.path, content);
        }];
        let name = path[path.length - 1];
        const style = {
            width: width + "px",
            height: height + "px"
        };
        return (<FileHeader name={name} state={state}>
            <TextArea className="app-storage-file-editor" ref={ref} focus={true} wrap="off" state={textState} style={style} />
        </FileHeader>);
    };

    const Main = () => {
        const [isOpen, setOpen] = React.useState(true);
        const dialogState = React.useState(null);
        const delayState = React.useState(5000);
        const languageState = React.useState("eng");
        const sortState = React.useState("name");
        const sortDirectionState = React.useState("desc");
        const filterState = React.useState([]);
        const updateState = React.useState(0);
        const searchState = React.useState("");
        const pathState = React.useState(me.path.split("/").filter(Boolean));
        const sourceState = React.useState(me.source);
        const viewTypeState = React.useState(me.viewType);
        const [path, setPath] = pathState;
        const [source, setSource] = sourceState;
        const [viewType, setViewType] = viewTypeState;
        pathState[1] = React.useCallback(path => {
            me.viewType = "folder";
            setViewType(me.viewType);
            setPath(path);
        });
        sourceState[1] = React.useCallback(source => {
            me.source = source;
            me.viewType = "folder";
            setViewType(me.viewType);
            setPath([]);
            setSource(source);
        });
        React.useEffect(() => {
            me.path = path.join("/");
        }, [path]);
        React.useEffect(() => {
            me.source = source;
        }, [source]);
        React.useEffect(() => {
            me.viewType = viewType;
        }, [viewType]);
        React.useEffect(() => {
            me.updateView();
        }, [path, viewType, source]);
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
            searchState,
            filterState,
            sourceState,
            dialogState
        };
        if (!isOpen) {
            return null;
        }
        return (
            <Direction direction={direction}>
                <Language language={language}>
                    <AppToolbar state={state} />
                    {viewType === "folder" && <FolderView state={state} />}
                    {viewType === "file" && <FileView state={state} />}
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
    me.filter = [
        {
            id: "hidden",
            name: (
                <>
                    <Text language="eng">Hidden Folders {'&'} Files</Text>
                    <Text language="heb">תיקיות וקבצים נסתרים</Text>
                </>
            ),
            filter: (items, flag) => {
                if (!flag) {
                    items = items.filter(item => !item.name.startsWith("."));
                }
                return items;
            }
        }
    ];
    me.types = [
        {
            id: "folder",
            title: {
                eng: "Folder",
                heb: "תיקיה"
            }
        },
        {
            id: "file",
            title: {
                eng: "File",
                heb: "קובץ"
            }
        }
    ];
    me.sources = [
        {
            id: "browser",
            name: (
                <>
                    <Text language="eng">Device</Text>
                    <Text language="heb">מכשיר</Text>
                </>
            )
        },
        {
            id: "server",
            name: (
                <>
                    <Text language="eng">Server</Text>
                    <Text language="heb">שרת</Text>
                </>
            )
        }
    ];
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.path = "";
        me.viewType = "folder";
        me.source = "browser";
        await me.updateView();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.updateView = async function () {
        if (me.viewType === "folder") {
            me.items = await me.send("storage.fs.list", "/" + me.path);
        }
        else if (me.viewType === "file") {
            me.content = await me.send("storage.fs.readFile", "/" + me.path, "utf8");
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
    me.send = async function (method, ...params) {
        var send_method = "send_" + me.source;
        var send = core.message[send_method];
        return await send(method, ...params);
    };
};
