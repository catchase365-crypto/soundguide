window.__BOOK_REGISTER_SECTION__("sec_020", {
  "title": "语音生成：数字录音与声道物理模拟 (Speech Generation)",
  "intuition": "让机器开口说话只有两条路：要么把真人声音数字化压缩存起来直接回放，要么用“声带脉冲/气湍噪声 + 声道共振滤波器”在芯片里从零模拟人类口腔的物理发声。",
  "blocks": [
    {
      "type": "concept",
      "heading": "解放双手双眼：语音交互与「数字录音」方案",
      "paragraphs": [
        "人类与机器交互通常依赖手和眼（打字、看屏幕），但在开车、做外科手术或操纵复杂设备时，你的手眼根本腾不开。此时，用**嘴和耳朵**进行语音生成与识别（Speech generation and recognition）就成了最自然高效的通道。",
        "计算机生成语音的第一条技术路线非常直接，叫做**数字录音（Digital recording）**，也是当今最常用的方法。它的工作流程是：先找一位真人播音员，将他的声音通过模数转换（ADC）**数字化**，然后用压缩算法瘦身后存入存储器；需要机器说话时，再把数据解压并通过数模转换（DAC）变回连续的模拟音频信号播放出来。",
        "得益于音频压缩技术，语音存储的代价其实惊人地低：长达**整整一小时**的录制语音，经过压缩后大约只需要 **3 MB** 的存储空间。即便是早期的微型计算机系统也能轻松装下大量语音词库。"
      ],
      "formula": {
        "expr": "Storage (MB) = (Bitrate_kbps × Time_sec) / (8 × 1024)",
        "explain": "Bitrate_kbps 为压缩后的语音比特率（千比特每秒）；Time_sec 为录音时长（秒，1小时=3600秒）。代入 1 小时约 3 MB 可反推出：压缩后的语音比特率仅约 6.8 kbps，远低于未压缩电话语音的 64 kbps。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：语音数字化、压缩比与「1小时 3MB」存储挑战",
      "instruction": "拖动采样率、量化位数与压缩倍率滑块，观察波形台阶失真与1小时存储体积的变化，点击播放即可实时试听压缩/量化后的声音质感。",
      "controls": [
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "采样率 (Sampling Rate)",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 8,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化位数 (Bit Depth)",
          "min": 2,
          "max": 12,
          "step": 1,
          "value": 8,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "compressRatio",
          "label": "语音压缩倍率",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 9,
          "unit": "x"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放数字语音试听",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var audioCtx = null;\nvar srcNode = null;\nvar gainNode = null;\nvar lastAudioKey = \"\";\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    try { srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    lastAudioKey = \"\";\n    return;\n  }\n  var sr = lab.values.sampleRate * 1000;\n  var bits = lab.values.bits;\n  var comp = lab.values.compressRatio;\n  var key = sr + \"_\" + bits + \"_\" + comp;\n  if (key === lastAudioKey && srcNode) return;\n  lastAudioKey = key;\n\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n  }\n  if (audioCtx.state === \"suspended\") {\n    audioCtx.resume();\n  }\n  if (!gainNode) {\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.25;\n    gainNode.connect(audioCtx.destination);\n  }\n\n  stopAudio();\n\n  var outSr = audioCtx.sampleRate;\n  var duration = 0.5;\n  var len = Math.floor(outSr * duration);\n  var buf = audioCtx.createBuffer(1, len, outSr);\n  var data = buf.getChannelData(0);\n\n  var holdSamples = Math.max(1, Math.round(outSr / sr));\n  var levels = Math.pow(2, bits - 1);\n  var f0 = 140;\n  var heldVal = 0;\n\n  for (var i = 0; i < len; i++) {\n    if (i % holdSamples === 0) {\n      var t = i / outSr;\n      var raw = 0.5 * Math.sin(2 * Math.PI * f0 * t)\n              + 0.3 * Math.sin(2 * Math.PI * 3 * f0 * t + 0.4)\n              + 0.2 * Math.sin(2 * Math.PI * 5 * f0 * t + 1.1);\n      var q = Math.round(raw * levels) / levels;\n      if (comp > 6) {\n        var noiseAmt = (comp - 6) * 0.008;\n        q += (Math.random() * 2 - 1) * noiseAmt;\n      }\n      heldVal = Math.max(-1, Math.min(1, q));\n    }\n    data[i] = heldVal;\n  }\n\n  srcNode = audioCtx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start();\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var srKHz = lab.values.sampleRate;\n  var bits = lab.values.bits;\n  var comp = lab.values.compressRatio;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 45) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 30) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var midY = H * 0.54;\n  var amp = H * 0.34;\n  var winSec = 0.015;\n  var f0 = 140;\n\n  function analogSignal(t) {\n    return 0.5 * Math.sin(2 * Math.PI * f0 * t)\n         + 0.3 * Math.sin(2 * Math.PI * 3 * f0 * t + 0.4)\n         + 0.2 * Math.sin(2 * Math.PI * 5 * f0 * t + 1.1);\n  }\n\n  var levels = Math.pow(2, bits - 1);\n  if (bits <= 5) {\n    ctx.strokeStyle = \"rgba(245, 158, 11, 0.16)\";\n    for (var lv = -levels; lv <= levels; lv++) {\n      var ly = midY - (lv / levels) * amp;\n      ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();\n    }\n  }\n\n  ctx.strokeStyle = \"rgba(56, 189, 248, 0.45)\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var x = 0; x <= W; x += 2) {\n    var t = (x / W) * winSec;\n    var y = midY - analogSignal(t) * amp;\n    if (x === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  var totalSamples = srKHz * 1000 * winSec;\n  var dt = 1 / (srKHz * 1000);\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  var prevY = midY;\n  var pts = [];\n  for (var s = 0; s <= totalSamples; s++) {\n    var st = s * dt;\n    var sx = (st / winSec) * W;\n    var val = analogSignal(st);\n    var qVal = Math.max(-1, Math.min(1, Math.round(val * levels) / levels));\n    var sy = midY - qVal * amp;\n    if (s === 0) {\n      ctx.moveTo(sx, sy);\n    } else {\n      ctx.lineTo(sx, prevY);\n      ctx.lineTo(sx, sy);\n    }\n    prevY = sy;\n    pts.push({ x: sx, y: sy });\n  }\n  ctx.lineTo(W, prevY);\n  ctx.stroke();\n\n  ctx.fillStyle = \"#f59e0b\";\n  for (var p = 0; p < pts.length; p++) {\n    if (pts[p].x <= W) {\n      ctx.beginPath();\n      ctx.arc(pts[p].x, pts[p].y, 2.8, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  var rawKbps = srKHz * bits;\n  var compKbps = rawKbps / comp;\n  var mbPerHour = (compKbps * 3600) / (8 * 1024);\n\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"— 原始连续模拟波形\", 14, 20);\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"— 采样+量化台阶波形\", 155, 20);\n\n  var barX = 430;\n  var barY = 10;\n  var barW = 270;\n  var barH = 14;\n  ctx.fillStyle = \"rgba(255,255,255,0.1)\";\n  ctx.fillRect(barX, barY, barW, barH);\n  var fillRatio = Math.min(1, mbPerHour / 30);\n  ctx.fillStyle = mbPerHour <= 3.5 ? \"#10b981\" : \"#ec4899\";\n  ctx.fillRect(barX, barY, barW * fillRatio, barH);\n  var markX = barX + barW * (3 / 30);\n  ctx.strokeStyle = \"#f8fafc\";\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(markX, barY - 3); ctx.lineTo(markX, barY + barH + 3); ctx.stroke();\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.fillText(\"1小时体积: \" + mbPerHour.toFixed(2) + \" MB (白线=3MB基准)\", barX, barY + 29);\n\n  lab.setReadout(\n    \"未压缩码率: \" + rawKbps.toFixed(0) + \" kbps | \" +\n    \"压缩后码率: \" + compKbps.toFixed(1) + \" kbps (\" + comp + \"x) | \" +\n    \"1小时存储: \" + mbPerHour.toFixed(2) + \" MB\"\n  );\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "从零捏出人声：声道模拟与「激励-共振」物理模型",
      "paragraphs": [
        "第二条路线叫做**声道模拟（Vocal tract simulation）**，它不靠提前录音，而是直接模仿人类发声器官的物理机制，把人的口腔和咽喉看作一个具有特定几何形状的**声学共鸣腔（Acoustic cavity）**。腔体的大小与形状（比如张大嘴发“啊”、撅起嘴发“呜”）决定了这个腔体对哪些频率会产生剧烈共鸣（即**共振峰**）。",
        "声道内的原始声音激励（Excitation）只来源于两种截然不同的物理方式：**浊音（Voiced sounds）**与**清音/摩擦音（Fricative sounds）**。发浊音时（如元音 a, e, i），声带周期性地开合振动，向声道腔体内喷射出近乎周期性的脉冲气流；而发清音时（如 s, f, sh），声带不振动，气流强行挤过牙齿、嘴唇等狭窄缝隙，产生类似白噪声的**湍流噪声**。",
        "声道模拟器在芯片里的实现极其优雅：先用数字信号发生器生成这两种激励信号之一（周期脉冲串或随机噪声），再将激励信号送入一个**数字共振滤波器**——用滤波器的频率响应来模拟人类声道腔体的共鸣特性。著名的早期 DSP 里程碑产品、风靡一时的儿童电子学习机 **Speak & Spell**，正是靠这套方法在极有限的芯片算力下开口说话的。"
      ],
      "formula": {
        "expr": "Y(f) = E(f) · H_vocal(f)",
        "explain": "E(f) 是激励源频谱（浊音对应基频及其丰富谐波脉冲，清音对应宽带气湍噪声）；H_vocal(f) 是模拟声道腔体形状的数字共振滤波器频响，它挑出并放大特定共振峰频率，最终合成出像人一样的语音输出 Y(f)。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：声道模拟器实验室（浊音脉冲 vs 清音噪声 + 腔体共振峰）",
      "instruction": "切换「浊音/清音」激励模式，拖动基频、共振峰频率与共振尖锐度（Q值），观察左侧激励源如何被右侧声道滤波器塑形，并点击播放聆听 Speak & Spell 风格的合成音。",
      "controls": [
        {
          "type": "toggle",
          "id": "fricative",
          "label": "激励切换：开启=清音气湍噪声 / 关闭=浊音周期脉冲",
          "value": false
        },
        {
          "type": "slider",
          "id": "pitch",
          "label": "声带基频 (仅浊音有效)",
          "min": 80,
          "max": 240,
          "step": 5,
          "value": 120,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "formant",
          "label": "声道共振峰频率 (腔体大小)",
          "min": 350,
          "max": 2400,
          "step": 50,
          "value": 750,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "qFactor",
          "label": "腔体共振尖锐度 (Q值)",
          "min": 2,
          "max": 18,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成语音",
          "activeLabel": "⏸ 暂停合成"
        }
      ],
      "jsCode": "var ac = null;\nvar osc = null;\nvar oscGain = null;\nvar noiseSrc = null;\nvar noiseGain = null;\nvar filter = null;\nvar masterGain = null;\nvar audioReady = false;\n\nfunction initAudio() {\n  if (audioReady) return;\n  ac = lab.getAudioContext();\n  filter = ac.createBiquadFilter();\n  filter.type = \"bandpass\";\n\n  masterGain = ac.createGain();\n  masterGain.gain.value = 0;\n\n  osc = ac.createOscillator();\n  osc.type = \"sawtooth\";\n  oscGain = ac.createGain();\n  oscGain.gain.value = 0;\n  osc.connect(oscGain);\n  oscGain.connect(filter);\n  osc.start();\n\n  var bufLen = ac.sampleRate * 2;\n  var nBuf = ac.createBuffer(1, bufLen, ac.sampleRate);\n  var ch = nBuf.getChannelData(0);\n  for (var i = 0; i < bufLen; i++) {\n    ch[i] = Math.random() * 2 - 1;\n  }\n  noiseSrc = ac.createBufferSource();\n  noiseSrc.buffer = nBuf;\n  noiseSrc.loop = true;\n  noiseGain = ac.createGain();\n  noiseGain.gain.value = 0;\n  noiseSrc.connect(noiseGain);\n  noiseGain.connect(filter);\n  noiseSrc.start();\n\n  filter.connect(masterGain);\n  masterGain.connect(ac.destination);\n  audioReady = true;\n}\n\nfunction syncAudio() {\n  if (!lab.values.play) {\n    if (audioReady && masterGain) {\n      masterGain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    }\n    return;\n  }\n  initAudio();\n  if (ac.state === \"suspended\") {\n    ac.resume();\n  }\n  var now = ac.currentTime;\n  osc.frequency.setTargetAtTime(lab.values.pitch, now, 0.02);\n  filter.frequency.setTargetAtTime(lab.values.formant, now, 0.02);\n  filter.Q.setTargetAtTime(lab.values.qFactor, now, 0.02);\n\n  if (lab.values.fricative) {\n    oscGain.gain.setTargetAtTime(0, now, 0.02);\n    noiseGain.gain.setTargetAtTime(0.9, now, 0.02);\n  } else {\n    oscGain.gain.setTargetAtTime(0.65, now, 0.02);\n    noiseGain.gain.setTargetAtTime(0, now, 0.02);\n  }\n  masterGain.gain.setTargetAtTime(0.45, now, 0.02);\n}\n\nfunction drawFrame(timeSec) {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var isFric = lab.values.fricative;\n  var pitch = lab.values.pitch;\n  var formant = lab.values.formant;\n  var qVal = lab.values.qFactor;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 45) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 30) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var midX = W / 2;\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.beginPath(); ctx.moveTo(midX, 10); ctx.lineTo(midX, H - 10); ctx.stroke();\n\n  var midY = H * 0.56;\n  var amp = H * 0.30;\n  var winSec = 0.025;\n\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.fillText(isFric ? \"激励源：清音气湍噪声 (Fricative)\" : \"激励源：声带周期脉冲 (Voiced)\", 14, 22);\n\n  ctx.strokeStyle = \"#f59e0b\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var leftW = midX - 24;\n  var period = 1 / pitch;\n  for (var x = 0; x <= leftW; x += 2) {\n    var t = (x / leftW) * winSec + timeSec * 0.06;\n    var val = 0;\n    if (isFric) {\n      var seed = Math.sin((x + Math.floor(timeSec * 24) * 17) * 12.9898) * 43758.5453;\n      val = (seed - Math.floor(seed)) * 2 - 1;\n      val *= 0.75;\n    } else {\n      var phase = (t % period) / period;\n      if (phase < 0.08) {\n        val = Math.sin((phase / 0.08) * Math.PI);\n      } else {\n        val = -0.15 * Math.exp(-(phase - 0.08) * 6);\n      }\n    }\n    var px = 12 + x;\n    var py = midY - val * amp;\n    if (x === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var rightX = midX + 12;\n  var rightW = midX - 24;\n\n  ctx.strokeStyle = \"rgba(56, 189, 248, 0.55)\";\n  ctx.fillStyle = \"rgba(56, 189, 248, 0.12)\";\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(rightX, H - 18);\n  var fMin = 100;\n  var fMax = 3200;\n  for (var rx = 0; rx <= rightW; rx += 3) {\n    var f = fMin + (rx / rightW) * (fMax - fMin);\n    var ratio = f / formant;\n    var denom = Math.sqrt(Math.pow(1 - ratio * ratio, 2) + Math.pow(ratio / qVal, 2));\n    var mag = Math.min(1, (ratio / qVal) / Math.max(0.001, denom));\n    var ry = (H - 18) - mag * (H * 0.65);\n    ctx.lineTo(rightX + rx, ry);\n  }\n  ctx.lineTo(rightX + rightW, H - 18);\n  ctx.closePath();\n  ctx.fill();\n  ctx.stroke();\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var decayRate = (Math.PI * formant) / qVal;\n  for (var ox = 0; ox <= rightW; ox += 2) {\n    var ot = (ox / rightW) * winSec + timeSec * 0.06;\n    var oval = 0;\n    if (isFric) {\n      var f1 = formant * (1 - 0.5 / qVal);\n      var f2 = formant * (1 + 0.5 / qVal);\n      var s1 = Math.sin(2 * Math.PI * formant * ot + Math.sin(2 * Math.PI * 73 * ot + timeSec * 4) * 2.5);\n      var s2 = 0.5 * Math.sin(2 * Math.PI * f1 * ot + 1.3) + 0.5 * Math.sin(2 * Math.PI * f2 * ot + 2.7);\n      oval = (s1 * 0.6 + s2 * 0.4) * 0.75;\n    } else {\n      var oPhaseTime = ot % period;\n      oval = Math.exp(-decayRate * oPhaseTime) * Math.sin(2 * Math.PI * formant * oPhaseTime);\n    }\n    var px2 = rightX + ox;\n    var py2 = midY - oval * amp;\n    if (ox === 0) ctx.moveTo(px2, py2);\n    else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"声道输出波形\", rightX + 2, 22);\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"共振峰响应 |H(f)|\", rightX + 105, 22);\n\n  var vowelHint = formant < 600 ? \"偏 /u/ (呜)\" : (formant < 1100 ? \"偏 /a/ (啊)\" : (formant < 1700 ? \"偏 /e/ (鹅)\" : \"偏 /i/ (衣)\"));\n  lab.setReadout(\n    \"激励: \" + (isFric ? \"清音噪声\" : \"浊音 \" + pitch + \" Hz\") +\n    \" | 声道共振峰: \" + formant + \" Hz (\" + vowelHint + \")\" +\n    \" | 滤波器 Q 值: \" + qVal\n  );\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawFrame(0);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  drawFrame(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "选型直觉：如果只需要播报固定语句（如电梯报楼、导航提示），「数字录音 + 压缩」音质最自然且 1 小时仅约 3 MB；如果要动态拼出任意词汇且受限于早期极低存储容量，才用「声道模拟」。",
        "声道模型的本质是「源-滤波器分离（Source-Filter Model）」：音调高低和清浊音由激励源（脉冲 vs 噪声）决定，而具体发哪个元音/辅音由声道滤波器的共振峰位置决定。",
        "语音并不需要音乐级别的 44.1 kHz / 16-bit 高保真：人声主要能量集中在 300–3400 Hz 窄带内，8 kHz 采样加参数压缩就能保留极高的可懂度。"
      ]
    }
  ]
});
