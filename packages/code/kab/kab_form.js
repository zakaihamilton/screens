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
    me.compare = function (source, target) {
        var equal = true;
        if (typeof source !== typeof target) {
            equal = false;
        }
        else if (Array.isArray(source)) {
            target.map((item, index) => {
                var sourceItem = source[index];
                if (!me.compare(sourceItem, item)) {
                    equal = false;
                }
            });
        }
        else if (source !== target) {
            equal = false;
        }
        return equal;
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
    me.copy = function (form) {
        var newForm = Object.apply({}, form);
        if (!form.members) {
            form.members = [];
        }
        form.members.push(newForm);
        newForm.parent = form;
    };
    me.set = function (form, values) {
        var isEqual = me.has(form, values);
        if (!isEqual) {
            var newForm = me.copy(form);
            newForm = Object.apply(newForm, values);
            return newForm;
        }
        return form;
    };
};
