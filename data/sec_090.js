window.__BOOK_REGISTER_SECTION__("sec_090", {
  "title": "用联立方程组求离散傅里叶变换 (DFT by Simultaneous Equations)",
  "intuition": "把时域的 N 个采样点看作 N 条已知等式，反解出构成信号的 N 个正弦与余弦基函数的未知振幅——虽然算力代价高到没法实用，但它从代数根源上证明了“为什么信号一定能拆成正弦波”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把 DFT 问题翻译成“N 元一次方程组”",
      "paragraphs": [
        "在上一节我们知道，任何长度为 `N` 的离散时域信号 `x[i]`，都可以由一组余弦波和正弦波叠加合成（Synthesis）。通常我们顺着这个方向把频域合成时域；但如果反过来——**已知时域的 `N` 个采样点，如何倒推出频域的振幅？**",
        "最直觉的代数思路就是列方程组求解。实数 DFT 的频域一共有 `N/2 + 1` 个余弦分量（`Re X[k]`）和 `N/2 + 1` 个正弦分量（`Im X[k]`），表面上看有 `N + 2` 个未知数。但其中直流（`k = 0`）和奈奎斯特频率（`k = N/2`）对应的正弦波在所有整数采样点上恒为零（`sin(0) = 0` 且 `sin(πi) = 0`），因此这两个虚部数值必然为 `0`。忽略这两个已知的零值后，我们需要求解的真正未知数恰好就是 **`N` 个**！",
        "基础代数告诉我们：解 `N` 个未知数，只需要 `N` 个线性无关的方程。把所有正弦与余弦基函数在第 `0` 个采样点的值加起来，令其等于 `x[0]`，就得到了第 1 个方程；对剩余的 `i = 1, 2, ..., N-1` 个采样点如法炮制，就凑齐了完整的 **`N` 个联立方程**，接着用经典的**高斯消元法（Gauss Elimination）**即可算出全部频域振幅。"
      ],
      "formula": {
        "expr": "x[i] = Σ(k=0..N/2) a[k]·cos(2πki/N) + Σ(k=1..N/2-1) b[k]·sin(2πki/N)  (i = 0, 1, ..., N-1)",
        "explain": "x[i] 是第 i 个已知的时域采样点；a[k] 和 b[k] 分别是第 k 个余弦、正弦基函数的未知振幅（对应加权缩放后的 Re X[k] 与 -Im X[k]）；i 从 0 到 N-1 共给出 N 条独立的线性方程。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：4 点信号的联立方程组反解与声波合成",
      "instruction": "拖动左侧 4 个时域采样点滑块 x[0]~x[3]，观察右侧高斯消元反解出的 4 个独立振幅（a0, a1, b1, a2），并点击播放试听由这组解合成的真实周期声波。",
      "controls": [
        {
          "type": "slider",
          "id": "x0",
          "label": "采样点 x[0]",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "x1",
          "label": "采样点 x[1]",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "x2",
          "label": "采样点 x[2]",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": -1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "x3",
          "label": "采样点 x[3]",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showBasis",
          "label": "叠加显示 4 个拆解出的基函数",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听合成周期声波",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height, ctx = lab.ctx;\nlet ac = null, osc = null, masterGain = null;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (masterGain) {\n    try { masterGain.disconnect(); } catch (e) {}\n    masterGain = null;\n  }\n}\n\nfunction updateAudio(a1, b1, a2) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  if (!ac) ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  const real = new Float32Array([0, a1, a2]);\n  const imag = new Float32Array([0, b1, 0]);\n  const wave = ac.createPeriodicWave(real, imag, { disableNormalization: true });\n  const norm = Math.max(1, Math.hypot(a1, b1, a2));\n  const targetGain = 0.16 / norm;\n  if (!osc) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = targetGain;\n    masterGain.connect(ac.destination);\n    osc = ac.createOscillator();\n    osc.frequency.value = 220;\n    osc.setPeriodicWave(wave);\n    osc.connect(masterGain);\n    osc.start();\n  } else {\n    osc.setPeriodicWave(wave);\n    masterGain.gain.setTargetAtTime(targetGain, ac.currentTime, 0.02);\n  }\n}\n\nlab.onUpdate(() => {\n  const x0 = lab.values.x0, x1 = lab.values.x1, x2 = lab.values.x2, x3 = lab.values.x3;\n  const showBasis = lab.values.showBasis;\n  const a0 = (x0 + x1 + x2 + x3) / 4;\n  const a1 = (x0 - x2) / 2;\n  const b1 = (x1 - x3) / 2;\n  const a2 = (x0 - x1 + x2 - x3) / 4;\n\n  updateAudio(a1, b1, a2);\n\n  ctx.clearRect(0, 0, W, H);\n  const px0 = 42, py0 = 24, pw = 316, ph = 188;\n  const toX = (t) => px0 + (t / 4) * pw;\n  const toY = (v) => py0 + ph / 2 - (v / 3.0) * (ph / 2);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v = -2; v <= 2; v++) {\n    const y = toY(v);\n    ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px0 + pw, y); ctx.stroke();\n  }\n  for (let t = 0; t <= 4; t++) {\n    const x = toX(t);\n    ctx.beginPath(); ctx.moveTo(x, py0); ctx.lineTo(x, py0 + ph); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(px0, toY(0)); ctx.lineTo(px0 + pw, toY(0)); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域采样点 x[0..3] 与合成波形', px0, 15);\n  for (let t = 0; t < 4; t++) {\n    ctx.fillText('x[' + t + ']', toX(t) - 8, py0 + ph + 14);\n  }\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(px0, py0, pw, ph);\n  ctx.clip();\n\n  if (showBasis) {\n    const drawWave = (fn, color, dashed) => {\n      ctx.save();\n      ctx.strokeStyle = color;\n      ctx.lineWidth = 1.4;\n      if (dashed) ctx.setLineDash([4, 3]);\n      ctx.beginPath();\n      for (let i = 0; i <= 120; i++) {\n        const t = (i / 120) * 4;\n        const x = toX(t), y = toY(fn(t));\n        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n      }\n      ctx.stroke();\n      ctx.restore();\n    };\n    drawWave(() => a0, '#f59e0b', true);\n    drawWave((t) => a1 * Math.cos(Math.PI * t / 2), '#38bdf8', false);\n    drawWave((t) => b1 * Math.sin(Math.PI * t / 2), '#ec4899', false);\n    drawWave((t) => a2 * Math.cos(Math.PI * t), 'rgba(248,250,252,0.45)', true);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 160; i++) {\n    const t = (i / 160) * 4;\n    const val = a0 + a1 * Math.cos(Math.PI * t / 2) + b1 * Math.sin(Math.PI * t / 2) + a2 * Math.cos(Math.PI * t);\n    const x = toX(t), y = toY(val);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  const xs = [x0, x1, x2, x3];\n  for (let i = 0; i < 4; i++) {\n    const sx = toX(i), sy = toY(xs[i]), zy = toY(0);\n    ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(sx, zy); ctx.lineTo(sx, sy); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(376, 12); ctx.lineTo(376, H - 12); ctx.stroke();\n\n  const rx = 396;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('4×4 联立方程组解出的未知振幅：', rx, 20);\n\n  const coeffs = [\n    { name: 'a0 (直流 DC)', val: a0, color: '#f59e0b' },\n    { name: 'a1 (余弦 1周期)', val: a1, color: '#38bdf8' },\n    { name: 'b1 (正弦 1周期)', val: b1, color: '#ec4899' },\n    { name: 'a2 (余弦 2周期)', val: a2, color: '#cbd5e1' }\n  ];\n  const barCenterX = rx + 195;\n  const maxBarW = 80;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(barCenterX, 34); ctx.lineTo(barCenterX, 165); ctx.stroke();\n\n  coeffs.forEach((c, idx) => {\n    const cy = 50 + idx * 32;\n    ctx.fillStyle = c.color;\n    ctx.font = '11px sans-serif';\n    ctx.fillText(c.name, rx, cy + 4);\n    const bw = Math.max(-maxBarW, Math.min(maxBarW, (c.val / 2) * maxBarW));\n    ctx.fillRect(bw >= 0 ? barCenterX : barCenterX + bw, cy - 7, Math.abs(bw), 14);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText(c.val.toFixed(2), barCenterX + maxBarW + 8, cy + 4);\n  });\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('x[0] = a0 + a1 + a2     = ' + x0.toFixed(1), rx, 186);\n  ctx.fillText('x[1] = a0 + b1 - a2     = ' + x1.toFixed(1), rx, 201);\n  ctx.fillText('x[2] = a0 - a1 + a2     = ' + x2.toFixed(1), rx, 216);\n  ctx.fillText('x[3] = a0 - b1 - a2     = ' + x3.toFixed(1), rx, 231);\n\n  lab.setReadout('方程解：a0=' + a0.toFixed(2) + ' | a1=' + a1.toFixed(2) + ' | b1=' + b1.toFixed(2) + ' | a2=' + a2.toFixed(2) + (lab.values.play ? ' | 正在合成 220Hz/440Hz 声波' : ''));\n});"
    },
    {
      "type": "concept",
      "heading": "为什么工程上“几乎不用它”，却非学不可？",
      "paragraphs": [
        "作者在书中直言不讳：用高斯消元解联立方程组**需要极其庞大的计算量，在数字信号处理（DSP）工程实践中几乎从不使用**。求解 `N` 元一次方程组的时间复杂度高达 `O(N³)`；哪怕信号只有 512 个点，运算次数也会飙升到接近 1 亿次量级，相比相关法（`O(N²)`）和快速傅里叶变换 FFT（`O(N·log₂N)`）慢了成千上万倍。",
        "既然这么慢，为什么还要专门花篇幅讲解？因为它回答了三个最底层的理论问题：第一，**为什么任意离散信号都能被唯一拆解成正弦波之和**（只要系数矩阵满秩，方程组就有唯一解）；第二，**到底需要多少个正弦/余弦波才够用**（恰好 `N` 个，多一个冗余，少一个无法拟合所有点）；第三，**基函数必须满足线性无关（Linearly Independent）**——如果某两个基函数可以互相线性表出，方程组就会退化，微小的采样噪声都会让反解出的频域振幅剧烈发散甚至无解。"
      ],
      "formula": {
        "expr": "计算复杂度：高斯消元 ≈ (2/3)·N³  ≫  相关法 ≈ N²  ≫  FFT ≈ N·log₂(N)",
        "explain": "N 是时域信号的采样点数。随着 N 增大，联立方程法的立方级算力开销会瞬间爆炸，而 FFT 仅呈近线性增长，但三者算出的频域结果在数学上完全一致。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：基函数线性无关性检验与三大算法算力对比",
      "instruction": "先将基函数夹角 θ 从 90° 慢慢调小到 5° 并开启“微小噪声”，观察交点如何疯狂漂移；再拖动点数 N，对比三种 DFT 算法的计算量爆炸差距。",
      "controls": [
        {
          "type": "slider",
          "id": "angle",
          "label": "基函数夹角 θ（线性无关度）",
          "min": 5,
          "max": 90,
          "step": 1,
          "value": 90,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "perturb",
          "label": "给测量值加 +0.15 微小噪声",
          "value": false
        },
        {
          "type": "slider",
          "id": "nSize",
          "label": "信号点数 N（算力对比）",
          "min": 8,
          "max": 256,
          "step": 8,
          "value": 64,
          "unit": " 点"
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height, ctx = lab.ctx;\n\nlab.onUpdate(() => {\n  const deg = lab.values.angle;\n  const N = lab.values.nSize;\n  const perturb = lab.values.perturb;\n  const theta = deg * Math.PI / 180;\n  const phi1 = Math.PI / 4 - theta / 2;\n  const phi2 = Math.PI / 4 + theta / 2;\n\n  const c1 = Math.cos(phi1), s1 = Math.sin(phi1);\n  const c2 = Math.cos(phi2), s2 = Math.sin(phi2);\n  const eps = perturb ? 0.15 : 0.0;\n  const y1 = c1 * 1.0 + s1 * 0.8 + eps;\n  const y2 = c2 * 1.0 + s2 * 0.8 - eps;\n\n  const det = Math.sin(theta);\n  const a1Sol = (y1 * s2 - y2 * s1) / det;\n  const a2Sol = (y2 * c1 - y1 * c2) / det;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 28, ly = 24, lw = 290, lh = 192;\n  const minV = -1.5, maxV = 3.5;\n  const toPX = (a1) => lx + ((a1 - minV) / (maxV - minV)) * lw;\n  const toPY = (a2) => ly + lh - ((a2 - minV) / (maxV - minV)) * lh;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v = -1; v <= 3; v++) {\n    ctx.beginPath(); ctx.moveTo(toPX(v), ly); ctx.lineTo(toPX(v), ly + lh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(lx, toPY(v)); ctx.lineTo(lx + lw, toPY(v)); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(toPX(0), ly); ctx.lineTo(toPX(0), ly + lh); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(lx, toPY(0)); ctx.lineTo(lx + lw, toPY(0)); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('线性无关性几何检验 (2元方程交点)', lx, 15);\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(lx, ly, lw, lh);\n  ctx.clip();\n\n  const drawEqLine = (c, s, yVal, color) => {\n    const p0x = c * yVal, p0y = s * yVal;\n    const dx = -s * 12, dy = c * 12;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(toPX(p0x - dx), toPY(p0y - dy));\n    ctx.lineTo(toPX(p0x + dx), toPY(p0y + dy));\n    ctx.stroke();\n  };\n  drawEqLine(c1, s1, y1, '#38bdf8');\n  drawEqLine(c2, s2, y2, '#ec4899');\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.4)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.arc(toPX(1.0), toPY(0.8), 6, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = perturb && det < 0.25 ? '#f59e0b' : '#10b981';\n  ctx.beginPath();\n  ctx.arc(toPX(a1Sol), toPY(a2Sol), 5.5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.restore();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('行列式 det = sin(' + deg + '°) = ' + det.toFixed(3), lx, ly + lh + 15);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(338, 12); ctx.lineTo(338, H - 12); ctx.stroke();\n\n  const rx = 358, rw = 340;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('N = ' + N + ' 点时三大算法运算量对比（对数刻度）', rx, 20);\n\n  const opsGauss = Math.round((2 / 3) * N * N * N);\n  const opsCorr = N * N;\n  const opsFFT = Math.round(N * Math.log2(N));\n\n  const items = [\n    { label: '联立方程 (高斯消元 ~2/3·N³)', val: opsGauss, color: '#ec4899' },\n    { label: '相关法 DFT (~N²)', val: opsCorr, color: '#f59e0b' },\n    { label: '快速傅里叶 FFT (~N·log₂N)', val: opsFFT, color: '#10b981' }\n  ];\n\n  const maxLog = Math.log10((2 / 3) * 256 * 256 * 256);\n  items.forEach((it, idx) => {\n    const iy = 56 + idx * 54;\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(it.label, rx, iy);\n    const logVal = Math.max(0.2, Math.log10(Math.max(1, it.val)));\n    const barW = Math.max(8, (logVal / maxLog) * (rw - 105));\n    ctx.fillStyle = it.color;\n    ctx.fillRect(rx, iy + 8, barW, 18);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.fillText(it.val.toLocaleString() + ' 次', rx + barW + 8, iy + 21);\n  });\n\n  const speedup = (opsGauss / opsFFT).toFixed(1);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('当前 FFT 比联立方程组快约 ' + speedup + ' 倍！', rx, 224);\n\n  const errDist = Math.hypot(a1Sol - 1.0, a2Sol - 0.8);\n  lab.setReadout('解=(' + a1Sol.toFixed(2) + ', ' + a2Sol.toFixed(2) + ') | 误差漂移=' + errDist.toFixed(2) + ' | 高斯消元=' + opsGauss.toLocaleString() + '次 vs FFT=' + opsFFT.toLocaleString() + '次');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "未知数刚好等于 N：实数 DFT 虽有 N/2+1 个实部与 N/2+1 个虚部，但 Im X[0] 和 Im X[N/2] 恒为 0，去掉这两个零值后，正好由 N 个时域样本列出的 N 个方程唯一解出。",
        "线性无关是硬约束：正弦与余弦基函数必须相互线性无关（正交是线性无关的最优特例），否则方程组矩阵病态或奇异，无法稳定拆解信号。",
        "结果全等，速度天差地别：联立方程法（O(N³)）、相关法（O(N²)）与 FFT（O(N·log₂N)）算出的 DFT 数值完全相同；实际写代码时，小于 32 点用相关法，大于等于 32 点无脑选 FFT，绝不要手写高斯消元算 DFT。"
      ]
    }
  ]
});
