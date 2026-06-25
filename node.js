(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var MODE = ({
      'index.html': 'network',
      '':           'network',
      'thesis.html':  'orbit',
      'work.html':    'circuit',
      'gallery.html': 'mesh',
      'blog.html':    'drift'
    })[file] || 'network';
  
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');
  
    var w, h, dpr, P = [];
    var INK = '17,17,17';
    var mouse = { x: -9999, y: -9999 };
  
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function dot(x, y, r, a) {
      ctx.fillStyle = 'rgba(' + INK + ',' + a + ')';
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
    function seg(x1, y1, x2, y2, a, lw) {
      ctx.strokeStyle = 'rgba(' + INK + ',' + a + ')';
      ctx.lineWidth = (lw || 1) * dpr;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  
    function seed() {
      P = [];
      if (MODE === 'network') {
        for (var i = 0; i < 66; i++) P.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-.22, .22) * dpr, vy: rnd(-.22, .22) * dpr });
      } else if (MODE === 'orbit') {
        var cx = w * 0.5, cy = h * 0.5;
        for (var o = 0; o < 90; o++) {
          var R = rnd(40, Math.min(w, h) * 0.46);
          P.push({ R: R, ang: rnd(0, 6.28), sp: rnd(0.0008, 0.004) * (Math.random() < .5 ? -1 : 1), cx: cx, cy: cy });
        }
      } else if (MODE === 'circuit') {
        var gx = 120 * dpr, gy = 120 * dpr;
        for (var x = gx * 0.5; x < w; x += gx) for (var y = gy * 0.5; y < h; y += gy) {
          if (Math.random() < 0.78) P.push({ x: x + rnd(-20, 20) * dpr, y: y + rnd(-20, 20) * dpr, pulse: Math.random(), psp: rnd(0.002, 0.006) });
        }
      } else if (MODE === 'mesh') {
        for (var m = 0; m < 48; m++) P.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-.18, .18) * dpr, vy: rnd(-.18, .18) * dpr });
      } else if (MODE === 'drift') {
        for (var d = 0; d < 80; d++) P.push({ x: rnd(0, w), y: rnd(0, h), sp: rnd(.15, .5) * dpr, sway: rnd(0, 6.28), swsp: rnd(.005, .02) });
      }
    }

    function network() {
      var L = 150 * dpr;
      for (var i = 0; i < P.length; i++) {
        var n = P[i]; n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var dx = P[a].x - P[b].x, dy = P[a].y - P[b].y, dd = Math.hypot(dx, dy);
        if (dd < L) seg(P[a].x, P[a].y, P[b].x, P[b].y, 0.22 * (1 - dd / L));
      }
      var mx = mouse.x * dpr, my = mouse.y * dpr, ML = L * 1.25;
      for (var k = 0; k < P.length; k++) {
        var ed = Math.hypot(P[k].x - mx, P[k].y - my);
        if (ed < ML) seg(mx, my, P[k].x, P[k].y, 0.3 * (1 - ed / ML));
      }
      for (var p = 0; p < P.length; p++) dot(P[p].x, P[p].y, 2 * dpr, 0.9);
    }
  
    function orbit() {
      var prev = null;
      for (var i = 0; i < P.length; i++) {
        var o = P[i]; o.ang += o.sp;
        var x = o.cx + Math.cos(o.ang) * o.R, y = o.cy + Math.sin(o.ang) * o.R * 0.78;
        seg(o.cx, o.cy, x, y, 0.05);
        if (prev && Math.abs(prev.R - o.R) < 60 * dpr) seg(prev.x, prev.y, x, y, 0.12);
        dot(x, y, 2 * dpr, 0.85);
        prev = { x: x, y: y, R: o.R };
      }
      dot(P.length ? P[0].cx : w / 2, P.length ? P[0].cy : h / 2, 3 * dpr, 0.9);
    }
  
    function circuit() {
      for (var i = 0; i < P.length; i++) {
        var a = P[i], best = null, bd = 1e9;
        for (var j = 0; j < P.length; j++) {
          if (j === i) continue;
          var dx = P[j].x - a.x, dy = P[j].y - a.y;
          if (dx < -5 && dy < -5) continue;
          var dd = Math.hypot(dx, dy);
          if (dd < bd && dd < 220 * dpr) { bd = dd; best = P[j]; }
        }
        if (best) { seg(a.x, a.y, best.x, a.y, 0.16); seg(best.x, a.y, best.x, best.y, 0.16); }
      }
      for (var p = 0; p < P.length; p++) {
        var n = P[p]; n.pulse += n.psp; if (n.pulse > 1) n.pulse -= 1;
        ctx.fillStyle = 'rgba(' + INK + ',0.9)';
        ctx.fillRect(n.x - 2.5 * dpr, n.y - 2.5 * dpr, 5 * dpr, 5 * dpr);
        dot(n.x, n.y, (1 + n.pulse * 4) * dpr, 0.12 * (1 - n.pulse)); 
      }
    }
  
    function mesh() {
      for (var i = 0; i < P.length; i++) {
        var n = P[i]; n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (var a = 0; a < P.length; a++) {
        var ds = [];
        for (var b = 0; b < P.length; b++) if (b !== a) ds.push({ b: b, d: Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y) });
        ds.sort(function (u, v) { return u.d - v.d; });
        for (var t = 0; t < 3 && t < ds.length; t++) {
          if (ds[t].d < 320 * dpr) seg(P[a].x, P[a].y, P[ds[t].b].x, P[ds[t].b].y, 0.10);
        }
      }
      for (var p = 0; p < P.length; p++) dot(P[p].x, P[p].y, 2 * dpr, 0.85);
    }
  
    function drift() {
      for (var i = 0; i < P.length; i++) {
        var n = P[i]; n.y -= n.sp; n.sway += n.swsp;
        n.x += Math.sin(n.sway) * 0.3 * dpr;
        if (n.y < -10) { n.y = h + 10; n.x = rnd(0, w); }
      }
      var L = 110 * dpr;
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var dx = P[a].x - P[b].x, dy = P[a].y - P[b].y;
        if (Math.abs(dx) < 60 * dpr) {
          var dd = Math.hypot(dx, dy);
          if (dd < L) seg(P[a].x, P[a].y, P[b].x, P[b].y, 0.16 * (1 - dd / L));
        }
      }
      for (var p = 0; p < P.length; p++) dot(P[p].x, P[p].y, 1.8 * dpr, 0.85);
    }
  
    var RENDER = { network: network, orbit: orbit, circuit: circuit, mesh: mesh, drift: drift };
  
    function frame() {
      ctx.clearRect(0, 0, w, h);
      (RENDER[MODE] || network)();
      if (!reduce) requestAnimationFrame(frame);
    }
  
    window.addEventListener('resize', function () { resize(); seed(); });
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', function () { mouse.x = -9999; mouse.y = -9999; });
  
    resize(); seed(); frame();
  })();