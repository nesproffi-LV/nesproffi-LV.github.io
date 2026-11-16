/**
 * Ligne Vive — hero-overpass
 * WebGL-эффект «курсор раздвигает воздух» (приближение к igloo.inc/overpass).
 * Пиксели видео слегка расходятся вокруг курсора + лёгкая рябь.
 * Если WebGL недоступен / ошибка / тач / reduced-motion — просто остаётся обычное видео.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var video = document.getElementById('heroVideo');
  var hero = document.getElementById('heroVideoWrapper');
  if (!video || !hero || reduced || !fine) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'hero-gl';
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';

  var gl = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false }) || canvas.getContext('experimental-webgl');
  } catch (e) { return; }
  if (!gl) return;

  var VERT = [
    'attribute vec2 a_pos;',
    'varying vec2 v_uv;',
    'void main(){',
    '  v_uv = a_pos * 0.5 + 0.5;',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'varying vec2 v_uv;',
    'uniform sampler2D u_video;',
    'uniform vec2 u_cover;',
    'uniform vec2 u_shift;',
    'uniform vec2 u_mouse;',
    'uniform float u_time;',
    'uniform float u_intensity;',
    'void main(){',
    '  vec2 uv = v_uv * u_cover + u_shift;',
    '  vec2 to = uv - u_mouse;',
    '  float d = length(to);',
    '  vec2 dir = to / (d + 0.0001);',
    '  float bulge = smoothstep(0.30, 0.0, d) * 0.08 * u_intensity;',
    '  float ripple = sin(d * 55.0 - u_time * 2.2) * 0.008 * smoothstep(0.26, 0.0, d) * u_intensity;',
    '  uv += dir * (bulge + ripple);',
    '  gl_FragColor = texture2D(u_video, uv);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  var prog;
  try {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    return; // fallback: обычное видео
  }
  window.heroOverpassActive = true;

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uCover = gl.getUniformLocation(prog, 'u_cover');
  var uShift = gl.getUniformLocation(prog, 'u_shift');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uIntensity = gl.getUniformLocation(prog, 'u_intensity');

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Переносим тёплый CSS-фильтр видео на канвас
  try {
    var vf = getComputedStyle(video).filter;
    if (vf && vf !== 'none') canvas.style.filter = vf;
  } catch (e) {}

  var canvasInserted = false;

  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var px = 0, py = 0, cx = 0, cy = 0;
  var intensity = 0;
  var lastMove = 0;
  var t0 = performance.now();

  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height; // 0 сверху
    cx = mouse.tx - 0.5;
    cy = mouse.ty - 0.5;
    lastMove = performance.now();
  });
  hero.addEventListener('mouseleave', function () {
    mouse.tx = 0.5; mouse.ty = 0.5;
    cx = 0; cy = 0;
  });

  function resize() {
    var w = hero.clientWidth || 1;
    var h = hero.clientHeight || 1;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    var vw = video.videoWidth || 16;
    var vh = video.videoHeight || 9;
    var s = Math.max(w / vw, h / vh);
    var dw = vw * s, dh = vh * s;
    var ox = (w - dw) / 2, oy = (h - dh) / 2;
    gl.uniform2f(uCover, w / dw, h / dh);
    gl.uniform2f(uShift, -ox / dw, -oy / dh);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (video.readyState < 2) return; // видео ещё не готово
    var idle = now - lastMove;
    var target = idle > 3000 ? 0 : 1;
    intensity += (target - intensity) * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.12;
    mouse.y += (mouse.ty - mouse.y) * 0.12;
    px += (cx - px) * 0.06;
    py += (cy - py) * 0.06;

    gl.useProgram(prog);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) { return; }
    gl.uniform2f(uMouse, mouse.x, 1.0 - mouse.y);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform1f(uIntensity, intensity);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!canvasInserted) {
      video.parentNode.insertBefore(canvas, video.nextSibling);
      canvasInserted = true;
    }
    canvas.style.transform = 'translate(' + (-px * 12) + 'px,' + (-py * 12) + 'px) scale(1.06)';
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
})();
