/*
 @author Zakai Hamilton
 @component KabRule
 */

screens.kab.rule = function KabRule(me) {
    me.run = function (form, ruleName) {
        var rule = me[ruleName];
        if (rule) {
            me.log("running: " + rule.name + " - " + rule.description);
            return rule.run(form);
        }
    };
};

screens.kab.rule.expand = function KabRuleExpand(me, { kab }) {
    me.name = "Expansion";
    me.description = "Expands the emanation into ten emanations";
    me.run = function (form) {
        var depth = kab.form.get(form, "depth") + 1;
        for (var phase = 0; phase <= 4; phase++) {
            form = kab.form.set(form, { phase, depth });
        }
        return form;
    };
};

screens.kab.rule.restrict = function KabRuleRestrict(me, { kab }) {
    me.name = "Restriction";
    me.description = "Restricts the light in the vessel";
    me.run = function (form) {
        for (var phase = 4; phase >= 0; phase--) {
            form = kab.form.set(form, { phase, restriction: true });
        }
        return form;
    };
};

screens.kab.rule.look = function KabRuleRestrict(me, { kab }) {
    me.name = "Look";
    me.description = "Attract direct light";
    me.run = function (form) {
        form = kab.form.set(form, { direct: true });
        return form;
    };
};

screens.kab.rule.reflect = function KabRuleReflect(me, { kab }) {
    me.name = "Reflect";
    me.description = "Raise reflected light";
    me.run = function (form) {
        for (var phase = 4; phase >= 0; phase--) {
            form = kab.form.set(form, { phase, reflect: phase });
        }
        return form;
    };
};
