module.exports = {
    config: {
        path: '&id=ap7364935&format=iphone&page=0',
        options: {
            viewportSize: [{width: 320, height: 920}]
        },
        media: {
            print: false
        },
        package: 'iphone',
        //actions: ['iphone-wait', 'after-inline-wait']
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
