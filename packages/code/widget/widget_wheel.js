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
        wheel.animatetime = 1000;
        wheel.animateeffect = "linear";
        wheel.slicePathFunction = slicePath().CogBasePieSlice;
        wheel.sliceHoverPathFunction = slicePath().CogSlice;
        wheel.sliceSelectedPathFunction = slicePath().CogSlice;
        wheel.sliceSelectedTransformFunction = sliceTransform().MoveMiddleTransform;
        wheel.hoverPercent = 0.9;
        wheel.selectedPercent = 1.1;
        wheel.wheelRadius = wheel.wheelRadius * 0.8;
        wheel.colors = colorpalette.greensilver;
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
