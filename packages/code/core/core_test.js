/*
 @author Zakai Hamilton
 @component CoreTest
 */

package.core.test = function CoreTest(me) {
    me.run = function(path) {
        package.include(path + ".test", function(info) {
            if(info.complete) {
                var component = package(path);
                var testing = package(path + ".test");
                var methodNames = Object.getOwnPropertyNames(testing);
                for(var methodName of methodNames) {
                    var tests = testing[methodName];
                    if(!Array.isArray(tests)) {
                        continue;
                    }
                    var callMethod = component[methodName];
                    if(callMethod) {
                        for(var test of tests) {
                            var argNames = me.core.util.getArgs(callMethod);
                            var argValues = [];
                            for(var argName of argNames) {
                                var value = test.input[argName];
                                if(value) {
                                    argValues.push(value);
                                }
                            }
                            console.log("testing: " + methodName + " args: " + argValues);
                            var result = callMethod.apply(test.this, argValues);
                            var match = (result === test.output) ? "true" : "false";
                            console.log("test result: method: " + methodName + " args: " + argValues + " result:" + result +  " output: " + test.output + " match: " + match);
                        }
                    }
                }
            }
        }, "test");
    };
};
