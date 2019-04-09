/*
    @author Zakai Hamilton
    @component CmdFiles
*/

screens.cmd.files = function CmdFiles(me, packages) {
    const { core, media, storage } = packages;
    me.cmd = async function (terminal, args) {
        if (args.length <= 1) {
            core.property.set(terminal, "print", "files resolution");
            core.cmd.exit(terminal);
            return;
        }
        var resolution = args[1];
        core.property.set(terminal, "print", "converting video files to resolution:" + resolution);
        try {
            var groups = await media.file.groups();
            for (let group of groups) {
                var list = group.sessions.filter(session => session.extension === "mp4");
                for (let item of list) {
                    var remote = "screens/" + group.name + "/" + item.session + ".mp4";
                    var local = "cache/" + item.session + ".mp4";
                    var local_convert = "cache/" + item.session + "_" + resolution + ".mp4";
                    var remote_convert = "screens/" + group.name + "/" + item.session + "_" + resolution + ".mp4";
                    if (await storage.aws.exists(remote_convert)) {
                        continue;
                    }
                    if (!await core.file.exists(local_convert)) {
                        if (!await core.file.exists(local)) {
                            core.property.set(terminal, "print", "downloading: " + remote + " to: " + local);
                            await storage.aws.downloadFile(remote, local);
                        }
                        core.property.set(terminal, "print", "converting: " + local + " to: " + local_convert);
                        await media.ffmpeg.convert(local, local_convert, {
                            size: resolution
                        });
                    }
                    core.property.set(terminal, "print", "uploading: " + local_convert + " to: " + remote_convert);
                    await storage.aws.uploadFile(local_convert, remote_convert);
                    core.property.set(terminal, "print", "deleting: " + local_convert);
                    await core.file.delete(local_convert);
                    core.property.set(terminal, "print", "finished: " + item.name);
                }
            }
            core.property.set(terminal, "print", "successfully converted and uploaded files");
        }
        catch (err) {
            core.property.set(terminal, "print", "failed to convert files: " + err);
        }
        core.cmd.exit(terminal);
    };
};
