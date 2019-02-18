/*
    @author Zakai Hamilton
    @component CmdFiles
*/

screens.cmd.files = function CmdFiles(me) {
    me.cmd = async function (terminal, args) {
        if (args.length <= 2) {
            me.core.property.set(terminal, "print", "files source target");
            me.core.cmd.exit(terminal);
            return;
        }
        var source = args[1];
        var target = args[2];
        me.core.property.set(terminal, "print", "converting files in " + source);
        try {
            var children = await me.storage.file.getChildren(source);
            var audioList = children.filter(child => me.core.path.extension(child.name) === "m4a");
            var videoList = children.filter(child => me.core.path.extension(child.name) === "mp4");
            for (let videoChild of videoList) {
                var name = me.core.path.fileName(videoChild.name);
                var matching = audioList.find(child => me.core.path.fileName(child.name) === name);
                if (matching) {
                    continue;
                }
                var targetVideoPath = target + "/" + videoChild.name;
                var targetAudioPath = me.core.path.replaceExtension(target + "/" + videoChild.name, "m4a");
                me.core.property.set(terminal, "print", videoChild.path_display);
                await me.manager.download.get(videoChild.path_lower, targetVideoPath);
                if (!await me.core.file.exists(targetAudioPath)) {
                    try {
                        await me.media.ffmpeg.convert(targetVideoPath, targetAudioPath, {
                            noVideo: null,
                            audioCodec: "copy"
                        });
                    }
                    catch (err) {
                        me.core.property.set(terminal, "print", "failed to convert file: " + JSON.stringify(err));
                        continue;
                    }
                }
                var fileSize = await me.core.file.size(targetAudioPath);
                me.core.property.set(terminal, "print", "converted from: " + me.core.string.formatBytes(videoChild.size) + " to: " + me.core.string.formatBytes(fileSize));
                var uploadAudioPath = me.core.path.replaceExtension(videoChild.path_display, "m4a");
                await me.storage.file.uploadFile(targetAudioPath, uploadAudioPath);
            }
            me.core.property.set(terminal, "print", "successfully converted files");
        }
        catch (err) {
            me.core.property.set(terminal, "print", "failed to convert files: " + JSON.stringify(err));
        }
        me.core.cmd.exit(terminal);
    };
};
