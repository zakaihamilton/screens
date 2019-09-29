/*
 @author Zakai Hamilton
 @component ManagerSchedule
 */

screens.manager.schedule = function ManagerSchedule(me, packages) {
    const { core } = packages;
    me.events = async function (query) {
        var events = [];
        var { start, end } = query;
        var startDate = me.toDate(start);
        var endDate = me.toDate(end);
        var groups = await me.media.file.groups();
        for (let group of groups) {
            let sessions = group.sessions;
            sessions = sessions.filter(item => {
                return core.path.extension(item.name) === "m4a";
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
                        user: group.name,
                        title: core.path.fileName(item.name),
                        app: "Player",
                        launch: ["player", group.name, core.path.fileName(item.name)]
                    });
                }
            }
        }
        let sources = await me.manager.content.associated(null, this.userId);
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
    return "server";
};