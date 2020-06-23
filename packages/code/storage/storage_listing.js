/*
 @author Zakai Hamilton
 @component StorageListing
 */

screens.storage.listing = function StorageListing(me, { storage, media }) {
    me.metadataPath = async () => {
        if (!me.metadata) {
            me.metadata = "aws/" + await media.file.bucket() + "/metadata";
        }
        return me.metadata;
    };
    me.update = async path => {
        const metadataPath = await me.metadataPath();
        const listing = await storage.fs.list(path);
        await storage.fs.createPath(metadataPath, metadataPath + "/" + path);
        await storage.fs.writeFile(metadataPath + "/" + path + "/listing.json", JSON.stringify(listing, null, 4), "utf8");
        return listing;
    };
    me.get = async path => {
        const metadataPath = await me.metadataPath();
        const listingPath = metadataPath + "/" + path + "/listing.json";
        if (!await storage.fs.exists(listingPath)) {
            return await me.update(path);
        }
        const buffer = await storage.fs.readFile(listingPath, "utf8");
        const listing = JSON.parse(buffer);
        return listing;
    };
};
