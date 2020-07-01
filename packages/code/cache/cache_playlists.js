/*
 @author Zakai Hamilton
 @component CachePlaylists
 */

screens.cache.playlists = function CachePlaylists(me, { cache, db }) {
    me.init = async function () {
        await cache.manager.implement(me);
    };
    me.load = async path => {
        const user = path.split("/").pop();
        const metadata = await db.shared.metadata.list({ user });
        delete metadata._id;
        return metadata;
    };
    me.set = async (path, playlists) => {
        playlists = Object.assign({}, playlists);
        const [user, group, title] = path.split("/");
        await db.shared.metadata.use({ group, title, user }, { ...playlists, group, title, user });
        await me.updateAll(path);
    };
};
