screens.storage.actions = function StorageActions(me, { core, react, storage }) {
    me.init = () => {
        core.broadcast.register(me, {
            storageActions: "storage.actions.storageActions"
        });
    };
    me.storageActions = function storageActions({ path, type }) {
        const { Item, Text } = react;
        const updateListing = async () => {
            await storage.listing.cache.update(path);
        };
        const updateDuration = async () => {
            await storage.duration.cache.update(path);
        };
        if (type !== "folder") {
            return null;
        }
        if (path.startsWith(storage.listing.cache.metadata) || path.startsWith("local/")) {
            return null;
        }
        return (<React.Fragment key="storage.listing">
            <Item onClick={updateListing}>
                <Text language="eng">Update Listing</Text>
                <Text language="heb">רענן רישום</Text>
            </Item>
            <Item onClick={updateDuration}>
                <Text language="eng">Update Duration</Text>
                <Text language="heb">רענן משך</Text>
            </Item>
        </React.Fragment>);
    };
    return "browser";
};
