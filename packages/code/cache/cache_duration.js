/*
 @author Zakai Hamilton
 @component CacheDuration
 */

screens.cache.duration = function CacheDuration(me, { manager, db }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
    me.load = async path => {
        const folder = path.split("/").filter(Boolean).slice(2).join("/");
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
