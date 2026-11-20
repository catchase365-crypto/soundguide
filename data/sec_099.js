window.__BOOK_REGISTER_SECTION__("sec_099", {
  "title": "困扰 6：幅值恒为正导致的相位 π 跳变 (Nuisance 6: The Magnitude is Always Positive / π Ambiguity)",
  "intuition": "极坐标规定幅值必须大于等于零，迫使原本平滑穿过零点的实部信号被硬生生折成尖角，而原本应有的负号则被甩给相位，导致相位在 0 和 ±π 之间反复剧烈跳变。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么平滑的直角坐标，转成极坐标后变得满是尖角与断崖？",
      "paragraphs": [
        "在数字信号处理中，离散傅里叶变换（DFT）的频域结果既可以用**直角坐标（Rectangular form）**表示，即实部 `Re X[]` 和虚部 `Im X[]`；也可以用**极坐标（Polar form）**表示，即幅值 `Mag X[]` 和相位 `Phase X[]`。",
        "设想一个非常规整、直观的频域信号（对应原书图 8-13）：它的虚部 `Im X[]` 处处为零，而实部 `Re X[]` 是一条光滑衰减的振荡曲线，会反复穿过零点进入负半轴。在直角坐标下，这个信号一眼就能看懂。",
        "但一旦转换到极坐标，问题就来了：**在数学定义上，幅值（Magnitude）必须恒为非负数**。每当实部 `Re X[]` 跌破零点变成负数时，幅值无法跟着下探到负半轴，只能像“绝对值整流”一样在零点处生硬地向上反弹，形成一个个尖锐的 **V 形折角（sharp corners）**。",
        "与此同时，实部丢失的“负号”必须由相位来承担：只要 `Re X[] < 0`，相位就必须瞬间跳变 **π（或 -π，两者等价）** 弧度来实现 $180^\\circ$ 反相。数学计算上这完全正确，但在人眼观察与工程分析时，这种锯齿状的幅值和断崖式的相位跳变极难解读。"
      ],
      "formula": {
        "expr": "Mag[k] = √(Re[k]² + Im[k]²) ≥ 0,   Phase[k] = atan2(Im[k], Re[k])",
        "explain": "Re[k] 与 Im[k] 分别是第 k 个频点的实部与虚部；由于平方和开根号结果恒非负，当 Im[k]=0 且 Re[k] 从正变负时，Mag[k] 等于 |Re[k]| 产生尖角，Phase[k] 从 0 跳变为 π 或 -π。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：直击图 8-13 的直角坐标与极坐标分裂现场",
      "instruction": "拖动「旁瓣振荡频率」与「虚部微扰」，并开启「解卷绕幅值」开关，观察 Mag 的尖角与 Phase 的 π 跳变如何产生与消失",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "旁瓣振荡频率",
          "min": 4,
          "max": 18,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imBias",
          "label": "虚部微扰 Im X[]",
          "min": -0.25,
          "max": 0.25,
          "step": 0.01,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "unwrapped",
          "label": "开启解卷绕幅值 (Unwrapped Mag)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const cutoff = lab.values.cutoff;\n  const imBias = lab.values.imBias;\n  const unwrapped = lab.values.unwrapped;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const N = 160;\n  const reArr = [];\n  const imArr = [];\n  const magArr = [];\n  const phArr = [];\n\n  let zeroCrossings = 0;\n  for (let i = 0; i < N; i++) {\n    const f = (i / (N - 1)) * 0.5;\n    const x = Math.PI * f * cutoff * 2;\n    const re = x < 1e-6 ? 2.0 : 2.0 * Math.sin(x) / x;\n    const im = imBias;\n    const mag = Math.sqrt(re * re + im * im);\n    const ph = Math.atan2(im, re);\n    reArr.push(re);\n    imArr.push(im);\n    magArr.push(mag);\n    phArr.push(ph);\n    if (i > 0 && ((reArr[i - 1] >= 0 && re < 0) || (reArr[i - 1] < 0 && re >= 0))) {\n      zeroCrossings++;\n    }\n  }\n\n  function drawPlot(x0, y0, pw, ph, title, yMin, yMax, data, color, dashedData, dashedColor, showPiTicks) {\n    ctx.save();\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(x0, y0, pw, ph);\n\n    const zeroY = y0 + ph * (yMax / (yMax - yMin));\n    ctx.beginPath();\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.moveTo(x0, zeroY);\n    ctx.lineTo(x0 + pw, zeroY);\n    ctx.stroke();\n\n    if (showPiTicks) {\n      const piY = y0 + ph * ((yMax - Math.PI) / (yMax - yMin));\n      const nPiY = y0 + ph * ((yMax + Math.PI) / (yMax - yMin));\n      ctx.setLineDash([3, 3]);\n      ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n      ctx.beginPath();\n      ctx.moveTo(x0, piY); ctx.lineTo(x0 + pw, piY);\n      ctx.moveTo(x0, nPiY); ctx.lineTo(x0 + pw, nPiY);\n      ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = 'rgba(248,250,252,0.5)';\n      ctx.font = '10px monospace';\n      ctx.fillText('+π', x0 - 18, piY + 3);\n      ctx.fillText('-π', x0 - 18, nPiY + 3);\n    } else {\n      ctx.fillStyle = 'rgba(248,250,252,0.5)';\n      ctx.font = '10px monospace';\n      ctx.fillText('0', x0 - 12, zeroY + 3);\n    }\n\n    if (dashedData) {\n      ctx.beginPath();\n      ctx.setLineDash([4, 4]);\n      ctx.strokeStyle = dashedColor;\n      ctx.lineWidth = 1.5;\n      for (let i = 0; i < N; i++) {\n        const px = x0 + (i / (N - 1)) * pw;\n        const py = y0 + ph * ((yMax - dashedData[i]) / (yMax - yMin));\n        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n      }\n      ctx.stroke();\n      ctx.setLineDash([]);\n    }\n\n    ctx.beginPath();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    for (let i = 0; i < N; i++) {\n      const px = x0 + (i / (N - 1)) * pw;\n      const py = y0 + ph * ((yMax - data[i]) / (yMax - yMin));\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'right';\n    ctx.fillText(title, x0 + pw - 6, y0 + 14);\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(W / 2, 8);\n  ctx.lineTo(W / 2, H - 8);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('直角坐标 (Rectangular)', 182, 14);\n  ctx.fillText('极坐标 (Polar)', 542, 14);\n  ctx.textAlign = 'left';\n\n  drawPlot(30, 22, 305, 92, 'a. Re X[f] (实部)', -0.8, 2.6, reArr, '#38bdf8', null, null, false);\n  drawPlot(30, 130, 305, 92, 'b. Im X[f] (虚部)', -0.5, 0.5, imArr, '#f59e0b', null, null, false);\n\n  const isPureReal = Math.abs(imBias) < 0.005;\n  if (unwrapped && isPureReal) {\n    const flatZero = new Array(N).fill(0);\n    drawPlot(390, 22, 305, 92, 'c. Unwrapped Mag (允许负值)', -0.8, 2.6, reArr, '#10b981', magArr, 'rgba(16,185,129,0.28)', false);\n    drawPlot(390, 130, 305, 92, 'd. Phase X[f] (相位归零!)', -4.2, 4.2, flatZero, '#ec4899', phArr, 'rgba(236,72,153,0.25)', true);\n    lab.setReadout('实部过零点: ' + zeroCrossings + ' 处 | 已开启解卷绕幅值：曲线与 Re 完全重合，Phase 跳变完全消除 (恒为 0)');\n  } else {\n    const cTitle = (unwrapped && !isPureReal) ? 'c. Mag X[f] (虚部非零绕过原点)' : 'c. Mag X[f] (恒 ≥ 0)';\n    drawPlot(390, 22, 305, 92, cTitle, -0.8, 2.6, magArr, '#10b981', unwrapped ? reArr : null, 'rgba(56,189,248,0.4)', false);\n    drawPlot(390, 130, 305, 92, 'd. Phase X[f] (弧度)', -4.2, 4.2, phArr, '#ec4899', null, null, true);\n    if (isPureReal) {\n      lab.setReadout('实部过零点: ' + zeroCrossings + ' 处 | Mag 在过零点出现尖锐 V 型折角，Phase 在 0 与 π 间跳变 ' + zeroCrossings + ' 次');\n    } else {\n      lab.setReadout('Im X[f] = ' + imBias.toFixed(2) + ' ≠ 0 | 复矢量绕过原点，Mag 尖角圆滑化，Phase 连续滑向 ' + (imBias > 0 ? '+π' : '-π'));\n    }\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "破局之道：“解卷绕幅值 (Unwrapped Magnitude)”与术语严谨性",
      "paragraphs": [
        "既然问题出在“强行要求幅值非负”，最直接的解法就是**允许幅值取负值**。在刚才图 8-13 的例子中，只要放开负号限制，幅值曲线就会立刻恢复成与实部 `Re X[]` 一模一样的光滑波形，而原本剧烈震荡的相位 `Phase X[]` 则会彻底归零、风平浪静。",
        "从物理本质来看，这是因为正弦波的“负幅值”与“$+\\pi$（或 $-\\pi$）相移”完全等价：把一个正弦信号乘以 $-1$，在波形上就是上下翻转，而这与将它沿时间轴平移半个周期（$\\pi$ 弧度）所得到的波形分毫不差。",
        "但 Steven W. Smith 在书中特别给出了一个**术语警告**：如果一条曲线允许出现负值，**千万不要直接叫它“Magnitude（幅值）”**，因为这违背了幅值非负的严格数学定义。工程上为了既能享受平滑视图的直觉便利、又不犯概念错误，专门发明了一个委婉词：**Unwrapped Magnitude（解卷绕幅值）**，用来指代“允许取负值的广义幅值”。"
      ],
      "formula": {
        "expr": "-A · cos(ωt)  ≡  A · cos(ωt + π)  ≡  A · cos(ωt - π)",
        "explain": "A 为正振幅，ω 为角频率。当 A 取负号时（-A），等价于保持正振幅 A 不变，同时把相位移动 +π 或 -π 弧度；因此极坐标在 π 和 -π 之间切换本质上是同一个物理波形。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：负幅值 vs π 相移的几何等效与听感验证",
      "instruction": "拖动「实部振幅」穿过 0 点进入负区，切换极坐标视角并点击播放声音，验证负幅值与 +π 相移产生的波形和听感完全一致",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "实部振幅 (Unwrapped Mag)",
          "min": -1,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "测试音频率",
          "min": 150,
          "max": 500,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "polarView",
          "label": "强制极坐标视角 (Mag ≥ 0, Phase = 0 或 π)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放正弦波",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet osc = null;\nlet gainNode = null;\nlet audioRunning = false;\nlet visPhase = 0;\n\nfunction syncAudio() {\n  const shouldPlay = !!lab.values.play;\n  const freq = lab.values.freq;\n  const amp = lab.values.amp;\n\n  if (shouldPlay && !audioRunning) {\n    const actx = lab.getAudioContext();\n    if (actx) {\n      if (actx.state === 'suspended') actx.resume();\n      osc = actx.createOscillator();\n      gainNode = actx.createGain();\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(freq, actx.currentTime);\n      gainNode.gain.setValueAtTime(amp * 0.25, actx.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(actx.destination);\n      osc.start();\n      audioRunning = true;\n    }\n  } else if (!shouldPlay && audioRunning) {\n    if (osc) { try { osc.stop(); osc.disconnect(); } catch (e) {} osc = null; }\n    if (gainNode) { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }\n    audioRunning = false;\n  } else if (shouldPlay && audioRunning && osc && gainNode) {\n    const actx = lab.getAudioContext();\n    if (actx) {\n      osc.frequency.setTargetAtTime(freq, actx.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(amp * 0.25, actx.currentTime, 0.02);\n    }\n  }\n}\n\nfunction draw() {\n  const amp = lab.values.amp;\n  const freq = lab.values.freq;\n  const polarView = lab.values.polarView;\n  const mag = Math.abs(amp);\n  const phaseShift = amp < 0 ? Math.PI : 0;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const cx = 125;\n  const cy = 125;\n  const R = 78;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - R - 15, cy); ctx.lineTo(cx + R + 15, cy);\n  ctx.moveTo(cx, cy - R - 15); ctx.lineTo(cx, cy + R + 15);\n  ctx.stroke();\n\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const refAngle = visPhase;\n  const refX = cx + Math.cos(refAngle) * R;\n  const refY = cy - Math.sin(refAngle) * R;\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(refX, refY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const vecAngle = refAngle + (polarView ? phaseShift : 0);\n  const vecLen = (polarView ? mag : amp) * R;\n  const tipX = cx + Math.cos(vecAngle) * vecLen;\n  const tipY = cy - Math.sin(vecAngle) * vecLen;\n\n  const vecColor = polarView ? '#10b981' : '#38bdf8';\n  ctx.strokeStyle = vecColor;\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(tipX, tipY);\n  ctx.stroke();\n\n  ctx.fillStyle = vecColor;\n  ctx.beginPath();\n  ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  if (polarView && amp < -0.01) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.arc(cx, cy, 24, -refAngle - Math.PI, -refAngle);\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText('Δφ = π', cx - 18, cy - 30);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('旋转矢量对比 (Phasor)', 58, 22);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText(polarView ? ('Mag=' + mag.toFixed(2) + ', φ=' + (amp < 0 ? 'π' : '0')) : ('Unwrapped=' + amp.toFixed(2) + ', φ=0'), 42, 226);\n\n  const wx0 = 260;\n  const wy0 = 36;\n  const ww = 435;\n  const wh = 168;\n  const wMid = wy0 + wh / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(wx0, wy0, ww, wh);\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.moveTo(wx0, wMid);\n  ctx.lineTo(wx0 + ww, wMid);\n  ctx.stroke();\n\n  const cycles = 2.5 * (freq / 220);\n  if (amp < -0.01) {\n    ctx.beginPath();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.25)';\n    ctx.lineWidth = 1.5;\n    for (let i = 0; i <= 180; i++) {\n      const px = wx0 + (i / 180) * ww;\n      const th = (i / 180) * Math.PI * 2 * cycles - visPhase;\n      const py = wMid - Math.cos(th) * mag * (wh * 0.42);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.beginPath();\n  ctx.strokeStyle = vecColor;\n  ctx.lineWidth = 2.5;\n  for (let i = 0; i <= 180; i++) {\n    const px = wx0 + (i / 180) * ww;\n    const th = (i / 180) * Math.PI * 2 * cycles - visPhase;\n    const val = polarView ? (mag * Math.cos(th + phaseShift)) : (amp * Math.cos(th));\n    const py = wMid - val * (wh * 0.42);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  const eqText = polarView\n    ? ('极坐标形式: x(t) = ' + mag.toFixed(2) + ' · cos(ωt' + (amp < 0 ? ' + π)' : ' + 0)'))\n    : ('负幅值形式: x(t) = (' + amp.toFixed(2) + ') · cos(ωt)');\n  ctx.fillText(eqText, wx0 + 8, 22);\n\n  if (amp < -0.01) {\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('虚线为未反相正振幅参考波 (+|A|)', wx0 + 8, 226);\n  }\n\n  lab.setReadout((polarView ? '[极坐标] ' : '[解卷绕幅值] ') + 'Unwrapped=' + amp.toFixed(2) + ' | Mag=' + mag.toFixed(2) + ' | Phase=' + (amp < 0 ? '±π (180°反相)' : '0 rad') + ' | 频率=' + freq + ' Hz' + (audioRunning ? ' | 🔊 发声中' : ''));\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  const clamped = Math.min(dt, 0.05);\n  visPhase += clamped * (lab.values.freq / 220) * 2.2;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看到频谱幅值出现尖锐的 V 形零点反弹、且相位同步发生 π 弧度（180°）跳变时，不要误以为信号本身存在奇异突变，这往往是实部（或零相位频谱）穿零引起的极坐标表示伪影。",
        "为了分析方便，可以在工程中允许“幅值取负”来还原平滑曲线，但切记不可称之为 Magnitude（幅值），规范的名称应为 Unwrapped Magnitude（解卷绕幅值）。",
        "负幅值乘以余弦与正幅值加上 π（或 -π）相移在数学和物理上完全等价；因此相位在 +π 与 -π 之间切换并不代表物理跳变，也正因为两者等价，微小的舍入噪声就能导致相位在 +π 和 -π 间疯狂闪烁（即下一个困扰）。"
      ]
    }
  ]
});
