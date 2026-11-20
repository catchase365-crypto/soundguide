window.__BOOK_REGISTER_SECTION__("sec_075", {
  "title": "卷积的结合律 (Associative Property)",
  "intuition": "把多个信号处理系统串联成流水线时，不仅前后处理顺序可以随意调换，还能将整条流水线“打包合并”成一个等效的单一系统。",
  "blocks": [
    {
      "type": "concept",
      "heading": "三个信号的卷积与顺序无关性",
      "paragraphs": [
        "在数字信号处理中，我们经常需要对三个或更多的信号连续做卷积。结合律告诉我们：你可以先挑出其中两个信号做卷积，得到一个**中间信号 (intermediate signal)**，再将这个中间信号与第三个信号做卷积。",
        "无论你先算前两个，还是先算后两个，**最终得到的波形在数学上完全一模一样**。不过千万注意：虽然终点相同，但你在半路上生成的“中间信号”却会因为计算顺序的不同而截然不同。"
      ],
      "formula": {
        "expr": "(a[n] * b[n]) * c[n] = a[n] * (b[n] * c[n])",
        "explain": "a[n]、b[n]、c[n] 代表三个离散信号（或输入信号与两个系统的冲激响应），星号 * 表示卷积运算。括号表示先执行哪一组卷积，等号说明两种分组方式结果完全相等。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：调换级联顺序，观察中间剧变与终点重合",
      "instruction": "拖动 h1 平滑窗长和 h2 差分系数，观察中间信号 w[n]（橙色与绿色）截然不同，但最终输出 y[n]（天蓝线与粉红点）却像素级重合。",
      "controls": [
        {
          "type": "slider",
          "id": "avgLen",
          "label": "h1 平滑窗长 M",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "edgeGain",
          "label": "h2 差分系数 α",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "highlightDiff",
          "label": "高亮中间信号差异区",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction conv(a, b) {\n  const out = new Array(a.length + b.length - 1).fill(0);\n  for (let i = 0; i < a.length; i++) {\n    for (let j = 0; j < b.length; j++) {\n      out[i + j] += a[i] * b[j];\n    }\n  }\n  return out;\n}\n\nfunction drawPanel(x0, y0, pw, ph, title, yMin, yMax) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(x0, y0, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, pw, ph);\n  const zeroY = y0 + ph * (yMax / (yMax - yMin));\n  ctx.beginPath();\n  ctx.moveTo(x0, zeroY);\n  ctx.lineTo(x0 + pw, zeroY);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(title, x0 + 6, y0 + 16);\n  return (idx, val, total) => {\n    const px = x0 + 8 + (idx / Math.max(1, total - 1)) * (pw - 16);\n    const py = y0 + ph - 10 - ((val - yMin) / (yMax - yMin)) * (ph - 32);\n    return [px, py];\n  };\n}\n\nfunction drawCurve(arr, mapPt, color, width, dashed) {\n  ctx.save();\n  ctx.strokeStyle = color;\n  ctx.lineWidth = width;\n  if (dashed) ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (let i = 0; i < arr.length; i++) {\n    const [px, py] = mapPt(i, arr[i], arr.length);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  const M = Math.round(lab.values.avgLen);\n  const alpha = lab.values.edgeGain;\n  const highlight = lab.values.highlightDiff;\n\n  const N = 46;\n  const x = new Array(N).fill(0);\n  for (let n = 8; n <= 20; n++) x[n] = 1.0;\n  for (let n = 26; n <= 34; n++) x[n] = -0.8 * (1 - Math.abs(n - 30) / 4.5);\n\n  const h1 = new Array(M).fill(1 / M);\n  const h2 = [1, -alpha];\n\n  const wA = conv(x, h1);\n  const yA = conv(wA, h2);\n  const wB = conv(x, h2);\n  const yB = conv(wB, h1);\n\n  const lenW = Math.max(wA.length, wB.length);\n  let maxW = 0;\n  for (let i = 0; i < lenW; i++) {\n    const va = i < wA.length ? wA[i] : 0;\n    const vb = i < wB.length ? wB[i] : 0;\n    maxW = Math.max(maxW, Math.abs(va - vb));\n  }\n\n  let maxYDiff = 0;\n  for (let i = 0; i < yA.length; i++) {\n    maxYDiff = Math.max(maxYDiff, Math.abs(yA[i] - yB[i]));\n  }\n\n  const mapX = drawPanel(12, 16, 200, 206, '1. 原始输入 x[n]', -1.5, 1.8);\n  drawCurve(x, mapX, '#f8fafc', 2, false);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '16px sans-serif';\n  ctx.fillText('→', 221, 122);\n\n  const mapW = drawPanel(244, 16, 224, 206, '2. 中间信号 w[n] (顺序不同)', -1.5, 1.8);\n  if (highlight) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n    ctx.beginPath();\n    for (let i = 0; i < lenW; i++) {\n      const [px, py] = mapW(i, i < wA.length ? wA[i] : 0, lenW);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    for (let i = lenW - 1; i >= 0; i--) {\n      const [px, py] = mapW(i, i < wB.length ? wB[i] : 0, lenW);\n      ctx.lineTo(px, py);\n    }\n    ctx.closePath();\n    ctx.fill();\n  }\n  drawCurve(wA, (i, v) => mapW(i, v, lenW), '#f59e0b', 2.2, false);\n  drawCurve(wB, (i, v) => mapW(i, v, lenW), '#10b981', 2.0, false);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('— x*h1 (先平滑)', 252, 200);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— x*h2 (先差分)', 252, 215);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '16px sans-serif';\n  ctx.fillText('→', 476, 122);\n\n  const mapY = drawPanel(498, 16, 210, 206, '3. 最终输出 y[n] (重合)', -1.5, 1.8);\n  drawCurve(yA, mapY, '#38bdf8', 3.5, false);\n  for (let i = 0; i < yB.length; i += 2) {\n    const [px, py] = mapY(i, yB[i], yB.length);\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath();\n    ctx.arc(px, py, 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('━ (x*h1)*h2', 506, 200);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('● (x*h2)*h1', 506, 215);\n\n  lab.setReadout('M=' + M + ' | α=' + alpha.toFixed(1) + ' | 中间信号最大差异 max|wA-wB|=' + maxW.toFixed(3) + ' | 最终输出误差 max|yA-yB|=' + maxYDiff.toExponential(1) + ' (完全等价)');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "级联系统（Cascaded Systems）的两大工程威力",
      "paragraphs": [
        "在系统理论中，如果前一个系统的输出直接作为后一个系统的输入，我们称它们处于**级联 (cascade)** 状态。如图 7-9 所示，假设信号 `x[n]` 依次通过冲激响应为 `h1[n]` 和 `h2[n]` 的两个线性系统，卷积结合律赋予了工程师两项极其实用的“超能力”：",
        "**第一，系统顺序可任意重排**：把 `h1 -> h2` 换成 `h2 -> h1`，整个黑盒子的对外输入输出特性丝毫不变。这在硬件设计中非常有用，例如可以把容易导致数值溢出的高增益放大环节调整到后面，或者把能提前滤除带外噪声的环节放到最前面。",
        "**第二，多级系统可合并为单个等效系统**：任意多个串联的系统，都可以被替换成一个**单一系统**。这个替代系统的冲激响应，只需把原来所有级联系统的冲激响应提前做一次卷积即可。只要在设计阶段预先算好合并后的核，实际运行时就无需维护多级中间缓存，只需一次卷积计算就能完成整条流水线的任务！"
      ],
      "formula": {
        "expr": "h_eq[n] = h1[n] * h2[n]",
        "explain": "h1[n] 与 h2[n] 分别为两级串联系统的冲激响应，h_eq[n] 为合并后单一替代系统的等效冲激响应。对输入 x[n] 依次经过两级系统，完全等效于直接用 x[n] 卷积 h_eq[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：系统合并为等效单核 h1*h2 与实时音频盲听",
      "instruction": "调节低通长度与回声延迟，观察两个独立核如何卷成一个等效核；点击播放声音并在“级联两步”与“单步合并”间切换，亲耳验证听感毫无差别。",
      "controls": [
        {
          "type": "slider",
          "id": "lpLen",
          "label": "h1 低通平滑长度",
          "min": 1,
          "max": 15,
          "step": 1,
          "value": 6,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "echoDelay",
          "label": "h2 回声/梳状延迟",
          "min": 2,
          "max": 20,
          "step": 1,
          "value": 9,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "useMerged",
          "label": "使用单步合并系统 x*(h1*h2)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet currentSource = null;\nlet animPhase = 0;\n\nfunction conv(a, b) {\n  const out = new Array(a.length + b.length - 1).fill(0);\n  for (let i = 0; i < a.length; i++) {\n    for (let j = 0; j < b.length; j++) {\n      out[i + j] += a[i] * b[j];\n    }\n  }\n  return out;\n}\n\nfunction getKernels() {\n  const M = Math.round(lab.values.lpLen);\n  const D = Math.round(lab.values.echoDelay);\n  const h1 = new Array(M).fill(1 / M);\n  const h2 = new Array(D + 1).fill(0);\n  h2[0] = 0.65;\n  h2[D] = 0.55;\n  const hEq = conv(h1, h2);\n  return { M, D, h1, h2, hEq };\n}\n\nfunction drawStems(x0, y0, pw, ph, arr, title, color, maxFixed) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(x0, y0, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, pw, ph);\n  const baseY = y0 + ph - 16;\n  ctx.beginPath();\n  ctx.moveTo(x0, baseY);\n  ctx.lineTo(x0 + pw, baseY);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(title, x0 + 8, y0 + 16);\n\n  const maxV = maxFixed || Math.max(0.001, ...arr.map(Math.abs));\n  const usableW = pw - 24;\n  const usableH = ph - 40;\n  const nCount = arr.length;\n  for (let i = 0; i < nCount; i++) {\n    const px = x0 + 12 + (nCount === 1 ? usableW / 2 : (i / (nCount - 1)) * usableW);\n    const py = baseY - (arr[i] / maxV) * usableH;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, baseY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(px, py, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n}\n\nfunction stopAudio() {\n  if (currentSource) {\n    try { currentSource.stop(); } catch (e) {}\n    try { currentSource.disconnect(); } catch (e) {}\n    currentSource = null;\n  }\n}\n\nfunction updateAudio() {\n  stopAudio();\n  if (!lab.values.play) return;\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n\n  const { h1, h2, hEq } = getKernels();\n  let procRate = 16000;\n  let testBuf;\n  try {\n    testBuf = ac.createBuffer(1, procRate, procRate);\n  } catch (e) {\n    procRate = ac.sampleRate;\n    testBuf = ac.createBuffer(1, procRate, procRate);\n  }\n\n  const pad = 64;\n  const totalSrc = procRate + pad;\n  const src = new Array(totalSrc);\n  const freq = 125;\n  for (let n = 0; n < totalSrc; n++) {\n    let s = 0;\n    const w = 2 * Math.PI * freq * (n / procRate);\n    for (let k = 1; k <= 18; k++) {\n      s += Math.sin(k * w) / k;\n    }\n    src[n] = s * 0.28;\n  }\n\n  const processed = lab.values.useMerged ? conv(src, hEq) : conv(conv(src, h1), h2);\n  const outData = testBuf.getChannelData(0);\n  for (let n = 0; n < procRate; n++) {\n    outData[n] = processed[n + pad];\n  }\n\n  const node = ac.createBufferSource();\n  node.buffer = testBuf;\n  node.loop = true;\n  node.connect(ac.destination);\n  node.start();\n  currentSource = node;\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const { M, D, h1, h2, hEq } = getKernels();\n  const merged = lab.values.useMerged;\n  const playing = lab.values.play;\n\n  drawStems(12, 12, 232, 102, '系统 1: h1[n] 低通平滑 (M=' + M + ')', h1, '#10b981', 1.0);\n  drawStems(12, 126, 232, 102, '系统 2: h2[n] 回声核 (D=' + D + ')', h2, '#38bdf8', 0.8);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '15px sans-serif';\n  ctx.fillText('＊', 252, 125);\n\n  drawStems(274, 12, 434, 216, '等效单系统: h_eq[n] = h1[n] * h2[n] (长度 ' + hEq.length + ' 点)', hEq, '#f59e0b', 0.8);\n\n  ctx.fillStyle = merged ? 'rgba(236, 72, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)';\n  ctx.fillRect(496, 20, 202, 26);\n  ctx.strokeStyle = merged ? '#ec4899' : '#38bdf8';\n  ctx.strokeRect(496, 20, 202, 26);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  const modeLabel = merged ? '音频模式: 单步合并 x*(h1*h2)' : '音频模式: 级联两步 (x*h1)*h2';\n  ctx.fillText(modeLabel, 505, 37);\n\n  if (playing) {\n    const pulse = 0.5 + 0.5 * Math.sin(animPhase * 6);\n    ctx.fillStyle = 'rgba(16, 185, 129, ' + (0.4 + 0.6 * pulse).toFixed(2) + ')';\n    ctx.beginPath();\n    ctx.arc(482, 33, 5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  const pathText = merged ? '当前执行: 预先合并成 1 个长度 ' + hEq.length + ' 的滤波器' : '当前执行: 先过 h1(' + M + '点) 再过 h2(' + (D + 1) + '点)';\n  lab.setReadout(pathText + ' | 两者音频波形逐样本完全一致');\n}\n\nlab.onUpdate(() => {\n  draw();\n  updateAudio();\n});\n\nlab.onLoop((dt) => {\n  if (!lab.values.play) return;\n  animPhase += dt;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【数值精度避坑】数学上 (x*h1)*h2 等于 (x*h2)*h1，但在定点 DSP 或有限字长硬件中，中间信号 w[n] 截然不同！把高增益或易饱和的滤波器放在前面会导致中间结果溢出失真，合理调换级联顺序能在不改变功能的前提下最大化信噪比与动态范围。",
        "【算力优化准则】如果级联的各系统参数固定不变，务必在离线设计阶段把所有冲激响应预先卷积合并成一个等效核 h_eq = h1 * h2 * ...，运行时只需一次卷积即可替代整条流水线。",
        "【架构权衡提醒】一旦将多个级联系统合并成单个系统，中间节点信号 w[n] 就会消失；如果后续算法（如多抽头监测或自适应反馈）仍需提取某一级中间输出，则应保留级联结构而非彻底合并。"
      ]
    }
  ]
});
