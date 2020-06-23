/*
 @author Zakai Hamilton
 @component StorageListing
 */

screens.storage.listing = function StorageListing(me, { storage, media }) {
    me.init = async () => {
        me.metadata = "aws/" + await media.file.bucket() + "/metadata";
    };
    me.update = async path => {
        const listing = await storage.fs.list(path);
        await storage.fs.createPath(me.metadata, me.metadata + "/" + path);
        await storage.fs.writeFile(me.metadata + "/" + path + "/listing.json", JSON.stringify(listing, null, 4), "utf8");
        return listing;
    };
    me.get = async path => {
        const listingPath = me.metadata + "/" + path + "/listing.json";
        if (!await storage.fs.exists(listingPath)) {
            return await me.update(path);
        }
        const buffer = await storage.fs.readFile(listingPath, "utf8");
        const listing = JSON.parse(buffer);
        return listing;
    };
};
