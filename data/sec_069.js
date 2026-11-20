window.__BOOK_REGISTER_SECTION__("sec_069", {
  "title": "常见冲激响应：单位冲激函数 (Delta Function)",
  "intuition": "只要改变一个单脉冲的“高度”和“位置”（或再多加一个脉冲），线性系统就能变身成无损导线、放大器、延迟器或回声发生器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 卷积中的“数字 1”：单位冲激恒等性 (Identity)",
      "paragraphs": [
        "在信号处理中，最简单的冲激响应莫过于一个**单位冲激函数（Delta Function）** $\\delta[n]$：只在 $n=0$ 处有一个幅度为 1 的尖峰，其余时刻全为 0。这意味着当你往系统输入一个单脉冲，输出端会原封不动地吐出一个一模一样的单脉冲。",
        "根据线性系统的叠加性，既然单个脉冲能原样通过，那么由无数个脉冲拼成的**任意复杂信号**，经过这个系统后也都会毫发无损地原样输出。在数学上，这被称为**卷积的恒等元（Identity）**——就像加法里的 `0`（$a+0=a$）和乘法里的 `1`（$a\\times 1=a$）一样，任何信号与 $\\delta[n]$ 卷积，结果依然是它自己。",
        "别看它好像“什么都没干”，这恰恰是**数据存储、无线通信与精密测量系统**追求的最高境界：数字信号处理中有大量工作，正是为了消除畸变，让真实信息像通过 $\\delta[n]$ 一样无损穿过系统。"
      ],
      "formula": {
        "expr": "x[n] * δ[n] = x[n]",
        "explain": "x[n] 是原始输入信号，* 表示卷积运算，δ[n] 是单位冲激函数（仅在 n=0 时为 1，其余为 0）。公式表示任意信号与单位冲激卷积，输出保持完全不变。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 缩放与移位：放大器、衰减器与时间延迟",
      "paragraphs": [
        "既然 $\\delta[n]$ 是原样透传，只要对这个小脉冲动手脚，就能立刻得到两种最基础的信号处理系统：",
        "**（1）改变脉冲高度（放大与衰减）：** 如果把冲激响应的幅度乘以常数 $k$，即 $h[n] = k\\delta[n]$，那么输出信号就会整体变成原来的 $k$ 倍。当 $k > 1$ 时（如原书图 7-1b 中的 $k=1.6$），系统就是**放大器（Amplifier）**；当 $0 < k < 1$ 时，系统就是**衰减器（Attenuator）**。",
        "**（2）改变脉冲位置（信号延迟与超前）：** 如果把单位冲激从 $n=0$ 挪到其他位置，写为 $\\delta[n+s]$，输出信号就会整体产生相同的样本偏移，变成 $x[n+s]$。以原书图 7-1c 为例，脉冲位于 $n=4$ 处（即 $s=-4$，冲激响应为 $\\delta[n-4]$），系统就会把输入信号**延迟（Delay）** 4 个采样点输出；反之若 $s > 0$，在数学上则对应信号的**超前（Advance）**。从深空探测器传回地球的无线电时延，到生物神经元突触传递动作电位的毫秒级滞后，本质上都是移位冲激响应的体现。"
      ],
      "formula": {
        "expr": "x[n] * kδ[n] = k·x[n]  |  x[n] * δ[n+s] = x[n+s]",
        "explain": "k 为幅度缩放系数（k>1 放大，k<1 衰减）；s 为移位参数（当 s 为负数如 s=-4 时，δ[n-4] 在 n=4 处出现脉冲，使信号向右延迟 4 个样本；s 为正数时向左超前）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：缩放与移位冲激卷积显微镜",
      "instruction": "拖动“脉冲幅度 k”与“延迟样本 d”，观察左侧冲激响应 h[n] 如何通过卷积直接塑造右侧输出信号 y[n]。",
      "controls": [
        {
          "type": "slider",
          "id": "gain",
          "label": "脉冲幅度 k",
          "min": 0.2,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "delay",
          "label": "延迟样本 d (即 -s)",
          "min": -4,
          "max": 8,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "showInput",
          "label": "叠加显示原始输入 x[n]",
          "value": true
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var N_MIN = -4;\n  var N_MAX = 16;\n  var H_MIN = -4;\n  var H_MAX = 8;\n\n  function inputSignal(n) {\n    if (n < 0 || n > 6) return 0;\n    if (n === 0) return 0.35;\n    if (n === 1) return 0.85;\n    if (n === 2) return 1.0;\n    if (n === 3) return 0.7;\n    if (n === 4) return 0.4;\n    if (n === 5) return 0.2;\n    return 0.05;\n  }\n\n  function drawPanelGrid(x0, y0, pw, ph, nMin, nMax, yMin, yMax, title) {\n    ctx.fillStyle = 'rgba(255,255,255,0.02)';\n    ctx.fillRect(x0, y0, pw, ph);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(x0, y0, pw, ph);\n\n    var zeroY = y0 + ph * (yMax / (yMax - yMin));\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath();\n    ctx.moveTo(x0, zeroY);\n    ctx.lineTo(x0 + pw, zeroY);\n    ctx.stroke();\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n    for (var yVal = Math.ceil(yMin); yVal <= Math.floor(yMax); yVal++) {\n      if (yVal === 0) continue;\n      var py = y0 + ph * ((yMax - yVal) / (yMax - yMin));\n      ctx.beginPath();\n      ctx.moveTo(x0, py);\n      ctx.lineTo(x0 + pw, py);\n      ctx.stroke();\n    }\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    for (var n = nMin; n <= nMax; n += 2) {\n      var px = x0 + 16 + (pw - 32) * ((n - nMin) / (nMax - nMin));\n      ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n      ctx.beginPath();\n      ctx.moveTo(px, y0);\n      ctx.lineTo(px, y0 + ph);\n      ctx.stroke();\n      ctx.fillText(String(n), px, y0 + ph + 13);\n    }\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(title, x0 + 8, y0 - 8);\n    return zeroY;\n  }\n\n  function drawStem(x, zeroY, targetY, color, radius, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = 2;\n    if (dashed) ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(x, zeroY);\n    ctx.lineTo(x, targetY);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.beginPath();\n    ctx.arc(x, targetY, radius, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.restore();\n  }\n\n  function render() {\n    var k = lab.values.gain;\n    var d = Math.round(lab.values.delay);\n    var showIn = lab.values.showInput;\n\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    var leftX = 24, leftW = 230, topY = 28, panelH = 178;\n    var rightX = 292, rightW = 406;\n\n    var zeroYL = drawPanelGrid(leftX, topY, leftW, panelH, H_MIN, H_MAX, -0.4, 2.2, '冲激响应 h[n] = k·δ[n - d]');\n    for (var n = H_MIN; n <= H_MAX; n++) {\n      var px = leftX + 16 + (leftW - 32) * ((n - H_MIN) / (H_MAX - H_MIN));\n      var val = (n === d) ? k : 0;\n      var py = topY + panelH * ((2.2 - val) / 2.6);\n      if (n === d) {\n        drawStem(px, zeroYL, py, '#f59e0b', 4.5, false);\n        ctx.fillStyle = '#f59e0b';\n        ctx.font = 'bold 11px monospace';\n        ctx.textAlign = 'center';\n        ctx.fillText(k.toFixed(1), px, py - 9);\n      } else {\n        drawStem(px, zeroYL, zeroYL, 'rgba(148,163,184,0.45)', 2.5, false);\n      }\n    }\n\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = 'bold 18px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('*', 273, topY + panelH / 2 + 5);\n\n    var zeroYR = drawPanelGrid(rightX, topY, rightW, panelH, N_MIN, N_MAX, -0.4, 2.2, '输出信号 y[n] = x[n] * h[n]');\n    for (var m = N_MIN; m <= N_MAX; m++) {\n      var rx = rightX + 16 + (rightW - 32) * ((m - N_MIN) / (N_MAX - N_MIN));\n      if (showIn) {\n        var xin = inputSignal(m);\n        var yin = topY + panelH * ((2.2 - xin) / 2.6);\n        drawStem(rx - 2, zeroYR, yin, 'rgba(56,189,248,0.45)', 3, true);\n      }\n      var yout = k * inputSignal(m - d);\n      var pyOut = topY + panelH * ((2.2 - yout) / 2.6);\n      drawStem(rx + (showIn ? 2 : 0), zeroYR, pyOut, '#10b981', 4, false);\n    }\n\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'right';\n    if (showIn) {\n      ctx.fillStyle = '#38bdf8';\n      ctx.fillText('● 虚线: 原始输入 x[n]', rightX + rightW - 120, topY - 8);\n    }\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('● 实线: 卷积输出 y[n]', rightX + rightW - 4, topY - 8);\n\n    var modeText = k > 1.05 ? '放大器' : (k < 0.95 ? '衰减器' : '恒等增益');\n    var shiftText = d > 0 ? ('延迟 ' + d + ' 样本') : (d < 0 ? ('超前 ' + (-d) + ' 样本') : '无移位');\n    var signStr = d === 0 ? 'δ[n]' : (d > 0 ? 'δ[n-' + d + ']' : 'δ[n+' + (-d) + ']');\n    lab.setReadout('系统特性: ' + modeText + ' (' + k.toFixed(1) + 'x) + ' + shiftText + '  |  h[n] = ' + k.toFixed(1) + '·' + signStr + '  (对应书本参数 s = ' + (-d) + ')');\n  }\n\n  lab.onUpdate(render);\n})();"
    },
    {
      "type": "concept",
      "heading": "3. 两个脉冲的组合：回声 (Echo) 的诞生",
      "paragraphs": [
        "如果我们把“原样透传的单位冲激”和“移位并衰减的冲激”加在一起作为系统的冲激响应，例如原书图 7-1d 所示：",
        "$h[n] = \\delta[n] + 0.6\\,\\delta[n - 4]$",
        "根据线性系统的**叠加原理（Superposition）**，输出信号就会等于“原始输入信号”加上“延迟 4 个样本且幅度缩水为 60% 的输入信号”——这在物理上就是活生生的**回声（Echo）**！",
        "回声在数字信号处理领域扮演着截然相反的两副面孔：在**音乐与录音制作**中，适当添加延迟与衰减的回声能让干瘪的录音听起来自然悦耳、充满空间感；在**雷达、声呐与地球物理勘探**中，科学家通过分析电磁波或地震波的回声延迟与强度，来探测飞机、潜艇或地下油田的位置；但在**长途电话通信**中，回声则是必须被消除的公害——你肯定不想在说话时，半秒后又在听筒里听到自己的声音。"
      ],
      "formula": {
        "expr": "h[n] = δ[n] + α·δ[n - D]  ⇒  y[n] = x[n] + α·x[n - D]",
        "explain": "δ[n] 产生直达声，α·δ[n-D] 产生延迟 D 个样本、强度为 α 倍的回声。输出 y[n] 是直达声与回声的线性叠加。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：回声冲激合成与实时听觉体验",
      "instruction": "调节“回声强度 α”和“回声延迟”，点击播放测试音，直观听出短延迟（空间音染）与长延迟（清晰回声）的听感区别。",
      "controls": [
        {
          "type": "slider",
          "id": "echoGain",
          "label": "回声强度 α",
          "min": 0,
          "max": 0.9,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "echoDelayMs",
          "label": "回声延迟 τ",
          "min": 15,
          "max": 300,
          "step": 5,
          "value": 120,
          "unit": " ms"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲回声测试",
          "activeLabel": "⏸ 停止测试音"
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var lastTriggerTime = -999;\n  var wasPlaying = false;\n\n  function chirpSample(tMs) {\n    if (tMs < 0 || tMs > 45) return 0;\n    var env = Math.sin(Math.PI * (tMs / 45));\n    env = env * env * Math.exp(-tMs / 18);\n    return env * Math.sin(2 * Math.PI * 0.14 * tMs);\n  }\n\n  function triggerAudioBurst() {\n    var ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    var now = ac.currentTime + 0.02;\n    var alpha = lab.values.echoGain;\n    var delaySec = lab.values.echoDelayMs / 1000;\n\n    function playPing(startTime, amp) {\n      if (amp <= 0.005) return;\n      var osc = ac.createOscillator();\n      var gain = ac.createGain();\n      osc.type = 'triangle';\n      osc.frequency.setValueAtTime(660, startTime);\n      osc.frequency.exponentialRampToValueAtTime(330, startTime + 0.09);\n      gain.gain.setValueAtTime(0.0001, startTime);\n      gain.gain.linearRampToValueAtTime(0.32 * amp, startTime + 0.006);\n      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start(startTime);\n      osc.stop(startTime + 0.12);\n    }\n\n    playPing(now, 1.0);\n    playPing(now + delaySec, alpha);\n  }\n\n  function drawScene(playheadMs) {\n    var alpha = lab.values.echoGain;\n    var delayMs = lab.values.echoDelayMs;\n\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    var lx = 24, lw = 230, ty = 28, ph = 178;\n    var rx = 286, rw = 412;\n    var maxMs = 360;\n\n    ctx.fillStyle = 'rgba(255,255,255,0.02)';\n    ctx.fillRect(lx, ty, lw, ph);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.strokeRect(lx, ty, lw, ph);\n\n    var baseYL = ty + ph - 26;\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath();\n    ctx.moveTo(lx, baseYL);\n    ctx.lineTo(lx + lw, baseYL);\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('回声冲激响应 h(t)', lx + 6, ty - 8);\n\n    var scaleHL = ph - 48;\n    var x0L = lx + 24;\n    var xEchoL = lx + 24 + (lw - 42) * (delayMs / maxMs);\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 3;\n    ctx.beginPath();\n    ctx.moveTo(x0L, baseYL);\n    ctx.lineTo(x0L, baseYL - scaleHL);\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(x0L, baseYL - scaleHL, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('1.0', x0L, baseYL - scaleHL - 8);\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText('0ms', x0L, ty + ph - 8);\n\n    if (alpha > 0.01) {\n      var hEcho = scaleHL * alpha;\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 3;\n      ctx.beginPath();\n      ctx.moveTo(xEchoL, baseYL);\n      ctx.lineTo(xEchoL, baseYL - hEcho);\n      ctx.stroke();\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath();\n      ctx.arc(xEchoL, baseYL - hEcho, 4.5, 0, Math.PI * 2);\n      ctx.fill();\n      ctx.fillText(alpha.toFixed(2), xEchoL, baseYL - hEcho - 8);\n    }\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(delayMs + 'ms', xEchoL, ty + ph - 8);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.02)';\n    ctx.fillRect(rx, ty, rw, ph);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(rx, ty, rw, ph);\n\n    var midYR = ty + ph / 2;\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath();\n    ctx.moveTo(rx, midYR);\n    ctx.lineTo(rx + rw, midYR);\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('合成波形 y(t) = 直达脉冲 + 延迟回声', rx + 8, ty - 8);\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    var ampPx = ph * 0.36;\n    for (var i = 0; i <= rw - 20; i++) {\n      var tMs = (i / (rw - 20)) * maxMs;\n      var yVal = chirpSample(tMs) + alpha * chirpSample(tMs - delayMs);\n      var px = rx + 10 + i;\n      var py = midYR - yVal * ampPx;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    for (var tick = 0; tick <= 360; tick += 60) {\n      var tx = rx + 10 + (rw - 20) * (tick / maxMs);\n      ctx.fillText(tick + 'ms', tx, ty + ph + 13);\n    }\n\n    if (playheadMs >= 0 && playheadMs <= maxMs) {\n      var phx = rx + 10 + (rw - 20) * (playheadMs / maxMs);\n      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath();\n      ctx.moveTo(phx, ty);\n      ctx.lineTo(phx, ty + ph);\n      ctx.stroke();\n    }\n\n    var feel = delayMs < 45 ? '极短延迟（听感融合，类似小房间/金属共鸣音染）' : (delayMs < 110 ? '中等延迟（拍击感，类似室内自然混响感）' : '长延迟（耳朵可清晰分辨出两次独立的脉冲声）');\n    lab.setReadout('回声比 α = ' + Math.round(alpha * 100) + '%  |  延迟 τ = ' + delayMs + ' ms  |  听感判断: ' + feel);\n  }\n\n  lab.onUpdate(function() {\n    if (lab.values.play && !wasPlaying) {\n      wasPlaying = true;\n      lastTriggerTime = -999;\n    } else if (!lab.values.play) {\n      wasPlaying = false;\n    }\n    drawScene(-1);\n  });\n\n  lab.onLoop(function(dt, timeSec) {\n    if (!lab.values.play) return;\n    if (timeSec - lastTriggerTime >= 0.95) {\n      lastTriggerTime = timeSec;\n      triggerAudioBurst();\n    }\n    var elapsedMs = (timeSec - lastTriggerTime) * 1000;\n    drawScene(elapsedMs);\n  });\n})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【记准移位符号陷阱】：公式写作 δ[n + s] 时，s < 0（如 δ[n - 4]）是把脉冲放在正半轴 n = 4 处，代表信号向未来**延迟** 4 个样本；写代码构造数字延迟线时，脉冲必须放在数组索引 d > 0 处才是因果延迟。",
        "【用脉冲响应反推系统体检】：在工程调试中，如果你不知道一个黑盒系统在干嘛，只要喂给它一个单样本脉冲 [1, 0, 0, ...]，看输出里脉冲的高度、位置和个数，就能瞬间测出它的增益、延迟和是否存在多径回声。",
        "【回声的物理本质】：回声不是什么神秘的非线性特效，它仅仅是“原始脉冲 + 移位缩放脉冲”的线性叠加；同样地，混响器（Reverb）本质上也就是成百上千个密集衰减脉冲组成的冲激响应。"
      ]
    }
  ]
});
