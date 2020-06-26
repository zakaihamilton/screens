screens.cache.actions = function StorageActions(me, { core, react, cache }) {
    me.init = () => {
        core.broadcast.register(me, {
            storageActions: "cache.actions.storageActions"
        });
    };
    me.storageActions = function storageActions({ path, type }) {
        const { Item, Text } = react;
        const updateListing = async () => {
            await cache.listing.cache.update(path);
        };
        const updateDuration = async () => {
            await cache.duration.cache.update(path);
        };
        if (type !== "folder") {
            return null;
        }
        if (path.startsWith(cache.listing.cache.metadataPath()) || path.startsWith("local/")) {
            return null;
        }
        return (<React.Fragment key={me.id}>
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
