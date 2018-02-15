/*
 @author Zakai Hamilton
 @component WidgetChart
 */

package.widget.chart = function WidgetChart(me) {
    me["ui.element.default"] = {
        "ui.basic.tag": "div",
        "ui.basic.elements": {
            "ui.basic.tag": "canvas",
            "ui.basic.var": "canvas"
        }
    };
    me.init = function (task) {
        me.lock(task, (task) => {
            me.core.require.require((chart) => {
                me.chart = chart;
                me.unlock(task);
            }, ['/node_modules/chart.js/dist/Chart.bundle.js']);
        });
    };
    me.context = {
        get: function (object) {
            var context = object.var.canvas.getContext("2d");
            return context;
        }
    };
    me.data = {
        get: function (object) {
            return object.data;
        },
        set: function (object, value) {
            object.data = value;
        }
    };
    me.type = {
        get: function (object) {
            return object.type;
        },
        set: function (object, value) {
            object.type = value;
        }
    };
    me.options = {
        get: function (object) {
            return object.options;
        },
        set: function (object, value) {
            object.options = value;
        }
    };
    me.info = {
        get: function (object) {
            return object.chartInfo;
        },
        set: function (object, value) {
            object.chartInfo = value;
            me.core.property.notify(object, "update");
        }
    };
    me.update = {
        set: function (object, value) {
            if(object.data) {
                object.chartInfo.data = object.data;
            }
            if(object.options) {
                object.chartInfo.options = object.options;
            }
            if(object.type) {
                object.chartInfo.type = object.type;
            }
            if (object.chart) {
                object.chart.data = object.chartInfo.data;
                object.chart.options = object.chartInfo.options;
                object.chart.type = object.chartInfo.type;
                object.chart.update(value);
            } else {
                var context = me.core.property.get(object, "context");
                object.chart = new me.chart.Chart(context, object.chartInfo);
            }
        }
    };
    me.dateNow = function (amount, type) {
        return me.lib.moment.moment().add(amount, type).toDate();
    };
    me.dateRel = function(unixTimestamp) {
        return me.lib.moment.unix(unixTimestamp).toDate();
    };
};
