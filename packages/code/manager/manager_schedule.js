/*
 @author Zakai Hamilton
 @component ManagerSchedule
 */

screens.manager.schedule = function ManagerSchedule(me) {
    me.events = async function (query) {
        var events = [];
        var { start, end } = query;
        var startDate = me.toDate(start);
        var endDate = me.toDate(end);
        var groups = await me.media.file.groups();
        for (let group of groups) {
            let sessions = group.sessions;
            sessions = sessions.filter(item => {
                return me.core.path.extension(item.name) === "m4a";
            });
            for (let item of sessions) {
                let [year, month, day, name] = item.name.split(/(\d{4})-(\d{2})-(\d{2})\s(.+).m4a/g).slice(1);
                month = parseInt(month) - 1;
                let eventDate = me.toDate({ year, month, day });
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
                        title: me.core.path.fileName(item.name),
                        app: "Player",
                        launch: ["player", group.name, me.core.path.fileName(item.name)]
                    });
                }
            }
        }
        let [public, private] = await me.manager.content.associated(null, this.userId);
        let sources = { public, private };
        for (var source in sources) {
            let list = sources[source];
            for (let app in list) {
                for (let title of list[app]) {
                    let [year, month, day, name] = title.split(/(\d{4})-(\d{2})-(\d{2})\s(.+)/g).slice(1);
                    month = parseInt(month) - 1;
                    let eventDate = me.toDate({ year, month, day });
                    if (startDate <= eventDate && eventDate <= endDate) {
                        var group = me.core.string.language(title) === "english" ? "American" : "Israel";
                        events.push({
                            date: {
                                year: parseInt(year),
                                month: parseInt(month),
                                day: parseInt(day),
                            },
                            name,
                            group,
                            title,
                            app: me.core.string.title(app),
                            launch: [app, title, source === "private"]
                        });
                    }
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