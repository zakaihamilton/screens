/*
 @author Zakai Hamilton
 @component CachePlaylists
 */

screens.cache.playlists = function CachePlaylists(me, { manager, db }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
    me.load = async path => {
        const user = path.split("/").pop();
        const metadata = await db.shared.metadata.list({ user });
        if (metadata) {
            metadata.forEach(item => {
                delete item._id;
            });
        }
        return metadata;
    };
    me.set = async (path, playlists) => {
        playlists = Object.assign({}, playlists);
        const [user, group, title] = path.split("/");
        await db.shared.metadata.use({ group, title, user }, { ...playlists, group, title, user });
        await me.updateAll(path);
    };
};
