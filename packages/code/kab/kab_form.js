/*
 @author Zakai Hamilton
 @component KabForm
 */

screens.kab.form = function KabForm(me) {
    me.index = function (form) {
        for (var index = -1; form; index++) {
            form = form.cause;
        }
        return index;
    };
    me.get = function (form, key) {
        if (!form) {
            return;
        }
        if (key in form) {
            return form[key];
        }
        else if (form.cause) {
            return me.get(form.cause, key);
        }
    };
    me.has = function (form, values) {
        var equal = true;
        for (var key in values) {
            var value = values[key];
            var formValue = me.get(form, key);
            if (!me.core.json.compare(formValue, value)) {
                equal = false;
                break;
            }
        }
        return equal;
    };
    me.set = function (form, values) {
        var isEqual = me.has(form, values);
        if (!isEqual) {
            var newForm = { cause: form };
            if (!form.effects) {
                form.effects = [];
            }
            form.effects.push(newForm);
            for (var key in values) {
                var value = values[key];
                var formValue = me.get(form, key);
                if (!me.core.json.compare(formValue, value)) {
                    newForm[key] = value;
                }
            }
            return newForm;
        }
        return form;
    };
    me.root = function () {
        if (!me._root) {
            me._root = {};
            me.kab.rule.run(me._root, "expand");
            me.kab.rule.run(me._root, "restrict");
        }
        return me._root;
    };
};
