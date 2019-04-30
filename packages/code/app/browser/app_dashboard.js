/*
 @author Zakai Hamilton
 @component AppDashboard
 */

screens.app.dashboard = function AppDashboard(me, packages) {
    const { core, ui, widget } = packages;
    me.launch = async function () {
        return ui.element.create(me.json, "workspace", "self");
    };
    me.initOptions = function () {

    };
    me.refresh = async function (object) {
        const window = widget.window.get(object);
        me.data = (await core.broadcast.send("dashboard")).flat();
        if (!me.data || !me.data.length) {
            me.data = [
                {
                    engine: "google",
                    type: "BarChart",
                    options: {
                        title: "Density of Precious Metals, in g/cm^3",
                        width: 600,
                        height: 400,
                        bar: { groupWidth: "95%" },
                        legend: { position: "none" }
                    },
                    data: [
                        ["Element", "Density", { role: "style" }],
                        ["Copper", 8.94, "#b87333"],
                        ["Silver", 10.49, "silver"],
                        ["Gold", 19.30, "gold"],
                        ["Platinum", 21.45, "color: #e5e4e2"]
                    ]
                },
                {
                    engine: "google",
                    type: "LineChart",
                    data: [
                        ["Year", "Sales", "Expenses"],
                        ["2004", 1000, 400],
                        ["2005", 1170, 460],
                        ["2006", 660, 1120],
                        ["2007", 1030, 540]
                    ],
                    options: {
                        title: "Company Performance",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                },
                {
                    engine: "google",
                    type: "LineChart",
                    data: [
                        ["Year", "Sales", "Expenses"],
                        ["2004", 1000, 400],
                        ["2005", 1170, 460],
                        ["2006", 660, 1120],
                        ["2007", 1030, 540]
                    ],
                    options: {
                        title: "Company Performance",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                },
                {
                    engine: "google",
                    type: "LineChart",
                    data: [
                        ["Year", "Sales", "Expenses"],
                        ["2004", 1000, 400],
                        ["2005", 1170, 460],
                        ["2006", 660, 1120],
                        ["2007", 1030, 540]
                    ],
                    options: {
                        title: "Company Performance",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                },
                {
                    engine: "google",
                    type: "LineChart",
                    data: [
                        ["Year", "Sales", "Expenses"],
                        ["2004", 1000, 400],
                        ["2005", 1170, 460],
                        ["2006", 660, 1120],
                        ["2007", 1030, 540]
                    ],
                    options: {
                        title: "Company Performance",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                },
                {
                    engine: "google",
                    type: "PieChart",
                    data: [
                        ["Task", "Hours per Day"],
                        ["Work", 11],
                        ["Eat", 2],
                        ["Commute", 2],
                        ["Watch TV", 2],
                        ["Sleep", 7]
                    ],
                    options: {
                        title: "My Daily Activities",
                        pieHole: 0.4
                    }
                }
            ];
        }
        ui.node.empty(window.var.dashboard);
        if (me.data) {
            for (let data of me.data) {
                me.displayData(window, data);
            }
        }
    };
    me.displayData = function (object, data) {
        const window = widget.window.get(object);
        if (!data) {
            return;
        }
        var widgetElement = ui.element.create({
            "tag": "div",
            "ui.drag.icon.extend": null
        }, window.var.dashboard);
        if (data.engine === "google") {
            var chart = new google.visualization[data.type](widgetElement);
            var chartData = google.visualization.arrayToDataTable(data.data);

            var view = new google.visualization.DataView(chartData);
            let options = Object.assign({}, data.options);
            options.width = "350";
            options.height = "350";
            chart.draw(view, options);
            core.property.set(widgetElement, "ui.class.class", "app.dashboard.widget");
        }
    };
};
