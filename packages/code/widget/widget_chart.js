/*
 @author Zakai Hamilton
 @component WidgetChart
 */

screens.widget.chart = function WidgetChart(me, { core }) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.basic.elements": {
                "ui.basic.tag": "canvas",
                "ui.basic.var": "canvas"
            }
        }
    };
    me.context = {
        get: function (object) {
            var context = object.var.canvas.getContext("2d");
            return context;
        }
    };
    me.data = {
        get: function (object) {
            return object.chartData;
        },
        set: function (object, value) {
            object.chartData = value;
        }
    };
    me.type = {
        get: function (object) {
            return object.chartType;
        },
        set: function (object, value) {
            object.chartType = value;
        }
    };
    me.options = {
        get: function (object) {
            return object.chartOptions;
        },
        set: function (object, value) {
            object.chartOptions = value;
        }
    };
    me.info = {
        get: function (object) {
            return object.chartInfo;
        },
        set: function (object, value) {
            if (!value) {
                value = {};
            }
            object.chartInfo = value;
            core.property.notify(object, "update");
        }
    };
    me.reset = {
        get: function (object) {
            return !object.chart;
        },
        set: function (object) {
            if (object.chart) {
                object.chart.destroy();
                object.chart = null;
            }
        }
    };
    me.update = {
        set: function (object, value) {
            if (object.chartData) {
                object.chartInfo.data = object.chartData;
            }
            if (object.chart) {
                object.chart.data = object.chartInfo.data;
                object.chart.update(value);
            } else {
                if (object.chartOptions) {
                    object.chartInfo.options = object.chartOptions;
                }
                if (object.chartType) {
                    object.chartInfo.type = object.chartType;
                }
                var context = core.property.get(object, "context");
                clearTimeout(object.chartTimer);
                object.chart = new Chart(context, object.chartInfo);
            }
        }
    };
    me.dateRel = function (unixTimestamp) {
        var date = new Date(unixTimestamp * 1000);
        return date.toString();
    };
};
