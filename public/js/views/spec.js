define([
    'socket',
    'views/result',
    'text!templates/spec.html'
], function(Socket, ResultView, viewTemplate) {
    var View = Backbone.View.extend({
        events: {
            'click [data-toggle="result"]': 'onResultClick'
        },
        render: function() {
            this.$el.html(_.template(viewTemplate, {model: this.model}));

            this.subviews = [];
            this.model.get('results').each(function(model) {
                var view = new ResultView({
                    model: model,
                    el: this.$('.' + model.getClass())
                });
                view.render();
                this.subviews.push(view);
            }.bind(this));
        },
        onResultClick: function(event) {
            event.preventDefault();
            this.$el.addClass('active');
            this.trigger('active');
        }
    });
    return View;
});
