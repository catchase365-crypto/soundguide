window.__BOOK_REGISTER_SECTION__("sec_074", {
  "title": "卷积的交换律 (Commutative Property of Convolution)",
  "intuition": "在卷积运算中，谁充当输入信号、谁充当系统脉冲响应可以任意互换，最终得到的输出波形在数学与听觉上完全一致——但物理意义往往大相径庭。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心数学性质：卷积可以随意调换顺序",
      "paragraphs": [
        "在普通代数乘法里，`3 × 5 = 5 × 3` 是再自然不过的事。信号处理中的**卷积（Convolution）**同样满足这种对称性，称为**交换律（Commutative Property）**。",
        "用白话来说：把信号 `a[n]` 固定不动、让信号 `b[n]` 翻转并从左向右滑动相乘求和，与把 `b[n]` 固定不动、让 `a[n]` 翻转滑动，最终算出来的每一点输出值都**一模一样**。",
        "哪怕 `a[n]` 是一个长达几万点的复杂音频，而 `b[n]` 只有短短几个点构成的滤波器系数，调换它们的角色在数学上依然是完全合法的。"
      ],
      "formula": {
        "expr": "a[n] * b[n] = b[n] * a[n]",
        "explain": "a[n] 与 b[n] 是两个离散时间信号，星号 * 代表卷积运算；等号两边表明调换两个信号在卷积中的先后位置，不会改变输出序列的任何一个数值。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：翻转与滑动角色互换可视化",
      "instruction": "点击“互换角色”开关并拖动“滑动时刻 n”，对比两种视角下的重叠相乘过程与最终输出波形。",
      "controls": [
        {
          "type": "toggle",
          "id": "swap",
          "label": "互换角色 (固定 b[n] / 滑动 a[n])",
          "value": false
        },
        {
          "type": "slider",
          "id": "shift",
          "label": "当前滑动时刻 n",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "pulseLen",
          "label": "矩形信号 a[n] 宽度",
          "min": 2,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "decay",
          "label": "衰减信号 b[n] 衰减率",
          "min": 0.4,
          "max": 0.9,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        }
      ],
      "jsCode": "function convolve(x, h) {\n  var len = x.length + h.length - 1;\n  var out = new Array(len);\n  for (var n = 0; n < len; n++) {\n    var sum = 0;\n    for (var k = 0; k < x.length; k++) {\n      var m = n - k;\n      if (m >= 0 && m < h.length) sum += x[k] * h[m];\n    }\n    out[n] = sum;\n  }\n  return out;\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var swap = !!lab.values.swap;\n  var nShift = Math.round(lab.values.shift);\n  var pLen = Math.round(lab.values.pulseLen);\n  var decay = lab.values.decay;\n\n  var a = [];\n  for (var i = 0; i < 7; i++) a.push(i < pLen ? 1.0 : 0.0);\n  var b = [];\n  for (var j = 0; j < 7; j++) b.push(j < 6 ? Math.pow(decay, j) : 0.0);\n\n  var stationary = swap ? b : a;\n  var sliding = swap ? a : b;\n  var y_ab = convolve(a, b);\n  var y_ba = convolve(b, a);\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 20; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(356, 10); ctx.lineTo(356, H - 10); ctx.stroke();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(swap ? '视角 B：固定 b[k] (蓝) ，翻转滑动 a[n-k] (粉)' : '视角 A：固定 a[k] (蓝) ，翻转滑动 b[n-k] (粉)', 16, 22);\n  ctx.fillText('最终卷积输出 y[n] (两种视角结果完全重合)', 374, 22);\n\n  var baseL = 195;\n  var scaleL = 95;\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(16, baseL); ctx.lineTo(340, baseL); ctx.stroke();\n\n  var kMin = -5, kMax = 12;\n  var stepL = 300 / (kMax - kMin);\n  for (var k = kMin; k <= kMax; k++) {\n    var px = 28 + (k - kMin) * stepL;\n    var vStat = (k >= 0 && k < stationary.length) ? stationary[k] : 0;\n    var mIdx = nShift - k;\n    var vSlid = (mIdx >= 0 && mIdx < sliding.length) ? sliding[mIdx] : 0;\n\n    if (vStat > 0 && vSlid > 0) {\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';\n      ctx.fillRect(px - 7, baseL - Math.max(vStat, vSlid) * scaleL - 6, 14, Math.max(vStat, vSlid) * scaleL + 10);\n    }\n    if (vStat > 0) {\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 3;\n      ctx.beginPath(); ctx.moveTo(px - 2, baseL); ctx.lineTo(px - 2, baseL - vStat * scaleL); ctx.stroke();\n      ctx.fillStyle = '#38bdf8';\n      ctx.beginPath(); ctx.arc(px - 2, baseL - vStat * scaleL, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n    if (vSlid > 0) {\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 2.5;\n      ctx.beginPath(); ctx.moveTo(px + 2, baseL); ctx.lineTo(px + 2, baseL - vSlid * scaleL); ctx.stroke();\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath(); ctx.arc(px + 2, baseL - vSlid * scaleL, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n    if (k % 2 === 0) {\n      ctx.fillStyle = 'rgba(248,250,252,0.5)';\n      ctx.font = '10px monospace';\n      ctx.fillText(String(k), px - 4, baseL + 14);\n    }\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('橙色阴影区 = 当前时刻 n=' + nShift + ' 相乘累加区域', 16, 42);\n\n  var baseR = 195;\n  var maxVal = 1e-6;\n  for (var t = 0; t < y_ab.length; t++) if (y_ab[t] > maxVal) maxVal = y_ab[t];\n  var scaleR = 125 / Math.max(maxVal, 1);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(374, baseR); ctx.lineTo(704, baseR); ctx.stroke();\n\n  var stepR = 300 / 12;\n  var maxDiff = 0;\n  for (var idx = 0; idx <= 12; idx++) {\n    var diff = Math.abs(y_ab[idx] - y_ba[idx]);\n    if (diff > maxDiff) maxDiff = diff;\n    var rx = 386 + idx * stepR;\n    var val = swap ? y_ba[idx] : y_ab[idx];\n    var py = baseR - val * scaleR;\n\n    ctx.strokeStyle = idx === nShift ? '#f59e0b' : '#10b981';\n    ctx.lineWidth = idx === nShift ? 4 : 2.5;\n    ctx.beginPath(); ctx.moveTo(rx, baseR); ctx.lineTo(rx, py); ctx.stroke();\n\n    ctx.fillStyle = idx === nShift ? '#f59e0b' : '#10b981';\n    ctx.beginPath(); ctx.arc(rx, py, idx === nShift ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();\n\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath(); ctx.arc(rx, baseR - y_ab[idx] * scaleR, 6, 0, Math.PI * 2); ctx.stroke();\n\n    ctx.fillStyle = idx === nShift ? '#f59e0b' : 'rgba(248,250,252,0.55)';\n    ctx.font = '10px monospace';\n    ctx.fillText(String(idx), rx - 4, baseR + 14);\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('白圈 = a*b 基准值，实心点 = 当前输出 (完全重叠)', 374, 42);\n\n  lab.setReadout(\n    (swap ? '当前模式: b[n]固定 / a[n]滑动' : '当前模式: a[n]固定 / b[n]滑动') +\n    ' | y[' + nShift + '] = ' + y_ab[nShift].toFixed(3) +\n    ' | 两种顺序最大差值: ' + maxDiff.toFixed(6)\n  );\n});"
    },
    {
      "type": "concept",
      "heading": "系统理论中的“魔幻互换”与物理直觉陷阱",
      "paragraphs": [
        "把卷积的交换律搬到**线性系统理论（System Theory）**中，就会得到一个非常反直觉的推论（原书 Fig. 7-8）：如果输入信号 `a[n]` 通过脉冲响应为 `b[n]` 的系统得到输出 `y[n]`，那么你把 `b[n]` 当作输入信号、把 `a[n]` 塞进方框里当作系统的脉冲响应，出来的 `y[n]` 竟然丝毫不差！",
        "虽然这在数学上天衣无缝，但在物理世界里通常**毫无实际意义**。输入信号（比如一段 3 分钟的人声录音）和系统的脉冲响应（比如一个房间的 0.5 秒混响特征）本质上是完全不同的两类事物。就像原书作者 Steven Smith 幽默举例：你一年工作 `2,000 小时`、时薪 `$10`，年薪是 `$20,000`；乘法交换律允许你改成每年只工作 `10 小时`、时薪 `$2,000`，年薪照样是 `$20,000`——数学完全正确，但你绝对说服不了老板！",
        "既然物理上往往没意义，DSP 工程师为什么还如此看重交换律？答案是**代数化简（Equation Manipulation）**。在推导复杂系统框图、证明滤波器等价性或重构高效计算流程（例如在“输入侧视角”和“输出侧视角”之间切换）时，交换律就像代数里的乘法交换律一样，是化繁为简的超级工具。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 2：听感与系统框图实测——互换输入与脉冲响应",
      "instruction": "点击“▶ 播放卷积输出音”，尝试切换“系统角色互换”开关，亲耳验证波形与声音是否 100% 相同。",
      "controls": [
        {
          "type": "toggle",
          "id": "swap",
          "label": "系统角色互换 (输入信号 ↔ 脉冲响应)",
          "value": false
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "信号 a[n] 基频",
          "min": 150,
          "max": 550,
          "step": 50,
          "value": 250,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "平滑脉冲 b[n] 长度",
          "min": 2,
          "max": 24,
          "step": 2,
          "value": 10,
          "unit": " 点"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放卷积输出音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var sourceNode = null;\nvar lastAudioSig = '';\n\nfunction convolve1D(x, h) {\n  var len = x.length + h.length - 1;\n  var y = new Float32Array(len);\n  for (var n = 0; n < x.length; n++) {\n    var xv = x[n];\n    if (xv === 0) continue;\n    for (var k = 0; k < h.length; k++) {\n      y[n + k] += xv * h[k];\n    }\n  }\n  return y;\n}\n\nfunction stopAudio() {\n  if (sourceNode) {\n    try { sourceNode.stop(); sourceNode.disconnect(); } catch (e) {}\n    sourceNode = null;\n  }\n  lastAudioSig = '';\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var swap = !!lab.values.swap;\n  var freq = lab.values.freq;\n  var cutoff = Math.round(lab.values.cutoff);\n  var isPlay = !!lab.values.play;\n\n  var fsVis = 8000;\n  var visLen = 140;\n  var aVis = new Float32Array(visLen);\n  for (var i = 0; i < visLen; i++) {\n    var t = i / fsVis;\n    var s = Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 3 * t) + 0.25 * Math.sin(2 * Math.PI * freq * 5 * t);\n    var env = i < 15 ? i / 15 : (i > visLen - 25 ? (visLen - i) / 25 : 1);\n    aVis[i] = (s / 1.4) * env;\n  }\n  var bVis = new Float32Array(cutoff);\n  for (var j = 0; j < cutoff; j++) bVis[j] = 1.0 / cutoff;\n\n  var yNorm = convolve1D(aVis, bVis);\n  var ySwap = convolve1D(bVis, aVis);\n  var maxDiff = 0;\n  for (var d = 0; d < yNorm.length; d++) {\n    var df = Math.abs(yNorm[d] - ySwap[d]);\n    if (df > maxDiff) maxDiff = df;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 20; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(swap ? 'THEN (互换后系统拓扑):' : 'IF (常规物理系统拓扑):', 18, 22);\n\n  var inColor = swap ? '#ec4899' : '#38bdf8';\n  var sysColor = swap ? '#38bdf8' : '#ec4899';\n  var inText = swap ? 'b[n] (平滑核)' : 'a[n] (音频脉冲)';\n  var sysText = swap ? 'a[n] (音频作脉冲响应!)' : 'b[n] (低通平滑系统)';\n\n  ctx.fillStyle = inColor;\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(inText, 18, 52);\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(145, 48); ctx.lineTo(205, 48); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(198, 43); ctx.lineTo(205, 48); ctx.lineTo(198, 53); ctx.stroke();\n\n  ctx.strokeStyle = sysColor;\n  ctx.fillStyle = 'rgba(255,255,255,0.05)';\n  ctx.lineWidth = 2;\n  ctx.fillRect(212, 30, 195, 36);\n  ctx.strokeRect(212, 30, 195, 36);\n  ctx.fillStyle = sysColor;\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(sysText, 226, 52);\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.beginPath(); ctx.moveTo(414, 48); ctx.lineTo(474, 48); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(467, 43); ctx.lineTo(474, 48); ctx.lineTo(467, 53); ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText('y[n] (输出完全相同)', 484, 52);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(16, 80); ctx.lineTo(704, 80); ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('a[n]: 含奇次谐波的脉冲 (' + freq + 'Hz)', 18, 98);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(18, 130); ctx.lineTo(230, 130); ctx.stroke();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var p = 0; p < visLen; p++) {\n    var px = 18 + (p / (visLen - 1)) * 212;\n    var py = 130 - aVis[p] * 24;\n    if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('b[n]: ' + cutoff + '点矩形平滑窗', 18, 174);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(18, 222); ctx.lineTo(230, 222); ctx.stroke();\n  for (var q = 0; q < 26; q++) {\n    var qx = 24 + q * 7.8;\n    var qh = q < cutoff ? 28 : 0;\n    ctx.fillStyle = q < cutoff ? '#ec4899' : 'rgba(255,255,255,0.12)';\n    ctx.fillRect(qx, 222 - qh, 4, Math.max(qh, 2));\n  }\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('输出波形对比：青绿实线 = a[n]*b[n] | 琥珀虚线 = b[n]*a[n]', 260, 98);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(260, 162); ctx.lineTo(702, 162); ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3.5;\n  ctx.beginPath();\n  for (var u = 0; u < yNorm.length; u++) {\n    var ux = 260 + (u / (yNorm.length - 1)) * 442;\n    var uy = 162 - yNorm[u] * 50;\n    if (u === 0) ctx.moveTo(ux, uy); else ctx.lineTo(ux, uy);\n  }\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([6, 5]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var v = 0; v < ySwap.length; v++) {\n    var vx = 260 + (v / (ySwap.length - 1)) * 442;\n    var vy = 162 - ySwap[v] * 50;\n    if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  lab.setReadout(\n    (swap ? '已互换: b[n]输入 → [a[n]系统]' : '常规: a[n]输入 → [b[n]系统]') +\n    ' | 波形最大误差: ' + maxDiff.toFixed(7) + ' | 听感完全一致'\n  );\n\n  if (isPlay) {\n    var sig = swap + '|' + freq + '|' + cutoff;\n    if (sig !== lastAudioSig || !sourceNode) {\n      stopAudio();\n      lastAudioSig = sig;\n      var ac = lab.getAudioContext();\n      if (ac.state === 'suspended') ac.resume();\n      var sr = ac.sampleRate;\n      var durSamples = Math.floor(sr * 0.45);\n      var totalSamples = Math.floor(sr * 0.65);\n      var aAud = new Float32Array(durSamples);\n      for (var n = 0; n < durSamples; n++) {\n        var tt = n / sr;\n        var w = Math.sin(2 * Math.PI * freq * tt) + 0.5 * Math.sin(2 * Math.PI * freq * 3 * tt) + 0.25 * Math.sin(2 * Math.PI * freq * 5 * tt);\n        var fade = Math.min(1, n / (sr * 0.015), (durSamples - 1 - n) / (sr * 0.04));\n        aAud[n] = (w / 1.6) * fade;\n      }\n      var kLen = Math.max(2, Math.round(cutoff * (sr / 8000)));\n      var bAud = new Float32Array(kLen);\n      for (var kk = 0; kk < kLen; kk++) bAud[kk] = 1.0 / kLen;\n\n      var yAud = swap ? convolve1D(bAud, aAud) : convolve1D(aAud, bAud);\n      var buf = ac.createBuffer(1, totalSamples, sr);\n      var ch = buf.getChannelData(0);\n      var copyLen = Math.min(yAud.length, totalSamples);\n      for (var c = 0; c < copyLen; c++) ch[c] = yAud[c] * 0.35;\n\n      sourceNode = ac.createBufferSource();\n      sourceNode.buffer = buf;\n      sourceNode.loop = true;\n      sourceNode.connect(ac.destination);\n      sourceNode.start();\n    }\n  } else {\n    stopAudio();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数学等价，物理未必合理：虽然 `a[n] * b[n] = b[n] * a[n]` 永远成立，但工程上不要把“音频输入”和“滤波器脉冲响应”的物理身份搞混——就像“$10/小时 × 2000小时”与“$2000/小时 × 10小时”虽然总金额相等，但现实意义完全不同。",
        "算力与代码优化技巧：由于可以互换顺序，写卷积代码时，总可以把**较短的信号**作为内层循环的滑动核，或者在框图代数推导中把复杂卷积链重新排序化简，而不改变任何输出数值。",
        "先决条件别忘了：交换律与后续的线性系统分解性质一样，只适用于**线性时不变（LTI）系统**；一旦系统出现非线性失真（如限幅削波），交换输入和系统的顺序就不再成立。"
      ]
    }
  ]
});
