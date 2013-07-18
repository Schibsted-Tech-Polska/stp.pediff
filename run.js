var Pediff = require('./pediff'), pediff = new Pediff(), args = pediff.cli.args;
/* Make sure the script is invoked correctly */
if (args.length === 0){
    pediff.echo('No task provided!', 'ERROR');
    pediff.echo('Usage: casperjs run.js taskname', 'INFO');
    pediff.exit(1);
}
/* Run pediff rendering suit */
pediff.init(require('./tasks/' + args.pop()));
pediff.start().each(Object.keys(pediff.config.environments), function(pd, environment){
    pd.then(function(){ this.setEnvironment(environment); });
    pd.thenOpen(this.config.environments[environment] + (this.config.path || ''), function() {
        this.preExecute();
        this.execute();
    });
});
pediff.run();
