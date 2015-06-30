define([
    'text!templates/main.html'
], function(viewTemplate) {
    var View = Backbone.View.extend({
        events: {
        },
        initialize: function() {
        },
        render: function() {
            this.$el.html(viewTemplate);
        }
    });
    return View;
});
