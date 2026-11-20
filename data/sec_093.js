window.__BOOK_REGISTER_SECTION__("sec_093", {
  "title": "频率域的极坐标表示法 (Polar Notation)",
  "intuition": "把令人眼花缭乱的“余弦幅度 + 正弦幅度”转换成符合人类直觉的“总强度（幅度）+ 时间偏移（相位）”，信息零损失，却能一眼看穿系统脾气。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、直角坐标 vs 极坐标：一对一的视角切换",
      "paragraphs": [
        "在离散傅里叶变换（DFT）的**直角坐标表示法（Rectangular Notation）**中，频域由实部 `ReX[ ]` 和虚部 `ImX[ ]` 两个数组组成，分别代表余弦波和正弦波的幅度。",
        "而在**极坐标表示法（Polar Notation）**中，我们用**幅度数组 `MagX[ ]`** 和**相位数组 `PhaseX[ ]`** 成对替换掉它们。注意这是严格“一对一”的局部替换：例如 `MagX[14]` 和 `PhaseX[14]` 仅仅由 `ReX[14]` 和 `ImX[14]` 计算得到，与其他频率下标完全无关。",
        "理解这种转换的物理钥匙在于一个简单的三角现象：**将同频率的一个余弦波和一个正弦波相加，结果仍然是同一个频率的余弦波**，只是拥有了全新的幅度 `M` 和全新的相位偏移 `θ`。"
      ],
      "formula": {
        "expr": "A·cos(x) + B·sin(x) = M·cos(x - θ)   [原书 Eq. 8-5 写作 M·cos(x + θ)]",
        "explain": "A 为余弦分量的幅度 (对应 ReX[k])，B 为正弦分量的幅度 (对应 ImX[k])；叠加后变成单一余弦波，其总幅度为 M (即 MagX[k])，相移角为 θ (即 PhaseX[k])。就像平面直角坐标 (A, B) 与极坐标矢量 (M, θ) 之间的等价描述。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：正余弦的矢量合成与响度听感",
      "instruction": "拖动 Re(A) 与 Im(B) 滑块，观察左图矢量 (M, θ) 如何实时决定右图合成余弦波的振幅与左右平移；点击播放测试音，感受幅度 M 变化对音量的直接控制。",
      "controls": [
        {
          "type": "slider",
          "id": "re",
          "label": "余弦分量 Re(A)",
          "min": -1,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im",
          "label": "正弦分量 Im(B)",
          "min": -1,
          "max": 1,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showComp",
          "label": "显示原始 cos 与 sin 分量",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 440Hz 合成单音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet osc = null;\nlet gain = null;\n\nfunction stopAudio() {\n  if (gain) {\n    try {\n      const ac = lab.getAudioContext();\n      gain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    } catch (e) {}\n  }\n  if (osc) {\n    const oldOsc = osc;\n    setTimeout(() => {\n      try { oldOsc.stop(); oldOsc.disconnect(); } catch (e) {}\n    }, 80);\n    osc = null;\n    gain = null;\n  }\n}\n\nfunction updateAudio(mag) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') {\n    ac.resume();\n  }\n  if (!osc) {\n    osc = ac.createOscillator();\n    gain = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.value = 440;\n    gain.gain.value = 0;\n    osc.connect(gain);\n    gain.connect(ac.destination);\n    osc.start();\n  }\n  const targetGain = Math.min(0.24, mag * 0.15);\n  gain.gain.setTargetAtTime(targetGain, ac.currentTime, 0.03);\n}\n\nfunction draw() {\n  const A = lab.values.re;\n  const B = lab.values.im;\n  const showComp = lab.values.showComp;\n  const M = Math.sqrt(A * A + B * B);\n  const theta = Math.atan2(B, A);\n  const deg = (theta * 180 / Math.PI);\n\n  updateAudio(M);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const cx = 115;\n  const cy = 125;\n  const R = 60;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(cx - R - 20, cy);\n  ctx.lineTo(cx + R + 20, cy);\n  ctx.moveTo(cx, cy - R - 20);\n  ctx.lineTo(cx, cy + R + 20);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('Re(A)', cx + R - 8, cy + 14);\n  ctx.fillText('Im(B)', cx + 6, cy - R - 8);\n\n  const px = cx + A * R;\n  const py = cy - B * R;\n\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(px, cy);\n  ctx.lineTo(px, py);\n  ctx.lineTo(cx, py);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, cy);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(px, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n\n  if (M > 0.05) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    if (theta >= 0) {\n      ctx.arc(cx, cy, 18, 0, -theta, true);\n    } else {\n      ctx.arc(cx, cy, 18, 0, -theta, false);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath();\n  ctx.arc(px, py, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('矢量转换 (Fig. 8-9)', 32, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(235, 12);\n  ctx.lineTo(235, H - 12);\n  ctx.stroke();\n\n  const wx0 = 255;\n  const wx1 = 700;\n  const wW = wx1 - wx0;\n  const wy0 = 125;\n  const ampScale = 56;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gy = -1; gy <= 1; gy += 0.5) {\n    const yy = wy0 - gy * ampScale;\n    ctx.beginPath();\n    ctx.moveTo(wx0, yy);\n    ctx.lineTo(wx1, yy);\n    ctx.stroke();\n  }\n  for (let gx = 0; gx <= 4; gx++) {\n    const xx = wx0 + (gx / 4) * wW;\n    ctx.beginPath();\n    ctx.moveTo(xx, wy0 - ampScale * 1.45);\n    ctx.lineTo(xx, wy0 + ampScale * 1.45);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(wx0, wy0);\n  ctx.lineTo(wx1, wy0);\n  ctx.stroke();\n\n  if (showComp) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const t = i / 200;\n      const x = wx0 + t * wW;\n      const angle = t * Math.PI * 4;\n      const y = wy0 - A * Math.cos(angle) * ampScale;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const t = i / 200;\n      const x = wx0 + t * wW;\n      const angle = t * Math.PI * 4;\n      const y = wy0 - B * Math.sin(angle) * ampScale;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = i / 200;\n    const x = wx0 + t * wW;\n    const angle = t * Math.PI * 4;\n    const val = M * Math.cos(angle - theta);\n    const y = wy0 - val * ampScale;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域波形：A·cos(x) + B·sin(x) = M·cos(x - θ)', wx0, 20);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('━ A·cos(x)', wx0, H - 10);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('━ B·sin(x)', wx0 + 95, H - 10);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━ 合成余弦 M·cos', wx0 + 190, H - 10);\n\n  lab.setReadout(\n    `直角: Re=${A.toFixed(2)}, Im=${B.toFixed(2)}  |  极坐标: Mag(M)=${M.toFixed(3)}, Phase(θ)=${theta.toFixed(2)} rad (${deg.toFixed(1)}°)`\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "二、无损互转公式与“为什么只用余弦波”的秘密",
      "paragraphs": [
        "直角坐标与极坐标之间的转换**不会丢失任何信息**——只要拥有其中一种表示，就能精确反算出另一种。按照矢量勾股定理与三角函数投影，我们可以随时在两组数组间自由切换。",
        "在极坐标下，DFT 把长度为 `N` 的时域信号分解成了 `N/2 + 1` 个**余弦波**（每个波带有各自指定的幅度 `MagX[k]` 和相移 `PhaseX[k]`）。这里有一个关键问题：**为什么极坐标选用余弦波，而不是正弦波？**",
        "答案藏在**直流分量（DC, 频率为 0）**里：零频率的正弦波在所有采样点上恒等于 `sin(0) = 0`，根本无法表达信号的直流偏置；而 `cos(0) = 1`，正好能由 `MagX[0]` 完美承载直流分量！同时要注意，频域首尾两个采样点（直流 `k=0` 与奈奎斯特频率 `k=N/2`）的虚部与相位**必须都为零**。"
      ],
      "formula": {
        "expr": "MagX[k] = (ReX[k]² + ImX[k]²)^(1/2) ,  PhaseX[k] = arctan(ImX[k] / ReX[k])   |   ReX[k] = MagX[k]·cos(PhaseX[k]) ,  ImX[k] = MagX[k]·sin(PhaseX[k])",
        "explain": "左侧为直角转极坐标 (Eq. 8-6)，由勾股定理求总幅度 MagX[k]，由反正切求相位角 PhaseX[k]；右侧为极坐标转直角 (Eq. 8-7)，利用余弦和正弦投影恢复实部 ReX[k] 与虚部 ImX[k]。"
      }
    },
    {
      "type": "concept",
      "heading": "三、人类读图 vs 机器算力：正弦保真性的核心启示",
      "paragraphs": [
        "既然两种表示法包含**完全相同的信息**，工程上什么时候该用哪一种？答案非常明确：**数学推导与计算机程序运算用直角坐标；画图给人类观察与理解用极坐标**。典型程序在内部全程保持直角坐标计算，直到需要绘制频谱图给工程师看时，才做一次直角转极坐标。",
        "为什么人类看极坐标一目了然，看直角坐标却会“大脑过载”？这直击**正弦保真性（Sinusoidal Fidelity）**的本质：当一个正弦波输入线性系统时，输出必定还是**完全相同频率**的正弦波，唯一能改变的只有**幅度**和**相位**。",
        "极坐标正好直接刻画了系统如何放大/衰减各个频率的幅度（如低通滤波器的通带与阻带），以及如何延迟各个频率的相位；而若强行用直角坐标去理解系统，输入一个余弦波，输出却会同时冒出余弦和正弦的交叉耦合项（Cross-terms），让波形剧烈震荡、掩盖物理真相。"
      ],
      "formula": {
        "expr": "cos(ωn)  ──[ 线性系统 ]──▶  Mag(ω) · cos(ωn + Phase(ω))",
        "explain": "线性系统的正弦保真性：输入角频率为 ω 的余弦波，输出频率依然是 ω，系统对它的全部影响被浓缩在幅度响应 Mag(ω) 和相位响应 Phase(ω) 两个极坐标参数中。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：透视低通滤波器——直角“天书” vs 极坐标“真相”",
      "instruction": "重现原书 Fig. 8-10！调节截止频率与相位延迟，对比左侧剧烈震荡的 ReX/ImX 与右侧清晰无比的 MagX/PhaseX，并可切换相位卷绕观察锯齿波成因。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "滤波器截止频率 fc",
          "min": 0.08,
          "max": 0.42,
          "step": 0.01,
          "value": 0.25,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "delay",
          "label": "线性相位延迟斜率",
          "min": 2,
          "max": 20,
          "step": 2,
          "value": 10,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "wrapPhase",
          "label": "相位卷绕到 [-π, π] (呈锯齿状)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction drawSubplot(x0, y0, w, h, title, color, pts, yMin, yMax) {\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(x0, y0, w, h);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n\n  for (let gx = 1; gx < 5; gx++) {\n    const xx = x0 + (gx / 5) * w;\n    ctx.beginPath();\n    ctx.moveTo(xx, y0);\n    ctx.lineTo(xx, y0 + h);\n    ctx.stroke();\n  }\n\n  const zeroY = y0 + h - ((0 - yMin) / (yMax - yMin)) * h;\n  if (zeroY >= y0 && zeroY <= y0 + h) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.24)';\n    ctx.beginPath();\n    ctx.moveTo(x0, zeroY);\n    ctx.lineTo(x0 + w, zeroY);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  const n = pts.length - 1;\n  for (let i = 0; i <= n; i++) {\n    const px = x0 + (i / n) * w;\n    const clamped = Math.max(yMin, Math.min(yMax, pts[i]));\n    const py = y0 + h - ((clamped - yMin) / (yMax - yMin)) * h;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = color;\n  for (let i = 0; i <= n; i++) {\n    const px = x0 + (i / n) * w;\n    const clamped = Math.max(yMin, Math.min(yMax, pts[i]));\n    const py = y0 + h - ((clamped - yMin) / (yMax - yMin)) * h;\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText(title, x0 + 6, y0 + 13);\n}\n\nfunction draw() {\n  const fc = lab.values.fc;\n  const delay = lab.values.delay;\n  const wrapPhase = lab.values.wrapPhase;\n\n  const N = 40;\n  const reArr = [];\n  const imArr = [];\n  const magArr = [];\n  const phaseArr = [];\n\n  for (let i = 0; i <= N; i++) {\n    const f = (i / N) * 0.5;\n    const mag = 0.5 * (1 - Math.tanh((f - fc) / 0.045));\n    const rawPhase = -2 * Math.PI * f * delay;\n\n    let re = mag * Math.cos(rawPhase);\n    let im = mag * Math.sin(rawPhase);\n    let ph = rawPhase;\n\n    if (wrapPhase) {\n      ph = Math.atan2(Math.sin(rawPhase), Math.cos(rawPhase));\n    }\n    if (i === 0 || i === N) {\n      im = 0;\n      if (wrapPhase) ph = 0;\n    }\n\n    reArr.push(re);\n    imArr.push(im);\n    magArr.push(mag);\n    phaseArr.push(ph);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('直角坐标 (Rectangular) — 曲线晦涩难懂', 35, 16);\n  ctx.fillText('极坐标 (Polar) — 滤波特性一目了然', 395, 16);\n\n  drawSubplot(35, 24, 305, 92, 'a. Re X[ ]', '#38bdf8', reArr, -1.25, 1.25);\n  drawSubplot(35, 128, 305, 92, 'b. Im X[ ]', '#ec4899', imArr, -1.25, 1.25);\n\n  drawSubplot(395, 24, 305, 92, 'c. Mag X[ ] (幅度响应)', '#10b981', magArr, -0.2, 1.25);\n\n  const pMin = wrapPhase ? -Math.PI * 1.15 : -Math.PI * delay * 1.05;\n  const pMax = wrapPhase ? Math.PI * 1.15 : 1.0;\n  const pTitle = wrapPhase ? 'd. Phase X[ ] (卷绕至 ±π)' : 'd. Phase X[ ] (线性展开)';\n  drawSubplot(395, 128, 305, 92, pTitle, '#f59e0b', phaseArr, pMin, pMax);\n\n  ctx.fillStyle = '#64748b';\n  ctx.font = '10px monospace';\n  ctx.fillText('0           0.1          0.2          0.3          0.4         0.5 (f)', 35, 234);\n  ctx.fillText('0           0.1          0.2          0.3          0.4         0.5 (f)', 395, 234);\n\n  lab.setReadout(\n    `低通截止 fc=${fc.toFixed(2)} fs | 仅 f < ${fc.toFixed(2)} 显著通过 | 相位斜率=-${delay}样本 (首尾相位必为0)`\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "算力归直角，看图归极坐标：在代码内部尽量用 `ReX[]` 与 `ImX[]` 做加减乘除与滤波运算，避免频繁调用耗时且易错的 `sin/cos/arctan`；只在需要绘制频谱或分析物理意义时再转为 `MagX[]` 与 `PhaseX[]`。",
        "直流点必须用余弦承载：极坐标分解得到的是 `N/2 + 1` 个余弦波，因为 `sin(0) = 0` 无法表示直流分量。",
        "首尾两点归零检查：对于实数序列的 DFT，直流点 (`k = 0`) 与最高频点 (`k = N/2`) 的虚部 `ImX` 和相位 `PhaseX` 在理论上都必须为 `0`，写单元测试时可用这一规律快速验错。"
      ]
    }
  ]
});
