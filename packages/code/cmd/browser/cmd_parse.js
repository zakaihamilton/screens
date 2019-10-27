/*
    @author Zakai Hamilton
    @component CmdParse
*/

screens.cmd.parse = function CmdParse(me, { core }) {
    me.cmd = async function (terminal, args) {
        if (args.length <= 1) {
            core.cmd.exit(terminal);
            return;
        }
        var path = core.path.goto(terminal.current_dir, args[1]);
        var json = await core.json.loadFile(path);
        json = me.parse(json);
        me.log(JSON.stringify(json, null, 4));
        core.cmd.exit(terminal);
    };
    me.parse = function (json) {
        if (json.term) {
            var result = [];
            for (var itemName in json.term) {
                var item = json.term[itemName];
                item.term = itemName;
                result.push(item);
            }
        }
        return result;
    };
};
