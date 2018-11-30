/*
 @author Zakai Hamilton
 @component KabForm
 */

screens.kab.form = function KabForm(me) {
    me.get = function (form, key) {
        if (key in form) {
            return form[key];
        }
        else if (form.parent) {
            return me.get(form.parent, key);
        }
    };
    me.has = function (form, values) {
        var equal = true;
        for (var key in values) {
            var value = values[key];
            var formValue = me.get(form, key);
            if (!me.compare(formValue, value)) {
                equal = false;
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
        }
        return me._root;
    };
};
