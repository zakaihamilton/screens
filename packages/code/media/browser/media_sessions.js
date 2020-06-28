/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.sessions = function MediaSessions(me, { media, cache }) {
    me.list = async function (update) {
        if (update || !me.groups || !me.metadataList || !me.cdn || !me.bucket) {
            const { cdn } = await cache.path.get();
            me.cdn = cdn;
            me.groups = await media.file.groups(update);
            me.metadataList = await cache.playlists.get("$userId") || [];
        }
        const { groups, metadataList, cdn } = me;
        return { groups, metadataList, cdn };
    };
    me.updateMetadata = async function () {
        me.metadataList = await cache.playlists.get("$userId") || [];
        return me.metadataList;
    };
};
