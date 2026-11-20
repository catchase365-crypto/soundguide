(function(){
  window.__BOOK_SECTIONS__ = window.__BOOK_SECTIONS__ || {};
  window.__BOOK_REGISTER_SECTION__ = function(key, data) { window.__BOOK_SECTIONS__[key] = data; };

  var activeCleanups = [];
  var activeAudioContexts = [];
  var activeRafIds = [];
  var currentIdx = 0;
  var FLAT = [];

  function cleanupLabs() {
    activeRafIds.forEach(function(id){ cancelAnimationFrame(id); });
    activeRafIds = [];
    activeCleanups.forEach(function(fn){ try { fn(); } catch(e){} });
    activeCleanups = [];
    activeAudioContexts.forEach(function(ctx){ try { ctx.close(); } catch(e){} });
    activeAudioContexts = [];
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]; });
  }

  function formatInline(text) {
    var s = esc(text);
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    return s;
  }

  function mountLab(cardEl, block) {
    var canvas = cardEl.querySelector(".lab-canvas");
    var ctx = canvas.getContext("2d");
    var readoutEl = cardEl.querySelector(".lab-readout");
    var values = {};
    var updateCbs = [];

    (block.controls || []).forEach(function(c) {
      if (c.type === "slider") values[c.id] = Number(c.value != null ? c.value : (c.min || 0));
      else values[c.id] = Boolean(c.value);
    });

    function triggerUpdate() {
      updateCbs.forEach(function(fn){ try { fn(); } catch(e) { showErr(e); } });
    }

    function showErr(err) {
      var box = cardEl.querySelector(".lab-err");
      if (!box) { box = document.createElement("div"); box.className = "lab-err"; cardEl.appendChild(box); }
      box.textContent = "实验脚本运行提示: " + (err && err.message ? err.message : String(err));
    }

    cardEl.querySelectorAll("input[data-cid]").forEach(function(inp) {
      var cid = inp.getAttribute("data-cid");
      var unit = inp.getAttribute("data-unit") || "";
      var valSpan = cardEl.querySelector("[data-val-for='" + cid + "']");
      inp.addEventListener("input", function() {
        values[cid] = Number(inp.value);
        if (valSpan) valSpan.textContent = inp.value + unit;
        triggerUpdate();
      });
    });

    cardEl.querySelectorAll("button[data-cid]").forEach(function(btn) {
      var cid = btn.getAttribute("data-cid");
      var offLabel = btn.getAttribute("data-off");
      var onLabel = btn.getAttribute("data-on");
      btn.addEventListener("click", function() {
        values[cid] = !values[cid];
        btn.classList.toggle("active", values[cid]);
        btn.textContent = values[cid] ? onLabel : offLabel;
        triggerUpdate();
      });
    });

    var labAudio = null;
    var labApi = {
      canvas: canvas,
      ctx: ctx,
      width: canvas.width,
      height: canvas.height,
      values: values,
      setReadout: function(txt) { if (readoutEl) readoutEl.textContent = txt; },
      onUpdate: function(fn) { updateCbs.push(fn); },
      onCleanup: function(fn) { activeCleanups.push(fn); },
      getAudioContext: function() {
        if (!labAudio) {
          var AC = window.AudioContext || window.webkitAudioContext;
          labAudio = new AC();
          activeAudioContexts.push(labAudio);
        }
        if (labAudio.state === "suspended") labAudio.resume();
        return labAudio;
      },
      onLoop: function(fn) {
        var last = performance.now();
        var start = last;
        var alive = true;
        activeCleanups.push(function(){ alive = false; });
        function tick(now) {
          if (!alive) return;
          var dt = Math.min(0.1, (now - last) / 1000);
          last = now;
          try { fn(dt, (now - start) / 1000); } catch(e) { showErr(e); alive = false; return; }
          activeRafIds.push(requestAnimationFrame(tick));
        }
        activeRafIds.push(requestAnimationFrame(tick));
      }
    };

    try {
      var runner = new Function("lab", block.jsCode || "");
      runner(labApi);
      triggerUpdate();
    } catch(e) { showErr(e); }
  }

  function renderSectionData(meta, data) {
    cleanupLabs();
    var root = document.getElementById("bookContent");
    if (!root) return;
    root.innerHTML = "";

    var hero = document.createElement("section");
    hero.className = "glass-card";
    hero.innerHTML = "<div class='hero-meta'><span class='pill'>" + esc(meta.chapter) + "</span><span class='pill green'>" + esc(meta.pages) + "</span></div>" +
      "<h1 class='hero-title'>" + esc(data.title || meta.title) + "</h1>" +
      "<div class='intuition-box'>💡 <strong>核心直觉：</strong>" + formatInline(data.intuition || "") + "</div>";
    root.appendChild(hero);

    (data.blocks || []).forEach(function(block) {
      var card = document.createElement("section");
      if (block.type === "concept") {
        card.className = "glass-card";
        var html = "<h2 class='block-heading'>📘 " + esc(block.heading || "原理解析") + "</h2>";
        (block.paragraphs || []).forEach(function(p) { html += "<p class='para'>" + formatInline(p) + "</p>"; });
        if (block.formula && block.formula.expr) {
          html += "<div class='formula-box'><div class='formula-expr'>" + esc(block.formula.expr) + "</div><div class='formula-exp'>" + formatInline(block.formula.explain || "") + "</div></div>";
        }
        card.innerHTML = html;
        root.appendChild(card);
      } else if (block.type === "lab") {
        card.className = "glass-card lab-card";
        var slidersHtml = "";
        var btnsHtml = "";
        (block.controls || []).forEach(function(c) {
          var unit = c.unit || "";
          if (c.type === "slider") {
            slidersHtml += "<div class='ctrl-row'><span>" + esc(c.label) + "：<strong data-val-for='" + esc(c.id) + "'>" + esc(c.value) + esc(unit) + "</strong></span>" +
              "<input type='range' data-cid='" + esc(c.id) + "' data-unit='" + esc(unit) + "' min='" + esc(c.min) + "' max='" + esc(c.max) + "' step='" + esc(c.step || 1) + "' value='" + esc(c.value) + "'></div>";
          } else {
            var offLbl = c.label || "开关";
            var onLbl = c.activeLabel || (offLbl + "：开");
            var isOn = Boolean(c.value);
            btnsHtml += "<button class='ctrl-btn" + (isOn ? " active" : "") + "' data-cid='" + esc(c.id) + "' data-off='" + esc(offLbl) + "' data-on='" + esc(onLbl) + "'>" + esc(isOn ? onLbl : offLbl) + "</button>";
          }
        });
        card.innerHTML = "<h2 class='block-heading'>🧪 " + esc(block.heading || "交互实验") + "</h2>" +
          "<p class='lab-sub'>" + formatInline(block.instruction || "拖动滑块观察实时变化") + "</p>" +
          "<canvas class='lab-canvas' width='720' height='240'></canvas>" +
          "<div class='lab-readout'>就绪</div>" +
          (slidersHtml ? "<div class='ctrl-sliders'>" + slidersHtml + "</div>" : "") +
          (btnsHtml ? "<div class='ctrl-btns'>" + btnsHtml + "</div>" : "");
        root.appendChild(card);
        mountLab(card, block);
      } else if (block.type === "summary") {
        card.className = "glass-card";
        var sHtml = "<h2 class='block-heading'>🎯 " + esc(block.heading || "工程直觉与避坑速记") + "</h2><ul class='summary-list'>";
        (block.items || []).forEach(function(it) { sHtml += "<li>" + formatInline(it) + "</li>"; });
        sHtml += "</ul>";
        card.innerHTML = sHtml;
        root.appendChild(card);
      }
    });

    if (FLAT.length > 1) {
      var pager = document.createElement("div");
      pager.className = "bottom-pager";
      pager.innerHTML = "<button id='prevSecBtn'>← 上一小节</button><button id='nextSecBtn'>下一小节 →</button>";
      root.appendChild(pager);
      pager.querySelector("#prevSecBtn").onclick = function(){ window.__STEP_SECTION__(-1); };
      pager.querySelector("#nextSecBtn").onclick = function(){ window.__STEP_SECTION__(1); };
    }
    var stage = document.getElementById("stage");
    if (stage) stage.scrollTop = 0;
  }

  function loadSectionScript(item, cb) {
    if (window.__BOOK_SECTIONS__[item.key]) { cb(window.__BOOK_SECTIONS__[item.key]); return; }
    var s = document.createElement("script");
    s.src = item.file;
    s.onload = function() { cb(window.__BOOK_SECTIONS__[item.key]); };
    s.onerror = function() { alert("无法加载数据文件: " + item.file); };
    document.head.appendChild(s);
  }

  function renderTree(filter) {
    var manifest = window.__BOOK_MANIFEST__;
    var navTree = document.getElementById("navTree");
    if (!manifest || !navTree) return;
    var q = (filter || "").trim().toLowerCase();
    navTree.innerHTML = "";
    manifest.groups.forEach(function(group) {
      var matched = group.items.filter(function(it){ return !q || it.title.toLowerCase().indexOf(q) >= 0 || group.chapter.toLowerCase().indexOf(q) >= 0; });
      if (!matched.length) return;
      var folder = document.createElement("div");
      var hasActive = matched.some(function(it){ return it.idx === currentIdx; });
      folder.className = "folder" + ((q || hasActive) ? " open" : "");
      var head = document.createElement("div");
      head.className = "folder-title";
      head.innerHTML = "<span>📂</span><span>" + esc(group.chapter) + "</span>";
      head.onclick = function(){ folder.classList.toggle("open"); };
      folder.appendChild(head);
      var box = document.createElement("div");
      box.className = "folder-children";
      matched.forEach(function(it) {
        var d = document.createElement("div");
        d.className = "nav-item" + (it.idx === currentIdx ? " active" : "");
        d.innerHTML = esc(it.title) + "<small>" + esc(it.pages) + "</small>";
        d.onclick = function(){ openByIndex(it.idx); };
        box.appendChild(d);
      });
      folder.appendChild(box);
      navTree.appendChild(folder);
    });
  }

  function openByIndex(idx) {
    var item = FLAT[idx];
    if (!item) return;
    currentIdx = idx;
    var nav = document.getElementById("nav");
    if (nav) nav.classList.remove("open");
    var sb = document.getElementById("searchBox");
    renderTree(sb ? sb.value : "");
    try { localStorage.setItem("book_pos_" + document.title, String(idx)); } catch(e){}
    loadSectionScript(item, function(data) { if (data) renderSectionData(item, data); });
  }

  window.__STEP_SECTION__ = function(delta) {
    var next = currentIdx + delta;
    if (next >= 0 && next < FLAT.length) openByIndex(next);
  };

  window.__BOOT_BOOK__ = function() {
    var manifest = window.__BOOK_MANIFEST__;
    if (!manifest) return;
    document.title = manifest.bookTitle + " · 交互式教材";
    var h1 = document.getElementById("bookTitleEl");
    var sub = document.getElementById("bookMetaEl");
    if (h1) h1.textContent = manifest.bookTitle;
    if (sub) sub.textContent = "共 " + manifest.groups.length + " 章 · " + manifest.totalSections + " 个交互小节";
    FLAT = [];
    manifest.groups.forEach(function(g){ g.items.forEach(function(it){ FLAT.push(it); }); });
    var sb = document.getElementById("searchBox");
    if (sb) sb.addEventListener("input", function(e){ renderTree(e.target.value); });
    var saved = 0;
    try { saved = parseInt(localStorage.getItem("book_pos_" + document.title) || "0", 10) || 0; } catch(e){}
    openByIndex(FLAT[saved] ? saved : 0);
  };

  document.addEventListener("DOMContentLoaded", window.__BOOT_BOOK__);
})();