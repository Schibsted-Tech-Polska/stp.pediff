Test = function(test,media,file) {
    var files = [];
    files.push(file);
    this.files = files;
    this.testRoute = test;
    this.media = media;
}

Test.prototype = {
    files: [],
    testRoute: null,
    media: [],

    getTestRoute: function(){
        var self = this;
        return self.testRoute;
    },

    merge: function(media,file){
        var self = this;
        self.files.push(file);
        self.media.concat(media);
    }
}
