/*
 @author Zakai Hamilton
 @component StorageListing
 */

screens.storage.listing = function StorageListing(me, { core, storage }) {
    me.metadataPath = () => {
        if (!me.metadata) {
            if (screens.platform === "server") {
                me.metadata = "aws/" + storage.aws.bucket + "/metadata";
            }
            else {
                me.metadata = "local/metadata";
            }
        }
        return me.metadata;
    };
    me.update = async path => {
        let listing = null;
        if (screens.platform !== "server") {
            listing = await core.message.send_server("storage.listing.update", path);
        }
        else {
            listing = await storage.fs.list(path);
        }
        const metadataPath = me.metadataPath();
        await storage.fs.createPath(metadataPath + "/" + path);
        await storage.fs.writeFile(metadataPath + "/" + path + "/listing.json", JSON.stringify(listing, null, 4), "utf8");
        return listing;
    };
    me.get = async path => {
        const metadataPath = me.metadataPath();
        const listingPath = metadataPath + "/" + path + "/listing.json";
        if (!await storage.fs.exists(listingPath)) {
            return await me.update(path);
        }
        const buffer = await storage.fs.readFile(listingPath, "utf8");
        const listing = JSON.parse(buffer);
        return listing;
    };
};
