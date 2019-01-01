/*
 @author Zakai Hamilton
 @component WidgetWheel
 */

screens.widget.wheel = function WidgetWheel(me) {
    me.init = async function () {
        await me.core.require.load("/external/wheelnav.min.js");
        await me.core.require.load("/external/raphael.min.js");
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.attribute.#id": "wheel",
            "ui.style.position": "absolute"
        }
    };
    me.select = function (object, index) {
        object.wheel.navigateWheel(index);
    };
    me.items = {
        get: function (object) {
            return object.nav_items;
        },
        set: function (object, items) {
            object.nav_items = items;
        }
    };
    me.redraw = function (object) {
        var id = me.core.property.get(object, "ui.attribute.#id");
        var wheel = object.wheel = new wheelnav(id);
        wheel.slicePathFunction = slicePath().PieSlice;
        wheel.markerPathFunction = markerPath().DropMarker;
        wheel.markerAttr = { fill: "#333", stroke: "#333" };
        wheel.spreaderEnable = true;
        wheel.spreaderRadius = 50;
        wheel.spreaderInTitle = "menu";
        wheel.spreaderOutTitle = "close";
        wheel.clickModeRotate = false;
        wheel.markerEnable = true;
        wheel.createWheel(object.nav_items);
    };
    me.update = {
        set: async function (object, value) {
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
                var context = me.core.property.get(object, "context");
                if (!me.chart) {
                    me.core.require.load("/node_modules/chart.js/dist/Chart.bundle.js").then((chart) => {
                        me.chart = chart;
                        clearTimeout(object.chartTimer);
                        object.chartTimer = setTimeout(() => {
                            object.chart = new me.chart.Chart(context, object.chartInfo);
                        }, 0);
                    });
                }
                else {
                    clearTimeout(object.chartTimer);
                    object.chart = new me.chart.Chart(context, object.chartInfo);
                }
            }
        }
    };
    me.dateRel = function (unixTimestamp) {
        return me.lib.moment.unix(unixTimestamp).toDate();
    };
};
