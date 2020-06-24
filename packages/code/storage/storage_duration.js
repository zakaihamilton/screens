/*
 @author Zakai Hamilton
 @component StorageDuration
 */

screens.storage.duration = function StorageDuration(me, { storage, db }) {
    me.init = async function () {
        await storage.cache.implement(me);
    };
    me.load = async path => {
        const folder = path.split("/").filter(Boolean).slice(1).join("/");
        const files = await db.cache.file.list({ folder: "/" + folder });
        return files.map(file => {
            const { duration, name, path_display } = file;
            const path = "dropbox" + path_display;
            return {
                duration,
                name,
                path
            };
        });
    };
};
