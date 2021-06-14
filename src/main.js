function main() {

	var canvas = document.getElementById("c");
	
	var gl = canvas.getContext("webgl2");
	if(!gl) {
		document.write("GL context not opened");
		return;
	}
    
}