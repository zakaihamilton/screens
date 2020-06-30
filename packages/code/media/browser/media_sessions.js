/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.sessions = function MediaSessions(me, { core, cache }) {
    me.getPaths = async () => {
        const { cdn, bucket, sessions } = await cache.path.get() || {};
        me.cdn = cdn;
        me.bucket = bucket;
        me.sessions = sessions;
    };
    me.list = async function (update) {
        const groups = await me.groups(update);
        const metadataList = await cache.playlists.get("$userId") || [];
        await me.getPaths();
        const { cdn, bucket, sessions } = me;
        return { groups, metadataList, cdn, bucket, sessions };
    };
    me.groups = async (update) => {
        await me.getPaths();
        const listing = await cache.listing.get("aws/" + me.sessions, update) || [];
        let groups = [];
        for (const group of listing) {
            const { name } = group;
            const sessions = await me.group(name, update);
            groups.push({ name, sessions });
        }
        groups = groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    };
    me.group = async (groupName, update) => {
        const listing = await cache.listing.get("aws/" + me.sessions + "/" + groupName, update) || [];
        const years = [];
        for (const year of listing) {
            years.push(await me.year(groupName, year.name, update));
        }
        const sessions = years.flat(1);
        sessions.reverse();
        return sessions;
    };
    me.year = async (groupName, yearName, update) => {
        const path = "aws/" + me.sessions + "/" + groupName + "/" + yearName;
        const listing = await cache.listing.get(path, update);
        const durations = await cache.duration.get(path, update);
        let sessions = [];
        for (const file of listing) {
            const [, date, name, extension] = file.name.match(/([0-9]*-[0-9]*-[0-9]*) (.*)\.(.*)/);
            const [title, resolution] = name.split("_");
            const durationItem = durations.find(item => item.name === file.name);
            const dateAndTitle = date + " " + title;
            const sessionName = dateAndTitle + "." + extension;
            let item = sessions.find(item => item.name === name);
            if (!item) {
                item = {
                    group: groupName,
                    extension,
                    date,
                    title,
                    name: sessionName,
                    session: dateAndTitle,
                    label: core.string.title(dateAndTitle),
                    resolutions: [],
                    ...durationItem && {
                        duration: durationItem.duration,
                        durationText: core.string.formatDuration(durationItem.duration)
                    }
                };
                Object.assign(item, me.paths(groupName, file.name));
                sessions.push(item);
            }
            item.resolutions = [...item.resolutions, resolution];
        }
        return sessions;
    };
    me.paths = function (groupName, name) {
        const [, year] = name.match(/([0-9]*)-.*/);
        var paths = {
            local: "cache/" + name,
            remote: "/sessions/" + groupName + "/" + year + "/" + name,
            aws: me.sessions + "/" + groupName + "/" + year + "/" + name
        };
        return paths;
    };
    me.updateMetadata = async function () {
        me.metadataList = await cache.playlists.get("$userId") || [];
        return me.metadataList;
    };
    me.exists = async function (name) {
        var groups = await me.groups(false);
        for (var group of groups) {
            for (var session of group.sessions) {
                if (session.name.includes(name)) {
                    return group.name;
                }
            }
        }
        return null;
    };
};
