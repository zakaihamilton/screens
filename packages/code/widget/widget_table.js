/*
 @author Zakai Hamilton
 @component WidgetTable
 */

screens.widget.table = function WidgetTable(me, { core }) {
    me.element = {
        properties: {
            "ui.basic.tag": "table"
        },
        create: function (object) {
            core.property.set(object, "firstRowHeader", true);
        }
    };
    me.init = function () {
        core.property.set(me, {
            "core.property.object.firstRowHeader": null
        });
    };
    me.dataByColumns = {
        set: function (object, data) {
            var result = [];
            if (data) {
                data.map(function (column) {
                    column.map(function (entry, index) {
                        if (!result[index]) {
                            result[index] = [];
                        }
                        result[index].push(entry);
                    });
                });
            }
            core.property.set(object, "dataByRows", result);
        }
    };
    me.dataByRows = {
        set: function (object, data) {
            me.ui.node.removeChildren(object);
            if (data) {
                var firstRowHeader = core.property.get(object, "firstRowHeader");
                data.map(function (row, index) {
                    me.ui.element.create({
                        "ui.element.component": "widget.table.row",
                        "ui.basic.elements": row.map(function (item) {
                            var properties = Object.assign({}, item);
                            if (!("ui.element.component" in properties)) {
                                properties["ui.element.component"] = firstRowHeader && !index ? "widget.table.header" : "widget.table.data";
                            }
                            return properties;
                        })
                    }, object);
                });
            }
        }
    };
};

screens.widget.table.header = function WidgetTableHeader(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "th"
        }
    };
};

screens.widget.table.row = function WidgetTableRow(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "tr"
        }
    };
};

screens.widget.table.data = function WidgetTableData(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "td"
        }
    };
};
