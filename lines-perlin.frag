#ifdef GL_ES
precision mediump float;
#endif

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{ 
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i); 
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                          dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}



uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


void main() {
  float lineSpacing = 40.0; // расстояние между линиями в пикселях
  float lineWidth = 1.9; // ширина линии в пикселях

  // переводим координаты в пространство пикселей и вычитаем половину ширины линии,
  // чтобы линия была центрирована относительно своего "ячейкового" пространства
  float y = gl_FragCoord.y - lineWidth / 2.0;

  // добавляем шум Перлина для создания волнистого эффекта
  y += 60.0 * snoise(vec2(u_time * 0.2 + (gl_FragCoord.y / lineSpacing * 0.05), gl_FragCoord.x / u_resolution.x));
    
  if (mod(y, lineSpacing) < lineWidth) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // цвет линии (красный)
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // цвет фона (черный)
  }
}
