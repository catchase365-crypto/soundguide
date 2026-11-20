window.__BOOK_REGISTER_SECTION__("sec_134", {
  "title": "通过卷积实现滑动平均滤波 (Implementation by Convolution)",
  "intuition": "滑动平均的本质，就是用一个总面积恒为 1 的矩形脉冲卷积核在输入信号上平稳滑过——输出信号的每一个点，都是输入信号局部窗口内所有邻居的算术平均。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、单边滑动平均公式：把邻居拉来求平均",
      "paragraphs": [
        "顾名思义，滑动平均滤波器（Moving Average Filter）的工作方式非常直白：从输入信号 `x[ ]` 中连续取出 `M` 个采样点，将它们相加后再除以 `M`，就得到了输出信号 `y[ ]` 中的一个点。",
        "在原书的**方程 15-1** 中，作者先给出了一种编程最简单的**单边平均（One-side Averaging）**形式。例如，在一个 5 点滑动平均滤波器（`M = 5`）中，输出信号第 80 个点 `y[80]` 的计算方法就是把从 `x[80]` 开始往后数的 5 个点加起来除以 5：`y[80] = (x[80] + x[81] + x[82] + x[83] + x[84]) / 5`。",
        "注意这里有一个非常关键的细节：该公式**只使用了待求输出点一侧（右侧/未来）的采样点**。在实时嵌入式系统中，如果你只能往回看历史数据，也可以写成 `x[i-j]`，原理完全等价，只是方向相反。"
      ],
      "formula": {
        "expr": "y[i] = (1 / M) * Σ_{j=0}^{M-1} x[i + j]",
        "explain": "x[ ] 为输入信号，y[ ] 为输出信号，i 为当前计算的输出索引，M 为参与平均的窗口点数，j 从 0 遍历到 M-1（单边取样）。"
      }
    },
    {
      "type": "concept",
      "heading": "二、对称平均与“相位错位”的消除",
      "paragraphs": [
        "单边平均虽然代码写起来省事，但它会带来一个工程上很讨厌的副作用：**输入信号与输出信号之间会产生相对位移（Relative Shift）**。因为 `y[80]` 用的是 `x[80]` 到 `x[84]` 的平均值，它实际上反映的是以第 `82` 号点为中心的信号特征，相当于把整个波形往左“拽”了 2 个采样点。",
        "解决办法就是改用**对称平均（Symmetrical Averaging）**：围绕当前输出点 `i` 左右对称地各取一半采样点。还以 5 点滤波为例，计算 `y[80]` 时改为取前后对称的 5 个点：`y[80] = (x[78] + x[79] + x[80] + x[81] + x[82]) / 5`。",
        "此时求和索引 `j` 从 `-(M-1)/2` 遍历到 `+(M-1)/2`。显而易见，**对称平均要求窗口点数 `M` 必须是一个奇数**（这样正中心才能刚好落在一个整数索引上，左右各有 `(M-1)/2` 个邻居）。"
      ],
      "formula": {
        "expr": "y[i] = (1 / M) * Σ_{j=-(M-1)/2}^{(M-1)/2} x[i + j]   (M 为奇数)",
        "explain": "以输入点 x[i] 为正中心，向左侧和右侧各延伸 (M-1)/2 个点求平均，从而彻底消除输入与输出之间的时间偏移。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：单边 vs 对称平均的“波形错位”显微镜",
      "instruction": "拖动「平均点数 M」和「当前输出点 i」，再切换「对称平均」开关，观察黄色采样窗口如何滑动，以及单边平均如何导致绿色输出波形提前偏移。",
      "controls": [
        {
          "type": "slider",
          "id": "M",
          "label": "平均点数 M",
          "min": 3,
          "max": 25,
          "step": 2,
          "value": 9,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "pos",
          "label": "当前输出点 i",
          "min": 15,
          "max": 85,
          "step": 1,
          "value": 45,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "sym",
          "label": "开启对称平均 (关闭为单边)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const M = lab.values.M;\n  const pos = lab.values.pos;\n  const sym = lab.values.sym;\n  const N = 120;\n  const half = (M - 1) / 2;\n\n  const x = new Array(N);\n  for (let n = 0; n < N; n++) {\n    x[n] = (n >= 45 && n <= 75) ? 1.0 : 0.0;\n  }\n\n  const jStart = sym ? -half : 0;\n  const jEnd = sym ? half : (M - 1);\n  const y = new Array(N).fill(null);\n  for (let i = 0; i < N; i++) {\n    if (i + jStart >= 0 && i + jEnd < N) {\n      let sum = 0;\n      for (let j = jStart; j <= jEnd; j++) sum += x[i + j];\n      y[i] = sum / M;\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 42, padR = 20, padT = 28, padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const toX = (n) => padL + (n / (N - 1)) * plotW;\n  const toY = (v) => padT + (1 - v) * plotH;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const yy = padT + (g / 4) * plotH;\n    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();\n  }\n  for (let n = 0; n <= N; n += 15) {\n    const xx = toX(n);\n    ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + plotH); ctx.stroke();\n  }\n\n  const winL = pos + jStart;\n  const winR = pos + jEnd;\n  const xL = toX(winL - 0.5);\n  const xR = toX(winR + 0.5);\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n  ctx.fillRect(xL, padT, xR - xL, plotH);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';\n  ctx.setLineDash([4, 3]);\n  ctx.strokeRect(xL, padT, xR - xL, plotH);\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const px = toX(n), py = toY(x[n]);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  let started = false;\n  for (let n = 0; n < N; n++) {\n    if (y[n] === null) continue;\n    const px = toX(n), py = toY(y[n]);\n    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const curX = toX(pos);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(curX, padT); ctx.lineTo(curX, padT + plotH); ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (y[pos] !== null) {\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(curX, toY(y[pos]), 5.5, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('输入矩形脉冲 x[n]', padL + 6, 18);\n  ctx.fillStyle = '#38bdf8'; ctx.fillRect(padL + 114, 10, 14, 3);\n  ctx.fillStyle = '#f8fafc'; ctx.fillText('滤波输出 y[n]', padL + 142, 18);\n  ctx.fillStyle = '#10b981'; ctx.fillRect(padL + 228, 10, 14, 3);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText(sym ? '当前模式: 对称平均 (零偏移)' : '当前模式: 单边平均 (向左提前偏移 ' + half + ' 点)', padL + 260, 18);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px monospace';\n  ctx.fillText('0', padL - 14, toY(0) + 4);\n  ctx.fillText('1', padL - 14, toY(1) + 4);\n  ctx.fillText('i = ' + pos, curX - 14, H - 10);\n\n  const valStr = y[pos] !== null ? y[pos].toFixed(3) : '越界';\n  lab.setReadout('模式: ' + (sym ? '对称平均' : '单边平均') + ' | M=' + M + ' | 输出点 i=' + pos + ' | 采样窗口: x[' + winL + '..' + winR + '] | y[' + pos + ']=' + valStr);\n});"
    },
    {
      "type": "concept",
      "heading": "三、卷积视角与代码落地：面积为 1 的矩形核与边界保护",
      "paragraphs": [
        "从信号与系统的本质来看，滑动平均滤波器其实就是**将输入信号与一个极其简单的卷积核（Filter Kernel）做卷积**。比如一个 5 点滑动平均滤波器，它的卷积核就是：`..., 0, 0, 1/5, 1/5, 1/5, 1/5, 1/5, 0, 0, ...`。换句话说，它就是用**一个总面积等于 1 的矩形脉冲**去卷积输入信号——正因为总面积（所有权重之和 `M × (1/M) = 1`）严格等于 1，信号的直流偏置和整体幅度才不会在滤波后发生缩放。",
        "再看原书 **Table 15-1** 给出的经典程序实现：该程序用 101 点对称滑动平均处理 5000 个输入样本（索引 `0` 到 `4999`）。外层循环 `I%` 并没有从 `0` 跑到 `4999`，而是**刻意只循环 `50 TO 4949`**，最终只生成 4900 个有效输出点。",
        "为什么要丢掉首尾各 50 个点？因为当 `I% < 50` 或 `I% > 4949` 时，内层对称累加 `X[I% + J%]`（`J%` 从 `-50` 到 `+50`）就会访问到负索引或超出 `4999` 的非法内存！此外，每次外层循环开始前必须执行 `Y[I%] = 0` 将累加器清零，内层只做高速加法，全部加完后再统一除以 `101`（减少浮点除法次数）。"
      ],
      "formula": {
        "expr": "h[j] = 1 / M  (|j| ≤ (M-1)/2),  否则 0；且 Σ h[j] = 1",
        "explain": "滑动平均的脉冲响应（卷积核）是一个高度为 1/M、宽度为 M、总面积恒为 1 的矩形脉冲。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：矩形卷积核演化与实时音频降噪体验",
      "instruction": "点击「播放对比音频」，拖动「卷积核宽度 M」和「白噪声强度」，左侧观察矩形核如何“变矮变胖但面积不变”，右侧对比波形平滑与高频沙沙声被滤除的听感。",
      "controls": [
        {
          "type": "slider",
          "id": "M",
          "label": "卷积核宽度 M",
          "min": 1,
          "max": 35,
          "step": 2,
          "value": 9,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "白噪声强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 55,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路对比 (直听未滤波原声)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 停止音频"
        }
      ],
      "jsCode": "let audioSrc = null;\nconst N_VIS = 220;\nconst fixedNoise = new Float32Array(N_VIS);\nlet seed = 1337;\nfor (let i = 0; i < N_VIS; i++) {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  fixedNoise[i] = (seed / 4294967296) * 2 - 1;\n}\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nlab.onUpdate(function() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const M = lab.values.M;\n  const noisePct = lab.values.noise;\n  const bypass = lab.values.bypass;\n  const play = lab.values.play;\n  const half = (M - 1) >> 1;\n\n  const x = new Float32Array(N_VIS);\n  const y = new Float32Array(N_VIS);\n  const nAmp = (noisePct / 100) * 0.55;\n  for (let i = 0; i < N_VIS; i++) {\n    x[i] = 0.65 * Math.sin((2 * Math.PI * 3 * i) / N_VIS) + nAmp * fixedNoise[i];\n  }\n  for (let i = 0; i < N_VIS; i++) {\n    let sum = 0;\n    for (let j = -half; j <= half; j++) {\n      const idx = (i + j + N_VIS) % N_VIS;\n      sum += x[idx];\n    }\n    y[i] = sum / M;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const kX = 16, kY = 30, kW = 190, kH = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(kX, kY, kW, kH);\n  const kBaseY = kY + kH - 22;\n  ctx.beginPath(); ctx.moveTo(kX, kBaseY); ctx.lineTo(kX + kW, kBaseY); ctx.stroke();\n\n  const maxSlots = 37;\n  const slotW = (kW - 16) / maxSlots;\n  const kCenter = kX + kW / 2;\n  const barMaxH = kH - 42;\n  for (let j = -18; j <= 18; j++) {\n    const active = Math.abs(j) <= half;\n    const bx = kCenter + j * slotW - slotW * 0.38;\n    const bw = Math.max(2, slotW * 0.76);\n    if (active) {\n      const bh = Math.max(3, (1 / M) * barMaxH);\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillRect(bx, kBaseY - bh, bw, bh);\n    } else {\n      ctx.fillStyle = 'rgba(255,255,255,0.18)';\n      ctx.fillRect(bx, kBaseY - 2, bw, 2);\n    }\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('矩形卷积核 h[j] (面积=1)', kX + 4, 20);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px monospace';\n  ctx.fillText('高=1/' + M + '=' + (1 / M).toFixed(3) + '  宽=' + M, kX + 8, H - 14);\n\n  const sX = 228, sY = 30, sW = W - sX - 16, sH = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(sX, sY, sW, sH);\n  const midY = sY + sH / 2;\n  ctx.beginPath(); ctx.moveTo(sX, midY); ctx.lineTo(sX + sW, midY); ctx.stroke();\n\n  const toSX = (i) => sX + (i / (N_VIS - 1)) * sW;\n  const toSY = (v) => midY - v * (sH * 0.38);\n\n  ctx.strokeStyle = bypass ? '#ec4899' : 'rgba(56, 189, 248, 0.45)';\n  ctx.lineWidth = bypass ? 2.2 : 1.3;\n  ctx.beginPath();\n  for (let i = 0; i < N_VIS; i++) {\n    const px = toSX(i), py = toSY(x[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (!bypass) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let i = 0; i < N_VIS; i++) {\n      const px = toSX(i), py = toSY(y[i]);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(bypass ? '当前输出: 原始含噪波形 (旁路)' : '蓝色: 含噪输入 x[n]   绿色: 卷积滤波输出 y[n]', sX + 4, 20);\n\n  if (!play) {\n    stopAudio();\n  } else {\n    try {\n      const actx = lab.getAudioContext();\n      if (actx) {\n        if (actx.state === 'suspended') actx.resume();\n        const sr = actx.sampleRate || 44100;\n        const len = sr;\n        const raw = new Float32Array(len);\n        const audioNoise = (noisePct / 100) * 0.35;\n        for (let i = 0; i < len; i++) {\n          const tone = 0.28 * Math.sin((2 * Math.PI * 220 * i) / sr);\n          raw[i] = tone + audioNoise * (Math.random() * 2 - 1);\n        }\n        const buf = actx.createBuffer(1, len, sr);\n        const out = buf.getChannelData(0);\n        if (bypass || M === 1) {\n          out.set(raw);\n        } else {\n          let runSum = 0;\n          for (let j = -half; j <= half; j++) {\n            runSum += raw[(j + len) % len];\n          }\n          for (let i = 0; i < len; i++) {\n            out[i] = runSum / M;\n            const addIdx = (i + half + 1) % len;\n            const subIdx = (i - half + len) % len;\n            runSum += raw[addIdx] - raw[subIdx];\n          }\n        }\n        stopAudio();\n        audioSrc = actx.createBufferSource();\n        audioSrc.buffer = buf;\n        audioSrc.loop = true;\n        audioSrc.connect(actx.destination);\n        audioSrc.start(0);\n      }\n    } catch (e) {}\n  }\n\n  const noiseReduction = Math.sqrt(M).toFixed(2);\n  lab.setReadout('卷积核 M=' + M + ' (权重 1/' + M + ') | 白噪声理论幅值衰减: ' + noiseReduction + 'x | 状态: ' + (play ? (bypass ? '播放原始含噪音频' : '播放滤波后音频') : '静音'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【奇数优先与零相移】需要保留事件发生准确时刻（如心电图峰值、边缘检测）时，务必使用奇数点 M 的对称平均；若用单边平均，输出波形会整体偏移 (M-1)/2 个采样点。",
        "【严防数组越界】写类似 Table 15-1 的滑动平均代码时，最经典的 Bug 就是首尾索引越界（I+J < 0 或 >= N）。工程上要么像原书一样截断首尾各 (M-1)/2 个输出点，要么对边界做零填充或镜像延拓。",
        "【单位面积铁律】任何均值/平滑卷积核的系数之和必须严格等于 1（即 M 个 1/M 相加），否则信号整体直流电平会被放大或衰减。",
        "【降噪收益】滑动平均本质上是用单位面积矩形核做卷积，它对随机白噪声的标准差衰减倍数为 √M，但随着 M 增大，阶跃响应的上升沿也会同步变宽。"
      ]
    }
  ]
});
