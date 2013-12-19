module.exports = {
    config: {
        path: '&id=ap7364935&format=ipad_landscape&page=0',
        options: {
            viewportSize: [{width: 1024, height: 778}]
        },
        media: {
            print: false
        },
        package: 'ipadvideo',
        actions: ['ipad-wait', 'ipad-after-inline-wait']
    },
    execute: function(){
        this.wait(4000, function() {
            this.echo("I've waited for a second.");
            this.save();
        });

        this.then(function(){
             this.waitUntilVisible('.alf-template', function(){
                 //this.sendKeys('input', 'phrase', {keepFoc0us: true});
                 this.save(this.config.actions[0]);
                 this.echo("I've waited for a selector visible. saved");
             }, function(){
                this.save(this.config.actions[0]);
                this.echo("I've waited for a selector visible. timeout");
             }, 5000);
        });
        this.waitUntilVisible('.alf-template', function(){
             //this.sendKeys('input', 'phrase', {keepFocus: true});
             this.save(this.config.actions[1]);
             this.echo("inline. saved");
         }, function(){
            this.save(this.config.actions[1]);
            this.echo("inline. timeout");
         }, 5000);
    }
};
