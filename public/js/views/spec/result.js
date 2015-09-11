define([
    'utils',
    'text!templates/result.html'
], function(utils, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        initialize: function() {
            this.fetched = false;
            this.listenTo(this, 'change:environment', this.onEnvironmentChange.bind(this));
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.$el.empty();
        },
        render: function(environment) {
            this.$el.removeClass('ready');
            this.$el.html(_.template(viewTemplate));

            if(this.fetched) {
                this.renderImages(environment);
                this.trigger('ready');
                this.$el.addClass('ready');
            } else {
                this.fetch()
                    .done(function() {
                        this.fetched = true;
                        this.renderImages(environment);
                        this.trigger('ready');
                        this.$el.addClass('ready');
                    }.bind(this))
                    .progress(function(progress) {
                        this.$('.progress .determinate').width(progress + '%')
                    }.bind(this));
            }
        },
        renderImages: function(environment) {
            var html = '';

            _.each(this.model.get('screenshots'), function(screenshot, index) {
                html += '<img data-environment="' + index + '" src="' + utils.getImageUrl(screenshot.lo) + '"/>';
            }.bind(this));

            this.$('.images').html(html);
            this.$images = this.$('.images img');

            if(environment) {
                this.$images.filter('[data-environment="' + environment + '"]').addClass('active');
            } else {
                this.$images.first().addClass('active');
            }
        },
        onEnvironmentChange: function(environment) {
            this.$images.removeClass('active').filter('[data-environment="' + environment + '"]').addClass('active');
        },
        fetch: function() {
            var deferreds = [],
                progress = [],
                response = new $.Deferred();

            function getProgress() {
                return _.reduce(progress, function(total, n) {
                        return total + n;
                    }) / progress.length * 100;
            }

            var i = 0;
            _.each(this.model.get('screenshots'), function(screenshot, index) {
                var url = utils.getImageUrl(screenshot.hi);

                progress[i] = 0;

                var request = (function(index) {
                    return $.ajax({
                        url: url,
                        xhr: function() {
                            var xhr = new window.XMLHttpRequest();
                            xhr.addEventListener("progress", function(event) {
                                if(event.lengthComputable) {
                                    progress[index] = event.loaded / event.total;
                                    response.notify(getProgress());
                                    this.trigger('fetch-progress', getProgress());
                                }
                            }.bind(this), false);
                            return xhr;
                        }.bind(this)
                    });
                }.bind(this))(i);

                i++;
                deferreds.push(request);
            }.bind(this));

            $.when.apply($, deferreds).done(function() {
                this.trigger('fetch-success');
                response.resolve();
            }.bind(this));

            return response;
        }
    });
    return View;
});
