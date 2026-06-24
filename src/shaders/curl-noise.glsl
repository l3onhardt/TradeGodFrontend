vec3 curlNoise(vec3 p) {
  float s = 0.5;
  vec3 a = vec3(sin(p.x*s+1.7), sin(p.y*s+9.2), sin(p.z*s+3.3));
  vec3 b = vec3(cos(p.z*1.1), cos(p.x*1.1), cos(p.y*1.1));
  return cross(a, b) * 0.8;
}