jQuery.fn.rotate = function(angle) {
	var p = this.get(0);

	// we store the angle inside the image tag for persistence
	if (!p.angle) {
		p.angle = 0;
	}
	p.angle = (p.angle+angle)%4;

	var rotation = .5 * Math.PI * p.angle;

	if (document.all && !window.opera) {
		var canvas = document.createElement('img');

		canvas.src = p.src;
		canvas.height = p.height;
		canvas.width = p.width;

		var costheta = Math.cos(rotation);
		var sintheta = Math.sin(rotation);
		canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
	} else {
		var canvas = document.createElement('canvas');

		// retrieve image from global hash
		if (!window.imageHash) {
			window.imageHash = {};
		}
		if (!window.imageHash[p.id]) {
			window.imageHash[p.id] = new Image();
			window.imageHash[p.id].src = p.src;
		}
		var imageData = window.imageHash[p.id];

		// handle width and height
		var a = Math.abs(p.angle);

		if (a==1||a==3) {
			canvas.style.width = canvas.width = imageData.height;
			canvas.style.height = canvas.height = imageData.width;
		} else {
			canvas.style.width = canvas.width = imageData.width;
			canvas.style.height = canvas.height = imageData.height;
		}

		xMap = p.angle==3||p.angle==-1||a==2?-1:0;
		yMap = p.angle==1||p.angle==-3||a==2?-1:0;

		var context = canvas.getContext('2d');
		context.save();
		context.rotate(.5 * Math.PI * p.angle);
		context.drawImage(imageData, xMap*imageData.width, yMap*imageData.height, imageData.width, imageData.height);
		context.restore();
	}
	canvas.id = p.id;
	canvas.angle = p.angle;
	p.parentNode.replaceChild(canvas, p);
}

jQuery.fn.rotateRight = function() {
	this.rotate(1);
}

jQuery.fn.rotateLeft = function() {
	this.rotate(-1);
}
