/*
 @author Zakai Hamilton
 @component ManagerSchedule
 */

screens.manager.schedule = function ManagerSchedule(me, { core, manager, media }) {
    me.events = async function (query) {
        var events = [];
        var { start, end } = query;
        var startDate = me.toDate(start);
        var endDate = me.toDate(end);
        var groups = await media.sessions.groups();
        for (let group of groups) {
            let sessions = group.sessions;
            sessions = core.json.union(sessions, "session");
            for (let item of sessions) {
                const { title } = item;
                let [, year, month, day] = item.date.split(/(\d{4})-(\d{2})-(\d{2})/);
                month = parseInt(month) - 1;
                let eventDate = me.toDate({ year, month, day });
                if (startDate <= eventDate && eventDate <= endDate) {
                    events.push({
                        date: {
                            year: parseInt(year),
                            month: parseInt(month),
                            day: parseInt(day),
                        },
                        name: title,
                        group: group.name,
                        user: group.name,
                        title: item.title,
                        app: "Player",
                        launch: ["player", group.name, item.session]
                    });
                }
            }
        }
        let sources = await manager.content.associated(null);
        for (var source in sources) {
            let list = sources[source];
            for (let app in list) {
                for (let item of list[app]) {
                    let [year, month, day, name] = item.title.split(/(\d{4})-(\d{2})-(\d{2})\s(.+)/g).slice(1);
                    month = parseInt(month) - 1;
                    let eventDate = me.toDate({ year, month, day });
                    if (startDate <= eventDate && eventDate <= endDate) {
                        var group = core.string.language(item.title) === "english" ? "American" : "Israel";
                        events.push({
                            date: {
                                year: parseInt(year),
                                month: parseInt(month),
                                day: parseInt(day),
                            },
                            name,
                            group,
                            title: item.title,
                            user: item.user,
                            app: core.string.title(app),
                            launch: [app, item.title, source === "privateList"]
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
};
