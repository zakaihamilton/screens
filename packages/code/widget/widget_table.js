/*
 @author Zakai Hamilton
 @component WidgetTable
 */

package.widget.table = function WidgetTable(me) {
    me.properties = {
        "ui.basic.tag": "table"
    };
    me.init = function () {
        me.core.property.set(me, {
            "core.object.firstRowHeader":null
        });
    };
    me.create = function (object) {
        me.core.property.set(object, "firstRowHeader", true);
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
            me.core.property.set(object, "dataByRows", result);
        }
    };
    me.dataByRows = {
        set: function (object, data) {
            me.ui.node.removeChildren(object);
            if (data) {
                var firstRowHeader = me.core.property.get(object, "firstRowHeader");
                data.map(function (row, index) {
                    me.ui.element({
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

package.widget.table.header = function WidgetTableHeader(me) {
    me.properties = {
        "ui.basic.tag": "th"
    };
};

package.widget.table.row = function WidgetTableRow(me) {
    me.properties = {
        "ui.basic.tag": "tr"
    };
};

package.widget.table.data = function WidgetTableData(me) {
    me.properties = {
        "ui.basic.tag": "td"
    };
};
