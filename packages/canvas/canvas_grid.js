/*
    @author Zakai Hamilton
    @component CanvasGrid
*/

package.canvas.grid = function CanvasGrid(me) {
    
};

package.canvas.grid.row = function CanvasGridRow(me) {
    me.create = function() {
        return me.core.object.create(me);
    };
    me.calcLength = function(object, name) {
        var items = me.get(object, "items");
        var maxLength = 0;
        for(var item in items) {
            var length = me.get(item, name);
            if(length > maxLength) {
                maxLength = length;
            }
        }
        return maxLength;
    };
    me.width = me.core.object.property("width", {
        readOnly: true,
        dirty: me.calcLength
    });
    me.height = me.core.object.property("height", {
        readOnly: true,
        dirty: me.calcLength
    });
    me.items = me.core.object.property("items");
};

package.canvas.grid.cell = function CanvasGridCell(me) {
    me.create = function() {
        return me.core.object.create(me);
    };
    me.row = me.core.object.property("row", {
        set: function(object, name, row, oldRow) {
            if(oldRow) {
                var oldItems = me.get(oldRow, "items");
                var index = oldItems.indexOf(object);
                oldItems.splice(index, 1);
            }
            if(row) {
                var items = me.get(row, "items");
                items.splice(-1, 0, object);
            }
        }
    });
    me.width = me.core.object.property("width", {
        set: function(object, name, length) {
            var row = me.get(object, "row");
            me.dirty(row, name);
        }
    });
    me.height = me.core.object.property("height", {
        set: function(object, name, length) {
            var row = me.get(object, "row");
            var rowLength = me.get(row, name);
            if(rowLength < length) {
                me.set(row, name, length);
            }
            else {
                me.dirty(row, name);
            }
        }
    });
};
