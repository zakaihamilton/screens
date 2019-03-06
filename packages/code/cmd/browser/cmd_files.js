/*
    @author Zakai Hamilton
    @component CmdFiles
*/

screens.cmd.files = function CmdFiles(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        if (args.length === 1) {
            args.push(...["/Kab/concepts/private/american", "cache"]);
        }
        if (args.length <= 2) {
            core.property.set(terminal, "print", "files source target");
            core.cmd.exit(terminal);
            return;
        }
        var source = args[1];
        var target = args[2];
        core.property.set(terminal, "print", "converting files in " + source);
        try {
            var children = await me.storage.dropbox.getChildren(source);
            var audioList = children.filter(child => core.path.extension(child.name) === "m4a");
            var videoList = children.filter(child => core.path.extension(child.name) === "mp4");
            for (let videoChild of videoList) {
                try {
                    var name = core.path.fileName(videoChild.name);
                    var matching = audioList.find(child => core.path.fileName(child.name) === name);
                    if (matching) {
                        continue;
                    }
                    var targetVideoPath = target + "/" + videoChild.name;
                    var targetAudioPath = core.path.replaceExtension(target + "/" + videoChild.name, "m4a");
                    core.property.set(terminal, "print", videoChild.path_display);
                    core.property.set(terminal, "print", "Downloading...");
                    await me.manager.file.download(videoChild.path_lower, targetVideoPath);
                    if (!await core.file.exists(targetAudioPath)) {
                        core.property.set(terminal, "print", "Converting...");
                        await me.media.ffmpeg.convert(targetVideoPath, targetAudioPath, {
                            noVideo: null,
                            audioCodec: "copy"
                        });
                        var fileSize = await core.file.size(targetAudioPath);
                        core.property.set(terminal, "print", "converted from: " + core.string.formatBytes(videoChild.size) + " to: " + core.string.formatBytes(fileSize));
                    }
                    var uploadAudioPath = core.path.replaceExtension(videoChild.path_display, "m4a");
                    core.property.set(terminal, "print", "Uploading...");
                    await me.manager.file.upload(targetAudioPath, uploadAudioPath);
                    await core.file.delete(targetVideoPath);
                }
                catch (err) {
                    core.property.set(terminal, "print", "failed to convert file: " + err);
                }
            }
            core.property.set(terminal, "print", "successfully converted files");
        }
        catch (err) {
            core.property.set(terminal, "print", "failed to convert files: " + err);
        }
        core.cmd.exit(terminal);
    };
};
