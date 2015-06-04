var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;
var width = 600;
var height = 600;
var maxpaths = 99;
var paths = [];
var clients = [];

http.listen(port, function() {
    console.log("server started at port " + port);
});

app.use(express.static(__dirname + '/public'));

app.use(express.static(__dirname + '/public/html'));

io.on('connection', function(socket) {
    io.to(socket.id).emit('canvas', JSON.stringify(paths));
    clients.push(socket.id);
    socket.on('disconnect', function() {
	clients.splice(clients.indexOf(socket.id), 1);
	if (clients.length == 0)
	    paths = [];
    });
    socket.on('draw', function(msg) {
	var path = JSON.parse(msg);
	paths.push(path);
	if (paths.length > maxpaths)
	    paths.shift();

	clients.forEach(function(id) {
	    if (id !== socket.id)
		io.to(id).emit('path', JSON.stringify(path));
	});
    });
});   
