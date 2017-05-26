/*
    @author Zakai Hamilton
    @component CorePlatform
*/

if(typeof require === 'undefined') {
    package.core.platform = "client";
}
else {
    package.core.platform = "server";
}
