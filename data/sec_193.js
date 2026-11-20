window.__BOOK_REGISTER_SECTION__("sec_193", {
  "title": "数据压缩策略：无损 vs 有损与分组机制 (Data Compression Strategies)",
  "intuition": "数据压缩的本质是在『百分百保真』与『允许人眼/人耳察觉不到的微小噪声以换取数倍体积缩减』之间做工程权衡，并通过输入/输出分组规则落地实现。",
  "blocks": [
    {
      "type": "concept",
      "heading": "第一把标尺：无损压缩 (Lossless) vs 有损压缩 (Lossy)",
      "paragraphs": [
        "在计算机里，绝大多数数字文件并不是以最紧凑的形式存储的——比如文字处理软件的 ASCII 文本、可直接执行的二进制代码、数据采集卡录下的原始采样点等。这种『怎么好用怎么存』的格式通常会多占 **约 2 倍** 的空间。压缩程序负责把易用格式转换成紧凑格式，解压程序则负责还原。",
        "根据《表 27-1a》，压缩算法最核心的划分方式是 **无损 (Lossless)** 与 **有损 (Lossy)**：",
        "1. **无损压缩 (`run-length`, `Huffman`, `delta`, `LZW`)**：解压后的文件必须与原文件 **逐比特完全一致 (identical)**。对于可执行程序、代码文本、财务统计报表，哪怕错掉 1 个 bit 都会导致程序崩溃或数据失真，因此必须使用无损压缩。",
        "2. **有损压缩 (`CS&Q`, `JPEG`, `MPEG`)**：允许解压后的数据与原数据存在轻微偏差。为什么能容忍失真？因为图像、音频和物理传感器采集到的信号 **本身就自带环境噪声**，只要压缩引入的误差表现得像一点点额外噪声，人眼和人耳就几乎察觉不到。有损压缩的压缩率远高于无损压缩——**压缩比越高，混入的噪声就越大**。",
        "书本给出了一个极有说服力的网页传图案例：假设通过 `33.6 kbps` 调制解调器下载一张彩色数码照片。未压缩的 `TIFF` 文件约 `600 kbytes`，耗时 **142 秒**；采用无损压缩的 `GIF` 体积减半为 `300 kbytes`，耗时 **71 秒**；采用有损压缩的 `JPEG` 体积骤降至 `50 kbytes`，仅需 **12 秒**！工程选型结论也很明确：**数码照片选 JPEG，而大面积纯色色块/线条（如公司 Logo）选无损 GIF**。"
      ],
      "formula": {
        "expr": "T_download = (Size_kbytes * 8) / Bitrate_kbps  |  CR = Size_orig / Size_comp",
        "explain": "Size_kbytes 为文件大小（1 byte = 8 bits），Bitrate_kbps 为链路带宽（kbps），T_download 为理论下载秒数；CR 为压缩比，数值越大代表文件缩水越狠。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：网页传图实战——TIFF、GIF 与 JPEG 的体积、噪声与耗时对比",
      "instruction": "拖动「压缩策略」滑块切换 TIFF/GIF/不同强度 JPEG，观察左侧图像扫描线的失真噪点，以及右侧实时下载进度与耗时差距（演示采用 10 倍速）。",
      "controls": [
        {
          "type": "slider",
          "id": "lossyLevel",
          "label": "压缩策略 (0=TIFF原图, 1=无损GIF, 2~10=有损JPEG)",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "kbps",
          "label": "链路带宽",
          "min": 14,
          "max": 200,
          "step": 2,
          "value": 34,
          "unit": " kbps"
        },
        {
          "type": "toggle",
          "id": "showError",
          "label": "高亮显示压缩引入的噪声误差",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar progress = 0;\nvar lastLevel = -1;\nvar lastKbps = -1;\n\nfunction getStrategy(lvl) {\n  if (lvl === 0) return { name: 'TIFF (未压缩)', size: 600, ratio: 1, noise: 0, color: '#f8fafc', lossy: false };\n  if (lvl === 1) return { name: 'GIF (无损压缩)', size: 300, ratio: 2, noise: 0, color: '#38bdf8', lossy: false };\n  var ratioMap = [1, 2, 4, 6, 9, 12, 16, 20, 25, 30, 36];\n  var r = ratioMap[lvl] || 12;\n  var sz = Math.round(600 / r);\n  var n = (lvl - 1) * 0.038;\n  return { name: 'JPEG (有损 ' + r + ':1)', size: sz, ratio: r, noise: n, color: '#10b981', lossy: true };\n}\n\nfunction origSignal(u) {\n  var photo = 0.5 + 0.32 * Math.sin(u * Math.PI * 3.0) + 0.14 * Math.cos(u * Math.PI * 7.0);\n  if (u > 0.68 && u < 0.86) photo = 0.88;\n  return Math.max(0.05, Math.min(0.95, photo));\n}\n\nfunction pseudoNoise(i, lvl) {\n  var s = Math.sin(i * 12.9898 + lvl * 78.233) * 43758.5453;\n  return (s - Math.floor(s)) * 2 - 1;\n}\n\nfunction drawFrame() {\n  var lvl = lab.values.lossyLevel;\n  var kbps = lab.values.kbps;\n  var showErr = lab.values.showError;\n  var st = getStrategy(lvl);\n  var tSec = (st.size * 8) / kbps;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx <= 340; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 100); ctx.lineTo(gx, 216); ctx.stroke();\n  }\n  for (var gy = 100; gy <= 216; gy += 29) {\n    ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(340, gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('图像扫描带与加载预览 (已下载 ' + Math.round(progress * 100) + '%)', 20, 20);\n\n  var imgX = 20, imgY = 28, imgW = 320, imgH = 56;\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(imgX, imgY, imgW, imgH);\n\n  var loadedH = Math.floor(imgH * progress);\n  var blockW = st.lossy ? Math.max(2, Math.floor(lvl * 1.4)) : 1;\n  for (var bx = 0; bx < imgW; bx += blockW) {\n    var u = (bx + blockW * 0.5) / imgW;\n    var v = origSignal(u);\n    var c = v + st.noise * pseudoNoise(bx, lvl);\n    c = Math.max(0, Math.min(1, c));\n    var rCol = Math.round(30 + c * 200);\n    var gCol = Math.round(70 + c * 150);\n    var bCol = Math.round(130 + (1 - c) * 110);\n    ctx.fillStyle = 'rgb(' + rCol + ',' + gCol + ',' + bCol + ')';\n    if (loadedH > 0) {\n      ctx.fillRect(imgX + bx, imgY, Math.min(blockW, imgW - bx), loadedH);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(imgX, imgY, imgW, imgH);\n  if (progress < 1) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillRect(imgX, imgY + loadedH, imgW, 2);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('单行像素亮度波形: 蓝=原图  绿=解压重建' + (showErr ? '  粉=噪声误差(x3)' : ''), 20, 96);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.65)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= 160; i++) {\n    var u1 = i / 160;\n    var x1 = 20 + u1 * 320;\n    var y1 = 212 - origSignal(u1) * 104;\n    if (i === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = st.color;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var j = 0; j <= 160; j++) {\n    var u2 = j / 160;\n    var qIdx = st.lossy ? Math.floor((u2 * 320) / blockW) * blockW : j * 2;\n    var uQ = Math.min(1, qIdx / 320);\n    var rec = origSignal(uQ) + st.noise * pseudoNoise(qIdx, lvl);\n    rec = Math.max(0, Math.min(1, rec));\n    var x2 = 20 + u2 * 320;\n    var y2 = 212 - rec * 104;\n    if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);\n  }\n  ctx.stroke();\n\n  if (showErr) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var k = 0; k <= 160; k++) {\n      var u3 = k / 160;\n      var qIdx3 = st.lossy ? Math.floor((u3 * 320) / blockW) * blockW : k * 2;\n      var uQ3 = Math.min(1, qIdx3 / 320);\n      var rec3 = origSignal(uQ3) + st.noise * pseudoNoise(qIdx3, lvl);\n      var err = rec3 - origSignal(u3);\n      var x3 = 20 + u3 * 320;\n      var y3 = 160 - err * 160;\n      if (k === 0) ctx.moveTo(x3, y3); else ctx.lineTo(x3, y3);\n    }\n    ctx.stroke();\n  }\n\n  var rx = 372;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('三种策略耗时对比 (' + kbps + ' kbps)', rx, 22);\n\n  var tTiff = (600 * 8) / kbps;\n  var tGif = (300 * 8) / kbps;\n  var tCur = tSec;\n  var maxT = Math.max(tTiff, 1);\n\n  var items = [\n    { label: 'TIFF (600 KB 原图)', t: tTiff, col: '#94a3b8', y: 48 },\n    { label: 'GIF (300 KB 无损)', t: tGif, col: '#38bdf8', y: 96 },\n    { label: '当前: ' + st.name + ' (' + st.size + ' KB)', t: tCur, col: st.color, y: 144 }\n  ];\n\n  for (var m = 0; m < items.length; m++) {\n    var it = items[m];\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '12px sans-serif';\n    ctx.fillText(it.label + '  ->  ' + it.t.toFixed(1) + ' 秒', rx, it.y);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx, it.y + 8, 320, 14);\n    var bw = Math.max(4, (it.t / maxT) * 320);\n    ctx.fillStyle = it.col;\n    ctx.fillRect(rx, it.y + 8, bw, 14);\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('当前实时下载进度 (10x 演示速度): ' + (progress * tSec).toFixed(1) + 's / ' + tSec.toFixed(1) + 's', rx, 198);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(rx, 206, 320, 10);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(rx, 206, 320 * progress, 10);\n\n  lab.setReadout('模式: ' + st.name + ' | 体积: ' + st.size + ' KB | 压缩比: ' + st.ratio + ':1 | ' + kbps + ' kbps 下载耗时: ' + tSec.toFixed(1) + ' s | 噪声幅度: ' + Math.round(st.noise * 100) + '%');\n}\n\nlab.onUpdate(function() {\n  if (lab.values.lossyLevel !== lastLevel || lab.values.kbps !== lastKbps) {\n    progress = 0;\n    lastLevel = lab.values.lossyLevel;\n    lastKbps = lab.values.kbps;\n  }\n  drawFrame();\n});\n\nlab.onLoop(function(dt) {\n  var st = getStrategy(lab.values.lossyLevel);\n  var tSec = (st.size * 8) / lab.values.kbps;\n  progress += (dt * 10) / Math.max(0.2, tSec);\n  if (progress > 1.15) progress = 0;\n  var saved = progress;\n  if (progress > 1) progress = 1;\n  drawFrame();\n  progress = saved;\n});"
    },
    {
      "type": "concept",
      "heading": "第二把标尺：分组大小 (Fixed vs Variable) 与 CS&Q 粗采样粗量化",
      "paragraphs": [
        "除了按保真度划分，绝大多数压缩程序的工作流程都是：**从原文件读取一组数据 -> 压缩处理 -> 将压缩后的数据块写入输出文件**。根据《表 27-1b》，我们可以按输入和输出分组大小是否固定，把算法分成 4 类：",
        "• **固定输入 -> 固定输出 (`CS&Q`)**：每次固定读入定长比特，固定吐出更少的定长比特。\n• **固定输入 -> 变长输出 (`Huffman`)**：输入定长符号（如 8-bit 字符），高频符号输出短码、低频符号输出长码。\n• **变长输入 -> 变长输出 (`Arithmetic`)**：算术编码把不定长符号流直接映射到变长比特区间。\n• **变长输入 -> 固定输出 (`run-length`, `LZW`)**：把一长串重复字符或字典短语打包成固定长度的编码。",
        "那么什么是 **CS&Q**？它是 **Coarser Sampling and/or Quantization（更粗糙的采样和/或量化）** 的缩写。书中用一段 12-bit 数字音频演示了它如何工作：每次从原文件读入 **2 个相邻采样点（共 24 bits）**，**直接丢弃其中 1 个采样点**（粗采样，采样率减半），再把剩下那个采样点的 **最低 4 位（4 LSBs）砍掉**（粗量化），只把高 8 位写入输出文件。24 bits 进、8 bits 出，瞬间实现了 **3:1 的有损压缩**！",
        "虽然单独使用 CS&Q 显得有些『粗暴』，但把它和后续章节会学到的 **变换压缩 (Transform Compression)** 结合起来，威力巨大——这正是 **JPEG** 的核心基石。至于为什么 `JPEG` 和 `MPEG` 没有出现在《表 27-1b》里？因为它们是集成了多种技术的 **复合算法 (composite algorithms)**，太过复杂，无法简单归入这四个单一类别。"
      ],
      "formula": {
        "expr": "CR_CSQ = (N_in * B_in) / (1 * B_out)  (例: 2 * 12 / 8 = 3 : 1)",
        "explain": "N_in 为每次读入并保留 1 个的采样间隔（粗采样倍数），B_in 为原始量化位深（如 12 bit），B_out 为截断低位后保留的位深（如 8 bit）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：CS&Q 音频有损压缩台——实时听感与波形对比",
      "instruction": "把「采样保留间隔」设为 2x、「保留量化位数」设为 8 bit 即可复现书中的 24 bit -> 8 bit (3:1) CS&Q 压缩；点击播放按钮对比原音与压缩后的失真听感。",
      "controls": [
        {
          "type": "slider",
          "id": "downsample",
          "label": "粗采样间隔 (每 N 个样本保留 1 个)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "粗量化保留位数 (原始为 12 bit)",
          "min": 2,
          "max": 12,
          "step": 1,
          "value": 8,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "输入信号基频",
          "min": 220,
          "max": 880,
          "step": 20,
          "value": 440,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "compareOrig",
          "label": "试听原始 12-bit 无压缩声音",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showError",
          "label": "叠加量化/采样误差波形 (粉色)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar fsAdc = 8000;\nvar scriptNode = null;\nvar audioPhase = 0;\nvar adcAcc = 0;\nvar adcIdx = 0;\nvar heldOrig = 0;\nvar heldCsq = 0;\n\nfunction synthWave(ph) {\n  return 0.65 * Math.sin(ph) + 0.25 * Math.sin(2 * ph) + 0.10 * Math.sin(3 * ph);\n}\n\nfunction quantize(x, b) {\n  var step = 2 / Math.pow(2, b);\n  var q = Math.round(x / step) * step;\n  return Math.max(-1, Math.min(1, q));\n}\n\nfunction syncAudio() {\n  var wantPlay = lab.values.play;\n  if (wantPlay && !scriptNode) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    scriptNode = ac.createScriptProcessor(2048, 0, 1);\n    scriptNode.onaudioprocess = function(e) {\n      var out = e.outputBuffer.getChannelData(0);\n      var sr = ac.sampleRate;\n      var f = lab.values.freq;\n      var ds = lab.values.downsample;\n      var bits = lab.values.bits;\n      var origMode = lab.values.compareOrig;\n      var phaseStep = (2 * Math.PI * f) / fsAdc;\n      var adcStep = fsAdc / sr;\n      for (var i = 0; i < out.length; i++) {\n        adcAcc += adcStep;\n        while (adcAcc >= 1) {\n          adcAcc -= 1;\n          audioPhase += phaseStep;\n          if (audioPhase > 2 * Math.PI) audioPhase -= 2 * Math.PI;\n          var raw = synthWave(audioPhase);\n          heldOrig = quantize(raw, 12);\n          if (adcIdx % ds === 0) {\n            heldCsq = quantize(raw, bits);\n          }\n          adcIdx++;\n        }\n        out[i] = (origMode ? heldOrig : heldCsq) * 0.16;\n      }\n    };\n    scriptNode.connect(ac.destination);\n  } else if (!wantPlay && scriptNode) {\n    scriptNode.disconnect();\n    scriptNode = null;\n  }\n}\n\nfunction draw() {\n  var ds = lab.values.downsample;\n  var bits = lab.values.bits;\n  var f = lab.values.freq;\n  var showErr = lab.values.showError;\n  var origMode = lab.values.compareOrig;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var padL = 44, padR = 20, padT = 28, padB = 26;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var midY = padT + plotH * 0.5;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = padL; gx <= W - padR; gx += 65) {\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, H - padB); ctx.stroke();\n  }\n  for (var gy = padT; gy <= H - padB; gy += plotH / 4) {\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(W - padR, midY); ctx.stroke();\n\n  var windowSec = 0.008;\n  var totalAdcSamples = Math.round(fsAdc * windowSec);\n  var errSqSum = 0;\n  var sigSqSum = 0;\n\n  ctx.strokeStyle = origMode ? '#38bdf8' : 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = origMode ? 2.5 : 1.5;\n  ctx.beginPath();\n  for (var p = 0; p <= plotW; p += 2) {\n    var t = (p / plotW) * windowSec;\n    var val = quantize(synthWave(2 * Math.PI * f * t), 12);\n    var y = midY - val * (plotH * 0.44);\n    if (p === 0) ctx.moveTo(padL + p, y); else ctx.lineTo(padL + p, y);\n  }\n  ctx.stroke();\n\n  var keptPts = [];\n  ctx.strokeStyle = origMode ? 'rgba(16,185,129,0.35)' : '#10b981';\n  ctx.lineWidth = origMode ? 1.5 : 2.5;\n  ctx.beginPath();\n  var curCsq = 0;\n  for (var s = 0; s <= totalAdcSamples; s++) {\n    var ts = s / fsAdc;\n    var rawS = synthWave(2 * Math.PI * f * ts);\n    var origS = quantize(rawS, 12);\n    if (s % ds === 0) {\n      curCsq = quantize(rawS, bits);\n      keptPts.push({ x: padL + (s / totalAdcSamples) * plotW, y: midY - curCsq * (plotH * 0.44) });\n    }\n    var diff = curCsq - origS;\n    errSqSum += diff * diff;\n    sigSqSum += origS * origS;\n\n    var x0 = padL + (s / totalAdcSamples) * plotW;\n    var x1 = padL + (Math.min(totalAdcSamples, s + 1) / totalAdcSamples) * plotW;\n    var yC = midY - curCsq * (plotH * 0.44);\n    if (s === 0) ctx.moveTo(x0, yC); else ctx.lineTo(x0, yC);\n    ctx.lineTo(x1, yC);\n  }\n  ctx.stroke();\n\n  if (showErr) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    var errHold = 0;\n    for (var s2 = 0; s2 <= totalAdcSamples; s2++) {\n      var ts2 = s2 / fsAdc;\n      var raw2 = synthWave(2 * Math.PI * f * ts2);\n      var orig2 = quantize(raw2, 12);\n      if (s2 % ds === 0) errHold = quantize(raw2, bits);\n      var eVal = errHold - orig2;\n      var xe = padL + (s2 / totalAdcSamples) * plotW;\n      var ye = midY - eVal * (plotH * 0.44);\n      if (s2 === 0) ctx.moveTo(xe, ye); else ctx.lineTo(xe, ye);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  for (var k = 0; k < keptPts.length; k++) {\n    ctx.beginPath();\n    ctx.arc(keptPts[k].x, keptPts[k].y, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('蓝=原12-bit波形  绿=CS&Q重建阶梯  橙点=保留采样点' + (showErr ? '  粉=失真误差' : ''), padL, 18);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0 ms', padL, H - 8);\n  ctx.fillText('8 ms 观测窗 (ADC = 8 kHz)', W - 185, H - 8);\n\n  var bitsIn = ds * 12;\n  var bitsOut = bits;\n  var ratio = bitsIn / bitsOut;\n  var snr = errSqSum > 1e-9 ? (10 * Math.log10(sigSqSum / errSqSum)).toFixed(1) + ' dB' : '无损 (∞)';\n  var listenText = lab.values.play ? (origMode ? '正在播放: 原12-bit' : '正在播放: CS&Q压缩') : '已静音';\n  lab.setReadout('分组变换: ' + bitsIn + ' bit 进 -> ' + bitsOut + ' bit 出 | 压缩比: ' + ratio.toFixed(2) + ':1 | 实测信噪比 SNR: ' + snr + ' | ' + listenText);\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【避坑第一条】文本、程序代码、配置表与精确数值绝不能用有损压缩；只要是带有物理测量噪声的多媒体信号（图像、音频），优先考虑有损压缩以换取数量级的体积缩减。",
        "【图片格式选型口诀】真实照片与连续色调渐变用有损 JPEG；公司 Logo、UI 图标、大块纯色边缘线条用无损 GIF（或 PNG），避免出现振铃噪点。",
        "【分组视角的价值】看到一个新压缩算法，先问两个问题：它是 Fixed 还是 Variable 分组？（如 CS&Q 是定长进定长出，Huffman 是定长进变长出，LZW/RLE 是变长进定长出）。",
        "【CS&Q 的定位】单纯砍采样率加砍低位比特（CS&Q）会迅速恶化听感与画质，但一旦放在频域变换（Transform Compression）之后再做粗量化，就能精准丢弃人眼/人耳不敏感的高频分量，成为 JPEG/MPEG 的核心引擎。"
      ]
    }
  ]
});
