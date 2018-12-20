/*
    @author Zakai Hamilton
    @component HlsGet
*/

screens.cmd.hlsget = function CmdHlsGet(me) {
    me.cmd = async function (terminal, args) {
        if (args.length <= 2) {
            me.core.property.set(terminal, "print", "hlsget path.m3u8 files");
            me.core.cmd.exit(terminal);
            return;
        }
        var path = args[1];
        var destination = args[2];
        me.core.property.set(terminal, "print", "downloading playlist " + path + " to " + destination + "...");
        try {
            await me.media.hls.download(path, destination);
            me.core.property.set(terminal, "print", "successfully downloaded files");
        }
        catch (err) {
            me.core.property.set(terminal, "print", "failed to downloaded files: " + JSON.stringify(err));
        }
        me.core.cmd.exit(terminal);
    };
};
