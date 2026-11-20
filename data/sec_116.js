window.__BOOK_REGISTER_SECTION__("sec_116", {
  "title": "吉布斯效应：为什么有限正弦波拼不出完美直角？ (Gibbs Effect)",
  "intuition": "只要强行砍掉高频正弦波，信号在陡峭跳变边缘就必然会“刹不住车”，激发出约 9% 的固定过冲与衰减振铃——离散信号补全所有频率即可消除，而连续信号永远会留下一根零宽度的毛刺。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、频率截断与边缘“刹车失灵”：图 11-6 背后的秘密",
      "paragraphs": [
        "在数字信号处理中，任何离散信号都可以看作一系列正弦波的叠加。原书图 11-6(h) 展示了一个长度为 **1024 点** 的时域信号（包含一个矩形脉冲和一段上升斜坡）。根据离散傅里叶变换（DFT）的规律，完整重构这 1024 个采样点，正好需要 **513 个独立频率分量**（频率编号 `0` 到 `512`）。",
        "如果我们只保留其中一部分低频分量——例如只取 `0` 到 `100` 号频率，把 `101` 到 `512` 号高频全设为 `0`，再用逆变换（IDFT）拼回时域波形——就会发现平滑区域还原得不错，但一遇到**陡峭边缘（edges）**就出问题了。",
        "仔细观察图 11-6(h)，其实隐藏着 **3 处陡峭边缘**：矩形脉冲的左右两个垂直边，以及**第 1023 点与第 0 点之间**的跳变（因为 DFT 默认把时域信号当成首尾相接的周期信号）。在这些边缘处，重构波形都会冲过头并来回震荡，这种现象被称为**过冲（overshoot）**和**振铃（ringing，即衰减振荡）**——数学物理学家约西亚·吉布斯（Josiah Gibbs）在 1899 年解释了这一现象，因此得名**吉布斯效应**。"
      ],
      "formula": {
        "expr": "x_K[n] = (1 / N) · Σ_{k=-K}^{K} X[k] · e^(j · 2πkn / N)",
        "explain": "x_K[n] 是只保留 0 到 K 号频率后重构出的时域信号；N = 1024 是总采样点数；X[k] 是原信号的 DFT 频谱；当 K < 512 时，相当于对高频成分做了硬截断。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复刻图 11-6——实时截取 DFT 频率观察过冲与振铃",
      "instruction": "拖动「保留最高频率 K」滑块，对照原书图 (a)~(g) 观察 3 处边缘的振铃变化；开启「放大脉冲左边缘」可看清过冲峰值幅度与宽度的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "kMax",
          "label": "保留最高频率 K (0~K)",
          "min": 0,
          "max": 512,
          "step": 1,
          "value": 30,
          "unit": " 号"
        },
        {
          "type": "toggle",
          "id": "showTarget",
          "label": "显示原始目标信号 (h)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "zoomEdge",
          "label": "放大脉冲左边缘 (n=230~370)",
          "value": false
        }
      ],
      "jsCode": "const N = 1024;\nconst target = new Float64Array(N);\nfor (let n = 0; n < N; n++) {\n  if (n >= 290 && n < 490) target[n] = 1.0;\n  else if (n >= 780 && n < 960) target[n] = 0.75 * (n - 780) / 180;\n  else if (n >= 960) target[n] = 0.75;\n  else target[n] = 0.0;\n}\n\nfunction fft(re, im, invert) {\n  const n = re.length;\n  for (let i = 1, j = 0; i < n; i++) {\n    let bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      let t = re[i]; re[i] = re[j]; re[j] = t;\n      t = im[i]; im[i] = im[j]; im[j] = t;\n    }\n  }\n  for (let len = 2; len <= n; len <<= 1) {\n    const ang = 2 * Math.PI / len * (invert ? 1 : -1);\n    const wLenRe = Math.cos(ang), wLenIm = Math.sin(ang);\n    for (let i = 0; i < n; i += len) {\n      let wRe = 1, wIm = 0;\n      for (let j = 0; j < len / 2; j++) {\n        const uRe = re[i + j], uIm = im[i + j];\n        const vRe = re[i + j + len / 2] * wRe - im[i + j + len / 2] * wIm;\n        const vIm = re[i + j + len / 2] * wIm + im[i + j + len / 2] * wRe;\n        re[i + j] = uRe + vRe;\n        im[i + j] = uIm + vIm;\n        re[i + j + len / 2] = uRe - vRe;\n        im[i + j + len / 2] = uIm - vIm;\n        const nextWRe = wRe * wLenRe - wIm * wLenIm;\n        wIm = wRe * wLenIm + wIm * wLenRe;\n        wRe = nextWRe;\n      }\n    }\n  }\n  if (invert) {\n    for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }\n  }\n}\n\nconst specRe = new Float64Array(target);\nconst specIm = new Float64Array(N);\nfft(specRe, specIm, false);\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const K = Math.round(lab.values.kMax);\n  const zoom = lab.values.zoomEdge;\n\n  const re = new Float64Array(specRe);\n  const im = new Float64Array(specIm);\n  for (let i = K + 1; i <= N - 1 - K; i++) {\n    re[i] = 0;\n    im[i] = 0;\n  }\n  fft(re, im, true);\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 46, padR = 16, padT = 20, padB = 26;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const yMin = -0.4, yMax = 1.4;\n  const nStart = zoom ? 230 : 0;\n  const nEnd = zoom ? 370 : 1023;\n\n  const toX = (n) => padL + ((n - nStart) / (nEnd - nStart)) * plotW;\n  const toY = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  [-0.2, 0, 0.5, 1.0, 1.2].forEach((yv) => {\n    const py = toY(yv);\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke();\n    ctx.fillText(yv.toFixed(1), padL - 6, py);\n  });\n\n  const xTicks = zoom ? [230, 260, 290, 320, 350, 370] : [0, 256, 512, 768, 1023];\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  xTicks.forEach((xv) => {\n    const px = toX(xv);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, H - padB); ctx.stroke();\n    ctx.fillText(String(xv), px, H - padB + 6);\n  });\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n  ctx.setLineDash([4, 4]);\n  const edges = zoom ? [290] : [290, 490, 1023];\n  edges.forEach((e) => {\n    const px = toX(e);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, H - padB); ctx.stroke();\n  });\n  ctx.restore();\n\n  if (!zoom) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.textAlign = 'center';\n    ctx.fillText('边缘1', toX(290), 5);\n    ctx.fillText('边缘2', toX(490), 5);\n    ctx.fillText('周期边缘(1023→0)', toX(975), 5);\n  } else {\n    ctx.fillStyle = '#f59e0b';\n    ctx.textAlign = 'center';\n    ctx.fillText('脉冲上升沿 (n=290)', toX(290), 5);\n  }\n\n  if (lab.values.showTarget) {\n    ctx.save();\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let n = nStart; n <= nEnd; n++) {\n      const px = toX(n), py = toY(target[n]);\n      if (n === nStart) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = nStart; n <= nEnd; n++) {\n    const px = toX(n), py = toY(re[n]);\n    if (n === nStart) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  let peakVal = -Infinity, peakIdx = 290;\n  for (let n = 270; n <= 360; n++) {\n    if (re[n] > peakVal) { peakVal = re[n]; peakIdx = n; }\n  }\n  const overshootPct = (peakVal - 1.0) * 100;\n\n  if (K >= 8 && K < 512 && overshootPct > 0.1) {\n    const pkX = toX(peakIdx), pkY = toY(peakVal);\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(pkX, pkY, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('过冲 +' + overshootPct.toFixed(1) + '%', Math.min(pkX + 8, W - 90), pkY - 6);\n  }\n\n  let status;\n  if (K === 512) status = '过冲幅度: 0.00% (全部 513 个频率已到位，离散信号实现零误差重构！)';\n  else if (K < 8) status = '脉冲尚未成型 (高频严重缺失，边缘极度平缓)';\n  else status = '脉冲边缘峰值: ' + peakVal.toFixed(3) + ' (相对台阶过冲 +' + overshootPct.toFixed(2) + '%)';\n\n  lab.setReadout('频率范围: 0 ~ ' + K + ' (共 ' + (K + 1) + ' / 513 个分量)  |  ' + status);\n});"
    },
    {
      "type": "concept",
      "heading": "二、顽固的 9% 魔咒：离散能消除，连续却不行？",
      "paragraphs": [
        "回到实验 1，把 `K` 分别拨到 `30`、`100`、`300`（对应原书图 11-6 的 e、f、g），你会发现一个令人惊掉下巴的现象：随着加入的正弦波越来越多，**过冲的宽度（width）明显变窄了，但过冲的高度（amplitude）几乎纹丝不动，始终死死停在台阶高度的 9% 左右！**",
        "对于**离散信号**，这并不构成麻烦——就像你在滑块拖到 `512` 时看到的那样，一旦补齐最后一个频率，所有过冲瞬间清零。但对于**连续时间信号**，要完美合成一个直角边缘需要**无穷多个正弦波**。既然频率数量趋于无穷时，过冲高度依然死守在 ~9% 不降反平，当年拉格朗日（Lagrange）与傅里叶（Fourier）就为此激烈争吵：连续的正弦波之和，到底能不能重构出一个直角边缘？",
        "吉布斯彻底解开了这个悖论，核心秘密有三条：**第一**，随着正弦波数量趋于无穷，过冲虽然还在，但它的**宽度缩减为零（zero width）**，退化成一根没有面积的无限细尖刺；**第二**，恰恰在**跳变间断点正中央**，重构信号的值会精准收敛到**台阶的中点**（例如从 0 跳到 1，间断点处收敛到 0.5）；**第三**，两者的差值信号所包含的**误差能量（error energy）严格收敛于零**。"
      ],
      "formula": {
        "expr": "x_M(t) = (4 / π) · Σ_{k=0}^{M-1} sin(2π(2k + 1)f₀t) / (2k + 1)",
        "explain": "标准周期方波（在 -1 与 +1 之间跳变，台阶总高度为 2）的傅里叶级数展开。M 是保留的奇次谐波个数，随着 M → ∞，边缘过冲峰值稳定在约 ±1.179（即超出台阶总高度 2 的 8.95%），但粉色误差面积趋于 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：连续方波的吉布斯极限与滤波听感（Web Audio）",
      "instruction": "拖动「奇次谐波数量 M」观察约 9% 过冲如何变窄而高度不变、粉色误差能量如何趋零；点击「播放截断方波听感」听听砍掉高频谐波对声音的影响。",
      "controls": [
        {
          "type": "slider",
          "id": "harmonics",
          "label": "奇次谐波数量 M",
          "min": 1,
          "max": 60,
          "step": 1,
          "value": 5,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "zoomEdge",
          "label": "放大跳变边缘 (观察 9% 峰值与中点)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放截断方波听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioCtx = null;\nlet osc = null;\nlet gainNode = null;\n\nfunction buildWave(ctx, M) {\n  const len = Math.max(4, 2 * M + 2);\n  const real = new Float32Array(len);\n  const imag = new Float32Array(len);\n  for (let k = 0; k < M; k++) {\n    const m = 2 * k + 1;\n    imag[m] = 4 / (Math.PI * m);\n  }\n  return ctx.createPeriodicWave(real, imag);\n}\n\nlab.onUpdate(() => {\n  const M = Math.round(lab.values.harmonics);\n  const zoom = lab.values.zoomEdge;\n  const playing = lab.values.play;\n\n  if (playing) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      gainNode.gain.value = 0.12;\n      osc.frequency.value = 220;\n      osc.setPeriodicWave(buildWave(audioCtx, M));\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    } else {\n      osc.setPeriodicWave(buildWave(audioCtx, M));\n    }\n  } else if (osc) {\n    try {\n      osc.stop();\n      osc.disconnect();\n      gainNode.disconnect();\n    } catch (e) {}\n    osc = null;\n    gainNode = null;\n  }\n\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 46, padR = 16, padT = 18, padB = 26;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const tStart = zoom ? 0.38 : 0.0;\n  const tEnd = zoom ? 0.62 : 1.0;\n  const yMin = -1.45, yMax = 1.45;\n\n  const toX = (t) => padL + ((t - tStart) / (tEnd - tStart)) * plotW;\n  const toY = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  [-1.0, -0.5, 0.0, 0.5, 1.0].forEach((yv) => {\n    const py = toY(yv);\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke();\n    ctx.fillText(yv.toFixed(1), padL - 6, py);\n  });\n\n  const tTicks = zoom ? [0.40, 0.45, 0.50, 0.55, 0.60] : [0.0, 0.25, 0.50, 0.75, 1.0];\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  tTicks.forEach((tv) => {\n    const px = toX(tv);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, H - padB); ctx.stroke();\n    ctx.fillText(tv.toFixed(2) + 'T', px, H - padB + 6);\n  });\n\n  const numPts = Math.floor(plotW);\n  let errSum = 0;\n  let maxApprox = -Infinity, maxPx = 0, maxPy = 0;\n  const approxPts = new Float64Array(numPts + 1);\n  const idealPts = new Float64Array(numPts + 1);\n\n  for (let i = 0; i <= numPts; i++) {\n    const t = tStart + (i / numPts) * (tEnd - tStart);\n    const ideal = t < 0.5 ? 1.0 : (t > 0.5 ? -1.0 : 0.0);\n    let s = 0;\n    for (let k = 0; k < M; k++) {\n      const m = 2 * k + 1;\n      s += Math.sin(2 * Math.PI * m * t) / m;\n    }\n    s *= 4 / Math.PI;\n    approxPts[i] = s;\n    idealPts[i] = ideal;\n    const diff = s - ideal;\n    errSum += diff * diff;\n    if (t > 0.2 && t < 0.5 && s > maxApprox) {\n      maxApprox = s;\n      maxPx = padL + i;\n      maxPy = toY(s);\n    }\n  }\n\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';\n  for (let i = 0; i <= numPts; i++) {\n    const yA = toY(approxPts[i]);\n    const yI = toY(idealPts[i]);\n    ctx.fillRect(padL + i, Math.min(yA, yI), 1, Math.max(1, Math.abs(yA - yI)));\n  }\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= numPts; i++) {\n    const px = padL + i, py = toY(idealPts[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= numPts; i++) {\n    const px = padL + i, py = toY(approxPts[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const midX = toX(0.5), midY = toY(0);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(midX, midY, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.textAlign = 'left';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('间断点中点 (0)', midX + 7, midY - 12);\n\n  const overshootPct = ((maxApprox - 1.0) / 2.0) * 100;\n  if (M >= 2) {\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(maxPx, maxPy, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.textAlign = 'right';\n    ctx.fillText('峰值 ' + maxApprox.toFixed(3) + ' (+' + overshootPct.toFixed(1) + '%)', Math.max(maxPx - 8, padL + 135), maxPy - 12);\n  }\n\n  const mse = errSum / (numPts + 1);\n  lab.setReadout('谐波阶数: 1 ~ ' + (2 * M - 1) + ' 次 (共 ' + M + ' 个)  |  过冲占台阶高度: ' + (M >= 2 ? '+' + overshootPct.toFixed(2) + '%' : '未超调') + '  |  粉色误差能量(MSE): ' + mse.toFixed(4));\n});"
    },
    {
      "type": "concept",
      "heading": "三、DSP 工程实战：低通滤波与时频对偶的双面刃",
      "paragraphs": [
        "千万别以为吉布斯效应只是数学家的纸上谈兵——它在真实的 DSP 工程中几乎无处不在。比如你设计了一个理想的**低通滤波器**，它的本质就是把信号频谱中的**高频成分强行截断**。按照刚刚的规律，这种在频域切一刀的做法，必然导致**时域**信号在每一个阶跃或脉冲边缘处长出**过冲与振铃**（图像锐化或音频限带时出现的“预振铃”就是这么来的）。",
        "更妙的是，傅里叶变换具有**时频对偶性（duality）**——把时域和频域的遭遇反过来也完全成立！工程中为了防止一段有限长信号延拓进相邻周期，人们经常粗暴地把**时域信号的两端直接截断**（相当于乘上一个矩形窗）。这一刀切出了陡峭的时域边缘，反过来就会在**频域的边缘处引发剧烈的吉布斯失真**（表现为频谱旁瓣泄露、滤波器通带/阻带波纹）。",
        "因此，后续章节讲解**滤波器设计（Filter Design）**时，核心工作之一就是用平滑过渡的窗函数（如汉明窗、布莱克曼窗）来替代生硬的矩形截断，从而在“边缘陡峭度”与“吉布斯振铃”之间做出优雅的工程折中。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "硬截断必生振铃：无论频域还是时域，只要对一端做“一刀切”式的陡峭截断，另一端在跳变边缘必然出现约 9% 的吉布斯过冲与衰减振荡。",
        "警惕隐形边界：DFT 默认信号周期延拓，即使信号内部看似平滑，首尾采样点（如第 1023 点与第 0 点）若不相等，同样构成陡峭边缘并激发振铃。",
        "离散与连续的本质差异：N 点离散信号补全所有 N/2 + 1 个频率后过冲会彻底消失；连续信号即使加到无穷项，过冲仍保留 ~9% 高度但宽度缩至 0，且总误差能量为 0。",
        "滤波器设计的妥协艺术：理想砖墙滤波器在时域会产生严重振铃，工程上常通过平滑过渡带或加窗（Windowing）来压制吉布斯效应。"
      ]
    }
  ]
});
