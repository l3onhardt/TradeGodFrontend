// vertex shader body (does NOT redeclare uniforms/attributes — they're prefixed in forge-shader.ts)
vec3 pos = position;
vec3 flow = curlNoise(pos * 0.6 + uPhase * 0.5);
vec3 toCenter = -normalize(pos + vec3(1e-3));
pos += flow * (1.0 - uPhase) * 1.2;       // churn early
pos += toCenter * uPhase * 3.0;           // collapse late
float ring = smoothstep(0.45, 0.9, uPhase);
pos.y += sin(uPhase * 6.28 + pos.x * 4.0) * ring * 0.3;
gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
gl_PointSize = (2.0 + aSeed * 2.0) * (300.0 / -gl_Position.z);