/*
 @author Zakai Hamilton
 @component AppPhases
 */

package.app.phases = function AppPhases(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        me.ui.element.create(__json__);
    };
};
