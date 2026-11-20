window.__BOOK_REGISTER_SECTION__("sec_199", {
  "title": "MPEG 视频压缩标准：帧内与帧间预测的艺术 (MPEG)",
  "intuition": "视频之所以能压缩几十倍，是因为相邻画面几乎一模一样——MPEG 只把少数关键帧完整画出来，其余画面只记录“哪里变了”和“物体往哪移了”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "不只是缩小体积：MPEG 的四大核心工程能力",
      "paragraphs": [
        "**MPEG**（Moving Pictures Experts Group，动态图像专家组）是针对数字视频序列（如电脑视频、数字电视网络）及其**伴随音轨**制定的联合压缩标准。原书作者打趣道：“如果你觉得 JPEG 已经很复杂了，那 MPEG 简直是一场噩梦——它是你直接买现成芯片来用的技术，而不是自己从头手写的。”在现代通信中，它是把上千路视频塞进单根入户光纤的核心基石。",
        "除了大幅降低数据率（Bitrate），MPEG 在设计之初就必须满足真实播放器与广播系统的四大严苛需求：**1. 双向变速播放**：电影必须能**正放或倒放**，且支持常速与倍速；**2. 随机访问 (Random Access)**：序列中的任意单帧都能被独立提取并作为静止画面显示；**3. 可剪辑性 (Editable)**：短片段只参考自身内部信息编码，无需依赖整部电影即可裁剪拼接；**4. 抗误码鲁棒性 (Robust to Errors)**：绝不能因为传输中出现 1 个比特的错误，就导致整部影片彻底崩溃。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "双管齐下：帧内压缩 (I 帧) 与帧间预测 (P 帧 / B 帧)",
      "paragraphs": [
        "MPEG 把视频压缩拆解为两个层次：**帧内压缩 (Within-the-frame)** 与 **帧间压缩 (Between-frame)**。帧内压缩就是把单个画面当作普通静止图像，直接套用略作微调的 **JPEG 标准**进行编码。在 MPEG 术语中，用这种方式独立编码的帧叫做**帧内编码帧 (Intra-coded)**，即 **I-picture（I 帧）**。I 帧就像书签与安全锚点，保证随时能随机跳转、倒放或从单比特错误中恢复。",
        "然而视频里绝大多数像素在连续几十帧内几乎纹丝不动——只要摄像机没动，背景就是完全恒定的。MPEG 利用精密的**差分编码 (Delta Encoding)** 消除帧间冗余：在压缩好一个 I 帧后，紧随其后的帧可以编码为**预测编码帧 (Predictive-coded)**，即 **P-picture（P 帧）**，只记录“相比 I 帧发生变化的像素”。更聪明的是，如果画面里的物体只是平移了，P 帧还可以参考一个**经过移位 (Shifted) 的 I 帧**，把运动补偿掉后再求残差。",
        "为了应对在多帧之间缓慢渐变的内容，MPEG 还引入了**双向预测编码帧 (Bidirectional predictive-coded)**，即 **B-picture（B 帧）**——它同时参考**前面和后面**的两个 I 帧（或 P 帧）。这就带来一个反直觉但至关重要的工程技巧：**码流中的帧可以乱序存储 (Out-of-order)**！解码器必须先拿到“未来的参考帧”，才能回过头去解码夹在中间的 B 帧；再加上彩色与音频同步，构成了 MPEG 高度精密的调度体系。"
      ],
      "formula": {
        "expr": "Residual[x, y] = Frame_P[x, y] - Frame_I[x - dx, y - dy]",
        "explain": "P 帧真正需要写入码流的是“移位补偿后的参考帧”与“当前帧”之间的像素残差 (Residual)；只要物体位移向量 (dx, dy) 估计准确，残差像素几乎全为 0，数据量瞬间骤降。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：I / P / B 帧间预测、移位运动补偿与乱序存储沙盒",
      "instruction": "拖动「物体移动速度」和「手动帧号」，切换「开启移位运动补偿」与「自动播放/倒放」，观察 P/B 帧残差数据量的暴跌以及播放顺序与码流存储顺序的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "frame",
          "label": "手动帧号",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " 帧"
        },
        {
          "type": "slider",
          "id": "motion",
          "label": "物体移动速度",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 7,
          "unit": " px/帧"
        },
        {
          "type": "toggle",
          "id": "shiftComp",
          "label": "开启移位运动补偿 (Shifted Ref)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "autoPlay",
          "label": "自动播放序列",
          "value": false
        },
        {
          "type": "toggle",
          "id": "reverse",
          "label": "倒放模式 (Reverse)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar animPos = 4;\nvar seq = [\n  { t: 'I', ref: [] },\n  { t: 'B', ref: [0, 4] },\n  { t: 'B', ref: [0, 4] },\n  { t: 'B', ref: [0, 4] },\n  { t: 'P', ref: [0] },\n  { t: 'B', ref: [4, 8] },\n  { t: 'B', ref: [4, 8] },\n  { t: 'B', ref: [4, 8] },\n  { t: 'I', ref: [] }\n];\nvar bitOrder = [0, 4, 1, 2, 3, 8, 5, 6, 7];\nvar tCol = { I: '#10b981', P: '#38bdf8', B: '#f59e0b' };\n\nfunction drawSceneBox(x, y, w, h, fIdx, motion, isRes, shiftComp) {\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(x, y, w, h);\n  ctx.clip();\n\n  if (!isRes) {\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(x, y, w, h);\n    ctx.fillStyle = '#1e293b';\n    ctx.beginPath();\n    ctx.moveTo(x, y + h);\n    ctx.lineTo(x + w * 0.25, y + h * 0.42);\n    ctx.lineTo(x + w * 0.55, y + h * 0.72);\n    ctx.lineTo(x + w * 0.8, y + h * 0.35);\n    ctx.lineTo(x + w, y + h * 0.65);\n    ctx.lineTo(x + w, y + h);\n    ctx.closePath();\n    ctx.fill();\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var gx = 0; gx < w; gx += 22) {\n      ctx.beginPath(); ctx.moveTo(x + gx, y); ctx.lineTo(x + gx, y + h); ctx.stroke();\n    }\n  } else {\n    ctx.fillStyle = '#050811';\n    ctx.fillRect(x, y, w, h);\n  }\n\n  var fType = seq[fIdx].t;\n  var objW = 34, objH = 22;\n  var baseX = x + 16;\n  var curX = baseX + fIdx * (motion * 0.85);\n  var curY = y + h * 0.56;\n\n  if (!isRes) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(curX, curY, objW, objH);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillRect(curX + 5, curY + 5, 11, 6);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillRect(curX + 20, curY + 5, 9, 6);\n\n    if (fType !== 'I' && shiftComp && motion > 0) {\n      var r0 = seq[fIdx].ref[0];\n      var rx = baseX + r0 * (motion * 0.85);\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 1.8;\n      ctx.beginPath();\n      ctx.moveTo(rx + objW * 0.5, curY - 10);\n      ctx.lineTo(curX + objW * 0.5, curY - 10);\n      ctx.stroke();\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath();\n      ctx.arc(curX + objW * 0.5, curY - 10, 3, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  } else {\n    if (fType === 'I') {\n      ctx.fillStyle = 'rgba(16,185,129,0.22)';\n      ctx.fillRect(x, y, w, h);\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath();\n      ctx.moveTo(x, y + h);\n      ctx.lineTo(x + w * 0.25, y + h * 0.42);\n      ctx.lineTo(x + w * 0.55, y + h * 0.72);\n      ctx.lineTo(x + w * 0.8, y + h * 0.35);\n      ctx.lineTo(x + w, y + h * 0.65);\n      ctx.lineTo(x + w, y + h);\n      ctx.closePath();\n      ctx.fill();\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillRect(curX, curY, objW, objH);\n    } else {\n      var rIdx = seq[fIdx].ref[0];\n      var prevX = baseX + rIdx * (motion * 0.85);\n      if (!shiftComp && motion > 0) {\n        ctx.fillStyle = 'rgba(236,72,153,0.45)';\n        ctx.fillRect(prevX, curY, objW, objH);\n        ctx.strokeStyle = '#ec4899';\n        ctx.lineWidth = 1.5;\n        ctx.strokeRect(prevX, curY, objW, objH);\n        ctx.fillStyle = 'rgba(56,189,248,0.8)';\n        ctx.fillRect(curX, curY, objW, objH);\n      } else if (motion > 0) {\n        ctx.strokeStyle = fType === 'P' ? 'rgba(56,189,248,0.85)' : 'rgba(245,158,11,0.8)';\n        ctx.lineWidth = 1.2;\n        ctx.strokeRect(curX, curY, objW, objH);\n      }\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.font = '10px sans-serif';\n      ctx.fillText(shiftComp ? '背景与平移均抵消 (仅微量边缘)' : '无补偿: 留下新旧双份残差', x + 7, y + 15);\n    }\n  }\n  ctx.restore();\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x, y, w, h);\n}\n\nfunction drawOrderPanel(x, y, w, h, fIdx) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(x, y, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(x, y, w, h);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('播放显示顺序 (Display Order):', x + 10, y + 16);\n  ctx.fillText('码流乱序存储 (Bitstream Order):', x + 10, y + 66);\n\n  var pw = 27, ph = 22, gap = 4, sx = x + 10;\n  for (var i = 0; i < 9; i++) {\n    var px = sx + i * (pw + gap);\n    var py1 = y + 24;\n    var t1 = seq[i].t;\n    ctx.fillStyle = i === fIdx ? tCol[t1] : 'rgba(255,255,255,0.06)';\n    ctx.fillRect(px, py1, pw, ph);\n    ctx.strokeStyle = tCol[t1];\n    ctx.lineWidth = i === fIdx ? 2 : 1;\n    ctx.strokeRect(px, py1, pw, ph);\n    ctx.fillStyle = i === fIdx ? '#050811' : '#f8fafc';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText(t1 + i, px + 6, py1 + 15);\n\n    var bIdx = bitOrder[i];\n    var py2 = y + 74;\n    var t2 = seq[bIdx].t;\n    ctx.fillStyle = bIdx === fIdx ? tCol[t2] : 'rgba(255,255,255,0.06)';\n    ctx.fillRect(px, py2, pw, ph);\n    ctx.strokeStyle = tCol[t2];\n    ctx.lineWidth = bIdx === fIdx ? 2 : 1;\n    ctx.strokeRect(px, py2, pw, ph);\n    ctx.fillStyle = bIdx === fIdx ? '#050811' : '#f8fafc';\n    ctx.fillText(t2 + bIdx, px + 6, py2 + 15);\n  }\n\n  var refs = seq[fIdx].ref;\n  for (var r = 0; r < refs.length; r++) {\n    var rx = sx + refs[r] * (pw + gap) + pw / 2;\n    var tx = sx + fIdx * (pw + gap) + pw / 2;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(rx, y + 48);\n    ctx.quadraticCurveTo((rx + tx) / 2, y + 60, tx, y + 48);\n    ctx.stroke();\n  }\n}\n\nfunction drawFrame(fIdx) {\n  var motion = lab.values.motion;\n  var shiftComp = lab.values.shiftComp;\n  var rev = lab.values.reverse;\n  var fType = seq[fIdx].t;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('还原画面 (帧 #' + fIdx + ')', 16, 16);\n  ctx.fillText('实际编码写入数据 (' + fType + '-picture)', 210, 16);\n  ctx.fillText('帧序列依赖与乱序存储机制', 408, 16);\n\n  drawSceneBox(16, 22, 182, 112, fIdx, motion, false, shiftComp);\n  drawSceneBox(210, 22, 182, 112, fIdx, motion, true, shiftComp);\n  drawOrderPanel(408, 22, 296, 112, fIdx);\n\n  var payloadPct = 18.0;\n  if (fType === 'P') {\n    payloadPct = shiftComp ? (1.2 + motion * 0.14) : (1.5 + motion * 1.1);\n  } else if (fType === 'B') {\n    payloadPct = shiftComp ? (0.7 + motion * 0.08) : (1.0 + motion * 0.75);\n  }\n\n  var bars = [\n    { label: '未压缩原始帧 (Raw)', val: 100, col: '#64748b' },\n    { label: '纯帧内 JPEG (I-picture)', val: 18.0, col: '#10b981' },\n    { label: '当前 ' + fType + ' 帧相对体积', val: payloadPct, col: tCol[fType] }\n  ];\n  var by = 152;\n  for (var i = 0; i < bars.length; i++) {\n    var b = bars[i];\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(b.label, 16, by + i * 26 + 13);\n    ctx.fillStyle = 'rgba(255,255,255,0.07)';\n    ctx.fillRect(190, by + i * 26 + 2, 430, 14);\n    ctx.fillStyle = b.col;\n    ctx.fillRect(190, by + i * 26 + 2, Math.max(4, 430 * (b.val / 100)), 14);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText(b.val.toFixed(1) + '%', 632, by + i * 26 + 13);\n  }\n\n  var dirStr = rev ? '倒放 (Reverse)' : '正放 (Forward)';\n  var refStr = seq[fIdx].ref.length === 0 ? '无 (独立帧内编码)' : '帧 #' + seq[fIdx].ref.join(' & #');\n  lab.setReadout('当前: ' + fType + '-picture (#' + fIdx + ') | 参考帧: ' + refStr + ' | 体积占比: ' + payloadPct.toFixed(1) + '% | 方向: ' + dirStr);\n}\n\nlab.onUpdate(function() {\n  animPos = lab.values.frame;\n  drawFrame(Math.round(animPos));\n});\n\nlab.onLoop(function(dt) {\n  if (lab.values.autoPlay) {\n    var step = dt * (lab.values.reverse ? -2.4 : 2.4);\n    animPos = (animPos + step + 9) % 9;\n    drawFrame(Math.floor(animPos));\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "固定码率下的“马赛克”危机与有线电视多路均摊",
      "paragraphs": [
        "MPEG 压缩效果惊人，但它的软肋也非常鲜明：**当画面中的大块区域发生剧烈且快速的变化时（例如突然切换镜头、爆炸或剧烈摇镜）**，帧间差分编码几乎失效——因为几乎所有像素都变了，必须瞬间爆发式地发送大量信息才能跟上节奏。",
        "如果传输信道的**数据率是固定不变的（Fixed Data Rate）**，码率突然触顶却又发不完，编码器只能被迫大幅降低量化精度，观众在切换场景的瞬间就会看到明显的**“块状”马赛克图案（\"blocky\" patterns）**。",
        "工程上如何化解这种突发失真？在**有线电视（Cable Television）**或光纤主干网等同时传输多路视频的网络中，系统把多个频道装进同一条共享信道里：**当某一个频道因动作大片切换场景而突发高码率需求时，它刚好可以借用其他频道相对静止画面所富余出的带宽**，通过多路平均把瞬时尖峰抹平。"
      ],
      "formula": {
        "expr": "R_avg(t) = (1 / N) * Σ R_k(t) <= C_link / N",
        "explain": "N 个视频频道共享总带宽 C_link 时，个别频道在镜头切换瞬间的码率尖峰 R_k(t)，会被其余相对静态频道的低码率需求均摊掉，从而大幅抑制固定码率下的块效应。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：固定码率块效应 (Blocky Distortion) 与多频道带宽均摊",
      "instruction": "拉高「镜头剧变/切换强度」或压低「单频道配额」，观察左图如何崩解为马赛克；再开启「多频道动态均摊」并增减频道数量，观察画质如何被瞬间挽救。",
      "controls": [
        {
          "type": "slider",
          "id": "sceneBurst",
          "label": "镜头剧变/切换强度",
          "min": 10,
          "max": 100,
          "step": 5,
          "value": 80,
          "unit": "% 剧变"
        },
        {
          "type": "slider",
          "id": "rateCap",
          "label": "单频道平均配额",
          "min": 20,
          "max": 100,
          "step": 5,
          "value": 45,
          "unit": " Mbps"
        },
        {
          "type": "toggle",
          "id": "multiplex",
          "label": "开启多频道均摊 (Cable TV Multiplex)",
          "value": false
        },
        {
          "type": "slider",
          "id": "channels",
          "label": "共享总频道数",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " 路"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar history = [];\nfor (var k = 0; k < 60; k++) history.push(30);\nvar tPhase = 0;\n\nfunction sampleColor(u, v) {\n  var r = 20, g = 35, b = 60;\n  var dx = u - 0.5, dy = v - 0.48;\n  var dist = Math.sqrt(dx * dx + dy * dy);\n  if (dist < 0.34) {\n    r = 40 + u * 160; g = 165 - dist * 180; b = 220;\n  }\n  if (Math.abs(u - 0.38) < 0.06 && Math.abs(v - 0.44) < 0.05) {\n    r = 248; g = 250; b = 252;\n    if (Math.hypot(u - 0.38, v - 0.44) < 0.025) { r = 15; g = 23; b = 42; }\n  }\n  if (Math.abs(u - 0.62) < 0.06 && Math.abs(v - 0.44) < 0.05) {\n    r = 248; g = 250; b = 252;\n    if (Math.hypot(u - 0.62, v - 0.44) < 0.025) { r = 15; g = 23; b = 42; }\n  }\n  if (Math.sin((u + v) * 28) > 0.75 && v > 0.72) {\n    r = 245; g = 158; b = 11;\n  }\n  return [r | 0, g | 0, b | 0];\n}\n\nfunction drawPreview(x, y, w, h, severity) {\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(x, y, w, h);\n  ctx.clip();\n\n  if (severity <= 0.02) {\n    ctx.fillStyle = '#14233c';\n    ctx.fillRect(x, y, w, h);\n    var grd = ctx.createRadialGradient(x + w * 0.5, y + h * 0.48, 8, x + w * 0.5, y + h * 0.48, w * 0.36);\n    grd.addColorStop(0, '#38bdf8');\n    grd.addColorStop(1, '#10b981');\n    ctx.fillStyle = grd;\n    ctx.beginPath();\n    ctx.arc(x + w * 0.5, y + h * 0.48, w * 0.34, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillRect(x + w * 0.32, y + h * 0.39, w * 0.12, h * 0.1);\n    ctx.fillRect(x + w * 0.56, y + h * 0.39, w * 0.12, h * 0.1);\n    ctx.fillStyle = '#0f172a';\n    ctx.beginPath();\n    ctx.arc(x + w * 0.38, y + h * 0.44, 5, 0, Math.PI * 2);\n    ctx.arc(x + w * 0.62, y + h * 0.44, 5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.fillStyle = '#f59e0b';\n    for (var s = 0; s < 5; s++) {\n      ctx.fillRect(x + 16 + s * 44, y + h * 0.76, 20, h * 0.18);\n    }\n  } else {\n    var bSize = Math.round(6 + severity * 20);\n    var qStep = Math.max(8, Math.round(severity * 64));\n    for (var py = 0; py < h; py += bSize) {\n      for (var px = 0; px < w; px += bSize) {\n        var c = sampleColor((px + bSize * 0.5) / w, (py + bSize * 0.5) / h);\n        var qr = Math.min(255, Math.round(c[0] / qStep) * qStep);\n        var qg = Math.min(255, Math.round(c[1] / qStep) * qStep);\n        var qb = Math.min(255, Math.round(c[2] / qStep) * qStep);\n        ctx.fillStyle = 'rgb(' + qr + ',' + qg + ',' + qb + ')';\n        ctx.fillRect(x + px, y + py, bSize, bSize);\n        ctx.strokeStyle = 'rgba(0,0,0,0.18)';\n        ctx.lineWidth = 0.5;\n        ctx.strokeRect(x + px, y + py, bSize, bSize);\n      }\n    }\n  }\n  ctx.restore();\n  ctx.strokeStyle = severity > 0.05 ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(x, y, w, h);\n}\n\nfunction render() {\n  var burst = lab.values.sceneBurst;\n  var cap = lab.values.rateCap;\n  var mux = lab.values.multiplex;\n  var nCh = lab.values.channels;\n\n  var demand1 = 8 + 0.76 * burst;\n  var staticSum = 0;\n  var staticRates = [];\n  for (var i = 1; i < nCh; i++) {\n    var sr = 18 + 5 * Math.sin(tPhase * 1.4 + i * 1.7);\n    staticRates.push(sr);\n    staticSum += sr;\n  }\n\n  var budget1 = mux ? Math.max(10, cap * nCh - staticSum) : cap;\n  var severity = demand1 > budget1 ? Math.min(1, (demand1 - budget1) / demand1) : 0;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('频道 #1 解码画面预览 (8x8 块效应监测)', 16, 16);\n  drawPreview(16, 22, 232, 196, severity);\n\n  var rx = 266, ry = 22, rw = 438, rh = 96;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('各频道瞬时码率分配 (共 ' + nCh + ' 路视频)', rx + 10, ry + 16);\n\n  var barW = 330;\n  var maxScale = Math.max(100, budget1 * 1.05);\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(rx + 88, ry + 26, barW, 16);\n  ctx.fillStyle = severity > 0.02 ? '#ec4899' : '#38bdf8';\n  ctx.fillRect(rx + 88, ry + 26, Math.min(barW, barW * (demand1 / maxScale)), 16);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('频道 #1 (剧变)', rx + 8, ry + 38);\n\n  var capX = rx + 88 + Math.min(barW, barW * (budget1 / maxScale));\n  ctx.strokeStyle = mux ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(capX, ry + 22); ctx.lineTo(capX, ry + 46); ctx.stroke();\n  ctx.fillStyle = mux ? '#10b981' : '#f59e0b';\n  ctx.font = '10px monospace';\n  ctx.fillText((mux ? '均摊上限 ' : '固定配额 ') + budget1.toFixed(0) + 'M', Math.min(rx + rw - 90, capX + 4), ry + 38);\n\n  var avgStatic = staticSum / Math.max(1, nCh - 1);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('频道 #2~' + nCh + ' (静态)', rx + 8, ry + 66);\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(rx + 88, ry + 54, barW, 14);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rx + 88, ry + 54, barW * (avgStatic / maxScale), 14);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('单路均值 ' + avgStatic.toFixed(1) + ' Mbps', rx + 88 + barW * (avgStatic / maxScale) + 6, ry + 65);\n\n  ctx.fillStyle = mux ? '#10b981' : '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(mux ? '主干总带宽池: ' + (cap * nCh) + ' Mbps -> 静态频道富余带宽已支援 #1' : '未启用复用: 频道 #1 独扛突发尖峰，超出配额即出块效应', rx + 10, ry + 86);\n\n  var gx = 266, gy = 130, gw = 438, gh = 88;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(gx, gy, gw, gh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  var capY = gy + gh - 10 - (budget1 / 120) * (gh - 22);\n  capY = Math.max(gy + 8, Math.min(gy + gh - 8, capY));\n  ctx.strokeStyle = mux ? 'rgba(16,185,129,0.8)' : 'rgba(245,158,11,0.8)';\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath(); ctx.moveTo(gx, capY); ctx.lineTo(gx + gw, capY); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var j = 0; j < history.length; j++) {\n    var hx = gx + (j / (history.length - 1)) * gw;\n    var hy = gy + gh - 10 - (history[j] / 120) * (gh - 22);\n    hy = Math.max(gy + 6, Math.min(gy + gh - 6, hy));\n    if (j === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('频道 #1 实时码率尖峰曲线 (虚线为可用带宽上限)', gx + 8, gy + 14);\n\n  var status = severity <= 0.02 ? '画面锐利 (无失真)' : (severity < 0.25 ? '轻度块效应' : '严重马赛克!');\n  lab.setReadout('频道#1需求: ' + demand1.toFixed(1) + ' Mbps | 可用带宽: ' + budget1.toFixed(1) + ' Mbps | 失真状态: ' + status);\n}\n\nlab.onUpdate(function() {\n  render();\n});\n\nlab.onLoop(function(dt) {\n  tPhase += dt;\n  var burst = lab.values.sceneBurst;\n  var baseD = 8 + 0.76 * burst;\n  var jitter = (Math.sin(tPhase * 5.2) > 0.65 ? 8 : -3 * Math.cos(tPhase * 2.1));\n  history.push(Math.max(8, baseD + jitter));\n  if (history.length > 60) history.shift();\n  render();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "I 帧间隔是“压缩率”与“交互体验”的权衡阀：I 帧越稀少，视频文件越小，但快进/倒放/随机拖拽定位就越卡顿，且单比特误码的影响持续更久。",
        "运动补偿（移位参考）是 P 帧能省流量的真正秘密：如果只做原地像素相减，物体一旦移动就会留下“新旧位置双份轮廓”的巨大残差。",
        "解码顺序 ≠ 播放顺序：因为 B 帧需要同时参考过去和未来的 I/P 帧，码流必须乱序传输，播放器端必须配备重排序帧缓存（Reorder Buffer）。",
        "固定码率遇到剧烈镜头切换必出马赛克：这是因为帧间差分失效导致瞬时比特需求暴涨，编码器在带宽封顶下只能粗暴量化 DCT 系数块。",
        "多路统计复用是广播网络的天然护盾：将多路视频合路传输，就能用静止频道的富余带宽吸收动作频道的突发尖峰，避免固定码率画质崩塌。"
      ]
    }
  ]
});
