window.__BOOK_REGISTER_SECTION__("sec_120", {
  "title": "快速傅里叶变换是如何工作的 (How the FFT Works)",
  "intuition": "把一个庞大的 N 点信号像剥洋葱一样拆成 N 个 1 点信号（频谱就是它自己），再用“蝶形”模块逐级合并，把 O(N²) 的蛮力计算压缩到 O(N log₂ N)。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、先统一“黑话”：复数表示法与 FFT 三步大战略",
      "paragraphs": [
        "在进入 FFT 算法内部之前，必须先看懂教材里的**复数记号黑话**。在复数表示下，无论是时域还是频域，都只包含**一个**由 $N$ 个复数点构成的信号。每一个复数点内部都打包着两个独立数字：**实部** (`ReX[k]`) 和**虚部** (`ImX[k]`)。",
        "因此，后文在谈论“1 个点”、“1 个样本”或“1 个信号值”时，指的都是**实部与虚部的组合体**。当两个复数点相乘时，本质上是把 4 个实数分量交叉运算，重新组合出乘积的 2 个分量。",
        "搞定记号后，整个 FFT 的核心思想极其优雅，只分**三步走**：**第一步（时域拆解）**：把一个 $N$ 点的时域信号，拆解成 $N$ 个只包含 1 个点的极小信号；**第二步（单点变换）**：求出这 $N$ 个 1 点信号的频谱——听起来吓人，其实**1 点信号的频谱就等于它自己**，这一步代码量为零！**第三步（频域合成）**：按照拆解的严格逆序，把 $N$ 个 1 点频谱逐级合成为最终的 1 个 $N$ 点频谱。"
      ],
      "formula": {
        "expr": "X[k] = ReX[k] + j · ImX[k],   1点DFT(x[0]) = x[0]",
        "explain": "每个复数样本 X[k] 同时携带实部 ReX[k] 与虚部 ImX[k]；当信号长度缩减到 1 个点时，其频谱恒等于该点自身，无需任何乘法即可从时域跨入频域。"
      }
    },
    {
      "type": "concept",
      "heading": "二、交错拆解与位倒序排序 (Bit Reversal Sorting)",
      "paragraphs": [
        "第一步是如何把 $N$ 点信号拆成 $N$ 个单点信号的？FFT 采用**交错拆解 (Interlaced Decomposition)**：每一级都把当前的信号一分为二——偶数编号的样本放一组，奇数编号的样本放另一组。以 16 点信号为例，第 1 级拆成 2 个 8 点信号，第 2 级拆成 4 个 4 点信号……经过 $\\log_2 N$ 级（如 16 点需要 4 级，4096 点需要 12 级），最终得到 16 个单点信号。",
        "但真正在写程序时，难道要像图 12-2 那样开辟大量中间数组一层层搬运数据吗？完全不用！仔细观察拆解的最终排列顺序，你会发现一个惊人的数学巧合：整个 $\\log_2 N$ 级的交错拆解，在结果上**等价于对原始样本下标做一次二进制左右翻转**！",
        "这种操作叫做**位倒序排序 (Bit Reversal Sorting)**。比如 16 点信号（4 位二进制），样本 3 (`0011`) 左右翻转后变成 12 (`1100`)，样本 14 (`1110`) 变成 7 (`0111`)。工程上只需原地两两互换下标，就能一步到位完成全部时域拆解。"
      ],
      "formula": {
        "expr": "Stages = Log₂(N),   Index_new = BitReverse(Index_old)",
        "explain": "Log₂(N) 是 N 点信号逐级二分到底所需的级数；将原下标的二进制比特左右镜像翻转，即可直接得到拆解后的最终存放位置。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：交错拆解过程与位倒序映射透视器",
      "instruction": "拖动「拆解阶段」滑块观察偶奇分组的逐级分裂，再切换「追踪样本」观察它的二进制下标如何通过左右翻转直达最终位置。",
      "controls": [
        {
          "type": "slider",
          "id": "pow",
          "label": "信号规模 P (N=2^P)",
          "min": 2,
          "max": 4,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stage",
          "label": "拆解阶段",
          "min": 0,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "track",
          "label": "追踪样本号",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 3,
          "unit": ""
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction bitRev(v, b) {\n  let r = 0;\n  for (let i = 0; i < b; i++) { r = (r << 1) | ((v >> i) & 1); }\n  return r;\n}\nfunction toBin(v, b) {\n  return v.toString(2).padStart(b, '0');\n}\nfunction draw() {\n  const P = Math.round(lab.values.pow);\n  const N = 1 << P;\n  const stg = Math.min(Math.round(lab.values.stage), P);\n  const trk = Math.min(Math.round(lab.values.track), N - 1);\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  const stages = [];\n  let cur = [Array.from({ length: N }, (_, i) => i)];\n  stages.push(cur);\n  for (let s = 0; s < P; s++) {\n    const next = [];\n    for (const grp of cur) {\n      const ev = [], od = [];\n      for (let i = 0; i < grp.length; i++) {\n        if (i % 2 === 0) ev.push(grp[i]); else od.push(grp[i]);\n      }\n      next.push(ev, od);\n    }\n    cur = next;\n    stages.push(cur);\n  }\n\n  const leftW = 492, x0 = 14, rowH = (H - 24) / (P + 1);\n  const trkPos = [];\n  for (let s = 0; s <= P; s++) {\n    const grps = stages[s];\n    const y = 14 + s * rowH + rowH * 0.5;\n    const isActive = s === stg;\n    const isPast = s <= stg;\n    const gap = 4;\n    const totalGap = gap * (grps.length - 1);\n    const boxW = (leftW - totalGap) / grps.length;\n    let bx = x0;\n    for (let g = 0; g < grps.length; g++) {\n      const grp = grps[g];\n      ctx.fillStyle = isActive ? 'rgba(56,189,248,0.16)' : (isPast ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)');\n      ctx.strokeStyle = isActive ? '#38bdf8' : (isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)');\n      ctx.lineWidth = isActive ? 1.5 : 1;\n      ctx.fillRect(bx, y - 13, boxW, 26);\n      ctx.strokeRect(bx, y - 13, boxW, 26);\n      const cellW = boxW / grp.length;\n      ctx.font = N >= 16 ? '10px monospace' : '12px monospace';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'middle';\n      for (let i = 0; i < grp.length; i++) {\n        const val = grp[i];\n        const cx = bx + (i + 0.5) * cellW;\n        if (val === trk) {\n          trkPos.push({ x: cx, y: y });\n          ctx.fillStyle = isPast ? '#f59e0b' : 'rgba(245,158,11,0.4)';\n          ctx.beginPath();\n          ctx.arc(cx, y, Math.min(10, cellW * 0.44), 0, Math.PI * 2);\n          ctx.fill();\n          ctx.fillStyle = '#0f172a';\n          ctx.fillText(String(val), cx, y + 0.5);\n        } else {\n          ctx.fillStyle = isActive ? '#f8fafc' : (isPast ? 'rgba(248,250,252,0.8)' : 'rgba(248,250,252,0.28)');\n          ctx.fillText(String(val), cx, y + 0.5);\n        }\n      }\n      bx += boxW + gap;\n    }\n  }\n\n  if (stg > 0) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.8)';\n    ctx.lineWidth = 2;\n    for (let s = 0; s < stg; s++) {\n      ctx.beginPath();\n      ctx.moveTo(trkPos[s].x, trkPos[s].y + 12);\n      ctx.lineTo(trkPos[s + 1].x, trkPos[s + 1].y - 12);\n      ctx.stroke();\n    }\n  }\n\n  const rx = 522, rw = 184;\n  ctx.fillStyle = 'rgba(15,23,42,0.75)';\n  ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(rx, 16, rw, H - 32);\n  ctx.strokeRect(rx, 16, rw, H - 32);\n\n  const rev = bitRev(trk, P);\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('位倒序映射 (' + P + ' bit)', rx + rw / 2, 38);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('原始样本号', rx + rw / 2, 64);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 18px monospace';\n  ctx.fillText(trk + '  [' + toBin(trk, P) + ']', rx + rw / 2, 86);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('⇅ 二进制左右翻转', rx + rw / 2, 118);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('拆解后最终索引', rx + rw / 2, 148);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 18px monospace';\n  ctx.fillText(rev + '  [' + toBin(rev, P) + ']', rx + rw / 2, 170);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(trk === rev ? '对称位置，原地不动' : ('样本 ' + trk + ' 与 ' + rev + ' 互换'), rx + rw / 2, 202);\n\n  lab.setReadout('点数 N=' + N + ' (Log₂N=' + P + '级) | 当前第 ' + stg + ' 级 | 样本 ' + trk + ' (' + toBin(trk, P) + ') ⇄ 位置 ' + rev + ' (' + toBin(rev, P) + ')');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、频域合成的秘密：插零复制、正弦调制与“蝶形”单元",
      "paragraphs": [
        "第二步得到 $N$ 个 1 点频谱后，第三步要把它们逐级合成回去。遗憾的是，频域合成没有位倒序那样的捷径，必须**老老实实一级一级往回拼**：16 个 1 点谱合成 8 个 2 点谱，再合成 4 个 4 点谱……直到最终的 16 点频谱。",
        "怎么把两个 4 点频谱合成一个 8 点频谱？这必须与时域上“把两个 4 点信号 `abcd` 和 `efgh` 交错合并成 `aebfcgdh`”的操作严格对应！在时域里，交错合并等价于两步：**① 插零稀释**：把 `abcd` 变成 `a0b0c0d0`（奇数位插零），把 `efgh` 变成 `0e0f0g0h`（偶数位插零，即整体右移 1 个样本）；**② 直接相加**。",
        "根据傅里叶变换的对偶性质：**时域插零稀释，对应频域频谱的复制**（`ABCD` 变成 `ABCDABCD`）；而**时域右移 1 个样本，等价于与移位脉冲卷积，在频域上对应把频谱乘以一个特定频率的复正弦波** ($\times S$)。最后把两路复制并调制好的频谱对应相加，就完成了合成！",
        "把 4 点合 8 点的连线图继续拆解，你会发现整个信号流图只是把一个**2 输入、2 输出的基础模块**反复复制粘贴——它长得像蝴蝶的翅膀，因此被称为 **蝶形 (Butterfly)**，它就是整个 FFT 最核心的原子计算单元。"
      ],
      "formula": {
        "expr": "X[k] = E_dup[k] + S[k] · O_dup[k]",
        "explain": "E_dup 与 O_dup 分别是偶序列和奇序列复制后的频谱；S[k] 是因奇序列在时域右移 1 个样本而必须乘上的复正弦旋转因子（在蝶形上下两支中相位相差180°，正好实现镜像混叠的抵消）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：时域插零、正弦调制 (×S) 与混叠抵消听感对比",
      "instruction": "先点击「播放蝶形合成音」，然后尝试关闭「正弦调制 (×S)」或拖动「奇序列幅度」：观察右图 k3/k5 处的镜像混叠如何瞬间冒出，并对比听感上出现的刺耳 3 次谐波失真！",
      "controls": [
        {
          "type": "slider",
          "id": "oddAmp",
          "label": "奇序列信号幅度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "applySin",
          "label": "开启蝶形正弦调制 (×S)",
          "value": true
        },
        {
          "type": "slider",
          "id": "harmonic2",
          "label": "叠加二次谐波",
          "min": 0,
          "max": 0.8,
          "step": 0.1,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放蝶形合成音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet osc = null, gainNode = null;\n\nfunction updateAudio(reX, imX) {\n  const play = !!lab.values.play;\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (play && ac.state === 'suspended') ac.resume();\n    if (play) {\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        gainNode.gain.value = 0;\n        osc.frequency.value = 220;\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      const real = new Float32Array(5);\n      const imag = new Float32Array(5);\n      for (let k = 1; k <= 3; k++) {\n        real[k] = (2 / 8) * reX[k];\n        imag[k] = -(2 / 8) * imX[k];\n      }\n      const wave = ac.createPeriodicWave(real, imag, { disableNormalization: false });\n      osc.setPeriodicWave(wave);\n      gainNode.gain.setTargetAtTime(0.18, ac.currentTime, 0.02);\n    } else if (gainNode && ac.state !== 'closed') {\n      gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nfunction draw() {\n  const oddAmp = lab.values.oddAmp;\n  const applySin = !!lab.values.applySin;\n  const h2 = lab.values.harmonic2;\n\n  const x = [];\n  for (let n = 0; n < 8; n++) {\n    x.push(Math.cos(2 * Math.PI * n / 8) + h2 * Math.cos(4 * Math.PI * n / 8));\n  }\n  const xe = [x[0], x[2], x[4], x[6]];\n  const xo = [oddAmp * x[1], oddAmp * x[3], oddAmp * x[5], oddAmp * x[7]];\n\n  const reE = [0,0,0,0], imE = [0,0,0,0];\n  const reO = [0,0,0,0], imO = [0,0,0,0];\n  for (let k = 0; k < 4; k++) {\n    for (let m = 0; m < 4; m++) {\n      const ang = -2 * Math.PI * k * m / 4;\n      const c = Math.cos(ang), s = Math.sin(ang);\n      reE[k] += xe[m] * c; imE[k] += xe[m] * s;\n      reO[k] += xo[m] * c; imO[k] += xo[m] * s;\n    }\n  }\n\n  const reX = [], imX = [], magE = [], magX = [];\n  for (let k = 0; k < 8; k++) {\n    const k4 = k % 4;\n    const ang = applySin ? (-2 * Math.PI * k / 8) : 0;\n    const wc = Math.cos(ang), ws = Math.sin(ang);\n    const modRe = reO[k4] * wc - imO[k4] * ws;\n    const modIm = reO[k4] * ws + imO[k4] * wc;\n    reX[k] = reE[k4] + modRe;\n    imX[k] = imE[k4] + modIm;\n    magE[k] = Math.hypot(reE[k4], imE[k4]);\n    magX[k] = Math.hypot(reX[k], imX[k]);\n  }\n\n  const y = [];\n  for (let n = 0; n < 8; n++) {\n    let sum = 0;\n    for (let k = 0; k < 8; k++) {\n      const ang = 2 * Math.PI * k * n / 8;\n      sum += reX[k] * Math.cos(ang) - imX[k] * Math.sin(ang);\n    }\n    y.push(sum / 8);\n  }\n\n  updateAudio(reX, imX);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(356, 12); ctx.lineTo(356, H - 12); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域：插零稀释与交错合并 (8点)', 16, 22);\n\n  function drawStems(vals, baseY, ampScale, color, label) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath(); ctx.moveTo(18, baseY); ctx.lineTo(338, baseY); ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(label, 18, baseY - 22);\n    for (let n = 0; n < 8; n++) {\n      const px = 42 + n * 38;\n      const py = baseY - vals[n] * ampScale;\n      ctx.strokeStyle = color;\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(px, baseY); ctx.lineTo(px, py); ctx.stroke();\n      ctx.fillStyle = Math.abs(vals[n]) < 1e-4 ? 'rgba(255,255,255,0.25)' : color;\n      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  const dilE = [xe[0], 0, xe[1], 0, xe[2], 0, xe[3], 0];\n  const dilO = [0, xo[0], 0, xo[1], 0, xo[2], 0, xo[3]];\n  drawStems(dilE, 64, 18, '#38bdf8', '偶插零 a0b0c0d0');\n  drawStems(dilO, 124, 18, '#ec4899', '奇插零+右移 0e0f0g0h');\n  drawStems(y, 196, 18, '#10b981', '频域反演合成波形 y[n]');\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('频域：频谱复制与蝶形抵消 |X[k]|', 374, 22);\n\n  const fBaseY = 204, fScale = 18;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(374, fBaseY); ctx.lineTo(702, fBaseY); ctx.stroke();\n\n  const aliasEnergy = magX[3] + magX[5];\n  for (let k = 0; k < 8; k++) {\n    const bx = 386 + k * 39;\n    const bw = 24;\n    const hE = Math.min(140, magE[k] * fScale);\n    const hX = Math.min(145, magX[k] * fScale);\n    ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n    ctx.setLineDash([3, 2]);\n    ctx.strokeRect(bx, fBaseY - hE, bw, hE);\n    ctx.setLineDash([]);\n\n    const isAliasBin = (k === 3 || k === 5);\n    ctx.fillStyle = (isAliasBin && magX[k] > 0.05) ? '#f59e0b' : '#10b981';\n    ctx.fillRect(bx + 3, fBaseY - hX, bw - 6, hX);\n\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('k' + k, bx + bw / 2, fBaseY + 14);\n    if (hX > 2) {\n      ctx.fillStyle = (isAliasBin && magX[k] > 0.05) ? '#f59e0b' : '#f8fafc';\n      ctx.fillText(magX[k].toFixed(1), bx + bw / 2, fBaseY - hX - 6);\n    }\n  }\n\n  ctx.textAlign = 'right';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = aliasEnergy < 0.05 ? '#10b981' : '#f59e0b';\n  ctx.fillText(aliasEnergy < 0.05 ? '✓ 镜像混叠 k3/k5 已完全抵消' : '⚠ 镜像混叠 k3/k5 残留: ' + aliasEnergy.toFixed(2), 702, 42);\n\n  lab.setReadout('奇幅度=' + oddAmp.toFixed(2) + ' | 正弦调制(×S): ' + (applySin ? '开启 (完美抵消)' : '关闭 (3次谐波混叠)') + ' | 混叠残留=' + aliasEnergy.toFixed(2) + (lab.values.play ? ' | 🔊 220Hz合成音播放中' : ''));\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "四、FFT 全局流程图与三重循环架构",
      "paragraphs": [
        "把上面三步拼接起来，就得到了图 12-7 所示的完整 FFT 架构：顶部是**位倒序排序**（完成时域拆解）；由于单点信号频谱等于自身，第二步在程序框图中直接“隐身”；下半部分则是频域合成，它由**三重嵌套循环**驱动：",
        "**外层循环**遍历 $\\log_2 N$ 个合成阶段（对应从 $N$ 个 1 点谱自底向上合并到 1 个 $N$ 点谱的每一层）；**中层循环**遍历当前阶段里的每一个独立子频谱（图 12-2 同一行里的每一个方框）；**内层循环**则驱动**蝶形单元**计算每个子频谱内部成对的样本点。",
        "夹在循环之间的两个**开销模块 (Overhead)**，专门负责计算内中层循环的起止下标，以及蝶形运算所需的正弦/余弦旋转因子。正是这种极其规整的三重循环，让计算量从直接相关的 $N^2$ 骤降到了 $N \\log_2 N$。"
      ],
      "formula": {
        "expr": "Complexity_DFT ≈ N²,   Complexity_FFT ≈ (N / 2) · Log₂(N) Butterflies",
        "explain": "直接相关法 DFT 需要 N² 次乘加运算；FFT 共有 Log₂(N) 级，每一级执行 N/2 个蝶形单元，总运算量呈对数级压缩。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 3：三重循环蝶形流图与 O(N log₂ N) 算力压缩实验室",
      "instruction": "调节「信号规模 N」与「当前合成级」，观察三重循环如何分工遍历所有蝶形单元，并对比 N=1024 时超过百倍的算力提速。",
      "controls": [
        {
          "type": "slider",
          "id": "nPow",
          "label": "信号规模 P (N=2^P)",
          "min": 2,
          "max": 10,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stageIdx",
          "label": "观察合成阶段",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": " 级"
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "自动扫描蝶形循环",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet cursor = 0;\n\nfunction render() {\n  const P = Math.round(lab.values.nPow);\n  const N = 1 << P;\n  const stg = Math.min(Math.max(1, Math.round(lab.values.stageIdx)), P);\n  const anim = !!lab.values.animate;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  const numSubDFTs = N >> stg;\n  const subSize = 1 << stg;\n  const halfSize = subSize >> 1;\n  const totalButterflies = (N >> 1);\n  const activeBf = anim ? (Math.floor(cursor) % totalButterflies) : 0;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('三重循环蝶形网络 (N=' + N + ', 第 ' + stg + '/' + P + ' 级)', 16, 22);\n\n  if (N <= 16) {\n    const colW = 390 / P;\n    const xStart = 36;\n    const rowStep = (H - 56) / Math.max(1, N - 1);\n    const yStart = 42;\n    for (let s = 1; s <= P; s++) {\n      const span = 1 << (s - 1);\n      const grpSize = 1 << s;\n      const x1 = xStart + (s - 1) * colW;\n      const x2 = xStart + s * colW;\n      const isCurStage = (s === stg);\n      let sBfIdx = 0;\n      for (let base = 0; base < N; base += grpSize) {\n        for (let j = 0; j < span; j++) {\n          const iTop = base + j;\n          const iBot = base + j + span;\n          const y1 = yStart + iTop * rowStep;\n          const y2 = yStart + iBot * rowStep;\n          const isHighlight = isCurStage && (sBfIdx === activeBf);\n          ctx.strokeStyle = isHighlight ? '#f59e0b' : (isCurStage ? 'rgba(16,185,129,0.55)' : 'rgba(255,255,255,0.14)');\n          ctx.lineWidth = isHighlight ? 2.2 : 1;\n          ctx.beginPath();\n          ctx.moveTo(x1, y1); ctx.lineTo(x2, y1);\n          ctx.moveTo(x1, y2); ctx.lineTo(x2, y2);\n          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);\n          ctx.moveTo(x1, y2); ctx.lineTo(x2, y1);\n          ctx.stroke();\n          sBfIdx++;\n        }\n      }\n    }\n    for (let s = 0; s <= P; s++) {\n      const px = xStart + s * colW;\n      for (let i = 0; i < N; i++) {\n        const py = yStart + i * rowStep;\n        ctx.fillStyle = (s === stg || s === stg - 1) ? '#38bdf8' : 'rgba(248,250,252,0.45)';\n        ctx.beginPath(); ctx.arc(px, py, N === 16 ? 2.8 : 4, 0, Math.PI * 2); ctx.fill();\n      }\n    }\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    for (let s = 1; s <= P; s++) {\n      ctx.fillStyle = s === stg ? '#10b981' : '#64748b';\n      ctx.fillText('S' + s, xStart + (s - 0.5) * colW, H - 10);\n    }\n  } else {\n    const colW = 410 / P;\n    const xStart = 20;\n    for (let s = 1; s <= P; s++) {\n      const x = xStart + (s - 1) * colW;\n      const isCur = (s === stg);\n      ctx.fillStyle = isCur ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)';\n      ctx.strokeStyle = isCur ? '#10b981' : 'rgba(255,255,255,0.15)';\n      ctx.lineWidth = isCur ? 1.8 : 1;\n      ctx.fillRect(x + 2, 42, colW - 6, 150);\n      ctx.strokeRect(x + 2, 42, colW - 6, 150);\n      ctx.fillStyle = isCur ? '#10b981' : '#94a3b8';\n      ctx.font = 'bold 11px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText('S' + s, x + colW / 2 - 1, 60);\n      ctx.font = '10px monospace';\n      ctx.fillStyle = isCur ? '#f8fafc' : '#64748b';\n      ctx.fillText((N >> s) + '组', x + colW / 2 - 1, 108);\n      ctx.fillText('×' + (1 << (s - 1)) + '蝶', x + colW / 2 - 1, 126);\n    }\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('第 ' + stg + ' 级：中层循环遍历 ' + numSubDFTs + ' 个子频谱，内层每组执行 ' + halfSize + ' 次蝶形 (×S)', 20, 214);\n  }\n\n  const rx = 466, rw = 238;\n  ctx.fillStyle = 'rgba(15,23,42,0.75)';\n  ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(rx, 16, rw, H - 32);\n  ctx.strokeRect(rx, 16, rw, H - 32);\n\n  const dftOps = N * N;\n  const fftOps = N * P;\n  const speedup = dftOps / fftOps;\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('算力碾压对比 (复数运算量级)', rx + 14, 38);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('直接DFT (N²): ' + dftOps.toLocaleString(), rx + 14, 68);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(rx + 14, 76, rw - 28, 16);\n\n  const fftBarW = Math.max(4, (rw - 28) * (fftOps / dftOps));\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('FFT (N·Log₂N): ' + fftOps.toLocaleString(), rx + 14, 114);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rx + 14, 122, fftBarW, 16);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 16px sans-serif';\n  ctx.fillText('提速比: ' + speedup.toFixed(1) + 'x', rx + 14, 164);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('外层循环: ' + P + ' 级 | 中层: ' + numSubDFTs + ' 组', rx + 14, 190);\n  ctx.fillText('内层蝶形: ' + halfSize + ' 次/组 (共 ' + totalButterflies + ' 蝶/级)', rx + 14, 208);\n\n  lab.setReadout('N=' + N + ' | 直接DFT≈' + dftOps.toLocaleString() + ' | FFT≈' + fftOps.toLocaleString() + ' | 加速 ' + speedup.toFixed(1) + ' 倍 | 第' + stg + '级: ' + numSubDFTs + '组×' + halfSize + '蝶');\n}\n\nlab.onUpdate(() => render());\nlab.onLoop((dt) => {\n  if (lab.values.animate) {\n    cursor += dt * 3.5;\n    render();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（单点之后不再是时域）：拆解到 1 个点时虽然没做任何乘法，但心里必须清楚——此时数组里装的已经是频域数据了，后续每一步合并都是在操作频谱。",
        "避坑 2（奇序列必须乘正弦因子 ×S）：把两个子频谱复制合并时，绝对不能直接相加；奇序列在时域右移了 1 个样本，频域必须乘上旋转正弦波，否则镜像混叠无法抵消。",
        "避坑 3（长度必须补齐 2 的整数次幂）：标准基-2 FFT 依赖二进制比特左右翻转（位倒序）和逐级二分；工程上若信号长度不是 2^P，需先补零 (Zero-padding) 再送入算法。",
        "核心结论：FFT 并不是近似算法，它算出的结果与直接相关法 DFT 在数值上完全等价，只是靠“位倒序拆解 + 蝶形复用”消除了大量重复的三角函数乘法。"
      ]
    }
  ]
});
