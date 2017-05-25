/*
    @author Zakai Hamilton
    @component Core
*/

var package = new Proxy({}, {
    get: function (object, property) {
      /* Check if package exists */
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      } else {
        /* Create package */
        package_obj = new Proxy({__package:property}, {
            get: function(object, property) {
                /* Check if component exists */
                if (Reflect.has(object, property)) {
                  return Reflect.get(object, property);
                } else {
                    /* Load component */
                    package_name=Reflect.get(object, "__package");
                    if(typeof require !== 'undefined') {
                        global.package = package;
                        path="../" + package_name + "/" + package_name + "_" + property;
                        require(path);
                    }
                    else {
                        var xhrObj = new XMLHttpRequest();
                        xhrObj.open('GET', "packages/" + package_name + "/" + package_name + "_" + property + ".js", false);
                        xhrObj.send(null);
                        var se = document.createElement('script');
                        se.type = "text/javascript";
                        se.text = xhrObj.responseText;
                        document.getElementsByTagName('head')[0].appendChild(se);
                    }
                    return Reflect.get(object, property);
                }
            },
            set: function(object, property, value) {
                Reflect.set(object, property, value);
            }
        });
        Reflect.set(object, property, package_obj);
        return package_obj;
      }
    }
  });

console.log(package.core.platform);
