window.__BOOK_REGISTER_SECTION__("sec_122", {
  "title": "速度与精度大比拼：为什么 FFT 碾压普通 DFT？ (Speed and Precision Comparisons)",
  "intuition": "FFT 不仅将运算复杂度从 O(N²) 降维打击到 O(N log₂N) 实现成百上千倍提速，更因为算得少而大幅减少了浮点舍入误差。",
  "blocks": [
    {
      "type": "concept",
      "heading": "平方级的性能泥潭：相关法 DFT 的耗时瓶颈",
      "paragraphs": [
        "在评估算法有多快之前，先看看笨办法慢在哪里。当我们直接利用**相关法 (Correlation)** 计算离散傅里叶变换（如原书表 12-2 所示）时，程序必须使用**两层嵌套循环**，外层遍历频域的 `N` 个点，内层遍历时域的 `N` 个点。",
        "这意味着总运算量与 `N × N` 成正比。原书在 100 MHz 的奔腾（Pentium）处理器上做过实测：如果每次循环都现算正弦和余弦值，比例常数 `k_DFT` 高达 **25 微秒**；即使你聪明地提前把三角函数值算好放进**查找表 (Look-Up Table, LUT)**，`k_DFT` 也只能降到 **7 微秒**。",
        "听起来微秒很短？一旦点数 `N = 1024`，直接相关法就需要足足 **25 秒**（平均每个点耗费近 25 毫秒）——在实时信号处理的世界里，这简直慢如蜗牛。"
      ],
      "formula": {
        "expr": "ExecutionTime = k_DFT * N^2",
        "explain": "N 为 DFT 的采样点数；k_DFT 为单次内层循环的硬件耗时常数（直接算三角函数约 25 微秒，查表法 LUT 约 7 微秒）。耗时随点数 N 的平方急剧爆炸。"
      }
    },
    {
      "type": "concept",
      "heading": "分治法的降维打击：FFT 的对数级提速奇迹",
      "paragraphs": [
        "用同样的算力模型去拆解**快速傅里叶变换 (FFT)**，结果截然不同。首先，数据重排所需的**位反转 (Bit Reversal)** 耗时几乎可以忽略不计；核心计算被拆解为 `log₂N` 个级联阶段，而每个阶段只需执行 `N/2` 次极简的**蝶形运算 (Butterfly Computations)**。",
        "在同一台 100 MHz 奔腾机器上，FFT 的比例常数 `k_FFT` 约为 **10 微秒**。这意味着一个 1024 点的 FFT 只需要大约 **70 毫秒**（每点仅 70 微秒），直接比相关法快了 **300 多倍**！",
        "更重要的是，`N log₂N` 不仅绝对值远小于 `N²`，它随着 `N` 增大的膨胀速度也慢得多：当 `N = 32` 时，FFT 已经比相关法快约 **10 倍**；当 `N = 4096` 时，差距直接拉大到惊人的 **1000 倍**。因此，对于 `32 ~ 128` 这样的小点数，FFT 很重要；而对于 `1024` 及以上的大点数，FFT 是决定系统生死的绝对关键。"
      ],
      "formula": {
        "expr": "ExecutionTime = k_FFT * N * log2(N)",
        "explain": "N 为变换点数，log2(N) 为蝶形分解的级数；k_FFT 为单级单位运算耗时常数（100 MHz 奔腾上约 10 微秒）。由于对数增长极缓，N 越大优势越悬殊。"
      }
    },
    {
      "type": "lab",
      "heading": "复刻图 12-8：不同算法耗时对数曲线与算力对比",
      "instruction": "拖动「点数指数」滑块改变 N (8 ~ 4096)，观察双对数坐标下相关法、查表法 (LUT) 与 FFT 的耗时鸿沟，并体验 N > 16 后 FFT 的全面统治。",
      "controls": [
        {
          "type": "slider",
          "id": "nExp",
          "label": "点数指数 k (N = 2^k)",
          "min": 3,
          "max": 12,
          "step": 1,
          "value": 10,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "speedMult",
          "label": "CPU 相对算力",
          "min": 1,
          "max": 100,
          "step": 1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "useLut",
          "label": "启用相关法 LUT 查表优化",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction fmtTime(t) {\n  if (t >= 1) return t.toFixed(2) + ' s';\n  if (t >= 0.001) return (t * 1000).toFixed(2) + ' ms';\n  return (t * 1e6).toFixed(0) + ' us';\n}\nfunction draw() {\n  var nExp = lab.values.nExp;\n  var speed = lab.values.speedMult;\n  var useLut = lab.values.useLut;\n  var N_sel = Math.pow(2, nExp);\n  ctx.clearRect(0, 0, W, H);\n  var padL = 62, padR = 232, padT = 24, padB = 34;\n  var plotW = W - padL - padR, plotH = H - padT - padB;\n  var minLogT = -4, maxLogT = 3;\n  function xOf(exp) { return padL + ((exp - 3) / 9) * plotW; }\n  function yOf(t) {\n    var lt = Math.log(Math.max(t, 1e-5)) / Math.LN10;\n    var norm = (lt - minLogT) / (maxLogT - minLogT);\n    return padT + plotH - Math.max(0, Math.min(1, norm)) * plotH;\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.textAlign = 'right';\n  for (var lt = minLogT; lt <= maxLogT; lt++) {\n    var y = padT + plotH - ((lt - minLogT) / (maxLogT - minLogT)) * plotH;\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n    var lbl = lt >= 0 ? Math.pow(10, lt).toFixed(0) : Math.pow(10, lt).toFixed(-lt);\n    ctx.fillText(lbl + 's', padL - 6, y + 4);\n  }\n  ctx.textAlign = 'center';\n  for (var e = 3; e <= 12; e++) {\n    var x = xOf(e);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n    ctx.fillText(Math.pow(2, e), x, padT + plotH + 15);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.fillText('DFT 点数 N (对数坐标)', padL + plotW / 2, H - 4);\n  function tCorr(e) { var n = Math.pow(2, e); return (25e-6 * n * n) / speed; }\n  function tLut(e) { var n = Math.pow(2, e); return (7e-6 * n * n) / speed; }\n  function tFft(e) { var n = Math.pow(2, e); return (0.0003 + 10e-6 * n * e) / speed; }\n  function plotCurve(fn, color, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.2;\n    if (dashed) ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (var e = 3; e <= 12; e++) {\n      var px = xOf(e), py = yOf(fn(e));\n      if (e === 3) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n    for (var e2 = 3; e2 <= 12; e2++) {\n      ctx.fillStyle = color;\n      ctx.beginPath();\n      ctx.arc(xOf(e2), yOf(fn(e2)), e2 === nExp ? 5 : 2.8, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n  var selX = xOf(nExp);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(selX, padT); ctx.lineTo(selX, padT + plotH); ctx.stroke();\n  plotCurve(tCorr, '#ec4899', useLut);\n  if (useLut) plotCurve(tLut, '#f59e0b', false);\n  plotCurve(tFft, '#10b981', false);\n  var rx = padL + plotW + 18;\n  var curCorr = useLut ? tLut(nExp) : tCorr(nExp);\n  var curFft = tFft(nExp);\n  var ratio = curCorr / curFft;\n  ctx.textAlign = 'left';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('N = ' + N_sel + ' 点耗时对比', rx, 34);\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('● 直接相关法 (25us)', rx, 60);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('  ' + fmtTime(tCorr(nExp)), rx, 76);\n  ctx.fillStyle = useLut ? '#f59e0b' : 'rgba(245,158,11,0.45)';\n  ctx.fillText('● 查表相关法 LUT (7us)', rx, 100);\n  ctx.fillStyle = useLut ? '#f8fafc' : 'rgba(248,250,252,0.45)';\n  ctx.fillText('  ' + fmtTime(tLut(nExp)), rx, 116);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 快速 FFT (10us)', rx, 140);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('  ' + fmtTime(curFft), rx, 156);\n  ctx.fillStyle = ratio >= 1 ? '#38bdf8' : '#f59e0b';\n  ctx.font = 'bold 14px sans-serif';\n  if (ratio >= 1) {\n    ctx.fillText('FFT 提速: ' + (ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1)) + 'x', rx, 190);\n  } else {\n    ctx.fillText('N<=8 时查表法略快', rx, 190);\n  }\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('基准: ' + speed + 'x Pentium 100MHz', rx, 212);\n  lab.setReadout('N=' + N_sel + ' | ' + (useLut ? 'LUT相关法: ' : '直接相关法: ') + fmtTime(curCorr) + ' vs FFT: ' + fmtTime(curFft) + ' | 加速比: ' + (ratio >= 1 ? ratio.toFixed(1) + 'x' : 'FFT尚未占优'));\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "意想不到的红利：算得越少，精度反而越高！",
      "paragraphs": [
        "在直觉里，我们常以为「快速算法」往往是用精度换速度的妥协产物。但 FFT 恰恰相反：**FFT 不仅算得比相关法快，算出来的结果还更精确**！",
        "原因非常简单：计算机中的浮点数运算每做一次乘法和加法，都会引入微小的**舍入误差 (Round-off Error)**。把一个任意时域信号先做正变换到频域，再做逆变换重建回时域，新信号与原信号并不会 100% 完全重合，多出来的那一点点差异就是计算过程中累积的**舍入噪声**。",
        "我们把原信号与重建信号差值的**标准差**（以百万分之一 `ppm` 为单位）作为误差指标（如原书图 12-9）。由于相关法需要做 `O(N²)` 次乘加运算，误差随着 `N` 呈线性甚至更陡峭地攀升——在 `N = 1024` 时误差已逼近 **70 ppm**；而 FFT 只做了 `O(N log₂N)` 次运算，误差累积极慢，在 `N = 1024` 时仍保持在 **约 2 ppm** 以下，精度整整领先三十多倍！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "复刻图 12-9：舍入误差累积曲线与残差底噪听觉对比",
      "instruction": "调节变换点数 N 与误差放大倍率，观察左侧图 12-9 误差曲线分化与右侧波形毛刺；点击播放声音并切换开关，对比「相关法」与「FFT」各自的舍入底噪听感。",
      "controls": [
        {
          "type": "slider",
          "id": "nExp2",
          "label": "变换点数指数 k (N = 2^k)",
          "min": 4,
          "max": 10,
          "step": 1,
          "value": 9,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "误差放大观测倍率",
          "min": 200,
          "max": 5000,
          "step": 200,
          "value": 2000,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "algoFft",
          "label": "使用 FFT 模式（关闭为相关法 DFT）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听重构信号与舍入底噪",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar playing = false, osc = null, noiseSrc = null, noiseGain = null, oscGain = null;\nvar animT = 0;\nfunction errCorr(e) { return 0.0675 * Math.pow(2, e); }\nfunction errFft(e) { return Math.max(0.35, 0.22 * e - 0.3); }\nfunction updateAudio() {\n  var shouldPlay = !!lab.values.play;\n  var e = lab.values.nExp2;\n  var amp = lab.values.noiseAmp;\n  var isFft = !!lab.values.algoFft;\n  var ppm = isFft ? errFft(e) : errCorr(e);\n  var targetNoiseGain = Math.min(0.32, (ppm / 1e6) * amp * 0.6);\n  if (shouldPlay && !playing) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = 220;\n    oscGain = ac.createGain();\n    oscGain.gain.value = 0.12;\n    osc.connect(oscGain);\n    oscGain.connect(ac.destination);\n    var bufSize = ac.sampleRate;\n    var buf = ac.createBuffer(1, bufSize, ac.sampleRate);\n    var data = buf.getChannelData(0);\n    for (var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;\n    noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n    noiseGain = ac.createGain();\n    noiseGain.gain.value = targetNoiseGain;\n    noiseSrc.connect(noiseGain);\n    noiseGain.connect(ac.destination);\n    osc.start();\n    noiseSrc.start();\n    playing = true;\n  } else if (!shouldPlay && playing) {\n    if (osc) { try { osc.stop(); osc.disconnect(); } catch (err) {} osc = null; }\n    if (noiseSrc) { try { noiseSrc.stop(); noiseSrc.disconnect(); } catch (err) {} noiseSrc = null; }\n    if (oscGain) { oscGain.disconnect(); oscGain = null; }\n    if (noiseGain) { noiseGain.disconnect(); noiseGain = null; }\n    playing = false;\n  } else if (playing && noiseGain) {\n    var ac2 = lab.getAudioContext();\n    noiseGain.gain.setTargetAtTime(targetNoiseGain, ac2.currentTime, 0.03);\n  }\n}\nfunction draw(t) {\n  var eSel = lab.values.nExp2;\n  var amp = lab.values.noiseAmp;\n  var isFft = !!lab.values.algoFft;\n  var N_sel = Math.pow(2, eSel);\n  var cErr = errCorr(eSel);\n  var fErr = errFft(eSel);\n  var curErr = isFft ? fErr : cErr;\n  ctx.clearRect(0, 0, W, H);\n  var lPadL = 48, lPadT = 26, lW = 290, lH = 172;\n  function lx(e) { return lPadL + ((e - 4) / 6) * lW; }\n  function ly(ppm) { return lPadT + lH - Math.min(1, ppm / 75) * lH; }\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '10px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.textAlign = 'right';\n  for (var p = 0; p <= 70; p += 10) {\n    var yy = ly(p);\n    ctx.beginPath(); ctx.moveTo(lPadL, yy); ctx.lineTo(lPadL + lW, yy); ctx.stroke();\n    ctx.fillText(p + '', lPadL - 6, yy + 3);\n  }\n  ctx.textAlign = 'center';\n  for (var e = 4; e <= 10; e++) {\n    var xx = lx(e);\n    ctx.beginPath(); ctx.moveTo(xx, lPadT); ctx.lineTo(xx, lPadT + lH); ctx.stroke();\n    ctx.fillText(Math.pow(2, e), xx, lPadT + lH + 14);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('图 12-9: 舍入误差 (ppm) vs 点数 N', lPadL + lW / 2, 15);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(lx(eSel), lPadT); ctx.lineTo(lx(eSel), lPadT + lH); ctx.stroke();\n  function drawErrCurve(fn, col, active) {\n    ctx.strokeStyle = col;\n    ctx.lineWidth = active ? 2.6 : 1.5;\n    ctx.beginPath();\n    for (var i = 4; i <= 10; i++) {\n      var px = lx(i), py = ly(fn(i));\n      if (i === 4) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    for (var j = 4; j <= 10; j++) {\n      ctx.fillStyle = col;\n      ctx.beginPath();\n      ctx.arc(lx(j), ly(fn(j)), j === eSel ? 5 : 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n  drawErrCurve(errCorr, '#ec4899', !isFft);\n  drawErrCurve(errFft, '#10b981', isFft);\n  var rX = 378, rY = 26, rW = 322, rH = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rX, rY, rW, rH);\n  var midY = rY + rH / 2;\n  ctx.beginPath(); ctx.moveTo(rX, midY); ctx.lineTo(rX + rW, midY); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('信号重建波形 (误差放大 ' + amp + 'x): ' + (isFft ? 'FFT (极干净)' : '相关法 DFT (毛刺明显)'), rX, 15);\n  ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var x = 0; x <= rW; x += 2) {\n    var ph = (x / rW) * Math.PI * 4 - t * 3;\n    var sy = midY - Math.sin(ph) * 56;\n    if (x === 0) ctx.moveTo(rX + x, sy); else ctx.lineTo(rX + x, sy);\n  }\n  ctx.stroke();\n  var noiseScale = (curErr / 1e6) * amp * 160;\n  ctx.strokeStyle = isFft ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var x2 = 0; x2 <= rW; x2 += 2) {\n    var ph2 = (x2 / rW) * Math.PI * 4 - t * 3;\n    var pseudoRand = Math.sin(x2 * 12.9898 + t * 47.2) * 43758.5453;\n    var nVal = (pseudoRand - Math.floor(pseudoRand)) * 2 - 1;\n    var ry2 = midY - Math.sin(ph2) * 56 + nVal * noiseScale;\n    ry2 = Math.max(rY + 4, Math.min(rY + rH - 4, ry2));\n    if (x2 === 0) ctx.moveTo(rX + x2, ry2); else ctx.lineTo(rX + x2, ry2);\n  }\n  ctx.stroke();\n  ctx.fillStyle = isFft ? '#10b981' : '#ec4899';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('当前误差: ' + curErr.toFixed(2) + ' ppm  |  FFT 精度提升: ' + (cErr / fErr).toFixed(1) + 'x', rX, H - 10);\n}\nlab.onUpdate(function() {\n  updateAudio();\n  draw(animT);\n  var eSel = lab.values.nExp2;\n  var isFft = !!lab.values.algoFft;\n  var cErr = errCorr(eSel), fErr = errFft(eSel);\n  lab.setReadout('N=' + Math.pow(2, eSel) + ' | 当前模式: ' + (isFft ? 'FFT (' + fErr.toFixed(2) + ' ppm)' : '相关法 DFT (' + cErr.toFixed(2) + ' ppm)') + ' | 舍入噪声差距: ' + (cErr / fErr).toFixed(1) + ' 倍');\n});\nlab.onLoop(function(dt, timeSec) {\n  animT = timeSec;\n  draw(animT);\n});\ndraw(0);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "16 点是分水岭：当点数 N <= 16 时，查表优化的相关法因为没有位反转与蝶形调度开销，速度可能略胜或持平于 FFT；只要 N > 16，FFT 便进入全面碾压。",
        "量级决定了架构选择：N 在 32 ~ 128 时 FFT 提供十倍到几十倍的加速；一旦 N >= 1024，直接相关法的秒级延迟不可接受，必须使用 FFT（毫秒级甚至微秒级）。",
        "算得少等于误差小：不要误以为 FFT 是有损近似，它与相关法在数学上完全等价；正因为 FFT 减少了乘加次数，反而把 1024 点变换的浮点舍入噪声从约 70 ppm 压低到了约 2 ppm。",
        "调试自检妙招：工程中若想验证自己写的 FFT/IFFT 是否存在数值溢出或精度异常，只需把任意信号做「正变换再逆变换」，计算重建信号与原信号差值的标准差即可。"
      ]
    }
  ]
});
