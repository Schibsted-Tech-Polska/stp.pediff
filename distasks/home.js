module.exports = {
    config: {
        path: '&id=common408675&format=ipad_landscape&page=1',
        options: {
            viewportSize: [{width: 1024, height: 778}]
        },
        media: {
            print: false
        },
        package: 'ipad',
        //actions: ['after-wait', 'after-inline-wait']
    },
    execute: function(){
        this.waitUntilVisible('.alf-template', function(){
             this.save();
             this.echo("inline. saved");
        }, function(){
            this.save();
            this.echo("inline. timeout");
        }, 9000);
    }
};
