/*
    @author Zakai Hamilton
    @component CmdYoutube
*/

screens.cmd.youtube = function CmdYoutube(me, { core, ui }) {
    me.cmd = function (terminal, args) {
        if (args.length < 2) {
            core.property.set(terminal, "print", "youtube: title video_id");
            core.property.set(terminal, "print", "example: youtube \"The Computer Chronicles\" YewNEAIkbG4");
            core.cmd.exit(terminal);
            return;
        }
        var youtube_id = args[2];
        youtube_id = youtube_id.replace("https://youtu.be/", "");
        me.log("youtube_id:" + youtube_id);
        ui.element.create({
            "title": args[1],
            "ui.style.left": "550px",
            "ui.style.top": "200px",
            "ui.style.width": "300px",
            "ui.style.height": "300px",
            "icon": "youtube",
            "ui.basic.elements": [
                {
                    "ui.element.component": "widget.embed",
                    "ui.basic.src": "https://www.youtube.com/embed/" + youtube_id + "?ecver=1",
                    "ui.attribute.allowFullScreen": "",
                    "ui.style.width": "100%",
                    "ui.style.height": "100%"
                }
            ]
        });
        core.cmd.exit(terminal);
    };
};
