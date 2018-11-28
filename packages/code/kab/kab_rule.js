/*
 @author Zakai Hamilton
 @component KabRule
 */

screens.kab.rule = function KabRule(me) {
    me.run = function(form, ruleName) {
        var rule = me[ruleName];
        if(rule) {
            rule.run(form);
        }
    };
};

screens.kab.rule.expand = function KabRuleExpand(me) {
    me.run = function(form) {

    };
};

screens.kab.rule.restrict = function KabRuleRestrict(me) {
    me.run = function(form) {
        
    };
};

screens.kab.rule.restrict = function KabRuleRestrict(me) {
    me.run = function(form) {
        
    };
};
