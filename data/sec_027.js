window.__BOOK_REGISTER_SECTION__("sec_027", {
  "title": "商业成像产品与图像压缩 (Commercial Imaging Products)",
  "intuition": "图像和视频数据量极其庞大，而大众消费电子产品必须廉价；DSP 通过压缩算法榨干像素与帧间的重复“废话”，让小内存、低带宽的设备也能流畅显示画面。",
  "blocks": [
    {
      "type": "concept",
      "heading": "商业产品的核心矛盾：海量像素 vs 廉价硬件",
      "paragraphs": [
        "在面向大众市场批量销售的商业成像产品中，工程师面临一个非常棘手的硬件矛盾：**图像包含的信息量实在太大了，但商业系统必须足够便宜**。廉价意味着设备不可能配备超大容量的高速内存，也不可能拥有极高的数据传输带宽。",
        "解决这一困境的核心答案就是 **图像压缩 (Image Compression)**。正如我们在语音信号处理中看到的现象一样，一幅自然图像中其实充斥着大量高度相似的 **冗余信息 (Redundant Information)**——比如蓝天相邻的几百个像素几乎是同一个颜色，把它们一个不漏地用完整比特存下来纯属浪费。",
        "借助数字信号处理算法，我们可以把图像送入压缩编码器，剔除这些可预测的冗余，大幅减少代表整幅画面所需的 **比特数 (Bits)**，从而在成本受限的硬件上实现存储与传输。"
      ],
      "formula": {
        "expr": "DataRate = W × H × B × FPS",
        "explain": "W 和 H 分别是图像的宽和高（像素数），B 是每个像素占用的比特数（例如真彩色为 24 bit），FPS 是每秒传输的帧数。若不经压缩，一段普通标清视频的原始数据率就足以瞬间堵死早期廉价设备的总线与存储。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：空间冗余合并与比特量化压缩实验室",
      "instruction": "拖动「空间分块大小」与「每通道量化位数」滑块，实时观察压缩比飙升与马赛克、色带失真之间的权衡；开启误差放大可看清被丢弃的细节。",
      "controls": [
        {
          "type": "slider",
          "id": "blockSize",
          "label": "空间分块合并",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 4,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "每通道量化位数",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "showDiff",
          "label": "显示压缩误差 (×4放大)",
          "value": false
        }
      ],
      "jsCode": "var W = 72, H = 48, S = 3;\nvar origR = new Float32Array(W * H);\nvar origG = new Float32Array(W * H);\nvar origB = new Float32Array(W * H);\nfor (var y = 0; y < H; y++) {\n  for (var x = 0; x < W; x++) {\n    var idx = y * W + x;\n    var r = 20 + (y / H) * 80;\n    var g = 55 + (1 - y / H) * 110;\n    var b = 120 + (1 - y / H) * 125;\n    var dx = x - 52, dy = y - 14;\n    var dist = Math.sqrt(dx * dx + dy * dy);\n    if (dist < 8) {\n      var glow = 1 - dist / 8;\n      r = 245; g = 180 + glow * 65; b = 60 + glow * 80;\n    }\n    var hill = 30 + Math.sin(x * 0.11) * 7 + Math.cos(x * 0.23) * 3;\n    if (y > hill) {\n      r = 16 + (y - hill) * 1.8;\n      g = 150 - (y - hill) * 2.5;\n      b = 110 - (y - hill) * 1.5;\n    }\n    if (y > 39) {\n      var wave = Math.sin(x * 0.35 + y * 0.9) * 15;\n      r = 35 + wave; g = 115 + wave; b = 185 + wave;\n    }\n    origR[idx] = Math.max(0, Math.min(255, r));\n    origG[idx] = Math.max(0, Math.min(255, g));\n    origB[idx] = Math.max(0, Math.min(255, b));\n  }\n}\nfunction render() {\n  var ctx = lab.ctx;\n  var bs = lab.values.blockSize;\n  var bits = lab.values.bits;\n  var showDiff = lab.values.showDiff;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, lab.width, lab.height);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx < lab.width; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, lab.height); ctx.stroke();\n  }\n  for (var gy = 0; gy < lab.height; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(lab.width, gy); ctx.stroke();\n  }\n  var x0 = 36, y0 = 48, x1 = 468, y1 = 48;\n  for (var y = 0; y < H; y++) {\n    for (var x = 0; x < W; x++) {\n      var i = y * W + x;\n      ctx.fillStyle = 'rgb(' + (origR[i]|0) + ',' + (origG[i]|0) + ',' + (origB[i]|0) + ')';\n      ctx.fillRect(x0 + x * S, y0 + y * S, S, S);\n    }\n  }\n  var levels = Math.pow(2, bits);\n  var step = levels > 1 ? 255 / (levels - 1) : 255;\n  var sqErr = 0;\n  for (var by = 0; by < H; by += bs) {\n    for (var bx = 0; bx < W; bx += bs) {\n      var sumR = 0, sumG = 0, sumB = 0, cnt = 0;\n      for (var dy = 0; dy < bs && by + dy < H; dy++) {\n        for (var dx = 0; dx < bs && bx + dx < W; dx++) {\n          var id = (by + dy) * W + (bx + dx);\n          sumR += origR[id]; sumG += origG[id]; sumB += origB[id]; cnt++;\n        }\n      }\n      var avgR = sumR / cnt, avgG = sumG / cnt, avgB = sumB / cnt;\n      var qR = bits === 8 ? Math.round(avgR) : Math.round(Math.round(avgR / step) * step);\n      var qG = bits === 8 ? Math.round(avgG) : Math.round(Math.round(avgG / step) * step);\n      var qB = bits === 8 ? Math.round(avgB) : Math.round(Math.round(avgB / step) * step);\n      for (var dy2 = 0; dy2 < bs && by + dy2 < H; dy2++) {\n        for (var dx2 = 0; dx2 < bs && bx + dx2 < W; dx2++) {\n          var p = (by + dy2) * W + (bx + dx2);\n          var er = origR[p] - qR, eg = origG[p] - qG, eb = origB[p] - qB;\n          sqErr += er * er + eg * eg + eb * eb;\n          if (showDiff) {\n            var dr = Math.min(255, Math.abs(er) * 4) | 0;\n            var dg = Math.min(255, Math.abs(eg) * 4) | 0;\n            var db = Math.min(255, Math.abs(eb) * 4) | 0;\n            ctx.fillStyle = 'rgb(' + dr + ',' + dg + ',' + db + ')';\n          } else {\n            ctx.fillStyle = 'rgb(' + qR + ',' + qG + ',' + qB + ')';\n          }\n          ctx.fillRect(x1 + (bx + dx2) * S, y1 + (by + dy2) * S, S, S);\n        }\n      }\n    }\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.strokeRect(x0 - 1, y0 - 1, W * S + 2, H * S + 2);\n  ctx.strokeStyle = showDiff ? '#f59e0b' : '#10b981';\n  ctx.strokeRect(x1 - 1, y1 - 1, W * S + 2, H * S + 2);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('原始图像 (24 bit/px, 1×1)', x0 + (W * S) / 2, 32);\n  ctx.fillStyle = showDiff ? '#f59e0b' : '#10b981';\n  ctx.fillText(showDiff ? '压缩残差放大 ×4 (丢失的细节)' : '压缩重建图像 (' + (bits * 3) + ' bit/块, ' + bs + '×' + bs + ')', x1 + (W * S) / 2, 32);\n  var origBits = W * H * 24;\n  var blocksX = Math.ceil(W / bs), blocksY = Math.ceil(H / bs);\n  var compBits = blocksX * blocksY * (bits * 3);\n  var ratio = origBits / compBits;\n  var rmse = Math.sqrt(sqErr / (W * H * 3));\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(280, 114, 152, 4);\n  ctx.beginPath();\n  ctx.moveTo(444, 116); ctx.lineTo(430, 108); ctx.lineTo(430, 124); ctx.closePath(); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 15px sans-serif';\n  ctx.fillText('压缩比 ' + ratio.toFixed(1) + ' : 1', 360, 96);\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '12px sans-serif';\n  ctx.fillText((origBits / 1024).toFixed(1) + ' Kb → ' + (compBits / 1024).toFixed(2) + ' Kb', 360, 142);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('均方根误差 RMSE: ' + rmse.toFixed(1), 360, 164);\n  lab.setReadout('分块: ' + bs + '×' + bs + ' | 每通道: ' + bits + ' bit | 压缩比: ' + ratio.toFixed(1) + ':1 | RMSE: ' + rmse.toFixed(1));\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "帧间冗余：为什么视频比静态图片更适合压缩？",
      "paragraphs": [
        "虽然单张静态图像已经包含大量空间冗余，但 **电视与动态画面 (Moving Pictures)** 才是图像压缩大展身手的终极舞台。原因非常直观：**在连续播放的视频中，相邻两帧之间绝大部分画面是完全不变的**。",
        "想象一个视频电话或新闻播报场景：墙面、书架、桌子在几十秒内几乎纹丝不动，真正发生变化的只有人物嘴唇和手臂的局部轮廓。如果每一帧都傻傻地从头传输整幅画面，90% 以上的带宽都浪费在了重复描绘静止背景上。",
        "因此，现代商业成像产品利用这种 **帧间冗余 (Frame-to-Frame Redundancy)**，只计算并传输前后两帧的 **差值**。从原书列举的典型应用来看，无论是 **可视电话 (Video Telephones)**、**在电脑上播放动态影像的软件**，还是 **数字电视 (Digital Television)**，无一例外都依赖这一技术才得以走进千家万户。"
      ],
      "formula": {
        "expr": "ΔI[n] = I[n] - I[n-1]",
        "explain": "I[n] 代表当前第 n 帧画面，I[n-1] 代表上一帧画面，ΔI[n] 是两帧相减得到的差分画面。静止背景相减后全部归零，编码器只需花极少比特去描述 ΔI[n] 中那些不为零的运动边缘。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：视频帧间差分编码与带宽节省实时演示",
      "instruction": "调节「前景运动速度」观察静止与运动状态下帧间差值的变化；试着开启「传感器背景微噪」并调节「零值门限」，体会噪声如何破坏帧间压缩率。",
      "controls": [
        {
          "type": "slider",
          "id": "speed",
          "label": "前景运动速度",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 4,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "thresh",
          "label": "帧差零值门限",
          "min": 0,
          "max": 40,
          "step": 2,
          "value": 8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "noise",
          "label": "叠加背景微弱噪点",
          "value": false
        }
      ],
      "jsCode": "var GW = 48, GH = 36, S = 4, N = GW * GH;\nvar curr = new Float32Array(N);\nvar prev = new Float32Array(N);\nvar diffArr = new Float32Array(N);\nvar hist = [];\nfor (var k = 0; k < 64; k++) hist.push(0);\nvar phase = 0, accum = 0, inited = false, activePct = 0;\nfunction computeFrame(usePrevInit) {\n  var speed = lab.values.speed;\n  var thresh = lab.values.thresh;\n  var addNoise = lab.values.noise;\n  var cx = 24 + Math.sin(phase) * 13;\n  var cy = 17 + Math.cos(phase * 1.4) * 7;\n  var changed = 0;\n  for (var y = 0; y < GH; y++) {\n    for (var x = 0; x < GW; x++) {\n      var idx = y * GW + x;\n      var bg = 28 + x * 0.65 + (y > 26 ? 32 : 0);\n      if (x > 34 && x < 43 && y > 6 && y < 22) bg += 25;\n      var dx = x - cx, dy = y - cy;\n      var d = Math.sqrt(dx * dx + dy * dy);\n      var val = bg;\n      if (d <= 6.2) {\n        val = 225 - d * 12;\n      }\n      if (addNoise) {\n        val += (Math.random() - 0.5) * 26;\n      }\n      val = Math.max(0, Math.min(255, val));\n      if (usePrevInit) {\n        prev[idx] = val;\n        curr[idx] = val;\n        diffArr[idx] = 0;\n      } else {\n        prev[idx] = curr[idx];\n        curr[idx] = val;\n        var df = Math.abs(curr[idx] - prev[idx]);\n        if (df <= thresh) {\n          diffArr[idx] = 0;\n        } else {\n          diffArr[idx] = Math.min(255, df * 2.2);\n          changed++;\n        }\n      }\n    }\n  }\n  activePct = (changed / N) * 100;\n  hist.push(activePct);\n  if (hist.length > 64) hist.shift();\n}\ncomputeFrame(true);\nfunction drawAll() {\n  var ctx = lab.ctx;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, lab.width, lab.height);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx < lab.width; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, lab.height); ctx.stroke();\n  }\n  for (var gy = 0; gy < lab.height; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(lab.width, gy); ctx.stroke();\n  }\n  var px1 = 24, px2 = 264, px3 = 504, py = 48;\n  for (var y = 0; y < GH; y++) {\n    for (var x = 0; x < GW; x++) {\n      var i = y * GW + x;\n      var v = curr[i] | 0;\n      ctx.fillStyle = 'rgb(' + (v * 0.45 | 0) + ',' + (v * 0.85 | 0) + ',' + v + ')';\n      ctx.fillRect(px1 + x * S, py + y * S, S, S);\n      var dv = diffArr[i] | 0;\n      if (dv === 0) {\n        ctx.fillStyle = '#020617';\n      } else {\n        ctx.fillStyle = 'rgb(' + Math.min(255, (dv * 0.2)|0) + ',' + Math.min(255, (dv * 0.95)|0) + ',' + Math.min(255, (dv * 0.65)|0) + ')';\n      }\n      ctx.fillRect(px2 + x * S, py + y * S, S, S);\n    }\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.strokeRect(px1 - 1, py - 1, GW * S + 2, GH * S + 2);\n  ctx.strokeStyle = '#10b981';\n  ctx.strokeRect(px2 - 1, py - 1, GW * S + 2, GH * S + 2);\n  ctx.fillStyle = '#020617';\n  ctx.fillRect(px3, py, 192, 144);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.strokeRect(px3 - 1, py - 1, 194, 146);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(px3, py + 12); ctx.lineTo(px3 + 192, py + 12); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('未压缩 100%', px3 + 6, py + 24);\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  for (var h = 0; h < hist.length; h++) {\n    var hx = px3 + (h / 63) * 192;\n    var hy = py + 144 - (hist[h] / 100) * 132;\n    if (h === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('需传输像素: ' + activePct.toFixed(1) + '%', px3 + 8, py + 136);\n  ctx.textAlign = 'center';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('当前原始帧 I[n]', px1 + 96, 32);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('帧间差值 |I[n] - I[n-1]|', px2 + 96, 32);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('帧间编码数据量曲线', px3 + 96, 32);\n  lab.setReadout('运动速度: ' + lab.values.speed + ' | 门限: ' + lab.values.thresh + ' | 变化像素占比: ' + activePct.toFixed(1) + '% | 节省帧间传输: ' + (100 - activePct).toFixed(1) + '%');\n}\nlab.onUpdate(function() {\n  drawAll();\n});\nlab.onLoop(function(dt) {\n  accum += dt;\n  if (accum >= 0.066) {\n    accum = 0;\n    phase += 0.066 * lab.values.speed * 0.65;\n    computeFrame(false);\n    drawAll();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "商业落地决定算法方向：大众消费品（数字电视、可视电话、桌面视频软件）追求低成本、小内存与低码率，图像压缩不是锦上添花，而是系统能否成立的前提。",
        "压缩的本质是“去冗余”：静态图主要榨干空间冗余（相邻像素颜色相近）与视觉比特冗余；动态视频则额外榨干庞大的时间冗余（前后帧背景几乎不变）。",
        "工程避坑（噪点与关键帧）：真实摄像头存在微弱背景噪声，若不做死区门限或滤波处理，帧间差分会以为全屏都在动，导致压缩比暴跌；同时实际视频流必须定期插入完整关键帧，避免某帧丢包导致后续差分画面永久花屏。"
      ]
    }
  ]
});
