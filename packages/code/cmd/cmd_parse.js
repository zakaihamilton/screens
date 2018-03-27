/*
    @author Zakai Hamilton
    @component CmdParse
*/

screens.cmd.parse = function CmdParse(me) {
    me.cmd = function(terminal, args) {
        if(args.length <= 1) {
            me.core.cmd.exit(terminal);
            return;
        }
        var path = me.core.path.goto(terminal.current_dir, args[1]);
        me.core.json.loadFile(function(json) {
            me.parse(function(json) {
                me.log(JSON.stringify(json, null, 4));
                me.core.cmd.exit(terminal);
            }, json);
        }, path);
    };
    me.parse = function(callback, json) {
        if(json.term) {
            var result = [];
            for(var itemName in json.term) {
                var item = json.term[itemName];
                item.term = itemName;
                result.push(item);
            }
        }
        callback(result);
    };
};
