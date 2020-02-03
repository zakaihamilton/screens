/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.sessions = function MediaSessions(me, { media, db }) {
    me.list = async function (update) {
        if (update || !me.groups || !me.metadataList) {
            me.groups = await media.file.groups(update);
            me.metadataList = await db.shared.metadata.list({ user: "$userId" });
        }
        const { groups, metadataList } = me;
        return { groups, metadataList };
    };
    me.updateMetadata = async function () {
        me.metadataList = await db.shared.metadata.list({ user: "$userId" });
        return me.metadataList;
    };
};
