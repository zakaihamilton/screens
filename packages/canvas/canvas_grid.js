/*
    @author Zakai Hamilton
    @component CanvasGrid
*/

package.canvas.grid = function CanvasGrid(me) {
    
};

package.canvas.grid.row = function CanvasGridRow(me) {
    me.height = me.core.object.property("height");
};

package.canvas.grid.cell = function CanvasGridCell(me) {
    me.width = {
        get: function(object) {
            return object.width;
        },
        set: function(object, value) {
            object.width = value;
        }
    };
    me.height = {
        get: function(object) {
            return object.height;
        },
        set: function(object, height) {
            object.height = height;
            if(object.row.height < height) {
                object.row.height = height;
            }
            else {
                me.dirty(object.row, "height");
            }
        }
    };
};
