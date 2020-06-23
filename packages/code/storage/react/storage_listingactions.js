screens.storage.listingActions = function StorageListingActions(me, { core, react, storage }) {
    me.init = () => {
        core.broadcast.register(me, {
            storageActions: "storage.listingActions.storageActions"
        });
    };
    me.storageActions = function storageActions({ path, type }) {
        const { Item, Text } = react;
        const updateListing = async () => {
            await storage.listing.update(path);
        };
        if (type !== "folder") {
            return null;
        }
        if (path.startsWith(storage.listing.metadata) || path.startsWith("local/")) {
            return null;
        }
        return (<React.Fragment key="storage.listing">
            <Item onClick={updateListing}>
                <Text language="eng">Update Listing</Text>
                <Text language="heb">רענן רישום</Text>
            </Item>
        </React.Fragment>);
    };
    return "browser";
};
