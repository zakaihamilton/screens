/*
 @author Zakai Hamilton
 @component AppTasks
 */

package.app.tasks = function AppTasks(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        me.ui.element.create(__json__);
    };
};
