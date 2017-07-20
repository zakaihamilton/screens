/*
 @author Zakai Hamilton
 @component AppPhases
 */

package.app.phases = function AppPhases(me) {
    me.launch = function () {
        me.ui.element.update(__json__, me.ui.element.body());
    };
};
