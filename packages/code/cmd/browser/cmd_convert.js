/*
    @author Zakai Hamilton
    @component CmdConvert
*/

screens.cmd.convert = function CmdConvert(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        if (args.length <= 2) {
            core.property.set(terminal, "print", "convert source target resolution");
            core.cmd.exit(terminal);
            return;
        }
        var source = args[1];
        var target = args[2];
        var resolution = args[3];
        try {
            await me.media.ffmpeg.convert(source, target, {
                size: resolution
            });
            core.property.set(terminal, "print", "successfully converted file");
        }
        catch (err) {
            core.property.set(terminal, "print", "failed to convert file: " + err);
        }
        finally {
            core.cmd.exit(terminal);
        }
    };
};
