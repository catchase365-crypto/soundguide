window.__BOOK_REGISTER_SECTION__("sec_051", {
  "title": "信号与系统：从物理参数到数字配列 (Signals and Systems)",
  "intuition": "信号描述一个参数如何随另一个参数变化，系统则是把输入信号加工成输出信号的黑盒——无论是滤波降噪、信道补偿还是雷达探测，本质都在研究这个黑盒。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是信号与系统？连续与离散的分野",
      "paragraphs": [
        "在数字信号处理（DSP）中，**信号（Signal）**是对一个参数如何随另一个参数变化的描述。例如：电子电路中随时间变化的电压，或者数字图像中随空间距离变化的像素亮度。",
        "**系统（System）**则是任何能够响应**输入信号（Input Signal）**并产生**输出信号（Output Signal）**的过程。你可以把它看作一个黑盒：给它喂入一个信号，它吐出加工后的另一个信号。",
        "根据处理对象的不同，系统分为两类：**连续系统（Continuous Systems）**接收并输出连续信号，典型代表是模拟电子电路；**离散系统（Discrete Systems）**接收并输出离散信号，典型代表是操作数组中数值的计算机程序。"
      ],
      "formula": {
        "expr": "x(t) → [连续系统] → y(t)   |   x[n] → [离散系统] → y[n]",
        "explain": "左式表示模拟/连续世界：输入信号 x(t) 经过连续系统变成输出信号 y(t)；右式表示计算机/离散世界：输入数组 x[n] 经过离散系统变成输出数组 y[n]。"
      }
    },
    {
      "type": "concept",
      "heading": "必须熟记的四条信号命名规范",
      "paragraphs": [
        "信号处理的数学推导本身已经够复杂了，清晰的符号约定能帮我们避开大量低级错误。工程与教材中普遍遵循以下四条命名规则：",
        "1. **括号区分连续与离散**：连续信号使用圆括号，如 `x(t)` 和 `y(t)`；离散信号使用方括号（就像编程语言里的数组索引），如 `x[n]` 和 `y[n]`。",
        "2. **大小写区分作用域**：时域或空域中的信号统一使用**小写字母**；**大写字母**专门保留给后续章节要学的频域（如 `X(f)` 或 `X[k]`）。",
        "3. **见名知意的物理缩写**：给信号起名通常直接反映它代表的物理参数。比如随时间（time）变化的电压（voltage）写作 `v(t)`，按天（day）统计的股票价格（price）写作 `p[d]`。",
        "4. **通用分析的默认代号**：当不关心具体物理意义、只讨论通用系统性质时（就像代数里用 x 和 y），离散系统的输入固定叫 `x[n]`、输出叫 `y[n]`；连续系统则固定叫 `x(t)` 和 `y(t)`。"
      ],
      "formula": {
        "expr": "v(t),  p[d]   →   通用化: x(t), y(t),  x[n], y[n]",
        "explain": "v(t) 表示随连续时间 t 变化的电压；p[d] 表示按离散天数 d 采样的价格；无具体物理背景时统一用 x 作为输入、y 作为输出。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：连续系统 x(t)→y(t) 与离散系统 x[n]→y[n] 对照台",
      "instruction": "拖动频率、离散数组长度与系统增益滑块，观察模拟连续波形与计算机离散采样数组如何同步穿过系统黑盒。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "输入信号频率",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 3,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "samples",
          "label": "离散数组点数 N",
          "min": 8,
          "max": 40,
          "step": 2,
          "value": 18,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "gain",
          "label": "系统增益系数 k",
          "min": 0.2,
          "max": 1.8,
          "step": 0.1,
          "value": 1.2,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showDiscrete",
          "label": "叠加显示离散数组 x[n] / y[n]",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var freq = lab.values.freq;\n  var N = Math.round(lab.values.samples);\n  var gain = lab.values.gain;\n  var showDisc = lab.values.showDiscrete;\n\n  ctx.clearRect(0, 0, W, H);\n\n  function drawBox(bx, by, bw, bh, title, subTitle) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(bx, by, bw, bh);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    for (var i = 1; i < 4; i++) {\n      var gy = by + (bh * i) / 4;\n      ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx + bw, gy); ctx.stroke();\n      var gx = bx + (bw * i) / 4;\n      ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + bh); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath(); ctx.moveTo(bx, by + bh / 2); ctx.lineTo(bx + bw, by + bh / 2); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(title, bx, by - 10);\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText(subTitle, bx + bw, by - 10);\n  }\n\n  function sigIn(u) {\n    return 0.72 * Math.sin(2 * Math.PI * freq * u * 0.25) + 0.28 * Math.cos(2 * Math.PI * freq * u * 0.5);\n  }\n  function sigOut(u) {\n    return gain * (0.72 * Math.sin(2 * Math.PI * freq * u * 0.25 - 0.55) + 0.28 * Math.cos(2 * Math.PI * freq * u * 0.5 - 1.1));\n  }\n\n  var inX = 20, outX = 470, boxW = 230, boxY = 38, boxH = 166;\n  var midY = boxY + boxH / 2;\n  var ampScale = 42;\n\n  drawBox(inX, boxY, boxW, boxH, '输入信号', 'x(t) / x[n]');\n  drawBox(outX, boxY, boxW, boxH, '输出信号', 'y(t) / y[n]');\n\n  ctx.lineWidth = 2;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath();\n  for (var px = 0; px <= boxW; px += 2) {\n    var u = px / boxW;\n    var y = midY - sigIn(u) * ampScale;\n    if (px === 0) ctx.moveTo(inX + px, y); else ctx.lineTo(inX + px, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.beginPath();\n  for (var px2 = 0; px2 <= boxW; px2 += 2) {\n    var u2 = px2 / boxW;\n    var y2 = midY - sigOut(u2) * ampScale;\n    if (px2 === 0) ctx.moveTo(outX + px2, y2); else ctx.lineTo(outX + px2, y2);\n  }\n  ctx.stroke();\n\n  if (showDisc) {\n    for (var n = 0; n < N; n++) {\n      var un = n / (N - 1);\n      var sx1 = inX + un * boxW;\n      var sy1 = midY - sigIn(un) * ampScale;\n      ctx.strokeStyle = 'rgba(245,158,11,0.65)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath(); ctx.moveTo(sx1, midY); ctx.lineTo(sx1, sy1); ctx.stroke();\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillRect(sx1 - 2.5, sy1 - 2.5, 5, 5);\n\n      var sx2 = outX + un * boxW;\n      var sy2 = midY - sigOut(un) * ampScale;\n      ctx.strokeStyle = 'rgba(236,72,153,0.65)';\n      ctx.beginPath(); ctx.moveTo(sx2, midY); ctx.lineTo(sx2, sy2); ctx.stroke();\n      ctx.fillStyle = '#ec4899';\n      ctx.fillRect(sx2 - 2.5, sy2 - 2.5, 5, 5);\n    }\n  }\n\n  var sysX = 290, sysY = 82, sysW = 140, sysH = 78;\n  ctx.fillStyle = 'rgba(56,189,248,0.08)';\n  ctx.fillRect(sysX, sysY, sysW, sysH);\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(sysX, sysY, sysW, sysH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(showDisc ? '连续 / 离散系统' : '连续系统', sysX + sysW / 2, sysY + 34);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px monospace';\n  ctx.fillText('增益 k = ' + gain.toFixed(2), sysX + sysW / 2, sysY + 56);\n\n  function drawArrow(x1, y1, x2, y2) {\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8, y2 - 5); ctx.lineTo(x2 - 8, y2 + 5);\n    ctx.closePath(); ctx.fill();\n  }\n  drawArrow(inX + boxW + 6, midY, sysX - 6, midY);\n  drawArrow(sysX + sysW + 6, midY, outX - 6, midY);\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('━ 连续 x(t) / y(t)', 20, 226);\n  if (showDisc) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('■ 离散数组 x[n] / y[n] (长度 N = ' + N + ')', 160, 226);\n  }\n\n  lab.setReadout('输入: x(t)' + (showDisc ? ' 与 x[0..' + (N - 1) + ']' : '') + '  →  [系统增益 ' + gain.toFixed(2) + ']  →  输出: y(t)' + (showDisc ? ' 与 y[0..' + (N - 1) + ']' : ''));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "为什么要理解一个系统？三大工程视角与线性归类",
      "paragraphs": [
        "在工程实践中，我们费尽心思去研究一个“系统”，通常出于以下三类截然不同的目的：",
        "1. **主动设计系统（Design）**：比如设计一个滤波系统，用来消除心电图（ECG）中的肌电噪声、锐化失焦的照片，或者消去录音中的回声。",
        "2. **测量并补偿干扰（Characterize & Compensate）**：当你对着电话说话时，传输线（系统）往往会造成高频衰减或畸变，使对方听到的输出信号不再等于原声。只要测出传输线如何改变信号，就能设计逆向算法来补偿失真。",
        "3. **反推未知物理过程（Study & Analyze）**：**雷达（Radar）**与**声呐（Sonar）**是这一思路的巅峰之作。它们发射一束信号，再接收反射回来的信号；通过对比发射与接收信号，就能反推出“中间那个物理系统”（即远方目标的距离、尺寸与材质特征）。",
        "世界上的系统多如牛毛，逐一研究根本不现实。幸运的是，绝大多数实用系统都属于**线性系统（Linear Systems）**这一大家族——只要摸透了线性系统的共性规律，就能用同一套强大工具解决海量工程问题。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "实验二：系统表征与补偿听感实验室（信道衰减与回波对比）",
      "instruction": "点击播放测试脉冲音，调节「信道高频衰减」与「回波/反射强度」感受传输线失真与目标回波，再切换「开启逆向补偿系统」对比波形与听感。",
      "controls": [
        {
          "type": "slider",
          "id": "echoLevel",
          "label": "回波/反射强度",
          "min": 0,
          "max": 0.85,
          "step": 0.05,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "信道高频衰减",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 40,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "compensate",
          "label": "开启逆向补偿系统",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audio = null;\n\nfunction stopAudio() {\n  if (!audio) return;\n  try {\n    audio.osc1.stop();\n    audio.osc2.stop();\n    audio.master.disconnect();\n  } catch (e) {}\n  audio = null;\n}\n\nfunction syncAudioParams() {\n  if (!audio) return;\n  var ac = audio.ac;\n  var comp = lab.values.compensate;\n  var cutPct = comp ? 0 : lab.values.cutoff;\n  var echo = comp ? 0 : lab.values.echoLevel;\n  var cutoffFreq = 4200 * Math.pow(0.08, cutPct / 100);\n  audio.filter.frequency.setTargetAtTime(cutoffFreq, ac.currentTime, 0.02);\n  audio.echoGain.gain.setTargetAtTime(echo * 0.85, ac.currentTime, 0.02);\n}\n\nfunction startAudio() {\n  if (audio) return;\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') { ac.resume(); }\n\n  var osc1 = ac.createOscillator();\n  var osc2 = ac.createOscillator();\n  osc1.type = 'sine';\n  osc2.type = 'triangle';\n  osc1.frequency.value = 330;\n  osc2.frequency.value = 990;\n\n  var g1 = ac.createGain();\n  var g2 = ac.createGain();\n  g1.gain.value = 0.6;\n  g2.gain.value = 0.4;\n\n  var envGain = ac.createGain();\n  envGain.gain.value = 0;\n\n  var filter = ac.createBiquadFilter();\n  filter.type = 'lowpass';\n  filter.frequency.value = 4200;\n\n  var delay = ac.createDelay(1.0);\n  delay.delayTime.value = 0.22;\n\n  var echoGain = ac.createGain();\n  echoGain.gain.value = 0;\n\n  var master = ac.createGain();\n  master.gain.value = 0.35;\n\n  osc1.connect(g1); osc2.connect(g2);\n  g1.connect(envGain); g2.connect(envGain);\n  envGain.connect(filter);\n  filter.connect(master);\n  filter.connect(delay);\n  delay.connect(echoGain);\n  echoGain.connect(master);\n  master.connect(ac.destination);\n\n  osc1.start();\n  osc2.start();\n  audio = { ac: ac, osc1: osc1, osc2: osc2, envGain: envGain, filter: filter, echoGain: echoGain, master: master };\n  syncAudioParams();\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var echo = lab.values.echoLevel;\n  var cutPct = lab.values.cutoff;\n  var comp = lab.values.compensate;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var padL = 24, padR = 24, padT = 32, padB = 34;\n  var pw = W - padL - padR, ph = H - padT - padB;\n  var midY = padT + ph / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 8; i++) {\n    var gx = padL + (pw * i) / 8;\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + ph); ctx.stroke();\n  }\n  for (var j = 0; j <= 4; j++) {\n    var gy = padT + (ph * j) / 4;\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + pw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + pw, midY); ctx.stroke();\n\n  function pulse(t, c, blur) {\n    var d = t - c;\n    var w = 0.042 * (1 + blur * 1.4);\n    var env = Math.exp(-(d * d) / (w * w));\n    var f1 = Math.sin(2 * Math.PI * 16 * d);\n    var f2 = (1 - blur * 0.85) * 0.55 * Math.sin(2 * Math.PI * 44 * d);\n    return (env / (1 + blur * 0.5)) * (f1 + f2) * 0.68;\n  }\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var px = 0; px <= pw; px += 2) {\n    var t = px / pw;\n    var vx = pulse(t, 0.22, 0);\n    var yy = midY - vx * (ph * 0.44);\n    if (px === 0) ctx.moveTo(padL + px, yy); else ctx.lineTo(padL + px, yy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var effBlur = comp ? 0 : (cutPct / 100);\n  var effEcho = comp ? 0 : echo;\n  ctx.strokeStyle = comp ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var px2 = 0; px2 <= pw; px2 += 2) {\n    var t2 = px2 / pw;\n    var vy = pulse(t2, 0.22, effBlur) + effEcho * pulse(t2, 0.58, effBlur);\n    var yy2 = midY - vy * (ph * 0.44);\n    if (px2 === 0) ctx.moveTo(padL + px2, yy2); else ctx.lineTo(padL + px2, yy2);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('┄ 原始输入信号 x(t)', padL, 20);\n  ctx.fillStyle = comp ? '#10b981' : '#f59e0b';\n  ctx.fillText(comp ? '━ 补偿后输出 y(t) (已消除失真与回波)' : '━ 经系统输出 y(t) (含信道衰减与回波)', padL + 150, 20);\n\n  if (!comp && echo > 0.05) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('← 回波/反射信号', padL + pw * 0.58, padT + 18);\n  }\n\n  var status = comp\n    ? '状态：逆向补偿已启用 — 输出 y(t) 完美还原输入 x(t)'\n    : '状态：未补偿 — 高频衰减 ' + cutPct + '%，回波强度 ' + Math.round(echo * 100) + '%';\n  lab.setReadout(status + (lab.values.play ? '  |  🔊 正在播放脉冲音' : ''));\n}\n\nlab.onUpdate(function() {\n  if (lab.values.play) {\n    startAudio();\n    syncAudioParams();\n  } else {\n    stopAudio();\n  }\n  draw();\n});\n\nlab.onLoop(function(dt, timeSec) {\n  if (!audio || !lab.values.play) return;\n  var phase = (timeSec % 0.72) / 0.72;\n  var env = 0;\n  if (phase < 0.16) {\n    env = Math.sin(Math.PI * (phase / 0.16));\n  }\n  audio.envGain.gain.setTargetAtTime(env * 0.6, audio.ac.currentTime, 0.008);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看到圆括号 x(t) 立刻反应出是连续时间/模拟世界，看到方括号 x[n] 立刻反应出是离散数组索引；时域用小写、频域用大写，千万不要混用。",
        "物理世界与代码中的任何处理环节都是“系统”：要么我们自己设计它（滤波去噪），要么我们测出它的失真特性并补偿它（信道均衡），要么通过对比输入和输出来反推未知世界（雷达声呐）。",
        "面对无穷无尽的现实系统不必慌张——绝大多数实用系统都落在“线性系统”这一分类下，这为我们后续使用叠加定理铺平了道路。"
      ]
    }
  ]
});
