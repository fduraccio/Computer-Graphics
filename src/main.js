
var canvas;
var gl = null,
	program = null,
	mesh = null;
	
var projectionMatrix, 
	perspProjectionMatrix,
	viewMatrix,
	worldMatrix;
var baseDir;
var shaderDir;
var program;

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 10.0;


function main(){
	

	// setup everything else
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	

	// Create a texture
	imgtx = new Image();
	imgtx.src = baseDir+"texture/Texture_01.jpg";
	imgtx.onload = function() {
		var textureId = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + 0);
		gl.bindTexture(gl.TEXTURE_2D, textureId);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtx);		
		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
		
		
		// links mesh attributes to shader attributes
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);
		 
	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);
		 
	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);

	program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
	program.textureUniform = gl.getUniformLocation(program, "u_texture");
		
	OBJ.initMeshBuffers(gl, mesh);
		
	// prepares the world, view and projection matrices.
	var w=canvas.clientWidth;
	var h=canvas.clientHeight;
		
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
		
	perspProjectionMatrix = perspective();


	// selects the mesh
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);		
	
	var textureId = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D, textureId);		
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtx);		
	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// turn on depth testing
	gl.enable(gl.DEPTH_TEST);

	//drawScene();
	
}


function drawScene() {
	// update WV matrix
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	projectionMatrix = utils.multiplyMatrices(perspProjectionMatrix, viewMatrix);

	// sets the uniforms
	gl.uniform1i(program.textureUniform, 0);

	// draws the request
	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));		
	gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	window.requestAnimationFrame(drawScene);		
}


async function init(){
	console.log("casa");
	var path = window.location.pathname;
	var page = path.split("/").pop();
	baseDir = window.location.href.replace(page, '');
	shaderDir = baseDir+"shaders/"; 

  	var canvas = document.getElementById("environment");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		document.write("GL context not opened");
		return;
	}
	utils.resizeCanvasToDisplaySize(gl.canvas);

  	await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
  	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
  	var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

  	program = utils.createProgram(gl, vertexShader, fragmentShader);
	});

	gl.useProgram(program);

	//Load Models 
	var flowerObjStr = await utils.get_objstr(baseDir+ "object/flower.obj");
    flowerModel = new OBJ.Mesh(flowerObjStr);

    var plantObjStr = await utils.get_objstr(baseDir+ "object/plant.obj");
    plantModel = new OBJ.Mesh(plantObjStr);

    var rock1ObjStr = await utils.get_objstr(baseDir+ "object/rock1.obj");
    rock1Model = new OBJ.Mesh(rock1ObjStr);

	///////////////////////////////////

	main();
}


