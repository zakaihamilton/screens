/*
 @author Zakai Hamilton
 @component CachePath
 */

screens.cache.path = function CachePath(me, { manager, media }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
    me.load = async () => {
        const cdn = await media.file.cdn();
        const bucket = await media.file.bucket();
        const sessions = await media.file.awsPath();
        return { cdn, bucket, sessions };
    };
};
