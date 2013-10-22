PediffReport = function (data, options) {
    this.data = data.tasks || {};
    this.coverage = data.coverage;
    $.extend(this.options, (options || {}));
    this.options.cacheBuster = data.cacheBuster;
    this.options.environmentsPaths = data.environments;
    this.init();
}

PediffReport.prototype = {
    data: null,
    coverage: null,
    state: {
        currentEnv: 0,
        currentVariant: null,
        currentData: null,
        loadedCount: 0,
        filterDiffering: true,
        loading: false,
        xhr: {},
        highQuality: false
    },
    options: {
        imagesPath: '../',
        environments: ['diff', 'current', 'candidate']
    },

    init: function () {
        var self = this;

        if (self.coverage) {
            $('#coverage .coverage-enabled').show();
            new CoverageReport(self.coverage);
        } else {
            $('#coverage .coverage-disabled').show();
        }

        self.calculateTasksDiff();
        self.loadTasks();

        self._bindChooseImage();
        self._bindArrowKeys();
        self._bindMouse();
        self._bindToggleQuality();

        self._bindFilterDiffering();
        self.filterDiffering();

        self._bindPanels();

    },

    _bindMouse: function () {
        var self = this;
        $('.images').on('click',function (e) {
            e.preventDefault();
            if (e.which == 1)
                self.chooseImage('next');
            else
                self.chooseImage(0);
        }).on("contextmenu", function (e) {
                e.preventDefault();
                self.chooseImage(0);
            });
        $('.images .actions').on('click', function (e) {
            e.stopPropagation();
        });
    },

    _bindArrowKeys: function () {
        var self = this;
        $(window).on('keyup', function (e) {
            if (e.keyCode == 37) {
                if (e.ctrlKey)
                    self.chooseVariantThrottle('previous');
                else
                    self.chooseImage('previous');
            }
            if (e.keyCode == 39) {
                if (e.ctrlKey)
                    self.chooseVariantThrottle('next');
                else
                    self.chooseImage('next');
            }

            if (e.keyCode == 40 && e.ctrlKey) { //down arrow
                self.chooseTask('_next');
            }
            if (e.keyCode == 38 && e.ctrlKey) { //up arrow
                self.chooseTask('_previous');
            }
        });
    },

    _bindToggleQuality: function () {
        var self = this;
        $('.toggle-quality').on('click', function (e) {
            e.preventDefault();

            self.state.highQuality = !self.state.highQuality;

            $(this).toggleClass('btn-primary');
            self.chooseVariantThrottle('first', 0);
        })
    },

    loadTasks: function () {
        var self = this;

        var html = '';

        var keys = Object.getSortedKeys(self.data, 'diff', 'desc');

        for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            var diff = self.data[name].diff;

            html += '<li><a href="#" class="level-' + self.diffToLevel(diff) +
                '" data-package="' + name + '">' +
                '<span class="badge pull-right tt-r"' +
                ' title="' + self.getTaskTooltip(diff) + '">' +
                self.diffToPercent(diff) +
                '</span>' + self.displayName(name);

            if (Object.size(self.data[name].actions) > 0) {
                html += ' <i class="icon-caret-down tt-b" title="' + Object.size(self.data[name].actions) + ' actions"></i>';
            }

            html += '</a>';

            if (Object.size(self.data[name].actions) > 0) {
                html += '<ul class="nav nav-pills nav-stacked collapse">';
                for (var action in self.data[name].actions) {
                    diff = self.data[name].actions[action].diff;
                    html += '<li><a href="#" class="level-' + self.diffToLevel(diff) + '' +
                        '" data-package="' + name + '" data-action="' + action + '">' +
                        '<span class="badge pull-right tt-r"' +
                        ' title="' + self.getTaskTooltip(diff) + '">' +
                        self.diffToPercent(diff) + '</span>' +
                        self.displayName(action) +
                        '</a></li>';
                }
                html += '</ul>';
            }
            html += '</li>';
        }

        $('ul.tasks').append(html);
        $('.tt-r').tooltip({placement: 'left'});
        $('.tt-b').tooltip({placement: 'bottom'});
        self._bindChooseTask();
    },

    getTaskTooltip: function (diff) {
        return (diff === -1) ? 'task run failure' : 'at least ' + this.diffToPercent(diff) + ' similarity';
    },

    calculateTasksDiff: function () {
        var self = this;

        for (var name in self.data) {
            var task = self.data[name];

            var diff = -1;
            for (var i = 0; i < task.variants.length; i++) {
                diff = Math.max(diff, task.variants[i].diff);
            }
            task.diff = diff;

            for (var action in task.actions) {
                diff = 0;
                for (var i = 0; i < task.actions[action].variants.length; i++) {
                    diff = Math.max(diff, task.actions[action].variants[i].diff);
                }
                task.actions[action].diff = diff;
            }
        }
    },

    _bindChooseTask: function () {
        var self = this;

        $('ul.tasks [data-package]').on('click', function (e) {
            e.preventDefault();

            if ($(this).parent().hasClass('active'))
                return;

            $(this).parents('.tasks').find('.collapse').removeClass('in');
            $(this).parents('.collapse').addClass('in');
            $(this).parent().children('.collapse').addClass('in');
            $(this).parents('.tasks').find('[data-package]').parent().removeClass('active');
            $(this).parent().addClass('active');

            self.chooseTask($(this).data('package'), $(this).data('action'));
        })
    },

    chooseTask: function (name, action) {
        var self = this;

        action = action || '';

        var $tasks = $('ul.tasks [data-package]:not(.ignore)');
        var current = $tasks.index($('ul.tasks .active > [data-package]:not(.ignore)'));
        if (name == '_next') {
            if (current < $tasks.size() - 1)
                $tasks.eq(current + 1).trigger('click');
            else
                $tasks.eq(0).trigger('click');
            return;
        }
        if (name == '_previous') {
            if (current > 0)
                $tasks.eq(current - 1).trigger('click');
            else
                $tasks.eq($tasks.size() - 1).trigger('click');
            return;
        }

        $('#tasks .panel-title').text(self.displayName(name + ((action) ? ': ' + action : '')));
        $('.container section header .variants').remove();

        if (typeof(self.data[name]) != 'undefined') {
            var data = self.data[name];
            if (action !== '')
                data = data.actions[action];
            self.state.currentData = data;
            self.state.currentName = name;
            self.state.currentAction = action;

            if (data.variants.length > 0) {
                var html = '<div class="btn-group pull-right variants">';

                for (var i in data.variants) {
                    var variant = data.variants[i];
                    html += '<a class="btn btn-default btn-sm" data-variant="' + i + '" href="#"><div class="tt" title="' + self.diffToPercent(variant.diff) + ' similarity">';
                    html += (variant.media === null) ? variant.viewportSize : variant.media;
                    html += ' <span class="badge" data-level="' + self.diffToLevel(variant.diff) + '">' + self.diffToPercent(variant.diff) + '</span>';
                    html += '</div></a>';
                }

                html += '</div>';

                $('#tasks header').append(html);
            }

            $('.tt').tooltip({placement: 'bottom'});
            self.filterDiffering();
            self._bindChooseVariant();
            self.chooseVariantThrottle('first', 0);
        }
    },

    _bindChooseVariant: function () {
        var self = this;
        $('.container section header .variants a').on('click', function (e) {
            e.preventDefault();

            if (!$(this).hasClass('btn-primary')) {
                self.chooseVariantThrottle($(this).data('variant'), 0);
            }
        })
    },

    clearVariant: function () {
        $('.total-progress .progress').removeClass('chosen').removeClass('done').find('.progress-bar').width(0);
        $('.images img').addClass('hidden').attr('src', '');
    },

    chooseVariantThrottle: function (id, timeout) {
        var self = this;

        if (typeof(timeout) === 'undefined')
            timeout = 300;

        self.clearVariant();

        if (id === 'first') {
            id = $('[data-variant]:not(.ignore)').eq(0).data('variant');
        } else if (self.state.currentVariant !== null) {
            if (id === 'next') {
                if (self.state.currentVariant < self.state.currentData.variants.length - 1)
                    id = self.state.currentVariant + 1;
                else
                    id = 0;

                var dir = 'next';
            }

            if (id === 'previous') {
                if (self.state.currentVariant > 0)
                    id = self.state.currentVariant - 1;
                else
                    id = self.state.currentData.variants.length - 1;

                dir = 'previous';
            }
        }

        $('[data-variant]').removeClass('btn-primary').filter('[data-variant="' + id + '"]').addClass('btn-primary');
        self.state.currentVariant = id;

        if ($('[data-variant="' + id + '"]').hasClass('ignore'))
            return self.chooseVariantThrottle(dir, timeout);

        clearTimeout(self.state.variantThrottle);
        self.state.variantThrottle = setTimeout(
            (function (idVariant) {
                return function () {
                    self.chooseVariant(idVariant);
                }
            })(id),
            timeout
        )
    },

    chooseVariant: function (id) {
        var self = this;
        var variant = self.state.currentData.variants[id];

        if (self.state.loading) {
            self.abortLoading();
        }

        if (variant.diff === -1) {
            $('#tasks').addClass('failure');
            $('[data-fill="candidate-path"]').attr(
                'href',
                self.options.environmentsPaths['candidate'] +
                    ((typeof(variant.path) !== 'undefined') ? variant.path : '')
            );
            $('[data-fill="current-path"]').attr(
                'href',
                self.options.environmentsPaths['current'] +
                    ((typeof(variant.path) !== 'undefined') ? variant.path : '')
            );
            $('[data-fill="task-file"]').text(self.state.currentData.file).show();
        } else {
            $('#tasks').removeClass('failure');
        }

        self.state.loading = true;

        for (var i = 0; i < self.options.environments.length; i++) {
            var env = self.options.environments[i];

            self.loadImage({
                env: env,
                name: self.state.currentName,
                action: self.state.currentAction,
                viewportSize: variant.viewportSize,
                media: variant.media,
                diff: variant.diff,
                path: variant.path,
                bar: $('.total-progress [data-environment="' + i + '"] .progress-bar'),
                img: $('.images .' + env + ' img')
            });

        }
    },

    diffToPercent: function (diff) {
        return (diff === -1) ? 'N/A' : (100 - Math.ceil(parseInt(diff) / 1000000)) + '%';
    },

    diffToLevel: function (diff) {
        return (diff === -1) ? 0 : (100 - Math.ceil(parseInt(diff) / 10000000) * 10);
    },

    displayName: function (name) {
        try {
            return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/-/g, ' ');
        } catch (e) {
            return name;
        }
    },

    abortLoading: function () {
        var self = this;

        if (self.state.loading) {
            for (var env in self.state.xhr) {
                self.state.xhr[env].abort();
                delete(self.state.xhr[env]);
            }
            self.state.loading = false;
        }
    },

    loadImage: function (opts) {
        var self = this;

        var src = self.breakCache(self.buildUrl(opts));

        self.state.xhr[opts.env] = $.ajax({
            url: src,
            xhr: function () {
                var xhr = jQuery.ajaxSettings.xhr();

                if (xhr instanceof window.XMLHttpRequest) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    xhr.addEventListener('progress', function (ev) {
                        if (ev.lengthComputable) {
                            var percentComplete = ev.loaded / ev.total;
                            opts.bar.width((percentComplete * 100) + '%').attr('data-level', Math.round(percentComplete * 100 / 10) * 10);
                        } else {
                            console.log('Unable to compute progress information since the total size is unknown');
                        }
                    }, false);
                    xhr.addEventListener('load', function (ev) {
                        delete(self.state.xhr[opts.env]);
                        opts.bar.parent().addClass('done');
                        if (++self.state.loadedCount == self.options.environments.length) {
                            self.state.loadedCount = 0;
                            self.chooseImage(0);
                            $('.container section header .variants .btn').removeClass('disabled');
                            self.state.loading = false;
                        }
                        $('.images .' + opts.env + ' .actions .download').attr('href', self.breakCache(self.buildUrl(opts, true)));
                        $('.images .' + opts.env + ' .actions .view').attr('href', self.options.environmentsPaths[opts.env] + ((typeof(opts.path) !== 'undefined') ? opts.path : ''));
                        opts.img.attr('src', "data:image/jpeg;base64," + base64Encode(xhr.responseText));
                    }, false);
                }
                return xhr;
            }
        })

    },

    _bindChooseImage: function () {
        var self = this;

        $('.total-progress .progress').on('click', function (e) {
            if ($(this).hasClass('done')) {
                var env = $(this).data('environment');
                self.chooseImage(env);
            }
        });
    },

    chooseImage: function (env) {
        var self = this;

        if (env == 'next') {
            if (self.state.currentEnv < self.options.environments.length - 1) {
                env = self.state.currentEnv + 1;
            } else {
                env = 0;
            }
        }

        if (env == 'previous') {
            if (self.state.currentEnv > 0) {
                env = self.state.currentEnv - 1;
            } else {
                env = self.options.environments.length - 1;
            }
        }

        self.state.currentEnv = env;

        $('.total-progress .progress').removeClass('chosen').filter('[data-environment="' + env + '"]').addClass('chosen');
        $('.images img').addClass('hidden');
        $('.images .' + self.options.environments[env] + ' img').removeClass('hidden');
    },

    buildUrl: function (opt, hq) {
        var self = this;

        if (typeof(hq) == 'undefined')
            var hq = self.state.highQuality;

        if (hq)
            var ext = '.png';
        else
            ext = '.jpg';

        var filename = opt.diff + '_' + opt.viewportSize + '_' + ((!!opt.media) ? opt.media + '_' : '') + opt.name +
            ((opt.action !== '') ? '@' + opt.action : '') + ext;
        return self.options.imagesPath + opt.env + ((hq) ? '/hq' : '') + '/' + filename;
    },

    breakCache: function (url) {
        var self = this;
        return  url + ((/\?/).test(url) ? "&" : "?") + self.options.cacheBuster;
    },

    filterDiffering: function () {
        var self = this;

        if (self.state.filterDiffering) {
            for (var name in self.data) {
                if (self.data[name].diff == 0) {
                    $('[data-package="' + name + '"]').hide().addClass('ignore');
                } else {
                    $('[data-package="' + name + '"]').show().removeClass('ignore');
                }

                for(var action in self.data[name].actions) {
                    if (self.data[name].actions[action].diff == 0) {
                        $('[data-package="' + name + '"][data-action="'+ action +'"]').hide().addClass('ignore');
                    } else {
                        $('[data-package="' + name + '"][data-action="'+ action +'"]').show().removeClass('ignore');
                    }
                }

                $('.tasks .collapse').each(function(){
                    if($(this).children('li').children('a').size() == $(this).children('li').children('a.ignore').size()) {
                        $(this).css('visibility','hidden');
                        $(this).prev('a').children('i').hide();
                    } else {
                        $(this).css('visibility','visible');
                        $(this).prev('a').children('i').show();
                    }
                });
            }

            if (self.state.currentData !== null) {
                for (var id in self.state.currentData.variants) {
                    if (self.state.currentData.variants[id].diff == 0) {
                        $('[data-variant="' + id + '"]').hide().addClass('ignore');
                    } else {
                        $('[data-variant="' + id + '"]').show().removeClass('ignore');
                    }
                }
            }
        } else {
            $('[data-package]').show().removeClass('ignore');
            $('[data-variant]').show().removeClass('ignore');
            $('.tasks .collapse').css('visibility','visible');
            $('.tasks .collapse').prev('a').children('i').show();
        }
    },

    _bindFilterDiffering: function () {
        var self = this;

        $('.toggle-differing').on('click', function () {
            $(this).toggleClass('btn-primary')
            self.state.filterDiffering = $(this).hasClass('btn-primary');
            self.filterDiffering();
        });
    },

    _bindPanels: function () {
        $('[data-package]').on('click', function () {
            $('.toggle-coverage').removeClass('active');
            $('section.panel').hide().filter('#tasks').show();
        });
        $('.toggle-coverage').on('click', function () {
            $(this).addClass('active');
            $('[data-package]').parent().removeClass('active');
            $('section.panel').hide().filter('#coverage').show();
        });
    }

}
