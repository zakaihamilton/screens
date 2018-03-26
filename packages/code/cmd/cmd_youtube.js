/*
    @author Zakai Hamilton
    @component CmdYoutube
*/

package.cmd.youtube = function CmdYoutube(me) {
    me.cmd = function(terminal, args) {
        if(args.length < 2) {
            me.core.property.set(terminal, "print", "youtube: title video_id");
            me.core.property.set(terminal, "print", "example: youtube \"The Computer Chronicles\" YewNEAIkbG4");
            me.core.cmd.exit(terminal);
            return;
        }
        var youtube_id = args[2];
        youtube_id = youtube_id.replace("https://youtu.be/", "");
        me.log("youtube_id:" + youtube_id);
        me.ui.element({
                "title": args[1],
                "ui.style.left": "550px",
                "ui.style.top": "200px",
                "ui.style.width": "300px",
                "ui.style.height": "300px",
                "icon": "https://www.youtube.com/yts/img/favicon_32-vfl8NGn4k.png",
                "ui.basic.elements": [
                    {
                        "ui.element.component": "widget.embed",
                        "ui.basic.src": "https://www.youtube.com/embed/" + youtube_id + "?ecver=1",
                        "ui.attribute.allowFullScreen": "",
                        "ui.style.width":"100%",
                        "ui.style.height":"100%"
                    }
                ]
            });
        me.core.cmd.exit(terminal);
    };
};
