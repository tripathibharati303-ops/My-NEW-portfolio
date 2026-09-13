(function(){

  /* mouse spotlight */
  var spot = document.getElementById('spotlight');
  window.addEventListener('mousemove', function(e){
    spot.style.left = e.clientX + 'px';
    spot.style.top = e.clientY + 'px';
  });

  /* custom blue cursor (dot + trailing ring) */
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
  var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasFinePointer && dot && ring){
    window.addEventListener('mousemove', function(e){
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    });

    (function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    })();

    var hoverSelector = 'a, button, .theme-toggle, .to-top, .card, .c-card, .btn, .pill, input, textarea, [role="button"]';
    document.addEventListener('mouseover', function(e){
      if (e.target.closest(hoverSelector)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function(e){
      if (e.target.closest(hoverSelector)) document.body.classList.remove('cursor-hover');
    });
  } else if (dot && ring){
    dot.style.display = 'none';
    ring.style.display = 'none';
  }

  /* 3D tilt depth effect for skill cards */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasFinePointer && !reduceMotion){
    document.querySelectorAll('.skills .card').forEach(function(card){
      var maxTilt = 8; // degrees

      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;  // 0..1
        var py = (e.clientY - rect.top) / rect.height;  // 0..1
        var rotateY = (px - 0.5) * maxTilt * 2;
        var rotateX = (0.5 - py) * maxTilt * 2;
        card.style.transform =
          'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px) scale(1.02)';
      });

      card.addEventListener('mouseleave', function(){
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      });
    });
  }

  /* scroll-to-top visibility */
  var toTop = document.getElementById('toTop');
  window.addEventListener('scroll', function(){
    toTop.classList.toggle('show', window.scrollY > 400);
  });

  /* simple theme toggle: dim/brighten surfaces */
  var toggled = false;
  document.getElementById('themeToggle').addEventListener('click', function(){
    toggled = !toggled;
    var root = document.documentElement.style;
    root.setProperty('--bg', toggled ? '#F5F4F6' : '#0A0A0D');
    root.setProperty('--card', toggled ? '#FFFFFF' : '#131318');
    root.setProperty('--card-border', toggled ? '#E4E3E8' : '#232329');
    root.setProperty('--text', toggled ? '#17171D' : '#F1F1F5');
    root.setProperty('--text-dim', toggled ? '#6B6B78' : '#93939F');
    root.setProperty('--pill-bg', toggled ? '#F0EFF3' : '#26262E');
    root.setProperty('--pill-text', toggled ? '#26262E' : '#D8D8E0');
  });

  /* typewriter effect */
  var roles = ["CSE Student", "Problem Solver", "Web Designer", "Data Enthusiast"];
  var el = document.getElementById('typewriter');
  var ri = 0, ci = 0, deleting = false;

  function tick(){
    var word = roles[ri];
    if (!deleting){
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length){
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0){
        deleting = false;
        ri = (ri + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 75);
  }
  tick();

  /* ---- canvas stipple / dot-art renderer ---- */
  function stipple(canvas, drawShape, opts){
    opts = opts || {};
    var spacing = opts.spacing || 4;
    var color = opts.color || 'rgba(216,216,224,0.85)';
    var w = canvas.width, h = canvas.height;

    var off = document.createElement('canvas');
    off.width = w; off.height = h;
    var octx = off.getContext('2d');
    drawShape(octx, w, h);
    var data = octx.getImageData(0, 0, w, h).data;

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;

    for (var y = 0; y < h; y += spacing){
      for (var x = 0; x < w; x += spacing){
        var idx = (y * w + x) * 4 + 3; // alpha channel
        if (data[idx] > 120){
          var jitterX = (Math.random() - 0.5) * spacing * 0.5;
          var jitterY = (Math.random() - 0.5) * spacing * 0.5;
          var r = 0.7 + Math.random() * 0.6;
          ctx.globalAlpha = 0.55 + Math.random() * 0.45;
          ctx.beginPath();
          ctx.arc(x + jitterX, y + jitterY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  /* hero blob */
  var blobCanvas = document.getElementById('blobCanvas');
  if (blobCanvas){
    stipple(blobCanvas, function(ctx, w, h){
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(w/2, h/2, Math.min(w,h)/2 - 6, 0, Math.PI * 2);
      ctx.fill();
    }, { spacing: 6, color: 'rgba(240,53,92,0.55)' });
  }

  /* about name dot-art */
  stipple(document.getElementById('nameCanvas'), function(ctx, w, h){
    ctx.fillStyle = '#000';
    ctx.font = "700 72px 'Space Grotesk', sans-serif";
    ctx.textBaseline = 'top';
    ctx.fillText('BHARATI', 4, 10);
  }, { spacing: 4, color: 'rgba(216,216,224,0.85)' });

  /* contact envelope dot-art (outline only) */
  stipple(document.getElementById('envelopeCanvas'), function(ctx, w, h){
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    var pad = 20;
    ctx.strokeRect(pad, pad, w - pad*2, h - pad*2);
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(w/2, h/2 + 10);
    ctx.lineTo(w - pad, pad);
    ctx.stroke();
  }, { spacing: 5, color: 'rgba(216,216,224,0.85)' });

})();