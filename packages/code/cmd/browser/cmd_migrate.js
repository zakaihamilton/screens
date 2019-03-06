/*
    @author Zakai Hamilton
    @component CmdMigrate
*/

screens.cmd.migrate = function CmdMigrate(me, packages) {
    const { core, manager } = packages;
    me.cmd = async function (terminal, args) {
        var input = args[1];
        var output = args[2];
        if (!input || !output) {
            core.property.set(terminal, "print", "migrate: input output");
            return;
        }
        var inputList = await me.manager.content.list(input);
        var count = 0;
        if (inputList) {
            for (var item of inputList) {
                var data = await me.manager.content.load(input, item.title);
                manager.content.save(output, item.title, data);
                count++;
            }
        }
        core.property.set(terminal, "print", "migrated from: " + input + " to: " + output + " " + count + " entries");
        core.cmd.exit(terminal);
    };
};
