define([
    'text!templates/spec/details.html'
], function(viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.$el.empty();
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
        }
    });
    return View;
});
