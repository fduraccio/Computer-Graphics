#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fsNormal;
out vec2 uvFS;
out vec3 fsPosition; 

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals
uniform sampler2D u_texture;
uniform mat4 pMatrix;     //matrix do transform positions


void main() {
  uvFS = a_uv;
  fsNormal = mat3(nMatrix) * inNormal; 
  fsPosition = (pMatrix * vec4(inPosition, 1.0)).xyz;

  gl_Position = matrix * vec4(inPosition, 1.0);
}