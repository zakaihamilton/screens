/*
 @author Zakai Hamilton
 @component WidgetTable
 */

package.widget.table = function WidgetTable(me) {
    me.default = {
        "ui.basic.tag": "table",
        "ui.theme.class": "container"
    };
    me.init = function () {
        me.firstRowHeader = me.core.object.property("widge.table.firstRowHeader");
    };
    me.create = {
        set: function (object) {
            me.set(object, "firstRowHeader", true);
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
            me.set(object, "dataByRows", result);
        }
    };
    me.dataByRows = {
        set: function (object, data) {
            me.ui.node.removeChildren(object);
            if (data) {
                var firstRowHeader = me.get(object, "firstRowHeader");
                data.map(function (row, index) {
                    me.ui.element.create({
                        "ui.element.component": "widget.table.row",
                        "ui.basic.elements": row.map(function (item) {
                            var properties = Object.assign({}, item);
                            properties["ui.element.component"] = firstRowHeader && !index ? "widget.table.header" : "widget.table.data";
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
        "ui.basic.tag": "th",
        "ui.theme.class": "widget.table.header"
    };
};

package.widget.table.row = function WidgetTableRow(me) {
    me.default = {
        "ui.basic.tag": "tr",
        "ui.theme.class": "widget.table.row"
    };
};

package.widget.table.data = function WidgetTableData(me) {
    me.default = {
        "ui.basic.tag": "td",
        "ui.theme.class": "widget.table.data"
    };
};
