window.__BOOK_REGISTER_SECTION__("sec_109", {
  "title": "压缩、扩展与多速率处理 (Compression, Expansion & Multirate Methods)",
  "intuition": "信号在时域被‘捏扁’，在频域就会被‘拉长’，反之亦然；利用这一对偶性配合频域补零，我们就能在离散序列之间无中生有地插值出平滑波形，但必须小心混叠与吉布斯振荡。",
  "blocks": [
    {
      "type": "concept",
      "heading": "时频伸缩的“跷跷板”：压缩与扩展对偶性",
      "paragraphs": [
        "在傅里叶变换的世界里，时域和频域就像一根跷跷板的两端：**在一个域中压缩信号，必然导致另一个域中的信号被等比例扩展**，反之亦然。",
        "用物理直觉去理解再自然不过：如果一个事件在时间上发生得**更快**（时域被压缩），它的波形变化就更剧烈，因此必须由**更高**的频率成分来构成（频谱向高频方向扩展）；如果事件发生得**更慢**（时域被拉长），它就由**更低**的频率成分构成（频谱向零频方向收缩）。",
        "将这一规律推向两个极端同样成立：当把时域脉冲压缩到极致变成一个**冲激函数 (Impulse)** 时，它的频谱会被无限拉平，变成全频段相等的**常数 (Constant)**；反过来，当把时域波形无限拉平变成一个直流常数时，它的频谱就会坍缩成零频处的一根冲激。"
      ],
      "formula": {
        "expr": "x(k·t)  <== 傅里叶变换 ==>  (1/k) · X(f / k)",
        "explain": "x(t) 是原时域信号，X(f) 是它的频谱；k 为伸缩因子。当 k > 1 时，时域信号变窄（压缩），频谱宽度 f/k 变为原来的 k 倍（扩展），同时频谱幅度缩放为 1/k 以保持总能量关系；当 0 < k < 1 时则相反。"
      }
    },
    {
      "type": "concept",
      "heading": "离散世界的新麻烦：混叠与“多速率”视角",
      "paragraphs": [
        "连续信号的伸缩规律非常纯粹，但到了计算机处理的**离散信号**上，就会出现两个必须面对的细节。第一个问题是**混叠 (Aliasing)**：离散信号的合法频率范围只到采样率的一半（归一化频率 `0.5`）。如果你把时域脉冲压缩得太狠，频谱被剧烈拉宽，高频旁瓣就会冲破 `0.5` 的边界并折叠回来，彻底破坏简单的伸缩比例关系。同理，如果你把频谱压缩得太狠，时域波形就会向两侧无限膨胀，溢出当前周期并撞进相邻的 DFT 周期里（时域混叠）。",
        "第二个问题是：**究竟什么叫“压缩或扩展一个离散信号”？** 采样点本身只是孤立的数字，压缩离散信号，本质上是先压缩这些采样点所依附的**底层连续曲线 (Underlying Continuous Waveform)**，然后再以原来的步长重新采样。压缩后，脉冲等事件只跨越**更少**的采样点；扩展后，同样的事件跨越**更多**的采样点。",
        "换一个完全等价的视角来看：我们也可以保持底层连续曲线完全不变，仅仅**改变采样率**。增加采样点数量叫**插值 (Interpolation)**，减少采样点数量叫**抽取 (Decimation)**。这种在数字域动态改变采样率的技术统称为**多速率方法 (Multirate Methods)**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 1：时频伸缩跷跷板与 Nyquist 混叠听感",
      "instruction": "拖动「时域压缩倍率 k」观察左右波形与频谱的反向伸缩；当 k 超过 1.8 时观察频谱如何冲破 0.5 边界发生混叠折返，并点击播放声音对比高音扩展与混叠音色。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "时域压缩倍率 k",
          "min": 0.3,
          "max": 3,
          "step": 0.05,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showAlias",
          "label": "模拟混叠折返与越界透视",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲谐波音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 64;\nlet audioState = { ac: null, master: null, oscs: [], gains: [], playing: false };\n\nfunction stopAudio() {\n  if (audioState.playing && audioState.master && audioState.ac) {\n    audioState.master.gain.setTargetAtTime(0, audioState.ac.currentTime, 0.02);\n  }\n  audioState.playing = false;\n}\n\nfunction updateAudio(k, showAlias, wantPlay) {\n  if (!wantPlay) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  if (audioState.oscs.length === 0) {\n    const master = ac.createGain();\n    master.gain.value = 0;\n    master.connect(ac.destination);\n    audioState.ac = ac;\n    audioState.master = master;\n    for (let h = 1; h <= 10; h++) {\n      const osc = ac.createOscillator();\n      const g = ac.createGain();\n      osc.type = 'sine';\n      g.gain.value = 0;\n      osc.connect(g);\n      g.connect(master);\n      osc.start();\n      audioState.oscs.push(osc);\n      audioState.gains.push(g);\n    }\n  }\n  const now = ac.currentTime;\n  audioState.playing = true;\n  audioState.master.gain.setTargetAtTime(0.22, now, 0.03);\n  const f0 = 150;\n  const nyq = 1200;\n  for (let i = 0; i < 10; i++) {\n    const h = i + 1;\n    const rawFreq = h * f0;\n    const amp = Math.exp(-Math.pow((h * 0.16) / k, 2)) / (1 + i * 0.25);\n    let outFreq = rawFreq;\n    let outAmp = amp;\n    if (rawFreq > nyq) {\n      if (showAlias) {\n        const mod = rawFreq % (2 * nyq);\n        outFreq = mod <= nyq ? mod : 2 * nyq - mod;\n        if (outFreq < 40) outFreq = 40;\n      } else {\n        outAmp = 0;\n      }\n    }\n    audioState.oscs[i].frequency.setTargetAtTime(outFreq, now, 0.03);\n    audioState.gains[i].gain.setTargetAtTime(outAmp * 0.35, now, 0.03);\n  }\n}\n\nlab.onUpdate(() => {\n  const k = lab.values.k;\n  const showAlias = lab.values.showAlias;\n  updateAudio(k, showAlias, lab.values.play);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const tX0 = 28, tW = 300, baseY = 190, tH = 135;\n  const fX0 = 380, fW = 310;\n  const nyqX = fX0 + (0.5 / 0.75) * fW;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = baseY - (i / 4) * tH;\n    ctx.beginPath(); ctx.moveTo(tX0, y); ctx.lineTo(tX0 + tW, y); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(fX0, y); ctx.lineTo(fX0 + fW, y); ctx.stroke();\n  }\n\n  ctx.fillStyle = 'rgba(236,72,153,0.08)';\n  ctx.fillRect(nyqX, baseY - tH - 10, fX0 + fW - nyqX, tH + 10);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(nyqX, baseY - tH - 12); ctx.lineTo(nyqX, baseY + 6); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Nyquist f=0.5', nyqX - 34, baseY - tH - 16);\n\n  const samples = [];\n  const sigma = 6.5;\n  for (let n = 0; n < N; n++) {\n    let v = 0;\n    for (let m = -1; m <= 1; m++) {\n      const d = (n - 31.5 + m * N) * k / sigma;\n      v += Math.exp(-d * d);\n    }\n    samples.push(v);\n  }\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let px = 0; px <= tW; px += 2) {\n    const nFloat = (px / tW) * (N - 1);\n    let v = 0;\n    for (let m = -1; m <= 1; m++) {\n      const d = (nFloat - 31.5 + m * N) * k / sigma;\n      v += Math.exp(-d * d);\n    }\n    const x = tX0 + px;\n    const y = baseY - Math.min(1.15, v) * tH * 0.85;\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  for (let n = 0; n < N; n++) {\n    const x = tX0 + (n / (N - 1)) * tW;\n    const y = baseY - Math.min(1.15, samples[n]) * tH * 0.85;\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const mag = [];\n  for (let bin = 0; bin <= N / 2; bin++) {\n    let re = 0, im = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * bin * n) / N;\n      re += samples[n] * Math.cos(ang);\n      im -= samples[n] * Math.sin(ang);\n    }\n    mag.push(Math.sqrt(re * re + im * im));\n  }\n\n  const scaleF = 11.5;\n  if (showAlias) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    for (let px = 0; px <= fW; px += 2) {\n      const f = (px / fW) * 0.75;\n      const idealMag = (Math.sqrt(Math.PI) * sigma / k) * Math.exp(-Math.pow((Math.PI * f * sigma) / k, 2));\n      const y = baseY - Math.min(142, idealMag * scaleF);\n      if (px === 0) ctx.moveTo(fX0 + px, y); else ctx.lineTo(fX0 + px, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let bin = 0; bin <= N / 2; bin++) {\n    const f = bin / N;\n    const x = fX0 + (f / 0.75) * fW;\n    const y = baseY - Math.min(142, mag[bin] * scaleF);\n    if (bin === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  for (let bin = 0; bin <= N / 2; bin += 2) {\n    const f = bin / N;\n    const x = fX0 + (f / 0.75) * fW;\n    const y = baseY - Math.min(142, mag[bin] * scaleF);\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域波形 Time Domain (x[n])', tX0, 22);\n  ctx.fillText('频谱幅度 Frequency Domain (|X(f)|)', fX0, 22);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0', tX0, baseY + 16);\n  ctx.fillText('样本 63', tX0 + tW - 38, baseY + 16);\n  ctx.fillText('0', fX0, baseY + 16);\n  ctx.fillText('0.5', nyqX - 8, baseY + 16);\n  ctx.fillText('越界区 0.75', fX0 + fW - 58, baseY + 16);\n\n  const nyqEnergy = mag[N / 2] / (mag[0] + 1e-6);\n  const status = nyqEnergy > 0.06 ? '⚠️ 已发生明显频域混叠！' : (k < 0.45 ? '⚠️ 时域已极度膨胀，逼近周期边界' : '✅ 伸缩比例良好，无明显混叠');\n  lab.setReadout('压缩倍率 k=' + k.toFixed(2) + ' | 频谱宽度相对倍率: ' + k.toFixed(2) + 'x | 奈奎斯特处残余能量: ' + (nyqEnergy * 100).toFixed(1) + '% | ' + status);\n});"
    },
    {
      "type": "concept",
      "heading": "找回丢失的连续曲线：时域拟合 vs 频域补零插值",
      "paragraphs": [
        "既然多速率插值的本质是恢复采样点之间的**底层连续曲线**，那给出一组任意的离散点，计算机怎么知道点与点之间原本长什么样？答案取决于信号的信息编码在哪个域。",
        "如果信息编码在**时域**（例如心电图、机械位移曲线），我们希望插值曲线是穿过所有已知样本的一条光滑线——比如先连折线再圆角，或者用**样条插值 (Spline)**、**多项式拟合**。这种方法只关心减少时域波折，完全不理会频谱。",
        "但如果信号的信息编码在**频域**（例如通信、音频波形），我们就反其道而行之：**保住频谱一模一样，让时域自动变密**。上一章我们学过，在时域信号末尾**补零 (Zero-padding)** 再做 DFT，可以得到更密的频谱采样；根据对偶性，如果在**频谱末尾补零**再做逆 DFT (IDFT)，就能得到更密的**时域插值**！",
        "以原书将 `50` 个样本插值为 `400` 个样本为例，工程标准做法只有四步：(1) 先把 50 个样本补零凑成 `64` 点；(2) 做 64 点 DFT，得到实部、虚部各 `33` 点的频谱；(3) 在频谱实部和虚部的右侧分别补上 `224` 个零，把频谱拉长到 `257` 点；(4) 做一次 `512` 点逆 DFT，取结果的前 `400` 个点，就是原信号精确放大 8 倍的插值序列！"
      ],
      "formula": {
        "expr": "N=64 频谱 (33点)  --[右端补224个零]-->  257点频谱  --[512点 IDFT]-->  8倍时域插值",
        "explain": "频域补零不会引入任何新的高频正弦波，只是在保持原有频率成分 100% 不变的前提下，提高了时域的采样密度。"
      }
    },
    {
      "type": "concept",
      "heading": "频域插值的致命陷阱：吉布斯效应 (Gibbs Effect)",
      "paragraphs": [
        "频域补零插值虽然保证了“频率成分绝对纯净”，但它在时域未必总是温顺听话。对于本身就**光滑**的信号（如高斯脉冲），频域补零会插值出一条极其漂亮、宛如完美样条拟合的平滑曲线。",
        "然而，一旦原信号里包含**锐利边沿或阶跃跳变**（比如矩形方波），它的真实频谱原本包含无穷高频；截断在有限离散频点并补零后，插值波形就会在跳变边沿附近剧烈过冲并来回振荡——这就是著名的**吉布斯效应 (Gibbs Effect)**。",
        "更隐蔽的一个坑是：DFT 默认把时域看成**首尾相连的圆环**。哪怕你的波形内部很光滑，只要**第 `0` 个样本和第 `N-1` 个样本的幅度不相等**，首尾接缝处就会形成一个隐形的悬崖跳变，导致吉布斯振荡在信号一头一尾同时炸开！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 2：频域补零插值与吉布斯效应 (Gibbs Effect) 实验室",
      "instruction": "对比「平滑高斯」与「矩形锐利边沿」在频域补零插值下的巨大反差；尝试开启「首尾边界跳变」，观察首尾两端如何同时冒出振荡波纹。",
      "controls": [
        {
          "type": "toggle",
          "id": "sharp",
          "label": "使用锐利方波边沿 (关闭为平滑高斯)",
          "value": false
        },
        {
          "type": "slider",
          "id": "interp",
          "label": "频域补零插值倍率",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 8,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "wrapJump",
          "label": "引入首尾边界跳变 (样本 0 ≠ N-1)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 32;\n\nlab.onUpdate(() => {\n  const sharp = lab.values.sharp;\n  const M = lab.values.interp;\n  const wrapJump = lab.values.wrapJump;\n\n  const xOrig = [];\n  for (let n = 0; n < N; n++) {\n    let v = 0;\n    if (sharp) {\n      v = (n >= 11 && n <= 20) ? 1.0 : 0.0;\n    } else {\n      v = Math.exp(-Math.pow((n - 15.5) / 3.2, 2));\n    }\n    if (wrapJump && n >= 26) {\n      v = Math.max(v, 0.72);\n    }\n    xOrig.push(v);\n  }\n\n  const halfN = N / 2;\n  const reX = new Array(halfN + 1).fill(0);\n  const imX = new Array(halfN + 1).fill(0);\n  for (let k = 0; k <= halfN; k++) {\n    let re = 0, im = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * k * n) / N;\n      re += xOrig[n] * Math.cos(ang);\n      im -= xOrig[n] * Math.sin(ang);\n    }\n    reX[k] = re;\n    imX[k] = im;\n  }\n\n  const totalM = N * M;\n  const xInterp = [];\n  let maxVal = -Infinity, minVal = Infinity;\n  for (let m = 0; m < totalM; m++) {\n    let sum = reX[0];\n    for (let k = 1; k < halfN; k++) {\n      const ang = (2 * Math.PI * k * m) / totalM;\n      sum += 2 * (reX[k] * Math.cos(ang) - imX[k] * Math.sin(ang));\n    }\n    sum += reX[halfN] * Math.cos((Math.PI * m) / M);\n    const val = sum / N;\n    xInterp.push(val);\n    if (val > maxVal) maxVal = val;\n    if (val < minVal) minVal = val;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const tX0 = 32, tW = 435, baseY = 185, scaleY = 125;\n  const fX0 = 500, fW = 195;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -1; i <= 4; i++) {\n    const y = baseY - (i / 3) * scaleY;\n    ctx.beginPath(); ctx.moveTo(tX0, y); ctx.lineTo(tX0 + tW, y); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.22)';\n  ctx.beginPath(); ctx.moveTo(tX0, baseY); ctx.lineTo(tX0 + tW, baseY); ctx.stroke();\n\n  if (wrapJump) {\n    ctx.fillStyle = 'rgba(236,72,153,0.12)';\n    ctx.fillRect(tX0, baseY - scaleY - 15, 35, scaleY + 40);\n    ctx.fillRect(tX0 + tW - 35, baseY - scaleY - 15, 35, scaleY + 40);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('首尾跳变波及', tX0 + 2, baseY - scaleY - 20);\n  }\n\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let m = 0; m < totalM; m++) {\n    const x = tX0 + (m / totalM) * tW;\n    const y = baseY - xInterp[m] * scaleY;\n    if (m === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  for (let m = 1; m < totalM; m++) {\n    const v0 = xInterp[m - 1], v1 = xInterp[m];\n    if (v0 > 1.02 || v1 > 1.02 || v0 < -0.02 || v1 < -0.02) {\n      ctx.beginPath();\n      ctx.moveTo(tX0 + ((m - 1) / totalM) * tW, baseY - v0 * scaleY);\n      ctx.lineTo(tX0 + (m / totalM) * tW, baseY - v1 * scaleY);\n      ctx.stroke();\n    }\n  }\n\n  for (let n = 0; n < N; n++) {\n    const x = tX0 + (n / N) * tW;\n    const y = baseY - xOrig[n] * scaleY;\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const maxBars = halfN * M;\n  const activeRatio = 1 / M;\n  ctx.fillStyle = 'rgba(56,189,248,0.08)';\n  ctx.fillRect(fX0 + fW * activeRatio, 45, fW * (1 - activeRatio), baseY - 45);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(fX0, baseY); ctx.lineTo(fX0 + fW, baseY); ctx.stroke();\n\n  const mag0 = Math.sqrt(reX[0] * reX[0] + imX[0] * imX[0]) + 1e-6;\n  for (let k = 0; k <= halfN; k++) {\n    const mag = Math.sqrt(reX[k] * reX[k] + imX[k] * imX[k]) / mag0;\n    const bx = fX0 + (k / maxBars) * fW;\n    const bw = Math.max(2, (fW / maxBars) * 0.72);\n    const bh = Math.min(130, mag * 125);\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(bx, baseY - bh, bw, bh);\n  }\n\n  if (M > 1) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('补零区 (' + (halfN * (M - 1)) + ' 频点)', fX0 + fW * activeRatio + 6, 115);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域插值结果 (' + N + ' 点 → ' + totalM + ' 点)', tX0, 22);\n  ctx.fillText('频谱右端补零示意', fX0, 22);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('样本 0', tX0, baseY + 18);\n  ctx.fillText('样本 31', tX0 + tW - 38, baseY + 18);\n  ctx.fillText('DC', fX0, baseY + 18);\n  ctx.fillText('扩展后 Nyquist', fX0 + fW - 76, baseY + 18);\n\n  const overshoot = Math.max(0, maxVal - 1.0, -minVal);\n  const gibbsPct = (overshoot * 100).toFixed(1);\n  lab.setReadout('波形: ' + (sharp ? '锐利方波' : '平滑高斯') + ' | 插值倍率: ' + M + 'x (' + totalM + '点) | 过冲/下冲振荡(粉色): ' + gibbsPct + '%' + (overshoot > 0.03 ? ' ⚠️ 出现吉布斯振铃' : ' ✅ 曲线平滑无过冲'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "压缩与扩展互为镜像：时域压得越窄，频域就撑得越宽；在离散系统中压缩过猛会导致频谱冲出 0.5 引发混叠，而频谱压得过窄会让时域波形撞进邻近 DFT 周期。",
        "多速率重采样的两条路：时域编码信号（如传感器轮廓）适合用样条/多项式平滑拟合；频域编码信号（如音频、通信）适合用“频谱右端补零 + 更大点数 IDFT”实现高保真插值。",
        "谨防吉布斯效应与首尾边界悬崖：用频域补零插值方波或阶跃信号必出过冲振铃；此外即使波形中间平缓，只要样本 0 与样本 N-1 高度不一致，周期边界照样会产生剧烈振荡，工程上常需先加窗或去趋势再插值。"
      ]
    }
  ]
});
