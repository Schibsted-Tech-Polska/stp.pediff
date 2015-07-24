define([], function() {
    var Model = Backbone.Model.extend({
        defaults: {},
        initialize: function(attributes) {
        },
        parse: function(data) {
            return data;
        },
        getScreenshot: function(env) {
            return this.get('screenshots')[env].lo;
        },
        getEnvironments: function() {
            return _.keys(this.get('screenshots'));
        }
    });
    return Model;
});
