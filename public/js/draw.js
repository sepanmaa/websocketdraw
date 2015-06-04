$(document).ready(function() {
    var socket = io();
    var canvas = document.getElementById('drawing');
    var ctx = canvas.getContext('2d');
    var path = null;

    var Path = function(x, y, color, width) {
	this.color = color;
	this.points = [];
	this.points.push({x: x, y: y});
	this.drawing = true;
	this.width = width;
    }
    
    Path.prototype.to = function(x, y) {
	this.points.push({x: x, y: y});
    }

    Path.prototype.end = function() {
	this.drawing = false;
    }

    function getMousePos(e) {
	var rect = canvas.getBoundingClientRect();
	return {
	    x: e.clientX - rect.left,
	    y: e.clientY - rect.top
	};
    }

    function drawPath(path) {
	var points = path.points;
	if (points.length > 0) {
	    ctx.strokeStyle = path.color;
	    ctx.lineWidth = path.width;
	    ctx.beginPath();
	    ctx.moveTo(points[0].x, points[0].y);
	    for (var i = 1; i < points.length; i++)
		ctx.lineTo(points[i].x, points[i].y);
	    ctx.stroke();
	}
    }
    
    document.addEventListener('mousedown', function(e) {
	var color = $('#color').val();
	var width = $('#linewidth').val();
	var mouse = getMousePos(e);
	path = new Path(mouse.x, mouse.y, color, width);
    });
    
    document.addEventListener('mouseup', function(e) {
	path.end();
	socket.emit('draw', JSON.stringify(path));
    });

    document.addEventListener('mousemove', function(e) {
	if (path.drawing) {
	    var mouse = getMousePos(e);
	    path.to(mouse.x, mouse.y);
	    drawPath(path);
	}
    });

    socket.on('path', function(msg) {
	var path = JSON.parse(msg);
	drawPath(path);
    });

    socket.on('canvas', function(msg) {
	var paths = JSON.parse(msg);
	paths.forEach(function(path) { drawPath(path) });
    });
});
