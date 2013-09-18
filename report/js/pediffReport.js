PediffReport = function(data,options) {
    this.data = data.tasks || {};
    this.coverage = data.coverage;
    $.extend(this.options,(options || {}));
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
        loading: false
    },
    options: {
        imagesPath: '../',
        imagesExt: '.png',
        environments: ['diff','current','candidate']
    },

    init: function(){
        var self = this;

        if(self.coverage) {
            $('#coverage .coverage-enabled').show();
            new CoverageReport(self.coverage);
        } else {
            $('#coverage .coverage-disabled').show();
        }

        self.calculateTasksDiff();
        self.loadTasks();

        self._bindChooseImage();
        self._bindArrowKeys();

        self._bindFilterDiffering();
        self.filterDiffering();

        self._bindPanels();

    },

    _bindArrowKeys: function(){
        var self = this;
        $(window).on('keyup',function(e){
            if(self.state.loading)
                return;

            if(e.keyCode == 37) {
                if(e.ctrlKey)
                    self.chooseVariantThrottle('previous');
                else
                    self.chooseImage('previous');
            } if(e.keyCode == 39) {
                if(e.ctrlKey)
                    self.chooseVariantThrottle('next');
                else
                    self.chooseImage('next');
            }

            if(e.keyCode == 40 && e.ctrlKey)
            $('.images ').focus();

            if(e.keyCode == 38 && e.ctrlKey)
            $('.images ').focus();
        });
    },

    loadTasks: function() {
        var self = this;

        var html = '';

        var keys = Object.getSortedKeys(self.data,'diff','desc');

        for(var i=0;i<keys.length;i++) {
            var name = keys[i];

            html += '<li><a href="#" class="level-'+self.diffToLevel(self.data[name].diff)+'" data-name="'+name+'">';
            html += '<span class="badge pull-right tt-r" title="up to '+self.diffToPercent(self.data[name].diff)+' difference">'+self.diffToPercent(self.data[name].diff)+'</span>';
            html += self.displayName(name);
            html += '</a></li>';
        }

        $('ul.tasks').append(html);
        $('.tt-r').tooltip({placement: 'left'});
        self._bindChooseTask();
    },

    calculateTasksDiff: function() {
        var self = this;

        for(var name in self.data) {
            var task = self.data[name];

            var diff = 0;
            for(var i=0; i < task.variants.length; i++) {
                diff = Math.max(diff,task.variants[i].diff);
            }

            task.diff = diff;
        }
    },

    _bindChooseTask: function() {
        var self = this;

        $('ul.tasks [data-name]').on('click',function(e){
            e.preventDefault();

            if($(this).parent().hasClass('active'))
                return;

            if(self.state.loading)
                return;

            $(this).parent().siblings().removeClass('active');
            $(this).parent().addClass('active');

            self.chooseTask($(this).data('name'));
            $('#tasks .panel-title').text(self.displayName($(this).data('name')));
        })
    },

    chooseTask: function(name){
        var self = this;

        if(self.state.loading)
            return;

        $('.container section header .variants').remove();

        if(typeof(self.data[name]) != 'undefined') {
            var data = self.data[name];
            self.state.currentData = data;
            self.state.currentName = name;

            if(data.variants.length > 0) {
                var html = '<div class="btn-group pull-right variants">';

                for(var i in data.variants) {
                    var variant = data.variants[i];
                    html += '<a class="btn btn-default btn-sm" data-variant="'+i+'" href="#"><div class="tt" title="'+self.diffToPercent(variant.diff)+' difference">';
                    html += (variant.media === null) ? variant.viewportSize : variant.media;
                    html += ' <span class="badge" data-level="'+self.diffToLevel(variant.diff)+'">'+self.diffToPercent(variant.diff)+'</span>';
                    html += '</div></a>';
                }

                html += '</div>';

                $('#tasks header').append(html);
            }

            $('.tt').tooltip({placement: 'bottom'});
            self.filterDiffering();
            self._bindChooseVariant();
            self.chooseVariantThrottle('first',0);
        }
    },

    _bindChooseVariant: function() {
        var self = this;
        $('.container section header .variants a').on('click',function(e){
            e.preventDefault();

            if(!$(this).hasClass('btn-primary')) {
                self.chooseVariantThrottle($(this).data('variant'),0);
            }
        })
    },

    clearVariant: function(){
        $('.total-progress .progress').removeClass('chosen').removeClass('done').find('.progress-bar').width(0);
        $('.images img').addClass('hidden').attr('src','');
    },

    chooseVariantThrottle: function(id,timeout){
        var self = this;

        if(typeof(timeout) === 'undefined')
            timeout = 1000;

        if(self.state.loading)
            return;

        self.clearVariant();

        if(id === 'first') {
            id = $('[data-variant]:not(.ignore)').eq(0).data('variant');
        } else if(self.state.currentVariant !== null) {
            if(id === 'next') {
                if(self.state.currentVariant < self.state.currentData.variants.length - 1)
                    id = self.state.currentVariant + 1;
                else
                    id = 0;

                var dir = 'next';
            }

            if(id === 'previous') {
                if(self.state.currentVariant > 0)
                    id = self.state.currentVariant - 1;
                else
                    id = self.state.currentData.variants.length - 1;

                dir = 'previous';
            }
        }

        $('[data-variant]').removeClass('btn-primary').filter('[data-variant="'+id+'"]').addClass('btn-primary');
        self.state.currentVariant = id;

        if($('[data-variant="'+id+'"]').hasClass('ignore'))
            return self.chooseVariantThrottle(dir,timeout);

        clearTimeout(self.state.variantThrottle);
        self.state.variantThrottle = setTimeout(
            (function(idVariant){
                return function(){
                    self.chooseVariant(idVariant);
                }
            })(id),
            timeout
        )
    },

    chooseVariant: function(id) {
        var self = this;
        var variant = self.state.currentData.variants[id];

        $('.container section header .variants .btn').addClass('disabled');

        self.state.loading = true;

        for(var i=0;i < self.options.environments.length; i++) {
            var env = self.options.environments[i];

            self.loadImage({
                env: env,
                name: self.state.currentName,
                viewportSize: variant.viewportSize,
                media:  variant.media,
                diff: variant.diff,
                path: variant.path,
                bar: $('.total-progress [data-environment="'+i+'"] .progress-bar'),
                img: $('.images .'+env+' img')
            });

        }
    },

    diffToPercent: function(diff){
        return Math.ceil(parseInt(diff)/1000000)+'%';
    },

    diffToLevel: function(diff){
        return Math.ceil(parseInt(diff)/10000000)*10;
    },

    displayName: function(name) {
        try {
            return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/-/g,' ');
        } catch(e) {
            return name;
        }
    },

    loadImage: function(opts) {
        var self = this;

        var src = self.breakCache(self.buildUrl(opts));

        $.ajax({
            url: src,
            xhr: function() {
                var xhr = jQuery.ajaxSettings.xhr();

                if(xhr instanceof window.XMLHttpRequest) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    xhr.addEventListener('progress', function(ev){
                        if (ev.lengthComputable) {
                            var percentComplete = ev.loaded / ev.total;
                            opts.bar.width((percentComplete*100)+'%').attr('data-level',Math.round(percentComplete*100/10)*10);
                        } else {
                            console.log('Unable to compute progress information since the total size is unknown');
                        }
                    }, false);
                    xhr.addEventListener('load', function(ev){
                        opts.bar.parent().addClass('done');
                        if(++self.state.loadedCount == self.options.environments.length) {
                            self.state.loadedCount = 0;
                            self.chooseImage(0);
                            $('.container section header .variants .btn').removeClass('disabled');
                            self.state.loading = false;
                        }
                        $('.images .'+opts.env+' .actions .download').attr('href',src);
                        $('.images .'+opts.env+' .actions .view').attr('href',self.options.environmentsPaths[opts.env]+opts.path);
                        opts.img.attr('src',"data:image/jpeg;base64," + base64Encode(xhr.responseText));
                    }, false);
                }
                return xhr;
            }
        })

    },

    _bindChooseImage: function(){
        var self = this;

        $('.total-progress .progress').on('click',function(e){
            if($(this).hasClass('done')) {
                var env = $(this).data('environment');
                self.chooseImage(env);
            }
        });
    },

    chooseImage: function(env){
        var self = this;

        if(env == 'next') {
            if(self.state.currentEnv < self.options.environments.length - 1) {
                env = self.state.currentEnv + 1;
            } else {
                env = 0;
            }
        }

        if(env == 'previous') {
            if(self.state.currentEnv > 0) {
                env = self.state.currentEnv - 1;
            } else {
                env = self.options.environments.length - 1;
            }
        }

        self.state.currentEnv = env;

        $('.total-progress .progress').removeClass('chosen').filter('[data-environment="'+env+'"]').addClass('chosen');
        $('.images img').addClass('hidden');
        $('.images .'+self.options.environments[env]+' img').removeClass('hidden');
    },

    buildUrl: function(opt) {
        var self = this;
        var filename = opt.diff + '_' + opt.viewportSize + '_' + ((!!opt.media) ? opt.media  + '_' : '') + opt.name + self.options.imagesExt;
        return self.options.imagesPath + opt.env + '/' + filename;
    },

    breakCache: function(url) {
        var self = this;
        return  url + ((/\?/).test(url) ? "&" : "?") + self.options.cacheBuster;
    },

    filterDiffering: function() {
        var self = this;

        if(self.state.filterDiffering) {
            for(var name in self.data) {
                if(self.data[name].diff == 0) {
                    $('[data-name="'+name+'"]').hide().addClass('ignore');
                } else {
                    $('[data-name="'+name+'"]').show().removeClass('ignore');
                }
            }

            if(self.state.currentData !== null) {
                for(var id in self.state.currentData.variants) {
                    if(self.state.currentData.variants[id].diff == 0) {
                        $('[data-variant="'+id+'"]').hide().addClass('ignore');
                    } else {
                        $('[data-variant="'+id+'"]').show().removeClass('ignore');
                    }
                }
            }
        } else {
            $('[data-name]').show().removeClass('ignore');
            $('[data-variant]').show().removeClass('ignore');
        }
    },

    _bindFilterDiffering: function() {
        var self = this;

        $('#differences').on('change',function(){
            self.state.filterDiffering = $(this).is(':checked');
            self.filterDiffering();
        });
    },

    _bindPanels: function(){
        $('[data-name]').on('click',function(){
            $('.toggle-coverage').removeClass('active');
            $('section.panel').hide().filter('#tasks').show();
        });
        $('.toggle-coverage').on('click',function(){
            $(this).addClass('active');
            $('[data-name]').parent().removeClass('active');
            $('section.panel').hide().filter('#coverage').show();
        });
    }

}
