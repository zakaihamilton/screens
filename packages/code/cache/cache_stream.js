/*
 @author Alex Pezzini
 @component CacheStream
 */

screens.cache.stream = function CacheStream(me, { manager, db }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
    me.load = async path => {
        const [user, group] = path.split("/");
        const streams = await db.shared.stream.list({ user, group });
        if (streams) {
            streams.forEach(item => {
                delete item._id;
            });
        }
        return streams;
    };
    me.set = async (path, sessionName, stream) => {
        stream = Object.assign({}, stream);
        const [user, group] = path.split("/");
        await db.shared.stream.use({ user, group, session: sessionName }, stream);
        await me.updateAll(path);
    };
};
