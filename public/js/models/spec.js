define(['collections/results'], function(ResultsCollection) {
    var Model = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            data.results = new ResultsCollection(data.results, {parse: true});
            return data;
        },
        getAverageDiff: function() {
            return Math.ceil(this.get('results').reduce(function(sum, result) {
                return sum + result.get('diff');
            }, 0) / this.get('results').length);
        },
        getTextColor: function() {
            var diff = this.getAverageDiff(),
                color = 'green';

            if(diff > 25) {
                color = 'yellow';
            }

            if(diff > 50) {
                color = 'orange';
            }

            if(diff > 75) {
                color = 'red';
            }

            return color;
        },
        getSlug: function() {
            return this.get('name').replace(/ /g, '-')
        }
    });
    return Model;
});
