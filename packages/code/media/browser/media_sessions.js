/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.sessions = function MediaSessions(me, { media, db }) {
    me.list = async function (update) {
        if (update || !me.groups || !me.metadataList || !me.cdn || !me.bucket) {
            me.cdn = await media.file.cdn();
            me.bucket = await media.file.bucket();
            me.groups = await media.file.groups(update);
            me.metadataList = await db.shared.metadata.list({ user: "$userId" });
        }
        const { groups, metadataList, cdn, bucket } = me;
        return { groups, metadataList, cdn, bucket };
    };
    me.updateMetadata = async function () {
        me.metadataList = await db.shared.metadata.list({ user: "$userId" });
        return me.metadataList;
    };
};
