define([
    'jquery',
    'backbone',
    'lodash',
    'utils',
    'views/keyboardInterface',
    'text!templates/spec/navigation.html'
], function($, Backbone, _, utils, InterfaceView, viewTemplate) {
    var View = InterfaceView.extend({
        events: {
            'click .tab a': 'onTabClick'
        },
        initialize: function() {
            this.listenTo(this, 'navigate', this.onNavigate.bind(this));
            InterfaceView.prototype.initialize.call(this);
        },
        render: function() {
            this.$el.html(_.template(viewTemplate, {
                model: this.model,
                utils: utils
            }));

            this.$tabs = this.$('ul.tabs').tabs();
        },
        getCurrentEnvironment: function() {
            return this.$('.environments .tab .active').data('toggle').replace('environment--', '');
        },
        onTabClick: function(event) {
            var $el = $(event.currentTarget);

            var toggle = $el.data('toggle'),
                type = toggle.split('--')[0],
                slug = toggle.split('--')[1];

            if(this['current' + type] !== slug) {
                this['current' + type] = slug;
                this.trigger('change:' + type, slug);
            }
        },
        onNavigate: function(params) {
            var $items, $active, $next, $previous, activeIndex;

            if(params.type === 'spec') {
                return;
            }

            if(params.type === 'viewport') {
                $items = this.$('.viewports a');
            }

            if(params.type === 'environment') {
                $items = this.$('.environments a');
            }

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
                $next.trigger('click');
            } else {
                $previous.trigger('click');
            }
        }
    });
    return View;
});
