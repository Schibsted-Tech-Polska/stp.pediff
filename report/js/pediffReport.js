PediffReport = function(data,options) {
    console.log(data.tasks)
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
        loading: false,
        xhr: {},
        highQuality: false
    },
    options: {
        imagesPath: '../',
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
        self._bindMouse();
        self._bindToggleQuality();

        self._bindFilterDiffering();
        self.filterDiffering();

        self._bindPanels();

    },

    _bindMouse: function(){
        var self = this;
        $('.images').on('click',function(e){
            console.log(e.target);
            e.preventDefault();
            if(e.which == 1)
                self.chooseImage('next');
            else
                self.chooseImage(0);
        }).on("contextmenu",function(e){
                e.preventDefault();
                self.chooseImage(0);
            });
        $('.images .actions').on('click',function(e){
            e.stopPropagation();
        });
    },

    _bindArrowKeys: function(){
        var self = this;
        $(window).on('keyup',function(e){
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

            if(e.keyCode == 40 && e.ctrlKey) { //down arrow
                self.chooseTask('_next');
            }
            if(e.keyCode == 38 && e.ctrlKey) { //up arrow
                self.chooseTask('_previous');
            }
        });
    },

    _bindToggleQuality: function(){
        var self = this;
        $('.toggle-quality').on('click',function(e){
            e.preventDefault();

            self.state.highQuality = !self.state.highQuality;

            $(this).toggleClass('btn-primary');
            self.chooseVariantThrottle('first',0);
        })
    },

    loadTasks: function() {
        var self = this;

        var html = '';

        var keys = Object.getSortedKeys(self.data,'diff','desc');

        for(var i=0;i<keys.length;i++) {
            var name = keys[i];

            html += '<li><a href="#" class="level-'+self.diffToLevel(self.data[name].diff)+'" data-name="'+name+'">';
            html += '<span class="badge pull-right tt-r" title="at least '+self.diffToPercent(self.data[name].diff)+' similarity">'+self.diffToPercent(self.data[name].diff)+'</span>';
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

            $(this).parent().siblings().removeClass('active');
            $(this).parent().addClass('active');

            self.chooseTask($(this).data('name'));
        })
    },

    chooseTask: function(name){
        var self = this;

        var $tasks = $('ul.tasks [data-name]:not(.ignore)');
        var current = $tasks.index($('ul.tasks .active > [data-name]:not(.ignore)'));
        if(name == '_next') {
            if(current < $tasks.size() - 1)
                $tasks.eq(current + 1).trigger('click');
            else
                $tasks.eq(0).trigger('click');
            return;
        }
        if(name == '_previous') {
            if(current > 0)
                $tasks.eq(current - 1).trigger('click');
            else
                $tasks.eq($tasks.size() - 1).trigger('click');
            return;
        }

        $('#tasks .panel-title').text(self.displayName(name));
        $('.container section header .variants').remove();

        if(typeof(self.data[name]) != 'undefined') {
            var data = self.data[name];
            self.state.currentData = data;
            self.state.currentName = name;

            if(data.variants.length > 0) {
                var html = '<div class="btn-group pull-right variants">';

                for(var i in data.variants) {
                    var variant = data.variants[i];
                    html += '<a class="btn btn-default btn-sm" data-variant="'+i+'" href="#"><div class="tt" title="'+self.diffToPercent(variant.diff)+' similarity">';
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
            timeout = 300;

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

        if(self.state.loading) {
            self.abortLoading();
        }

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
        return (100-Math.ceil(parseInt(diff)/1000000))+'%';
    },

    diffToLevel: function(diff){
        return (100-Math.ceil(parseInt(diff)/10000000)*10);
    },

    displayName: function(name) {
        try {
            return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/-/g,' ');
        } catch(e) {
            return name;
        }
    },

    abortLoading: function() {
        var self = this;

        if(self.state.loading) {
            for(var env in self.state.xhr) {
                self.state.xhr[env].abort();
                delete(self.state.xhr[env]);
            }
            self.state.loading = false;
        }
    },

    loadImage: function(opts) {
        var self = this;

        var src = self.breakCache(self.buildUrl(opts));

        self.state.xhr[opts.env] = $.ajax({
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
                        delete(self.state.xhr[opts.env]);
                        opts.bar.parent().addClass('done');
                        if(++self.state.loadedCount == self.options.environments.length) {
                            self.state.loadedCount = 0;
                            self.chooseImage(0);
                            $('.container section header .variants .btn').removeClass('disabled');
                            self.state.loading = false;
                        }
                        $('.images .'+opts.env+' .actions .download').attr('href',self.breakCache(self.buildUrl(opts,true)));
                        $('.images .'+opts.env+' .actions .view').attr('href',self.options.environmentsPaths[opts.env]+((typeof(opts.path) !== 'undefined') ? opts.path : ''));
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

    buildUrl: function(opt,hq) {
        var self = this;

        if(typeof(hq) == 'undefined')
            var hq = self.state.highQuality;

        if(hq)
            var ext = '.png';
        else
            ext = '.jpg';

        var filename = opt.diff + '_' + opt.viewportSize + '_' + ((!!opt.media) ? opt.media  + '_' : '') + opt.name + ext;
        return self.options.imagesPath + opt.env + ((hq) ? '/hq' : '') + '/' + filename;
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

        $('.toggle-differing').on('click',function(){
            $(this).toggleClass('btn-primary')
            self.state.filterDiffering = $(this).hasClass('btn-primary');
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
