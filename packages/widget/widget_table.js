/*
 @author Zakai Hamilton
 @component WidgetTable
 */

package.widget.table = function WidgetTable(me) {
    me.default = {
        "ui.basic.tag": "table"
    };
    me.init = function () {
        me.firstRowHeader = me.package.core.object.property("widge.table.firstRowHeader");
    };
    me.create = {
        set: function (object) {
            me.package.core.property.set(object, "firstRowHeader", true);
        }
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
            me.package.core.property.set(object, "dataByRows", result);
        }
    };
    me.dataByRows = {
        set: function (object, data) {
            me.package.ui.node.removeChildren(object);
            if (data) {
                var firstRowHeader = me.package.core.property.get(object, "firstRowHeader");
                data.map(function (row, index) {
                    me.package.ui.element.create({
                        "ui.element.component": "widget.table.row",
                        "ui.basic.elements": row.map(function (item) {
                            var properties = Object.assign({}, item);
                            if(!("ui.element.component" in properties)) {
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
    me.default = {
        "ui.basic.tag": "th"
    };
};

package.widget.table.row = function WidgetTableRow(me) {
    me.default = {
        "ui.basic.tag": "tr"
    };
};

package.widget.table.data = function WidgetTableData(me) {
    me.default = {
        "ui.basic.tag": "td"
    };
};
