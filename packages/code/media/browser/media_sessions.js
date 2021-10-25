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
        core.mutex.enable(me.id, true);
        var unlock = await core.mutex.lock(me.id);
        await me.getPaths();
        const path = "aws/" + me.sessions;
        if (!await cache.listing.exists(path)) {
            const results = await core.message.send_server("cache.listing.loadRecursive", path, "$userName");
            if (results) {
                for (const result of results) {
                    if (result.component) {
                        await cache[result.component].write(result.path, result.result);
                    }
                }
            }
        }
        const listing = await cache.listing.get(path, update) || [];
        let groups = [];
        try {
            for (const group of listing) {
                const { name } = group;
                const sessions = await me.group(name, update);
                groups.push({ name, sessions });
            }
            groups = groups.sort((a, b) => a.name.localeCompare(b.name));
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
        unlock();
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
        const positions = await cache.stream.get("$userName/" + groupName, update);
        let sessions = [];
        if (!listing) {
            return [];
        }
        for (const file of listing) {
            if (!(file.name.endsWith(".m4a") || file.name.endsWith(".mp4"))) {
                continue;
            }
            const [, date, name, extension] = file.name.match(/([0-9]*-[0-9]*-[0-9]*) (.*)\.(.*)/) || [];
            if (!date) {
                console.log("cannot match:" + file.name);
                continue;
            }
            const [title, resolution] = name.split("_");
            const durationItem = durations.find(item => item.name === file.name);
            const duration = parseInt((durationItem && durationItem.duration) || 0);
            const dateAndTitle = date + " " + title;
            const sessionName = dateAndTitle + "." + extension;
            const positionItem = await positions.find(item => item.group === groupName && item.session === dateAndTitle);
            var position = parseInt((positionItem && positionItem.position) || 0);
            var watched = (position === 0) ? "not_viewed" : (position === duration) ? "viewed" : "continue";
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
                    ...durationItem && durationItem.duration && {
                        duration: durationItem.duration,
                        durationText: core.string.formatDuration(durationItem.duration)
                    },
                    position,
                    watched
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
