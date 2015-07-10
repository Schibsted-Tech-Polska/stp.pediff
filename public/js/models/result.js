define([], function() {
    var Model = Backbone.Model.extend({
        defaults: {},
        getClass: function() {
            return 'result-' + this.get('viewport').name;
        }
    });
    return Model;
});
