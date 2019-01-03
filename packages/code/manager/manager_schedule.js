/*
 @author Zakai Hamilton
 @component ManagerSchedule
 */

screens.manager.schedule = function ManagerSchedule(me) {
    me.init = function () {

    };
    me.events = async function (start, end) {
        var events = [];
        var startDate = me.toDate(start);
        var endDate = me.toDate(end);
        var groups = await me.media.file.groups();
        for (var group of groups) {
            var listing = await me.media.file.listing(group.path);
            listing = listing.filter(item => {
                return me.core.path.extension(item.name) === "m4a";
            });
            for (var item of listing) {
                var [year, month, day, name] = item.name.split(/(\d{4})-(\d{2})-(\d{2})\s(.+).m4a/g).slice(1);
                var eventDate = me.toDate({ year, month, day });
                if (startDate <= eventDate && eventDate <= endDate) {
                    events.push({
                        date: {
                            year: parseInt(year),
                            month: parseInt(month),
                            day: parseInt(day),
                        },
                        name,
                        group: group.name,
                        path: item.path,
                        session: me.core.path.fileName(item.name)
                    });
                }
            }
        }
        return events;
    };
    me.toDate = function (date) {
        return new Date(parseInt(date.year), parseInt(date.month), parseInt(date.day));
    };
    return "server";
};