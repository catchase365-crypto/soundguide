window.__BOOK_REGISTER_SECTION__("sec_072", {
  "title": "因果信号与非因果信号 (Causal and Noncausal Signals)",
  "intuition": "物理世界讲究“先有因，后有果”，反映在数字信号上，就是所有负下标样本都必须为零；而在电脑内存里，你可以打破时间限制，让“未来”影响“现在”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 物理世界的时间铁律 vs 电脑内存的自由",
      "paragraphs": [
        "想象一个简单的模拟电子电路：你在输入端送入一个短脉冲，输出端随后就会产生响应。这是我们所处宇宙最基本的 **因果关系（Cause and Effect）**——任何“果”都只能发生在“因”之后，这正是“时间”的本质特征。",
        "现在把这个概念搬到数字信号处理（DSP）系统中。假设输入信号和输出信号都以数组形式存在计算机里。如果这个 DSP 系统要模拟真实物理世界（例如实时麦克风降噪、在线控制回路），它就必须遵守因果律：例如输入信号第 `8` 号样本的值，**只能**影响输出信号第 `8` 号或编号更大的样本（即 `n ≥ 8`），绝不能倒回去修改第 `7` 号或更早的输出。满足这种约束的系统，称为 **因果系统（Causal System）**。",
        "当然，计算机里的离线数字处理并不一定要受限于时间。因为整段输入数组和输出数组都已经静静地躺在内存里（比如硬盘里一段录好的音频或一张图片），从原理上讲，输入数组的**任意**一个样本都可以影响输出数组的**任意**位置——这就是 **非因果系统（Noncausal System）**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：从卷积输入视角看“因果”与“穿越”",
      "instruction": "拖动“输入脉冲位置 n₀”观察输出如何跟随移动；再拉大“负向提前影响”，亲眼看看非因果系统是如何让“果”出现在“因”之前的。",
      "controls": [
        {
          "type": "slider",
          "id": "inputN",
          "label": "输入脉冲位置 n₀",
          "min": -6,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "noncausalSpan",
          "label": "负向提前影响 (违背因果)",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "showMask",
          "label": "高亮未来/过去禁区",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar nMin = -14;\nvar nMax = 20;\nvar count = nMax - nMin + 1;\nvar xLeft = 46;\nvar xRight = W - 22;\nvar dx = (xRight - xLeft) / (count - 1);\n\nfunction nToX(n) {\n  return xLeft + (n - nMin) * dx;\n}\n\nfunction drawStem(x, yBase, val, scale, color, radius) {\n  var yTop = yBase - val * scale;\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(x, yBase);\n  ctx.lineTo(x, yTop);\n  ctx.stroke();\n  ctx.fillStyle = color;\n  ctx.beginPath();\n  ctx.arc(x, yTop, radius, 0, Math.PI * 2);\n  ctx.fill();\n}\n\nfunction draw() {\n  var n0 = lab.values.inputN;\n  var pre = lab.values.noncausalSpan;\n  var showMask = lab.values.showMask;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var yIn = 86;\n  var scaleIn = 52;\n  var yOut = 198;\n  var scaleOut = 60;\n  var xN0 = nToX(n0);\n\n  if (showMask) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.10)';\n    ctx.fillRect(xLeft - 10, 114, xN0 - (xLeft - 10), H - 124);\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n    ctx.fillRect(xN0, 114, (xRight + 10) - xN0, H - 124);\n  }\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';\n  ctx.lineWidth = 1;\n  for (var n = nMin; n <= nMax; n += 2) {\n    var gx = nToX(n);\n    ctx.beginPath();\n    ctx.moveTo(gx, 16);\n    ctx.lineTo(gx, H - 22);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';\n  ctx.beginPath();\n  ctx.moveTo(xLeft - 8, yIn);\n  ctx.lineTo(xRight + 8, yIn);\n  ctx.moveTo(xLeft - 8, yOut);\n  ctx.lineTo(xRight + 8, yOut);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(xN0, 14);\n  ctx.lineTo(xN0, H - 22);\n  ctx.stroke();\n  ctx.restore();\n\n  for (var n = nMin; n <= nMax; n++) {\n    var x = nToX(n);\n    if (n === n0) {\n      drawStem(x, yIn, 1.0, scaleIn, '#38bdf8', 4.5);\n    } else {\n      ctx.fillStyle = 'rgba(248, 250, 252, 0.32)';\n      ctx.beginPath();\n      ctx.arc(x, yIn, 2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n\n    var k = n - n0;\n    var yVal = 0;\n    if (k >= 0 && k <= 14) {\n      yVal = 0.92 * Math.exp(-0.26 * k);\n    } else if (pre > 0 && k < 0 && k >= -pre) {\n      yVal = 0.70 * Math.exp(0.32 * k);\n    }\n\n    if (Math.abs(yVal) > 0.001) {\n      var c = (n < n0) ? '#ec4899' : '#10b981';\n      drawStem(x, yOut, yVal, scaleOut, c, 3.6);\n    } else {\n      ctx.fillStyle = 'rgba(248, 250, 252, 0.32)';\n      ctx.beginPath();\n      ctx.arc(x, yOut, 2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('输入信号 x[n] (单脉冲在 n₀ = ' + n0 + ')', 14, 20);\n  ctx.fillStyle = (pre === 0) ? '#10b981' : '#ec4899';\n  ctx.fillText(pre === 0 ? '输出信号 y[n] (因果：仅影响 n ≥ n₀)' : '输出信号 y[n] (非因果：提前泄漏到 n < n₀！)', 14, 130);\n\n  if (showMask) {\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';\n    ctx.fillText('过去禁区 (n < n₀)', xLeft, H - 28);\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';\n    ctx.fillText('因果允许区 (n ≥ n₀)', Math.min(xN0 + 8, W - 130), H - 28);\n  }\n\n  ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  for (var n = nMin; n <= nMax; n += 4) {\n    ctx.fillText(String(n), nToX(n), H - 7);\n  }\n  ctx.textAlign = 'left';\n\n  if (pre === 0) {\n    lab.setReadout('输入 n₀ = ' + n0 + ' | 最早受影响输出 = ' + n0 + ' | 状态：因果系统 (Causal)');\n  } else {\n    lab.setReadout('输入 n₀ = ' + n0 + ' | 最早受影响输出 = ' + (n0 - pre) + ' | 状态：非因果 (提前了 ' + pre + ' 个样本)');\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. 脉冲响应判据与“平移变因果”魔法",
      "paragraphs": [
        "回到卷积的“输入侧视角”：输入信号在样本 `n` 处的一个脉冲，经过系统后会在输出端叠加上一个平移后的脉冲响应 `h[k]`。要让输出只出现在 `n` 或之后的位置，系统的**脉冲响应 `h[n]` 必须在所有负下标样本处都严格等于 0**。",
        "在工程习惯上，“因果”这个词不仅用来形容系统，也直接用来形容任何信号本身：只要一个信号所有负编号样本（`n < 0`）的值全为 0，不管它是不是脉冲响应，我们都称它为 **因果信号（Causal Signal）**。",
        "那么，如果我们设计了一个非常好用但“非因果”的有限长信号（比如左右对称的滤波核，负半轴有值），能不能让它变成实时的因果系统呢？答案非常简单：**只要把它整体向右平移（施加延迟）**，直到原本最左边的非零样本跨过 `n = 0` 进入非负区即可！代价仅仅是输出多了一点固定的时间延迟。"
      ],
      "formula": {
        "expr": "h[n] = 0  (当 n < 0 时)",
        "explain": "h[n] 表示系统的脉冲响应（或任意信号）在样本索引 n 处的幅值；n < 0 代表所有负编号样本。该式是判断系统或信号是否“因果”的充要条件。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：把非因果信号“平移”为因果信号（含听感对比）",
      "instruction": "拖动“右移延迟量 D”将对称的加窗 Sinc 信号整体右移，观察负半轴样本如何归零；点击播放按钮，对比“非因果前震（嘀声前的反常渐强）”与“因果延迟响应”的听感差异。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "右移延迟量 D",
          "min": 0,
          "max": 14,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "halfWidth",
          "label": "原信号半宽 M",
          "min": 4,
          "max": 10,
          "step": 1,
          "value": 8,
          "unit": " 样本"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 听感对比 (前震 vs 因果)",
          "activeLabel": "⏸ 停止发声"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar nMin = -12;\nvar nMax = 24;\nvar count = nMax - nMin + 1;\nvar xLeft = 42;\nvar xRight = W - 22;\nvar dx = (xRight - xLeft) / (count - 1);\n\nfunction nToX(n) {\n  return xLeft + (n - nMin) * dx;\n}\n\nfunction getSample(n, D, M) {\n  var m = n - D;\n  if (Math.abs(m) > M) return 0;\n  var win = 0.54 + 0.46 * Math.cos(Math.PI * m / (M + 1));\n  var sinc = (m === 0) ? 1.0 : Math.sin(0.85 * m) / (0.85 * m);\n  return sinc * win;\n}\n\nvar nextBeat = 0;\nvar burstStart = -1;\nvar burstDur = 0.28;\n\nfunction triggerAudioBurst(D, M) {\n  var audioCtx;\n  try {\n    audioCtx = lab.getAudioContext();\n  } catch (e) {\n    return;\n  }\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n\n  var sr = audioCtx.sampleRate;\n  var totalSamples = Math.floor(sr * burstDur);\n  var buf = audioCtx.createBuffer(1, totalSamples, sr);\n  var data = buf.getChannelData(0);\n  for (var i = 0; i < totalSamples; i++) {\n    var frac = i / totalSamples;\n    var nFloat = nMin + frac * (nMax - nMin);\n    var m = nFloat - D;\n    var env = 0;\n    if (Math.abs(m) <= M) {\n      var win = 0.54 + 0.46 * Math.cos(Math.PI * m / (M + 1));\n      var sinc = (Math.abs(m) < 1e-4) ? 1.0 : Math.sin(0.85 * m) / (0.85 * m);\n      env = sinc * win;\n    }\n    var t = i / sr;\n    data[i] = 0.35 * env * Math.sin(2 * Math.PI * 360 * t);\n  }\n\n  var now = audioCtx.currentTime + 0.02;\n  var src = audioCtx.createBufferSource();\n  src.buffer = buf;\n  src.connect(audioCtx.destination);\n  src.start(now);\n\n  var n0Frac = (0 - nMin) / (nMax - nMin);\n  var tClick = now + n0Frac * burstDur;\n  var osc = audioCtx.createOscillator();\n  var gain = audioCtx.createGain();\n  osc.type = 'sine';\n  osc.frequency.setValueAtTime(1600, tClick);\n  gain.gain.setValueAtTime(0.001, tClick);\n  gain.gain.exponentialRampToValueAtTime(0.22, tClick + 0.002);\n  gain.gain.exponentialRampToValueAtTime(0.0001, tClick + 0.022);\n  osc.connect(gain);\n  gain.connect(audioCtx.destination);\n  osc.start(tClick);\n  osc.stop(tClick + 0.025);\n}\n\nfunction draw(playheadFrac) {\n  var D = lab.values.shift;\n  var M = lab.values.halfWidth;\n  var isCausal = (D >= M);\n\n  ctx.clearRect(0, 0, W, H);\n\n  var yBase = 166;\n  var scale = 112;\n  var xZero = nToX(0);\n\n  ctx.fillStyle = isCausal ? 'rgba(16, 185, 129, 0.07)' : 'rgba(236, 72, 153, 0.11)';\n  ctx.fillRect(xLeft - 10, 20, xZero - (xLeft - 10), H - 44);\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';\n  ctx.lineWidth = 1;\n  for (var n = nMin; n <= nMax; n += 2) {\n    var gx = nToX(n);\n    ctx.beginPath();\n    ctx.moveTo(gx, 20);\n    ctx.lineTo(gx, H - 24);\n    ctx.stroke();\n  }\n  [-0.2, 0.2, 0.4, 0.6, 0.8, 1.0].forEach(function (v) {\n    var gy = yBase - v * scale;\n    ctx.beginPath();\n    ctx.moveTo(xLeft - 8, gy);\n    ctx.lineTo(xRight + 8, gy);\n    ctx.stroke();\n  });\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';\n  ctx.beginPath();\n  ctx.moveTo(xLeft - 8, yBase);\n  ctx.lineTo(xRight + 8, yBase);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  ctx.moveTo(xZero, 20);\n  ctx.lineTo(xZero, H - 24);\n  ctx.stroke();\n\n  var negNonZeroCount = 0;\n  for (var n = nMin; n <= nMax; n++) {\n    var val = getSample(n, D, M);\n    var x = nToX(n);\n    var y = yBase - val * scale;\n    if (n < 0 && Math.abs(val) > 1e-4) {\n      negNonZeroCount++;\n    }\n\n    if (Math.abs(val) > 1e-4) {\n      var color = (n < 0) ? '#ec4899' : (isCausal ? '#10b981' : '#38bdf8');\n      ctx.strokeStyle = color;\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(x, yBase);\n      ctx.lineTo(x, y);\n      ctx.stroke();\n      ctx.fillStyle = color;\n      ctx.beginPath();\n      ctx.arc(x, y, 3.6, 0, Math.PI * 2);\n      ctx.fill();\n    } else {\n      ctx.fillStyle = 'rgba(248, 250, 252, 0.35)';\n      ctx.beginPath();\n      ctx.arc(x, yBase, 2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  if (typeof playheadFrac === 'number' && playheadFrac >= 0 && playheadFrac <= 1) {\n    var px = xLeft + playheadFrac * (xRight - xLeft);\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, 20);\n    ctx.lineTo(px, H - 24);\n    ctx.stroke();\n  }\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = isCausal ? '#10b981' : '#ec4899';\n  ctx.fillText(isCausal ? 'CAUSAL 因果信号 (负样本全为 0)' : 'NONCAUSAL 非因果信号 (' + negNonZeroCount + ' 个负样本非零)', 16, 16);\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('n = 0 (因果分界/基准音)', xZero + 5, 32);\n\n  ctx.fillStyle = 'rgba(248, 250, 252, 0.6)';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  for (var n = nMin; n <= nMax; n += 4) {\n    ctx.fillText(String(n), nToX(n), H - 7);\n  }\n  ctx.textAlign = 'left';\n\n  if (isCausal) {\n    lab.setReadout('右移 D = ' + D + ' ≥ 半宽 M = ' + M + ' | 负下标非零点数 = 0 | 状态：因果 (引入了 ' + D + ' 样本延迟)');\n  } else {\n    lab.setReadout('右移 D = ' + D + ' < 半宽 M = ' + M + ' | 负下标非零点数 = ' + negNonZeroCount + ' | 状态：非因果 (还需右移 ' + (M - D) + ' 样本)');\n  }\n}\n\nlab.onUpdate(function () {\n  draw(-1);\n});\n\nlab.onLoop(function (dt, timeSec) {\n  if (!lab.values.play) {\n    nextBeat = timeSec;\n    burstStart = -1;\n    return;\n  }\n  if (timeSec >= nextBeat) {\n    if (timeSec - nextBeat > 1.2) {\n      nextBeat = timeSec;\n    }\n    nextBeat += 0.95;\n    burstStart = timeSec;\n    triggerAudioBurst(lab.values.shift, lab.values.halfWidth);\n  }\n  if (burstStart >= 0) {\n    var elapsed = timeSec - burstStart;\n    if (elapsed <= burstDur) {\n      draw(elapsed / burstDur);\n    } else {\n      burstStart = -1;\n      draw(-1);\n    }\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "实时系统铁律：凡是边采集边输出的实时 DSP（如麦克风降噪、助听器、电机控制），滤波器脉冲响应必须满足因果性（`h[n] = 0, n < 0`），因为系统拿不到“未来”的采样点。",
        "离线处理的自由：如果是处理已经存进硬盘的整段音频、图像或地震数据，完全可以使用非因果滤波（比如左右对称的零相位滤波器），直接消除相位失真。",
        "有限长非因果信号的通用解法：任何有限长非因果信号（如 FIR 滤波核），只需整体右移足够的样本数即可变为因果信号，但要记住这会带来等量的群延迟（Latency）。"
      ]
    }
  ]
});
