CoverageReport = function(data,options) {
    this.data = data || [];
    $.extend(this.options,(options || {}));
    this.init();
}

CoverageReport.prototype = {
    data: [],
    state: {},
    options: {},

    init: function(){
        var self = this;

        self.state.globalRatio = 0;

        var html = '';
        for(var i=0;i<self.data.length;i++) {

            html += self.tplRow(self.data[i]);

        }
        $('#coverage table tbody').append(html)

        self.state.globalRatio = Math.round((self.state.globalRatio/self.data.length));
        $('#coverage .progress-bar').attr('data-level',Math.ceil((self.state.globalRatio/10))*10).width(self.state.globalRatio+'%').parent().children('span').text(self.state.globalRatio+'%')
    },

    tplRow: function(route){
        var self = this;

        var testedRatio = 0;

        for(var i=0;i<route.variants.length;i++) {
            testedRatio += (route.variants[i].tested) ? 1 : 0;
        }

        testedRatio = Math.round((testedRatio/route.variants.length)*100);
        self.state.globalRatio += testedRatio;

        return (testedRatio == 100) ? self.tplSuccess(route) : self.tplFailure(route,testedRatio);
    },

    tplSuccess: function(route) {
        var self = this;

        var tests = [],files = [],media = [];
        for(var i=0;i<route.variants.length;i++) {
            for(var j=0;j<route.variants[i].tests.length;j++) {
                tests.push(route.variants[i].tests[j].testRoute);
                files = files.concat(route.variants[i].tests[j].files);
                media = media.concat(route.variants[i].tests[j].media);
            }
        }
        tests = Array.unique(tests);
        files = Array.unique(files);
        media = Array.unique(media);

        var html = '';
        html += '<tr>'
             + '<td>'+'<div class="level-100"></div> '+route.name+'</td>'
             + '<td>'+route.path+( (route.variants.length > 1) ? '<br/><small>and '+(route.variants.length - 1)+' variants</small>' : '' )+'</td>'
             + '<td>'+tests.join('<br/>')+'</td>'
             + '<td>'+self.label(files)+'</td>'
             + '<td>'+self.label(media)+'</td>'
             + '</tr>';
        return html;
    },

    tplFailure: function(route,ratio) {
        var self = this;

        var html = '';
        html += '<tr>'
            + '<td rowspan="'+route.variants.length+'">'+'<div class="level-'+Math.round(ratio/10)*10+'"></div> '+route.name+'</td>';

        for(var i=0;i<route.variants.length;i++) {
            if(i > 0)
                html += '<tr>';

            var tests = [],files = [],media = [];
            for(var j=0;j<route.variants[i].tests.length;j++) {
                tests.push(route.variants[i].tests[j].testRoute);
                files = files.concat(route.variants[i].tests[j].files);
                media = media.concat(route.variants[i].tests[j].media);
            }

            var variant = route.variants[i];
            var cl = (!variant.tested) ? 'class="danger"' : '';
            html += '<td '+cl+'>'+variant.fragments.join('/')+'</td>'
                + '<td '+cl+'>'+tests.join('<br/>')+'</td>'
                + '<td '+cl+'>'+self.label(files)+'</td>'
                + '<td '+cl+'>'+self.label(media)+'</td>'
                + '</tr>';
        }
        return html;
    },

    label: function(arr) {
        var html = '';
        for(var i=0;i<arr.length;i++) {
            html += '<span class="label label-default">'+arr[i]+'</span> ';
        }
        return html;
    }
}
