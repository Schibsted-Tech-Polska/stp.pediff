define([
    'socket',
    'utils',
    'views/keyboardInterface',
    'text!templates/specs-list-item.html'
], function(Socket, utils, InterfaceView, itemTemplate) {
    var View = InterfaceView.extend({
        events: {},
        initialize: function() {
            this.listenTo(this, 'route', this.onRouteChange.bind(this));
            this.listenTo(this, 'navigate', this.onNavigate.bind(this));
            InterfaceView.prototype.initialize.call(this);
        },
        render: function() {
            var html = '';

            this.collection.each(function(model) {
                html += _.template(itemTemplate, {
                    model: model,
                    utils: utils
                })
            }.bind(this));

            this.$el.html(html);

            this.$links = this.$('a');
        },
        checkState: function(url) {
            this.$links.parents('li').removeClass('active');
            this.$links.filter('[href="' + url + '"]').parents('li').addClass('active');
        },
        onRouteChange: function(route, params) {
            var url;

            if(route === 'spec') {
                url = '#!/spec/' + params[0];
            } else {
                url = route;
            }

            this.checkState(url);
        },
        onNavigate: function(params) {
            var $items, $active, $next, $previous, activeIndex;
            if(params.type === 'spec') {
                $items = this.$('li');
                $active = $items.filter('.active');
                activeIndex = $items.index($active);

                if(activeIndex === 0) {
                    $previous = $items.last();
                } else {
                    $previous = $items.eq(activeIndex - 1);
                }

                if(activeIndex === $items.length - 1) {
                    $next = $items.first();
                } else {
                    $next = $items.eq(activeIndex + 1);
                }

                if(params.direction === 'next') {
                    window.location.hash = $next.children('a').attr('href');
                } else {
                    window.location.hash = $previous.children('a').attr('href');
                }
            }
        }
    });
    return View;
});
