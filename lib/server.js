var nstatic = require('node-static'),
    socketio = require('socket.io');

var Server = function(config) {
    this.config = config || {};
    this.initialize();
};

Server.prototype = {
    initialize: function() {
        var staticServer = new nstatic.Server('./public/'),
            respond = function(req, res) {
                staticServer.serve(req, res, function(err) {
                    if(err) {
                        console.error("Error serving " + req.url + " - " + err.message);

                        res.writeHead(err.status, err.headers);
                        res.end();
                    }
                });
            };

        this.server = require('http').createServer(function(req, res) {
            req.addListener('end', respond.bind(staticServer, req, res)).resume();
        });

        this.io = socketio.listen(this.server);

        this.server.listen(5000);
    }
};

module.exports = Server;
