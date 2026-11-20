window.__BOOK_REGISTER_SECTION__("sec_091", {
  "title": "用相关法计算离散傅里叶变换 (DFT by Correlation)",
  "intuition": "算 DFT 就像拿不同频率的正弦/余弦“探针”去和输入信号逐点相乘再求和：信号里只要藏着这个频率，乘积就会同频共振出正峰值；没有这个频率，波形正负抵消恰好归零。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心原理：用“相关”探测信号里的隐藏频率",
      "paragraphs": [
        "在上一节我们知道，解联立方程虽然能算出 DFT，但计算量大到几乎无法实用。工程中真正标准的直观做法，是借用上一章学过的**相关（Correlation）**思想：想检测一段信号里有没有某个特定频率的波形，只需把输入信号与该频率的**基函数（Basis Function）**逐点相乘，再把所有乘积加起来。",
        "以原书图 8-8 的 64 点信号为例（频域实部与虚部各有 33 个点）：假设我们想算出虚部第 3 个点 `Im X[3]`——也就是在 0 到 63 号采样点之间恰好完成 **3 个完整周期**的正弦波分量强度。我们把 3 周期的正弦探针 `s_3[ ]` 分别乘以两段测试信号：",
        "1. 若输入信号 `x1[ ]` 本身就是幅度为 `1.0` 的 3 周期正弦波：它与探针波峰碰波峰、波谷碰波谷，乘积相当于正弦的平方，**所有点全大于等于 0**！64 个点加起来总和是 `32`（平均值为 `0.5`，乘上综合方程里的 `2/N` 归一化系数正好还原出幅度 `1.0`）。",
        "2. 若输入信号 `x2[ ]` 是其他多个频率正余弦波的混合体（唯独不含 3 周期正弦波）：它与探针 `s_3[ ]` 相乘后，结果有正有负且上下对称，**64 个点加起来总和严格为 0**，干净利落地说明信号里没有这个成分。"
      ],
      "formula": {
        "expr": "Sum = Σ x[i] · s_k[i]   (i = 0 到 N-1)",
        "explain": "x[i] 是时域输入信号第 i 个采样点，s_k[i] 是完成 k 个周期的标准正弦或余弦基函数；两者逐点相乘后累加，Sum 衡量了 x[i] 与该频率基函数的相似程度。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：复刻图 8-8 —— 基函数“探针”共振与正交抵消",
      "instruction": "拖动「基函数探针 k」与「输入信号主频」滑块，观察第 3 幅图中绿/粉乘积面积是如何从“全部为正共振”变为“正负抵消归零”的；也可勾选干扰频率或点击播放听声音对比。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "输入信号主频",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " 周"
        },
        {
          "type": "slider",
          "id": "probeFreq",
          "label": "基函数探针 k",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " 周"
        },
        {
          "type": "toggle",
          "id": "addInterference",
          "label": "叠加干扰成分 (2周+5周余弦)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音 (信号+探针)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 64;\nlet audioCtx = null, oscSig = null, oscInt1 = null, oscInt2 = null, oscProbe = null, masterGain = null, intGain = null;\n\nfunction ensureAudio() {\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (!audioCtx) return false;\n    masterGain = audioCtx.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(audioCtx.destination);\n    intGain = audioCtx.createGain();\n    intGain.gain.value = 0;\n    intGain.connect(masterGain);\n\n    oscSig = audioCtx.createOscillator();\n    const gSig = audioCtx.createGain();\n    gSig.gain.value = 0.25;\n    oscSig.connect(gSig);\n    gSig.connect(masterGain);\n    oscSig.start();\n\n    oscInt1 = audioCtx.createOscillator();\n    oscInt2 = audioCtx.createOscillator();\n    oscInt1.connect(intGain);\n    oscInt2.connect(intGain);\n    oscInt1.start();\n    oscInt2.start();\n\n    oscProbe = audioCtx.createOscillator();\n    oscProbe.type = 'triangle';\n    const gProbe = audioCtx.createGain();\n    gProbe.gain.value = 0.22;\n    oscProbe.connect(gProbe);\n    gProbe.connect(masterGain);\n    oscProbe.start();\n  }\n  return true;\n}\n\nfunction drawPanel(px, py, pw, ph, title, data, color, fillAreas) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n  const midY = py + ph / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(px, midY);\n  ctx.lineTo(px + pw, midY);\n  ctx.stroke();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(title, px + 6, py + 15);\n\n  const scaleY = (ph / 2 - 22) / 1.5;\n  if (fillAreas) {\n    for (let i = 0; i < N; i++) {\n      const x = px + 6 + (i / (N - 1)) * (pw - 12);\n      const y = midY - data[i] * scaleY;\n      ctx.strokeStyle = data[i] >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(236,72,153,0.75)';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(x, midY);\n      ctx.lineTo(x, y);\n      ctx.stroke();\n    }\n  } else {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const x = px + 6 + (i / (N - 1)) * (pw - 12);\n      const y = midY - data[i] * scaleY;\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  for (let i = 0; i < N; i++) {\n    const x = px + 6 + (i / (N - 1)) * (pw - 12);\n    const y = midY - data[i] * scaleY;\n    ctx.fillStyle = fillAreas ? (data[i] >= 0 ? '#10b981' : '#ec4899') : color;\n    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);\n  }\n}\n\nlab.onUpdate(() => {\n  const sigF = lab.values.sigFreq;\n  const probeF = lab.values.probeFreq;\n  const interf = lab.values.addInterference;\n\n  const xSig = new Array(N);\n  const sProbe = new Array(N);\n  const prod = new Array(N);\n  let sum = 0;\n\n  for (let i = 0; i < N; i++) {\n    const a1 = interf ? 0.7 : 1.0;\n    let val = a1 * Math.sin(2 * Math.PI * sigF * i / N);\n    if (interf) {\n      val += 0.4 * Math.cos(2 * Math.PI * 2 * i / N) + 0.4 * Math.cos(2 * Math.PI * 5 * i / N);\n    }\n    xSig[i] = val;\n    sProbe[i] = Math.sin(2 * Math.PI * probeF * i / N);\n    prod[i] = xSig[i] * sProbe[i];\n    sum += prod[i];\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  drawPanel(10, 12, 224, 216, '1. 输入信号 x[i] (N=64)', xSig, '#38bdf8', false);\n  drawPanel(248, 12, 224, 216, '2. 基函数探针 s_' + probeF + '[i]', sProbe, '#f59e0b', false);\n  drawPanel(486, 12, 224, 216, '3. 逐点乘积 x[i] × s_' + probeF + '[i]', prod, '#10b981', true);\n\n  const imVal = -sum;\n  const match = Math.abs(sum) > 1.0;\n  ctx.fillStyle = match ? '#10b981' : '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('Sum=' + sum.toFixed(1), 636, 27);\n\n  lab.setReadout('乘积累加 Sum = ' + sum.toFixed(2) + ' | 均值 = ' + (sum / N).toFixed(3) + ' | Eq.8-4 ImX[' + probeF + '] = ' + imVal.toFixed(2) + (match ? '  [同频共振命中!]' : '  [正交抵消=0]'));\n\n  if (lab.values.play) {\n    if (ensureAudio()) {\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      const t = audioCtx.currentTime;\n      oscSig.frequency.setTargetAtTime(sigF * 110, t, 0.02);\n      oscInt1.frequency.setTargetAtTime(2 * 110, t, 0.02);\n      oscInt2.frequency.setTargetAtTime(5 * 110, t, 0.02);\n      oscProbe.frequency.setTargetAtTime(probeF * 110, t, 0.02);\n      intGain.gain.setTargetAtTime(interf ? 0.12 : 0, t, 0.02);\n      masterGain.gain.setTargetAtTime(0.6, t, 0.02);\n    }\n  } else if (masterGain && audioCtx) {\n    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "分析方程 (Eq. 8-4) 与基函数的“正交性”魔法",
      "paragraphs": [
        "把上面的探测思路写成严谨的数学公式，就是 DFT 的**分析方程（Analysis Equation，即 Eq. 8-4）**。实部 `Re X[k]` 用余弦波去做相关，虚部 `Im X[k]` 用正弦波去做相关。你只要记住一句话：**“我是在把输入信号与每一个基函数做相关运算。”**",
        "关于分析方程有两个工程细节必须注意：第一，与综合方程（逆变换）不同，**分析方程不需要对首尾两点（`k=0` 和 `k=N/2`）做任何特殊缩放**；第二，虚部前面有一个**负号**，这个负号专门用来让实数 DFT 与复数 DFT 的数学定义保持一致（有些教材或代码会省略这个负号，看代码时要留意）。",
        "为什么相关法能精准把混在一起的频率拆开、互不干扰？全靠基函数的**正交性（Orthogonality）**——任意两个不同的基函数彼此“完全不相关”。不仅不同频率的正弦/余弦相乘求和为 0，**同频率的 `sin` 和 `cos` 相乘求和也为 0**！其实，方波、三角波、脉冲序列也满足正交性，理论上也能拿来分解信号，只是正弦/余弦波在线性系统分析中最实用罢了。"
      ],
      "formula": {
        "expr": "ReX[k] = Σ x[i]·cos(2πki/N) ,   ImX[k] = -Σ x[i]·sin(2πki/N)",
        "explain": "i 从 0 遍历到 N-1（时域全部采样点），k 从 0 遍历到 N/2（频域各频率索引）；ReX[k] 提取第 k 个频率的余弦分量，ImX[k] 带负号提取正弦分量。"
      }
    },
    {
      "type": "concept",
      "heading": "代码实现与双重视角：Table 8-2 的循环交换哲学",
      "paragraphs": [
        "原书 Table 8-2 给出了标准相关法求 DFT 的代码骨架：先将累加器数组 `REX[ ]` 和 `IMX[ ]` 清零，然后用两层 `FOR` 循环完成乘累加。当点数 **小于约 32 点** 时，这种直接相关法比复杂的 FFT 跑得还快、代码也极简。",
        "原书特别指出了一个极富启发性的编程技巧：**外层循环 `K%`（遍历频域）和内层循环 `I%`（遍历时域）是可以互换的！** 互换之后程序输出结果一模一样，但你理解算法的视角会彻底反转：",
        "• **外频域、内时域（输出侧视角 / Output side）**：盯着频域的某一个点 `K%`，把全部时域点乘上对应基函数加起来，依次算出每一个频率点。",
        "• **外时域、内频域（输入侧视角 / Input side）**：盯着时域的某一个采样点 `XX[I%]`，计算这一个点对**整个频域**所有 `K%` 产生的贡献，然后把所有时域点的贡献叠加起来。这直接引出了下一节重要的**对偶性（Duality）**。"
      ],
      "formula": {
        "expr": "REX[K%] += XX[I%] * COS(2π·K%·I%/N%) ,   IMX[K%] -= XX[I%] * SIN(2π·K%·I%/N%)",
        "explain": "Table 8-2 核心内循环语句：XX[ ] 存放 N 个时域样本，每次迭代将单个时域点与对应正余弦基函数的乘积累加到频域寄存器中。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：32 点相关法实时频谱分析仪 (Eq. 8-4 实战)",
      "instruction": "自由组合余弦频率 k1、正弦频率 k2 与直流偏置 DC，观察右侧 Re X[k]（蓝）与 Im X[k]（粉）如何精准锁定对应频点；试着打开噪声并播放合成波形。",
      "controls": [
        {
          "type": "slider",
          "id": "f1",
          "label": "余弦分量频率 k1 (Re)",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 3,
          "unit": " 周"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "正弦分量频率 k2 (Im)",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 7,
          "unit": " 周"
        },
        {
          "type": "slider",
          "id": "dc",
          "label": "直流偏置 DC (k=0)",
          "min": -1,
          "max": 1,
          "step": 0.2,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "noise",
          "label": "加入随机白噪声",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成多音信号",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 32, KMAX = 16;\nlet audioCtx = null, osc1 = null, osc2 = null, noiseSrc = null, masterGain = null, noiseGain = null;\n\nfunction ensureAudio() {\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (!audioCtx) return false;\n    masterGain = audioCtx.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(audioCtx.destination);\n\n    osc1 = audioCtx.createOscillator();\n    osc2 = audioCtx.createOscillator();\n    const g1 = audioCtx.createGain(); g1.gain.value = 0.25;\n    const g2 = audioCtx.createGain(); g2.gain.value = 0.25;\n    osc1.connect(g1); g1.connect(masterGain);\n    osc2.connect(g2); g2.connect(masterGain);\n    osc1.start();\n    osc2.start();\n\n    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);\n    const ch = buf.getChannelData(0);\n    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;\n    noiseSrc = audioCtx.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n    noiseGain = audioCtx.createGain();\n    noiseGain.gain.value = 0;\n    noiseSrc.connect(noiseGain);\n    noiseGain.connect(masterGain);\n    noiseSrc.start();\n  }\n  return true;\n}\n\nlab.onUpdate(() => {\n  const f1 = lab.values.f1;\n  const f2 = lab.values.f2;\n  const dc = lab.values.dc;\n  const hasNoise = lab.values.noise;\n\n  const x = new Array(N);\n  for (let i = 0; i < N; i++) {\n    const r = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n    const nVal = hasNoise ? ((r - Math.floor(r)) - 0.5) * 1.4 : 0;\n    x[i] = dc + Math.cos(2 * Math.PI * f1 * i / N) + Math.sin(2 * Math.PI * f2 * i / N) + nVal;\n  }\n\n  const reX = new Array(KMAX + 1).fill(0);\n  const imX = new Array(KMAX + 1).fill(0);\n  for (let k = 0; k <= KMAX; k++) {\n    for (let i = 0; i < N; i++) {\n      reX[k] += x[i] * Math.cos(2 * Math.PI * k * i / N);\n      imX[k] -= x[i] * Math.sin(2 * Math.PI * k * i / N);\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const tx = 12, ty = 14, tw = 240, th = 212;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(tx, ty, tw, th);\n  const tMid = ty + th / 2;\n  ctx.beginPath(); ctx.moveTo(tx, tMid); ctx.lineTo(tx + tw, tMid); ctx.stroke();\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域复合信号 x[i] (N=32)', tx + 8, ty + 16);\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = tx + 10 + (i / (N - 1)) * (tw - 20);\n    const py = tMid - x[i] * 26;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  for (let i = 0; i < N; i++) {\n    const px = tx + 10 + (i / (N - 1)) * (tw - 20);\n    const py = tMid - x[i] * 26;\n    ctx.fillRect(px - 2, py - 2, 4, 4);\n  }\n\n  function drawSpec(px, py, pw, ph, title, arr, color) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(px, py, pw, ph);\n    const mid = py + 53;\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath(); ctx.moveTo(px, mid); ctx.lineTo(px + pw, mid); ctx.stroke();\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '12px sans-serif';\n    ctx.fillText(title, px + 8, py + 15);\n\n    const barW = (pw - 24) / (KMAX + 1);\n    for (let k = 0; k <= KMAX; k++) {\n      const bx = px + 14 + k * barW;\n      const val = arr[k];\n      const bh = Math.max(-28, Math.min(28, (val / 32) * 28));\n      ctx.fillStyle = Math.abs(val) > 8 ? color : 'rgba(148,163,184,0.45)';\n      ctx.fillRect(bx - 5, mid - (bh >= 0 ? bh : 0), 10, Math.abs(bh) < 1.5 ? 1.5 : Math.abs(bh));\n      if (k % 2 === 0 || Math.abs(val) > 8) {\n        ctx.fillStyle = '#94a3b8';\n        ctx.font = '10px sans-serif';\n        ctx.fillText(String(k), bx - 3, py + ph - 4);\n      }\n    }\n  }\n\n  drawSpec(268, 14, 440, 100, '实部频谱 Re X[k] (余弦相关, k=0..16)', reX, '#38bdf8');\n  drawSpec(268, 126, 440, 100, '虚部频谱 Im X[k] (负正弦相关, k=0..16)', imX, '#ec4899');\n\n  lab.setReadout('DC ReX[0]=' + reX[0].toFixed(1) + ' | 余弦峰值 ReX[' + f1 + ']=' + reX[f1].toFixed(1) + ' | 正弦峰值 ImX[' + f2 + ']=' + imX[f2].toFixed(1) + ' (N/2=16)');\n\n  if (lab.values.play) {\n    if (ensureAudio()) {\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      const t = audioCtx.currentTime;\n      osc1.frequency.setTargetAtTime(f1 * 90, t, 0.02);\n      osc2.frequency.setTargetAtTime(f2 * 90, t, 0.02);\n      noiseGain.gain.setTargetAtTime(hasNoise ? 0.14 : 0, t, 0.02);\n      masterGain.gain.setTargetAtTime(0.6, t, 0.02);\n    }\n  } else if (masterGain && audioCtx) {\n    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "选型阈值记住 32 点：如果 DFT 点数小于约 32 点，直接写两层循环的“相关法”通常比 FFT 更快且零开销；超过 32 点请毫不犹豫用 FFT。",
        "负号与对齐陷阱：分析方程虚部 `Im X[k]` 的负号是为了与复数 DFT 和 FFT 算法对齐；若不加负号，算出的相位符号会反过来，自己手写逆变换时必须前后一致。",
        "首尾点无需特殊处理：逆变换（综合方程）需要把 `ReX[0]` 和 `ReX[N/2]` 特殊缩放，但正变换（分析方程 Eq. 8-4）对 `k = 0` 到 `N/2` 一视同仁，直接套公式累加即可。",
        "累加器必须清零：手写类似 Table 8-2 的相关法代码时，别忘了在双层循环开始前把 `REX[ ]` 和 `IMX[ ]` 全部置零；交换内外循环虽不改变结果，却是理解“频域点由全部时域决定”与“单时域点贡献全局频谱”的关键。"
      ]
    }
  ]
});
