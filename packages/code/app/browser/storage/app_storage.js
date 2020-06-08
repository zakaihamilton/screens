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
        List,
        Menu,
        ProgressRing,
        Spinner
    } = react;

    const HomeFolder = () => (<>
        <Text language="eng">Home</Text>
        <Text language="heb">בית</Text>
    </>);

    const AppToolbar = ({ state }) => {
        const { filterState, pathState, languageState, sortState, searchState, sortDirectionState } = state;
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
        const rootItem = (<Item id={0}>
            <HomeFolder />
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
        const item = me.items.find(item => item.name === name);
        const dialogObject = {
            path: core.path.normalize(parentPath, name),
            items: [item],
            name,
            parent,
            context: me.path,
            type,
            cancel: () => {
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
        const duplicateItem = async () => {
            let duplicateName = null;
            let target = null;
            for (let index = 0; ; index++) {
                duplicateName = core.path.suffix(name, index ? (" copy " + (index + 1)) : " copy");
                target = core.path.normalize(parentPath, duplicateName);
                if (!await storage.fs.exists(target)) {
                    break;
                }
            }
            name = duplicateName;
            await storage.fs.copy(dialogObject.path, target);
            await me.updateView();
            if (parent) {
                gotoFolder();
            }
            setDialog({ ...dialogObject, mode: "rename", path: target, name });
        };
        const moveItem = async () => {
            setDialog({
                ...dialogObject, mode: "move", multiSelect: true, done: async () => {
                    for (const item of dialogObject.items) {
                        const target = core.path.normalize(me.path, item.name);
                        await storage.fs.transfer(item.path, target);
                        await storage.fs.delete(item.path);
                    }
                    setDialog(null);
                    await me.updateView();
                }
            });
        };
        const copyItem = async () => {
            setDialog({
                ...dialogObject, mode: "copy", multiSelect: true, done: async () => {
                    for (const item of dialogObject.items) {
                        const target = core.path.normalize(me.path, item.name);
                        await storage.fs.transfer(item.path, target);
                    }
                    setDialog(null);
                    await me.updateView();
                }
            });
        };
        const deleteItem = async () => {
            setDialog({
                ...dialogObject, mode: "delete", multiSelect: true, done: async () => {
                    for (const item of dialogObject.items) {
                        const { name } = item;
                        const itemPath = core.path.normalize(parentPath, name);
                        await storage.fs.delete(itemPath);
                    }
                    setDialog(null);
                    await me.updateView();
                }
            });
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
                    <Item onClick={duplicateItem}>
                        <>
                            <Text language="eng">Duplicate</Text>
                            <Text language="heb">שכפול</Text>
                        </>
                    </Item>
                    {parent && <Separator />}
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
        const { loadingState } = state;
        const [loading, setLoading] = loadingState;
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <StorageItem key={name} name={name} type="folder" parent={true} root={root} state={state} />
                    <Element style={{ flex: 1 }}></Element>
                    <Element className="app-storage-item-count">
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
                </Element>
                {loading &&
                    <Element className="app-storage-loading" key="loadingItems">
                        <Spinner delay={250}>
                            <Text language="eng">Loading...</Text>
                            <Text language="heb">טוען...</Text>
                        </Spinner>
                    </Element>
                }
                <Element className="app-storage-children">
                    <List itemSize={4} unit="em">
                        {children}
                    </List>
                </Element>
            </Element >
        );
    };

    const Footer = ({ state }) => {
        const { pathState, dialogState } = state;
        const [dialog, setDialog] = dialogState;
        const [path, setPath] = pathState;
        const isFooter = dialog && (dialog.mode === "move" || dialog.mode === "copy" || dialog.mode === "delete");
        let disableTooltip = null;
        let disable = !dialog;
        let hebrewToModeText = "";
        let hebrewActionModeText = "";
        let englishToModeText = "";
        let englishActionModeText = "";
        if (dialog) {
            englishToModeText = englishActionModeText = core.string.title(dialog.mode);
            if (dialog.mode === "copy") {
                hebrewToModeText = "להעתיק";
                hebrewActionModeText = "העתק";
            }
            if (dialog.mode === "move") {
                hebrewToModeText = "להעביר";
                hebrewActionModeText = "העבר";
            }
            if (dialog.mode === "delete") {
                hebrewToModeText = "למחוק";
                hebrewActionModeText = "מחק";
            }
        }
        const englishItemName = dialog && dialog.items && dialog.items.length > 1 ? "items" : "item";
        const hebrewItemName = dialog && dialog.items && dialog.items.length > 1 ? "פריטים" : "פריט";
        if (dialog && dialog.mode !== "delete") {
            if (!disable) {
                disable = me.path === dialog.context;
                if (disable) {
                    disableTooltip = {
                        eng: `Cannot ${dialog.mode} ${englishItemName} to the same folder it is in`,
                        heb: `אי אפשר ${hebrewToModeText} ${hebrewItemName} לאותו תיקיה`
                    };
                }
            }
            if (!disable) {
                disable = (dialog.type === "folder" && dialog.context && me.path.includes(dialog.context));
                if (disable) {
                    disableTooltip = {
                        eng: `Cannot ${dialog.mode} folder to a child folder`,
                        heb: `אי אפשר ${hebrewToModeText} תיקיה לתת תיקיה`
                    };
                }
            }
            if (!disable) {
                disable = me.items.find(item => item.name === dialog.name);
                if (disable) {
                    disableTooltip = {
                        eng: `Cannot ${dialog.mode} ${englishItemName} to a folder which contains an item with the same name`,
                        heb: `אי אפשר ${hebrewToModeText} ${hebrewItemName} לתיקיה שיש בה פריט עם אותו שם`
                    };
                }
            }
        }
        if (dialog && dialog.mode === "delete") {
            if (!disable) {
                disable = !dialog.items.length;
                if (disable) {
                    disableTooltip = {
                        eng: `No items selected to ${dialog.mode}`,
                        heb: `אין פריטים נבחרים ${hebrewToModeText}`
                    };
                }
            }
        }
        if (dialog && !disable) {
            disable = dialog.progress;
            if (disable) {
                disableTooltip = {
                    eng: `Working...`,
                    heb: `עובד...`
                };
            }
        }
        const onClick = async () => {
            setDialog(dialog => {
                return { ...dialog, progress: true };
            });
            await dialog.done();
        }
        const items = dialog && dialog.items;
        let name = path[path.length - 1];
        if (!name) {
            name = <HomeFolder />;
        }
        return (
            <>
                {isFooter && <Element style={{ height: "4em" }} className={{ "app-storage-item": true, active: false, root: true, transfer: true }}>
                    <Text language="eng">{englishToModeText}</Text>
                    <Text language="heb">{hebrewToModeText}</Text>
                    <Element className="app-storage-item-scroller">
                        {items && items.map(item => {
                            return (<StorageItem key={item.name} name={item.name} location={item.path} type={item.type} transfer={true} footer={true} state={state} />);
                        })}
                    </Element>
                    {dialog.mode !== "delete" && <>
                        <Text language="eng">to</Text>
                        <Text language="heb">ל</Text>
                        <StorageItem key={name} name={name} location={me.path} type="folder" transfer={true} footer={true} state={state} />
                    </>}
                    <Element style={{ flex: 1 }}></Element>
                    {!dialog.progress && <Button border={true} onClick={dialog.cancel}>
                        <Text language="eng">Cancel</Text>
                        <Text language="heb">ביטול</Text>
                    </Button>}
                    <Button border={true} disable={disable} title={disableTooltip} onClick={onClick}>
                        <Text language="eng">{englishActionModeText}</Text>
                        <Text language="heb">{hebrewActionModeText}</Text>
                        <ProgressRing.Loading className="app-storage-button-loading" show={dialog.progress} speed={250} stroke={3} strokeDasharray={2.5} />
                    </Button>
                </Element>}
            </>
        );
    };

    const StorageItem = ({ name, size, select, type, parent, location, root, footer, state }) => {
        const { dialogState, pathState } = state;
        const [path, setPath] = pathState;
        const [dialog, setDialog] = dialogState;
        const [hoverRef, hover] = react.util.useHover();
        const editTextState = React.useState(name);
        const [selectionRange, setSelectionRange] = React.useState([0, 0]);
        const [editText, setEditText] = editTextState;
        const showCheckbox = !parent && !footer && dialog && dialog.multiSelect;
        const renameTo = async (text) => {
            if (name !== text && text) {
                let parentPath = me.path;
                if (parent) {
                    parentPath = parentPath.split("/").slice(0, -1).join("/");
                }
                const target = core.path.normalize(parentPath, text);
                try {
                    if (name) {
                        await storage.fs.rename(dialog.path, target);
                    }
                    else if (type === "folder") {
                        await storage.fs.mkdir(target);
                    }
                    else if (type === "file") {
                        await storage.fs.writeFile(target, "", "utf8");
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
        let onClick = !showCheckbox ? select : () => {
            const items = dialog.items;
            const index = items.findIndex(item => item.name === name);
            if (index !== -1) {
                items.splice(index, 1);
            }
            else {
                const item = me.items.find(item => item.name === name);
                items.push(item);
            }
            setDialog(dialog => {
                return { ...dialog, items };
            });
        };
        if (isEditVisible) {
            content = (
                <>
                    <Modal open={modalState} />
                    <Input className="app-storage-item-edit" onSubmit={onSubmit} state={editTextState} focus={true} selectionRange={selectionRange} />
                </>
            );
            onClick = null;
        }
        const typeTitle = me.types.find(item => item.id === type).title;
        const icon = parent ? (<b>&#9776;</b>) : (<b>&#8942;</b>);
        const gotoParentFolder = () => {
            setPath(path.slice(0, path.length - 1));
        };
        const menuTitle = {
            eng: "Menu",
            heb: "תפריט"
        };
        const formattedSize = core.string.formatNumber(size);
        const sizeTitle = {
            eng: formattedSize + " bytes",
            heb: formattedSize + " בתים"
        };
        const gotoParentFolderTitle = {
            eng: "Goto Parent Folder",
            heb: "לך לתיקיה העליונה"
        };
        const checkboxTitle = {
            eng: "Select",
            heb: "בחירה"
        };
        const sizeString = typeof size !== "undefined" && core.string.formatBytes(size);
        const isChecked = dialog && dialog.items && dialog.items.find(item => item.name === name);
        return (<Element className={{ "app-storage-item": true, active: true, minWidth: !footer, hover: !parent && !footer && !isEditVisible && hover }}>
            {(parent || !showCheckbox) && !footer && me.path && (!dialog || dialog.mode !== "delete") && <Menu icon={icon} title={menuTitle} label={parent && !isEditVisible && <Element title={location} className="app-storage-item-name">{name}</Element>}>
                <MenuActions name={name} root={root} type={type} parent={parent} state={state} />
            </Menu>}
            {(!parent || isEditVisible || !me.path || (dialog && dialog.mode === "delete")) && <Element title={name} ref={hoverRef} className="app-storage-item-name" onClick={onClick}>
                {showCheckbox && <Element className="app-storage-item-checkbox" title={checkboxTitle}>
                    <Element className={{ "app-storage-item-check": true, check: isChecked }}><b>&#10003;</b></Element>
                </Element>}
                {!parent && <Element title={typeTitle} className={`app-storage-icon app-storage-${type}-icon`}></Element>}
                {content}
                {!footer && <Element style={{ flex: 1 }} />}
            </Element>}
            {!parent && !footer && type === "folder" && dialog && dialog.multiSelect && dialog.mode !== "delete" && <Button border={true} onClick={select}>
                <Text language="eng">Open</Text>
                <Text language="heb">פתח</Text>
            </Button>}
            {!parent && !footer && <Element className="app-storage-item-size" title={sizeTitle}>{sizeString}</Element>}
            {parent && !root && (!dialog || dialog.mode !== "delete") && <Button title={gotoParentFolderTitle} onClick={gotoParentFolder}><b>&#8682;</b></Button>}
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
            name = <HomeFolder />;
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
                <Item key={item.name}>
                    <StorageItem {...item} select={select} state={state} />
                </Item>
            );
        });
        if (dialog && dialog.mode === "create") {
            items.unshift(
                <Item key="new item">
                    <StorageItem name={dialog.name} type={dialog.type} state={state} />
                </Item>
            );
        }
        return (<FolderHeader name={name} root={root} count={count} state={state}>
            {items}
        </FolderHeader>);
    };

    const FileHeader = ({ children, name, state }) => {
        const { loadingState } = state;
        const [loading, setLoading] = loadingState;
        return (
            <Element className="app-storage-root">
                <Element className={{ "app-storage-item": true, active: false, root: true }}>
                    <StorageItem key={name} name={name} type="file" parent={true} root={false} state={state} />
                </Element>
                {loading &&
                    <Element className="app-storage-loading" key="loadingItems">
                        <Spinner>
                            <Text language="eng">Loading...</Text>
                            <Text language="heb">טוען...</Text>
                        </Spinner>
                    </Element>
                }
                <Element className="app-storage-children">
                    {children}
                </Element>
            </Element >);
    };

    const FileView = ({ state }) => {
        const { pathState } = state;
        const [path] = pathState;
        const counter = react.util.useResize();
        const [ref, width, height] = react.util.useSize(counter);
        const textState = [me.content, async (content) => {
            await storage.fs.writeFile(me.path, content);
        }];
        let name = path[path.length - 1];
        const style = {
            width: width + "px",
            height: height + "px"
        };
        return (<FileHeader name={name} state={state}>
            <TextArea key={path} className="app-storage-file-editor" ref={ref} focus={true} wrap="off" state={textState} style={style} />
        </FileHeader>);
    };

    const Main = () => {
        const [isOpen, setOpen] = React.useState(true);
        const dialogState = React.useState(null);
        const loadingState = React.useState(me.loading);
        const delayState = React.useState(5000);
        const languageState = React.useState("eng");
        const sortState = React.useState("name");
        const sortDirectionState = React.useState("desc");
        const filterState = React.useState([]);
        const updateState = React.useState(0);
        const searchState = React.useState("");
        const pathState = React.useState(me.path.split("/").filter(Boolean));
        const viewTypeState = React.useState(me.viewType);
        const [dialog, setDialog] = dialogState;
        const [path, setPath] = pathState;
        const [loading, setLoading] = loadingState;
        const [viewType, setViewType] = viewTypeState;
        pathState[1] = React.useCallback(path => {
            me.viewType = "folder";
            setViewType(me.viewType);
            if (dialog && dialog.mode === "delete") {
                setDialog(null);
            }
            setPath(path);
        });
        React.useEffect(() => {
            me.path = path.join("/");
        }, [path]);
        React.useEffect(() => {
            me.viewType = viewType;
        }, [viewType]);
        React.useEffect(() => {
            if (me.loading !== loading) {
                setLoading(me.loading);
            }
        });
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
            searchState,
            filterState,
            dialogState,
            loadingState
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
                    <Footer state={state} />
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
        },
        {
            id: "size",
            name: (
                <>
                    <Text language="eng">Size</Text>
                    <Text language="heb">גודל</Text>
                </>
            ),
            sort: (items) => {
                items = [...items];
                items.sort((a, b) => {
                    return a.size - b.size;
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
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.path = "";
        me.items = [];
        me.loading = false;
        me.viewType = "folder";
        await me.updateView();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.updateView = async function () {
        if (me.viewType === "folder") {
            me.items = [];
            if (me.path) {
                me.loading = true;
                if (me.redraw) {
                    me.redraw();
                }
                me.items = await storage.fs.list(me.path);
                me.loading = false;
            }
            else {
                me.loading = false;
                me.items = Object.keys(storage.fs.sources).map(source => {
                    return { name: source, path: source, type: "folder" };
                });
            }
        }
        else if (me.viewType === "file") {
            me.content = "";
            me.loading = true;
            if (me.redraw) {
                me.redraw();
            }
            me.content = await storage.fs.readFile(me.path, "utf8");
            me.loading = false;
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
