define([
    'application',
    'socket',
    'models/run',
    'collections/specs',
    'views/spec',
    'text!templates/main.html'
], function(Application, Socket, Run, SpecsCollection, SpecView, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        initialize: function() {
            this.listenTo(Application.router, 'route', function(){
                console.log('route change');
            });
        },
        render: function() {
            if(Socket.enabled) {
                // handle websocket communication
            } else {
                var url = window.location.href.replace('public/index.html', 'results/report.json');
                $.get(url).done(function(data) {
                    this.model = new Run(data, {parse: true});
                    this.collection = new SpecsCollection(data.specs, {parse: true});
                    this.renderView();
                }.bind(this)).fail(function() {
                    alert('Report file not found - something went wrong :(');
                });
            }
        },
        renderView: function() {
            this.$el.html(_.template(viewTemplate, {
                model: this.model,
                collection: this.collection
            }));
            this.subviews = [];
            this.collection.each(function(model) {
                var view = new SpecView({
                    model: model,
                    el: this.$('.' + model.getClass())
                });
                view.render();
                this.listenTo(view, 'active', function(){
                    this.$('.specs').addClass('active');
                }.bind(this));
                this.subviews.push(view);
            }.bind(this));
        }
    });
    return View;
});
