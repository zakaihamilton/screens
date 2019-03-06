/*
 @author Zakai Hamilton
 @component KabRule
 */

screens.kab.rule = function KabRule(me, packages) {
    me.run = function (form, ruleName) {
        var rule = me[ruleName];
        if (rule) {
            me.log("running: " + rule.name + " - " + rule.description);
            return rule.run(form);
        }
    };
};

screens.kab.rule.expand = function KabRuleExpand(me, packages) {
    me.name = "Expansion";
    me.description = "Expands the emanation into ten emanations";
    me.run = function (form) {
        var depth = me.kab.form.get(form, "depth") + 1;
        for (var phase = 0; phase <= 4; phase++) {
            form = me.kab.form.set(form, { phase, depth });
        }
        return form;
    };
};

screens.kab.rule.restrict = function KabRuleRestrict(me, packages) {
    me.name = "Restriction";
    me.description = "Restricts the light in the vessel";
    me.run = function (form) {
        for (var phase = 4; phase >= 0; phase--) {
            form = me.kab.form.set(form, { phase, restriction: true });
        }
        return form;
    };
};

screens.kab.rule.look = function KabRuleRestrict(me, packages) {
    me.name = "Look";
    me.description = "Attract direct light";
    me.run = function (form) {
        form = me.kab.form.set(form, { direct: true });
        return form;
    };
};

screens.kab.rule.reflect = function KabRuleReflect(me, packages) {
    me.name = "Reflect";
    me.description = "Raise reflected light";
    me.run = function (form) {
        for (var phase = 4; phase >= 0; phase--) {
            form = me.kab.form.set(form, { phase, reflect: phase });
        }
        return form;
    };
};
