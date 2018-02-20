/*
    @author Zakai Hamilton
    @component HlsGet
*/

package.cmd.hlsget = function CmdHlsGet(me) {
    me.cmd = function(terminal, args) {
        if(args.length <= 2) {
            me.core.property.set(terminal, "print", "hlsget path.m3u8 files");
            me.core.cmd.exit(terminal);
            return;
        }
        var path = args[1];
        var destination = args[2];
        me.core.property.set(terminal, "print", "downloading playlist " + path + " to " + destination + "...");
        me.media.hls.download(function(err, fileCount) {
            if(err) {
                me.core.property.set(terminal, "print", err);
            }
            else {
                me.core.property.set(terminal, "print", "successfully downloaded files");
            }
            me.core.cmd.exit(terminal);
        }, path, destination);
    };
};
