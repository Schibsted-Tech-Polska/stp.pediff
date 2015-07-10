define([
    'text!templates/error.html'
], function(viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        render: function() {
            console.log('error view render')
            this.$el.html(_.template(viewTemplate));
        }
    });
    return View;
});
