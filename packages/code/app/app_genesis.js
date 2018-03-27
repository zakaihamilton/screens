/*
 @author Zakai Hamilton
 @component AppGenesis
 */

screens.app.genesis = function AppGenesis(me) {
    me.launch = function () {
        return me.ui.element(__json__, "workspace", "self");
    };
    me.update = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.canvas, [
            {
                "clear":null
            },
            {
                "fillText": {
                    "text": "Hello World!",
                    "font": "30px Ariel",
                    "pos": {
                        "x": 500,
                        "y": 600
                    }
                }
            },
            {
                "circle": {
                    "center": {
                        "x": 200,
                        "y": 200
                    },
                    "radius": 75
                },
            },
            {
                "stroke": {
                    "start": {
                        "x": 100,
                        "y": 200
                    },
                    "end": {
                        "x": 300,
                        "y": 400
                    }
                }
            },
            {
                "fillText": {
                    "text": "Hello World!",
                    "font": "30px Ariel",
                    "pos": {
                        "x": 500,
                        "y": 600
                    }
                }
            },
            {
                "fillRect":{
                    "pos":{
                        "x":400,
                        "y":200
                    },
                    "size":{
                        "width":200,
                        "height":200
                    },
                    "fillStyle":"red"
                }
            }
        ]);
    };
};
