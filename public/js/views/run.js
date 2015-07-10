define([
    'application',
    'socket',
    'text!templates/run.html'
], function(Application, Socket, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        render: function() {
            if(!Application.run) {
                return Application.router.navigate('!', {
                    trigger: true,
                    replace: true
                });
            }
            this.$el.html(_.template(viewTemplate, {model: Application.run}));
        }
    });
    return View;
});
