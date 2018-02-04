/*
 @author Zakai Hamilton
 @component WidgetChart
 */

package.widget.chart = function WidgetChart(me) {
    me["ui.element.default"] = {
        "ui.basic.tag":"div",
        "ui.basic.elements":{
            "ui.basic.tag": "canvas",
            "ui.basic.var":"canvas"
        }
    };
    me.init = function(task) {
        me.lock(task, (task) => {
            me.core.require.require((moment, chart) => {
                me.moment = moment;
                me.chart = chart;
                me.unlock(task);
            }, ['/node_modules/moment/moment.js','/node_modules/chart.js/dist/chart.js']);
        });
    };
    me.context = {
        get: function (object) {
            var context = object.var.canvas.getContext("2d");
            return context;
        }
    };
    me.info = {
        get: function(object) {
            return object.chartInfo;
        },
        set: function(object, value) {
            object.chartInfo = value;
            if(object.chart) {
                object.chart.data = object.chartInfo.data;
                object.chart.update();
            }
            else {
                var context = me.core.property.get(object, "context");
                object.chart = new me.chart.Chart(context, object.chartInfo);
            }
        }
    };
};
