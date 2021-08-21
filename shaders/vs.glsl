#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fsNormal;
out vec2 uvFS;

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals
uniform sampler2D u_texture;

void main() {
  uvFS = a_uv;
  fsNormal = mat3(nMatrix) * inNormal; 
  gl_Position = matrix * vec4(inPosition, 1.0);
}