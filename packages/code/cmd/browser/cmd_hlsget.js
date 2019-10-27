/*
    @author Zakai Hamilton
    @component CmdHlsGet
*/

screens.cmd.hlsget = function CmdHlsGet(me, { core }) {
    me.cmd = async function (terminal, args) {
        if (args.length <= 2) {
            core.property.set(terminal, "print", "hlsget path.m3u8 files");
            core.cmd.exit(terminal);
            return;
        }
        var path = args[1];
        var destination = args[2];
        core.property.set(terminal, "print", "downloading playlist " + path + " to " + destination + "...");
        try {
            await me.media.hls.download(path, destination);
            core.property.set(terminal, "print", "successfully downloaded files");
        }
        catch (err) {
            core.property.set(terminal, "print", "failed to downloaded files: " + JSON.stringify(err));
        }
        core.cmd.exit(terminal);
    };
};
