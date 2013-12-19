module.exports = {
    config: {
        path: '&id=ap7364935&format=iphone&page=0',
        options: {
            viewportSize: [{width: 320, height: 480}]
        },
        media: {
            print: false
        },
        package: 'iphone',
        actions: ['iphone-wait']
    },
    execute: function(){
        this.wait(1000, function() {
            this.echo("I've waited for a second.");
            this.save();
        });

        this.then(function(){
             this.waitForSelector('.alf-template', function(){
                 //this.sendKeys('input', 'phrase', {keepFocus: true});
                 this.save(this.config.actions[0]);
                 this.echo("I've waited for a selector. saved");
             }, function(){
                this.save(this.config.actions[0]);
                this.echo("I've waited for a selector. timeout");
             }, 40000);
        })
    }
};
