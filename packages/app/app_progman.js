/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        me.ui.element.create([
            {
                "title": "Program Manager",
                "icon": "/packages/res/icons/program_manager.png",
                "ui.style.left": "950px",
                "ui.style.top": "150px",
                "ui.style.width": "300px",
                "ui.style.height": "250px",
                "widget.menu.items": [
                    ["File", [
                            ["New..."],
                            ["Open"],
                            ["Move..."],
                            ["Copy..."],
                            ["Delete"],
                            ["Properties"],
                            ["Run...", undefined, {"separator": true}],
                            ["Exit Windows...", undefined, {"separator": true}],
                        ]],
                    ["Options", [
                            ["Load on Startup", "app.progman.check"]
                        ]],
                    ["Window", [
                            ["Games"],
                            ["Programs"],
                            ["Maximize", "widget.window.maximize"],
                            ["Minimize", "widget.window.minimize"],
                            ["Restore", "widget.window.restore"]
                        ]],
                    ["Help", [
                            ["Contents"],
                            ["Search for Help on..."],
                            ["How to Use Help"],
                            ["Windows Tutorial"],
                            ["About Program Manager..."],
                        ]]
                ],
                "ui.basic.elements": []
            }
        ]);
    };
    me.check = {
        get: function (object) {
            var options = {"state": me.checked};
            return options;
        },
        set: function (object, value) {
            me.checked = !me.checked;
        }
    };
};
