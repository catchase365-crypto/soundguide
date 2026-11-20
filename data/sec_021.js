window.__BOOK_REGISTER_SECTION__("sec_021", {
  "title": "语音识别：让计算机听懂人类语言 (Speech Recognition)",
  "intuition": "对人类大脑轻而易举的“听懂说话”，却是数字计算机的噩梦——经典 DSP 通过“提取激励与共振峰特征 + 模板比对匹配”来破局，但也受限于词库小、必须停顿和认生。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么“听懂”比“发声”难上千百倍？",
      "paragraphs": [
        "在上一节的语音合成（Speech generation）中，计算机只需要把存好的数字录音回放，或者用几个简单的数字滤波器模仿声道就能开口说话。然而，**自动语音识别（Automated Speech Recognition）**的难度却呈指数级飙升。",
        "这揭示了数字计算机与人类大脑之间最本质的能力鸿沟：**数字计算机极其擅长存储海量数据、以惊人的速度做数学运算，以及不知疲倦地重复枯燥任务**——所以教计算机每月给你算账并寄送电费单轻而易举；但**一旦面对杂乱无章的原始感官数据（Raw Sensory Data），计算机的表现就非常糟糕**。",
        "同样一句话，不同人说话的音高、语速、口音千差万别，环境里还有背景噪声、房间回声和连读现象。人类大脑天生具备极其强大的模式识别与上下文纠错能力，而数字处理器必须把连续变化的一维声波，硬生生拆解成可量化的数字参数去推理。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "DSP 语音识别的经典两步走：特征提取与特征匹配",
      "paragraphs": [
        "面对海量多变的语音波形，数字信号处理（DSP）通常采取**分而治之**的两步策略：**第一步是特征提取（Feature Extraction），第二步是特征匹配（Feature Matching）**。",
        "在**特征提取**阶段，系统首先要把输入音频流中的每一个单词**孤立分割（Isolate）**出来，然后像做物理体检一样分析这段波形的核心声学指纹：一是判断发声时的**激励类型（Type of Excitation）**——究竟是声带周期性振动产生的**浊音（Voiced）**，还是气流穿过牙齿嘴唇窄缝产生的**清音摩擦噪声（Fricative）**；二是测出声道腔体的**共振频率（Resonant Frequencies，即共振峰 Formants）**。",
        "为什么提取这两个参数就够了？因为同样的声道形状决定了共振峰 `F1, F2...` 的位置（区分元音如 `/a/`、`/i/`、`/u/`），而激励类型则区分了清浊辅音。把每秒上万个采样点的原始波形浓缩为寥寥几个关键特征参数，数据量被压缩了成百上千倍，后续对比才成为可能。"
      ],
      "formula": {
        "expr": "X_word = { Excitation_Type, F1, F2, ... }",
        "explain": "X_word 表示从单个孤立词中提取出的声学特征向量；Excitation_Type 区分声带周期脉冲激励（浊音）或湍流白噪声激励（清音）；F1、F2 为声道共振腔最主要的前两个共振峰频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：特征提取实验室 — 激励类型与声道共振峰",
      "instruction": "切换「浊音/清音」激励模式并拖动 F1、F2 共振峰滑块，观察右侧频谱包络如何提取声道特征，点击播放可实时听辨不同特征重构出的元音与摩擦音。",
      "controls": [
        {
          "type": "toggle",
          "id": "isVoiced",
          "label": "浊音脉冲激励 (关闭则为清音噪声)",
          "value": true
        },
        {
          "type": "slider",
          "id": "f1",
          "label": "第一共振峰 F1",
          "min": 250,
          "max": 900,
          "step": 10,
          "value": 520,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "第二共振峰 F2",
          "min": 950,
          "max": 2600,
          "step": 20,
          "value": 1500,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放特征重构音",
          "activeLabel": "⏸ 暂停发声"
        }
      ],
      "jsCode": "var audioNodes = null;\nvar phase = 0;\n\nfunction stopAudio() {\n  if (audioNodes) {\n    try {\n      if (audioNodes.src) audioNodes.src.stop();\n      audioNodes.master.disconnect();\n    } catch (e) {}\n    audioNodes = null;\n  }\n}\n\nfunction updateAudio() {\n  var shouldPlay = !!lab.values.play;\n  if (!shouldPlay) {\n    stopAudio();\n    return;\n  }\n  var ctx = lab.getAudioContext();\n  if (!ctx) return;\n  if (ctx.state === 'suspended') ctx.resume();\n  var isVoiced = !!lab.values.isVoiced;\n  if (!audioNodes || audioNodes.isVoiced !== isVoiced) {\n    stopAudio();\n    var master = ctx.createGain();\n    master.gain.value = 0.25;\n    master.connect(ctx.destination);\n    var f1Node = ctx.createBiquadFilter();\n    f1Node.type = 'bandpass';\n    f1Node.Q.value = 6.5;\n    var f2Node = ctx.createBiquadFilter();\n    f2Node.type = 'bandpass';\n    f2Node.Q.value = 8.5;\n    f1Node.connect(master);\n    f2Node.connect(master);\n    var src;\n    if (isVoiced) {\n      src = ctx.createOscillator();\n      src.type = 'sawtooth';\n      src.frequency.value = 125;\n      src.start();\n    } else {\n      var bufSize = ctx.sampleRate * 2;\n      var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);\n      var data = buf.getChannelData(0);\n      for (var i = 0; i < bufSize; i++) {\n        data[i] = Math.random() * 2 - 1;\n      }\n      src = ctx.createBufferSource();\n      src.buffer = buf;\n      src.loop = true;\n      src.start();\n    }\n    src.connect(f1Node);\n    src.connect(f2Node);\n    audioNodes = { src: src, f1Node: f1Node, f2Node: f2Node, master: master, isVoiced: isVoiced };\n  }\n  audioNodes.f1Node.frequency.setTargetAtTime(lab.values.f1, ctx.currentTime, 0.02);\n  audioNodes.f2Node.frequency.setTargetAtTime(lab.values.f2, ctx.currentTime, 0.02);\n}\n\nfunction env(f, f1, f2) {\n  var p1 = 0.9 / (1 + Math.pow((f - f1) / 95, 2));\n  var p2 = 0.7 / (1 + Math.pow((f - f2) / 130, 2));\n  return Math.min(1.0, p1 + p2);\n}\n\nfunction draw(tOffset) {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var isVoiced = !!lab.values.isVoiced;\n  var f1 = lab.values.f1;\n  var f2 = lab.values.f2;\n\n  ctx.fillStyle = '#0b1220';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx <= 340; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 32); ctx.lineTo(gx, 215); ctx.stroke();\n  }\n  for (var gx2 = 380; gx2 <= 700; gx2 += 40) {\n    ctx.beginPath(); ctx.moveTo(gx2, 32); ctx.lineTo(gx2, 215); ctx.stroke();\n  }\n  for (var gy = 40; gy <= 200; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(340, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(380, gy); ctx.lineTo(700, gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域原始波形 (Incoming Waveform)', 22, 22);\n  ctx.fillText('频谱特征提取 (Excitation + Resonance F1/F2)', 382, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(20, 124); ctx.lineTo(340, 124); ctx.stroke();\n\n  ctx.strokeStyle = isVoiced ? '#38bdf8' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var px = 0; px <= 320; px++) {\n    var t = (px / 320) * 0.032;\n    var val = 0;\n    if (isVoiced) {\n      var period = 0.008;\n      var tMod = (t + tOffset * 0.0005) % period;\n      val = 0.62 * Math.exp(-tMod * 160) * Math.sin(2 * Math.PI * f1 * tMod) +\n            0.42 * Math.exp(-tMod * 200) * Math.sin(2 * Math.PI * f2 * tMod);\n    } else {\n      var n1 = Math.sin(px * 1.7 + tOffset * 7.3) * Math.cos(px * 2.9 - tOffset * 4.1);\n      var n2 = Math.sin(2 * Math.PI * f1 * t * 0.3 + px * 0.9) * 0.45;\n      var n3 = Math.sin(2 * Math.PI * f2 * t * 0.3 + px * 1.3) * 0.4;\n      val = 0.55 * (n1 * 0.5 + n2 + n3);\n    }\n    var py = 124 - val * 72;\n    if (px === 0) ctx.moveTo(20 + px, py);\n    else ctx.lineTo(20 + px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = isVoiced ? '#38bdf8' : '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(isVoiced ? '周期脉冲激励 (~125Hz)' : '非周期湍流噪声激励', 24, 210);\n\n  var maxFreq = 3200;\n  var specBaseY = 205;\n  var specH = 155;\n\n  if (isVoiced) {\n    ctx.fillStyle = '#38bdf8';\n    for (var hf = 125; hf < maxFreq; hf += 125) {\n      var hx = 380 + (hf / maxFreq) * 320;\n      var hAmp = env(hf, f1, f2) * specH;\n      ctx.fillRect(hx - 1.5, specBaseY - hAmp, 3, hAmp);\n    }\n  } else {\n    ctx.strokeStyle = 'rgba(236,72,153,0.75)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (var sx = 0; sx <= 320; sx += 2) {\n      var freq = (sx / 320) * maxFreq;\n      var jitter = 0.65 + 0.35 * Math.abs(Math.sin(sx * 0.85 + tOffset * 5));\n      var sy = specBaseY - env(freq, f1, f2) * specH * jitter;\n      if (sx === 0) ctx.moveTo(380 + sx, sy); else ctx.lineTo(380 + sx, sy);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var ex = 0; ex <= 320; ex += 2) {\n    var ef = (ex / 320) * maxFreq;\n    var ey = specBaseY - env(ef, f1, f2) * specH;\n    if (ex === 0) ctx.moveTo(380 + ex, ey); else ctx.lineTo(380 + ex, ey);\n  }\n  ctx.stroke();\n\n  var f1x = 380 + (f1 / maxFreq) * 320;\n  var f1y = specBaseY - env(f1, f1, f2) * specH;\n  var f2x = 380 + (f2 / maxFreq) * 320;\n  var f2y = specBaseY - env(f2, f1, f2) * specH;\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(f1x, f1y, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(f2x, f2y, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('F1:' + f1 + 'Hz', f1x - 22, f1y - 10);\n  ctx.fillText('F2:' + f2 + 'Hz', f2x - 22, f2y - 10);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0 Hz', 380, 222);\n  ctx.fillText('1600 Hz', 520, 222);\n  ctx.fillText('3200 Hz', 665, 222);\n\n  lab.setReadout('特征向量 -> 激励类型: ' + (isVoiced ? '浊音周期脉冲 (Voiced)' : '清音湍流噪声 (Fricative)') + ' | F1 = ' + f1 + ' Hz | F2 = ' + f2 + ' Hz | 声音: ' + (lab.values.play ? '播放中' : '静音'));\n}\n\nlab.onUpdate(function () {\n  updateAudio();\n  draw(phase);\n});\n\nlab.onLoop(function (dt) {\n  if (lab.values.play) {\n    phase += dt * 10;\n    draw(phase);\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "特征匹配与经典语音识别的“三大枷锁”",
      "paragraphs": [
        "提取出新词的激励类型与共振峰参数后，系统就会进入**特征匹配（Feature Matching）**阶段：将这些参数与事先录入存储的“标准词库模板”逐一比对，计算参数之间的差距，找出**最接近的匹配项（Closest Match）**作为识别结果。",
        "听起来逻辑很美妙，但 Steven W. Smith 在书中诚实地指出：相比于人类听力，这套传统 DSP 语音识别方案的局限性令人自愧不如（Humbling），主要体现在**三大工程枷锁**上：",
        "1. **词汇量极其有限**：往往只能识别区区**几百个单词（a few hundred words）**，词库一大，特征空间就会拥挤重叠，误识率急剧上升。\n2. **必须字字停顿**：系统无法处理自然流利的连续语音，**只能接受词与词之间带有明显停顿（distinct pauses between words）的孤立词**，因为一旦连读，切分单词边界就会失败。\n3. **极度“认生”**：**必须针对每一位说话人单独重新训练（retrained for each individual speaker）**。男女老少的声道长度不同，共振峰位置天生整体偏移，未经训练换个人说话就会匹配到完全错误的词上。",
        "尽管在电话按键替代、工业指令控制等特定商业场景中已经够用，但要真正媲美人类听觉，这个领域仍有巨大的研究空间与商业回报。"
      ],
      "formula": {
        "expr": "k* = argmin_k  sqrt( (F1 - F1_k)^2 + (F2 - F2_k)^2 )",
        "explain": "k* 是最终识别出的词汇编号；(F1, F2) 是当前输入词提取的共振峰特征；(F1_k, F2_k) 是预先录入的第 k 个标准词汇模板；系统通过寻找几何距离最近的模板完成匹配。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：特征匹配与“三大局限”模拟台",
      "instruction": "选择输入词并尝试缩短「词间停顿时长」或增大「换人说话声道偏移」，亲眼见证词边界粘连与换人未重训是如何导致匹配崩溃的；开启「重新训练模板」即可体验针对特定说话人的校准效果。",
      "controls": [
        {
          "type": "slider",
          "id": "wordIdx",
          "label": "输入测试词 (1:开 2:关 3:上 4:下)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "pauseMs",
          "label": "词间停顿时长",
          "min": 10,
          "max": 260,
          "step": 10,
          "value": 140,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "speakerShift",
          "label": "换人说话声道偏移 (未重训)",
          "min": -28,
          "max": 28,
          "step": 2,
          "value": 0,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "retrained",
          "label": "针对当前说话人重新训练模板",
          "value": false
        }
      ],
      "jsCode": "var baseWords = [\n  { name: '开 (Open)', f1: 730, f2: 1180, color: '#10b981' },\n  { name: '关 (Close)', f1: 340, f2: 920, color: '#38bdf8' },\n  { name: '上 (Up)', f1: 310, f2: 2250, color: '#f59e0b' },\n  { name: '下 (Down)', f1: 540, f2: 1850, color: '#ec4899' }\n];\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var idx = Math.round(lab.values.wordIdx) - 1;\n  var pauseMs = lab.values.pauseMs;\n  var shiftPct = lab.values.speakerShift;\n  var retrained = !!lab.values.retrained;\n  var shiftScale = 1 + shiftPct / 100;\n\n  ctx.fillStyle = '#0b1220';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx <= 340; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 32); ctx.lineTo(gx, 210); ctx.stroke();\n  }\n  for (var gx2 = 380; gx2 <= 700; gx2 += 40) {\n    ctx.beginPath(); ctx.moveTo(gx2, 32); ctx.lineTo(gx2, 210); ctx.stroke();\n  }\n  for (var gy = 40; gy <= 200; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(340, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(380, gy); ctx.lineTo(700, gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('1. 孤立词边界切分 (Word Isolation)', 22, 22);\n  ctx.fillText('2. 二维特征空间匹配 (F1 vs F2 Matching)', 382, 22);\n\n  var totalMs = 700;\n  var w1Start = 50, w1End = 210;\n  var w2Start = w1End + pauseMs;\n  var w2End = w2Start + 170;\n  var pauseOk = pauseMs >= 80;\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 4]);\n  var threshY = 200 - 0.25 * 140;\n  ctx.beginPath(); ctx.moveTo(20, threshY); ctx.lineTo(340, threshY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('切分能量阈值', 24, threshY - 5);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var px = 0; px <= 320; px++) {\n    var tMs = (px / 320) * totalMs;\n    var e = 0.04;\n    if (tMs >= w1Start && tMs <= w1End) {\n      var u1 = (tMs - w1Start) / (w1End - w1Start);\n      e += 0.78 * Math.sin(Math.PI * u1);\n    }\n    if (tMs >= w2Start && tMs <= w2End) {\n      var u2 = (tMs - w2Start) / (w2End - w2Start);\n      e += 0.82 * Math.sin(Math.PI * u2);\n    }\n    if (!pauseOk && tMs > w1End && tMs < w2Start) {\n      e += 0.35;\n    }\n    var py = 200 - e * 140;\n    if (px === 0) ctx.moveTo(20 + px, py); else ctx.lineTo(20 + px, py);\n  }\n  ctx.stroke();\n\n  var x1a = 20 + (w1Start / totalMs) * 320;\n  var x1b = 20 + (w1End / totalMs) * 320;\n  var x2a = 20 + (w2Start / totalMs) * 320;\n  var x2b = 20 + (w2End / totalMs) * 320;\n\n  if (pauseOk) {\n    ctx.strokeStyle = '#10b981';\n    ctx.strokeRect(x1a, 46, x1b - x1a, 158);\n    ctx.strokeRect(x2a, 46, x2b - x2a, 158);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('前导词', x1a + 12, 60);\n    ctx.fillText('目标词:' + baseWords[idx].name.split(' ')[0], x2a + 6, 60);\n  } else {\n    ctx.strokeStyle = '#ef4444';\n    ctx.strokeRect(x1a, 46, x2b - x1a, 158);\n    ctx.fillStyle = '#ef4444';\n    ctx.fillText('停顿过短! 两词粘连无法孤立切分', x1a + 8, 60);\n  }\n\n  function mapX(f1) { return 380 + ((f1 - 150) / 850) * 320; }\n  function mapY(f2) { return 208 - ((f2 - 600) / 2100) * 170; }\n\n  var tplScale = retrained ? shiftScale : 1.0;\n  var templates = [];\n  for (var i = 0; i < baseWords.length; i++) {\n    templates.push({\n      name: baseWords[i].name,\n      f1: baseWords[i].f1 * tplScale,\n      f2: baseWords[i].f2 * tplScale,\n      color: baseWords[i].color\n    });\n  }\n\n  var targetWord = baseWords[idx];\n  var testF1 = targetWord.f1 * shiftScale;\n  var testF2 = targetWord.f2 * shiftScale;\n  if (!pauseOk) {\n    testF1 = (testF1 + baseWords[0].f1 * shiftScale) * 0.5;\n    testF2 = (testF2 + baseWords[0].f2 * shiftScale) * 0.5;\n  }\n\n  var bestIdx = 0;\n  var bestDist = 1e9;\n  for (var j = 0; j < templates.length; j++) {\n    var d = Math.sqrt(Math.pow((testF1 - templates[j].f1) / 850, 2) + Math.pow((testF2 - templates[j].f2) / 2100, 2));\n    if (d < bestDist) {\n      bestDist = d;\n      bestIdx = j;\n    }\n  }\n  var isCorrect = pauseOk && (bestIdx === idx);\n\n  var tx = mapX(testF1);\n  var ty = mapY(testF2);\n\n  for (var k = 0; k < templates.length; k++) {\n    var pxk = mapX(templates[k].f1);\n    var pyk = mapY(templates[k].f2);\n    ctx.strokeStyle = (k === bestIdx) ? (isCorrect ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.18)';\n    ctx.lineWidth = (k === bestIdx) ? 2.5 : 1;\n    ctx.setLineDash((k === bestIdx) ? [] : [3, 3]);\n    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(pxk, pyk); ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.fillStyle = templates[k].color;\n    ctx.globalAlpha = 0.2;\n    ctx.beginPath(); ctx.arc(pxk, pyk, 16, 0, Math.PI * 2); ctx.fill();\n    ctx.globalAlpha = 1.0;\n    ctx.beginPath(); ctx.arc(pxk, pyk, 5, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(templates[k].name.split(' ')[0], pxk + 8, pyk + 4);\n  }\n\n  ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444';\n  ctx.beginPath();\n  ctx.moveTo(tx, ty - 7);\n  ctx.lineTo(tx + 7, ty);\n  ctx.lineTo(tx, ty + 7);\n  ctx.lineTo(tx - 7, ty);\n  ctx.closePath();\n  ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('输入特征', tx - 22, ty - 11);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('F1 (Hz) ->', 645, 224);\n  ctx.fillText('F2', 382, 46);\n\n  var statusStr = isCorrect ? '匹配成功!' : (!pauseOk ? '失败: 词间无停顿导致特征混叠' : '误识别! 偏移过大匹配到了 [' + templates[bestIdx].name + ']');\n  lab.setReadout('输入词: ' + targetWord.name + ' | 系统判定: ' + templates[bestIdx].name + ' | 结果: ' + statusStr + (retrained ? ' (已针对当前说话人重训)' : ''));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "计算机擅长算术与存储，但极不擅长直接处理原始感官波形——做语音识别千万别直接拿原始时域采样点去逐点比对，必须先做“特征提取”（激励类型 + 共振峰）降维。",
        "传统模板匹配型 DSP 语音识别有三大硬伤：词库小（仅几百词）、必须停顿说孤立词、换人需重训；在产品选型时若无法满足这些约束，就必须引入统计模型或深度学习方案。",
        "声道长度变化会导致所有共振峰按比例平移（说话人差异），如果特征空间没有归一化或重新校准模板，跨说话人识别率会断崖式下跌。"
      ]
    }
  ]
});
