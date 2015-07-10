define([
    'socket',
    'text!templates/spec.html'
], function(Socket, itemTemplate) {
    var View = Backbone.View.extend({
        events: {
        },
        render: function() {
            var html = '';

            this.collection.each(function(model) {
                html += _.template(itemTemplate, {
                    model: model
                })
            }.bind(this));

            this.$el.html(html);
        }
    });
    return View;
});
