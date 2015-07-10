define([
    'socket',
    'text!templates/result.html'
], function(Socket, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        render: function() {
            this.$el.html(_.template(viewTemplate, {model: this.model}));
        }
    });
    return View;
});
