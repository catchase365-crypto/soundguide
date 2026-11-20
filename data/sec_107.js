window.__BOOK_REGISTER_SECTION__("sec_107", {
  "title": "相位的物理特性与信息密码 (Characteristics of the Phase)",
  "intuition": "时域平移不会改变频率成分的多少（幅度不变），只会给相位加上一条斜率为 2πs 的直线；真正决定波形边缘位置与左右对称性的，正是这条看似不起眼的相位曲线。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 时移不改变幅度，只倾斜相位的“斜率”",
      "paragraphs": [
        "尽管傅里叶变换满足**线性性质**，但它并**不具备时移不变性**——把时域波形向左或向右平移，频域并不会跟着整体平移。相反，所有频率分量的**幅度谱 `Mag X[f]` 纹丝不动**，所有的变化全部发生在**相位谱 `Phase X[f]`** 上。",
        "为什么平移会让相位变成一条倾斜的直线？想象把波形整体向右移动 `1` 个样本，组成它的所有正弦波也必须同时右移 `1` 个样本。对于一个很低频的正弦波（如周期为 32 个样本），移动 1 个样本只相当于移动了 `1/32` 个周期；但对于采样率一半的最高频正弦波（Nyquist 频率 `f = 0.5`，每 2 个样本一个周期），移动 1 个样本就等于移动了整整 `1/2` 个周期，即 `π` 弧度！",
        "因此，时域平移所等效的相位变化量**与频率 `f` 严格成正比**：频率 `0` 处相移为 `0`，最高频 `f = 0.5` 处每左移 1 个样本相位增加 `π`（每右移 1 个样本相位减少 `π`），中间所有频率连成一条完美的直线。这就是本节最核心的记忆口诀：**波形右移，相位斜率减小；波形左移，相位斜率增大**。",
        "在离散傅里叶变换（DFT）的**圆周视角**下，样本 `0` 与样本 `N-1` 首尾相连：当波形右移出边界时，会从左侧重新出现。如果波形本身具有**非线性相位**（例如直线上带有脉冲凸起），时域平移时这些非线性特征会直接叠加在变化的斜率上；而若强行用直角坐标（实部 `Re` 与虚部 `Im`）去观察，平移只会让它们变成更剧烈、人类完全无法解读的乱序振荡。"
      ],
      "formula": {
        "expr": "x[n + s]  <->  Mag X[f]  ∠ (Phase X[f] + 2π·s·f)    (0 ≤ f ≤ 0.5)",
        "explain": "x[n+s] 表示将信号向左平移 s 个样本（若向右平移 d 个样本，则令 s = -d）；f 是归一化频率（占采样率的比例，范围 0 到 0.5）；Mag X[f] 保持不变，相位谱则叠加一个关于频率 f 的线性项 2πsf。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：时域平移、相位斜率与圆周卷绕",
      "instruction": "拖动「时域右移量」滑块观察波形平移与相位直线的斜率反转；尝试开启「非线性相位」与「相位卷绕」，体会解卷绕（Unwrapped）斜率与 2π 周期模糊性的区别。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "时域右移量 (正右/负左)",
          "min": -16,
          "max": 16,
          "step": 1,
          "value": 4,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "nonlinear",
          "label": "叠加非线性相位特征",
          "value": false
        },
        {
          "type": "toggle",
          "id": "wrap",
          "label": "相位卷绕至 [-π, π]",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 64, M = N / 2;\nfunction draw() {\n  const shift = lab.values.shift;\n  const nonlin = lab.values.nonlinear;\n  const wrap = lab.values.wrap;\n  ctx.clearRect(0, 0, W, H);\n  const tx0 = 24, tw = 316, ty0 = 28, th = 182;\n  const px0 = 384, pw = 316, py0 = 28, ph = 182;\n\n  const mag = new Array(M + 1);\n  const phi = new Array(M + 1);\n  for (let k = 0; k <= M; k++) {\n    const f = k / N;\n    mag[k] = Math.exp(-0.5 * Math.pow(f / 0.14, 2));\n    let p = -2 * Math.PI * shift * f;\n    if (nonlin && ((f >= 0.08 && f <= 0.16) || (f >= 0.26 && f <= 0.34))) {\n      p += 2.4;\n    }\n    phi[k] = p;\n  }\n\n  const x = new Array(N);\n  let maxAbs = 1e-6;\n  for (let i = 0; i < N; i++) {\n    const n = i - M;\n    let sum = mag[0] * Math.cos(phi[0]) + ((n % 2 === 0 ? 1 : -1) * mag[M] * Math.cos(phi[M]));\n    for (let k = 1; k < M; k++) {\n      sum += 2 * mag[k] * Math.cos(2 * Math.PI * k * n / N + phi[k]);\n    }\n    x[i] = sum / N;\n    if (Math.abs(x[i]) > maxAbs) maxAbs = Math.abs(x[i]);\n  }\n  const norm = 1 / Math.max(0.25, maxAbs);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const yy = ty0 + (g / 4) * th;\n    ctx.beginPath(); ctx.moveTo(tx0, yy); ctx.lineTo(tx0 + tw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px0, yy); ctx.lineTo(px0 + pw, yy); ctx.stroke();\n  }\n  for (let g = 0; g <= 4; g++) {\n    const xx1 = tx0 + (g / 4) * tw;\n    const xx2 = px0 + (g / 4) * pw;\n    ctx.beginPath(); ctx.moveTo(xx1, ty0); ctx.lineTo(xx1, ty0 + th); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xx2, py0); ctx.lineTo(xx2, py0 + ph); ctx.stroke();\n  }\n\n  const tZeroY = ty0 + th * 0.68;\n  const tZeroX = tx0 + tw * 0.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(tx0, tZeroY); ctx.lineTo(tx0 + tw, tZeroY); ctx.stroke();\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(tZeroX, ty0); ctx.lineTo(tZeroX, ty0 + th); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const xx = tx0 + (i / (N - 1)) * tw;\n    const yy = tZeroY - x[i] * norm * (th * 0.52);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  const pZeroY = py0 + ph * 0.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(px0, pZeroY); ctx.lineTo(px0 + pw, pZeroY); ctx.stroke();\n\n  const P = 160;\n  const yMax = wrap ? Math.PI * 1.15 : 17 * Math.PI;\n  const evalPhase = (f) => {\n    let p = -2 * Math.PI * shift * f;\n    if (nonlin && ((f >= 0.08 && f <= 0.16) || (f >= 0.26 && f <= 0.34))) p += 2.4;\n    if (!wrap) return p;\n    const twoPi = 2 * Math.PI;\n    return ((p + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;\n  };\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  let prevVal = 0;\n  for (let i = 0; i <= P; i++) {\n    const f = 0.5 * (i / P);\n    const val = evalPhase(f);\n    const xx = px0 + (i / P) * pw;\n    const yy = pZeroY - (val / yMax) * (ph * 0.46);\n    if (i === 0 || (wrap && Math.abs(val - prevVal) > Math.PI)) {\n      ctx.moveTo(xx, yy);\n    } else {\n      ctx.lineTo(xx, yy);\n    }\n    prevVal = val;\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域波形 x[n] (样本 -32 ~ +31)', tx0, 18);\n  ctx.fillText(wrap ? '频域相位 (卷绕至 [-π, π])' : '频域相位 (解卷绕 Unwrapped)', px0, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText('n=0', tZeroX - 10, ty0 + th + 15);\n  ctx.fillText('f=0', px0, py0 + ph + 15);\n  ctx.fillText('f=0.5', px0 + pw - 32, py0 + ph + 15);\n  ctx.fillText(wrap ? '+π' : '+16π', px0 - 30, py0 + 12);\n  ctx.fillText(wrap ? '-π' : '-16π', px0 - 30, py0 + ph);\n\n  const nyqRad = -shift * Math.PI;\n  const symState = (shift === 0 && !nonlin) ? '零相位 (关于 n=0 对称)' : (nonlin ? '非线性相位 (波形不再对称)' : '线性相位');\n  lab.setReadout('右移 ' + (shift >= 0 ? '+' : '') + shift + ' 样本 | f=0.5 处线性相移=' + (nyqRad / Math.PI).toFixed(1) + 'π rad | 状态: ' + symState);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. 相位与幅度：究竟谁承载了波形的“形状”？",
      "paragraphs": [
        "很多人初学 DSP 时都会误以为“幅度谱包含信号的主要信息，相位只是次要的”。其实这完全取决于信息编码在哪个域！书中的图 10-6 做了一个极其震撼的对比实验：取一个带有明显**上升沿**（样本 55）和**下降沿**（样本 110）的脉冲信号，先做 DFT 并转为极坐标。",
        "如果把**相位替换成 `-π` 到 `π` 之间的随机数**，仅保留真实幅度谱再做逆 DFT，重建出的波形会变成一团毫无规律的起伏——原本清晰的脉冲边缘彻底消失了！反之，如果把**幅度替换成随机小正数**，仅保留真实相位谱做逆 DFT，重建出的波形虽然平直部分带有些许毛刺，但上升沿和下降沿的精确位置却**毫发无损地显现出来**。",
        "原因在于：波形中的一个“边缘”之所以能够陡峭地跳变，是因为成百上千个不同频率的正弦波恰好在**同一时刻同步抬升**，而这完全依赖它们彼此之间严密协调的**相位关系**。因此，**时域编码的信息（如波形形状、脉冲边缘、图像轮廓）主要存储在相位中**；而**频域编码的信息（如声音、语音、音乐的音色）则主要存储在幅度中**，相位在听觉上只扮演次要角色。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：分离幅度与相位，寻找消失的脉冲边缘",
      "instruction": "分别开关「保留幅度谱」与「保留相位谱」，并拖动「脉冲起始位置」滑块。观察：为什么丢掉幅度后边缘依然跟着滑块走，而丢掉相位后边缘瞬间灰飞烟灭？",
      "controls": [
        {
          "type": "slider",
          "id": "edgePos",
          "label": "脉冲起始位置",
          "min": 16,
          "max": 76,
          "step": 2,
          "value": 40,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "keepMag",
          "label": "保留真实幅度谱",
          "value": true
        },
        {
          "type": "toggle",
          "id": "keepPhase",
          "label": "保留真实相位谱",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 128, M = N / 2;\nconst randPh = new Array(M + 1);\nconst randMg = new Array(M + 1);\nfor (let k = 0; k <= M; k++) {\n  const r1 = Math.sin(k * 12.9898 + 78.233) * 43758.5453;\n  const r2 = Math.sin(k * 93.9898 + 19.133) * 24634.6345;\n  randPh[k] = ((r1 - Math.floor(r1)) * 2 - 1) * Math.PI;\n  randMg[k] = 0.55 + 0.45 * (r2 - Math.floor(r2));\n}\n\nfunction draw() {\n  const p0 = lab.values.edgePos;\n  const p1 = p0 + 36;\n  const keepMag = lab.values.keepMag;\n  const keepPhase = lab.values.keepPhase;\n  ctx.clearRect(0, 0, W, H);\n\n  const orig = new Array(N).fill(0);\n  for (let n = p0; n < p1; n++) {\n    orig[n] = 0.8 + 0.35 * ((n - p0) / 36);\n  }\n\n  const mag = new Array(M + 1);\n  const ph = new Array(M + 1);\n  let sumMag = 0;\n  for (let k = 0; k <= M; k++) {\n    let re = 0, im = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = 2 * Math.PI * k * n / N;\n      re += orig[n] * Math.cos(ang);\n      im -= orig[n] * Math.sin(ang);\n    }\n    mag[k] = Math.hypot(re, im);\n    ph[k] = Math.atan2(im, re);\n    if (k > 0 && k < M) sumMag += mag[k];\n  }\n  const avgMag = sumMag / (M - 1);\n\n  const tMag = new Array(M + 1);\n  const tPh = new Array(M + 1);\n  for (let k = 0; k <= M; k++) {\n    tMag[k] = keepMag ? mag[k] : (k === 0 ? avgMag * 0.2 : avgMag * 0.38 * randMg[k]);\n    if (k === 0 || k === M) {\n      tPh[k] = keepPhase ? ph[k] : 0;\n    } else {\n      tPh[k] = keepPhase ? ph[k] : randPh[k];\n    }\n  }\n\n  const recon = new Array(N);\n  let maxAbs = 1.2;\n  for (let n = 0; n < N; n++) {\n    let sum = tMag[0] * Math.cos(tPh[0]) + (n % 2 === 0 ? 1 : -1) * tMag[M] * Math.cos(tPh[M]);\n    for (let k = 1; k < M; k++) {\n      sum += 2 * tMag[k] * Math.cos(2 * Math.PI * k * n / N + tPh[k]);\n    }\n    recon[n] = sum / N;\n    if (Math.abs(recon[n]) > maxAbs) maxAbs = Math.abs(recon[n]);\n  }\n  const yScale = 1.2 / maxAbs;\n\n  const wx0 = 32, ww = 446, wy0 = 28, wh = 182;\n  const sx0 = 506, sw = 192;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const yy = wy0 + (g / 4) * wh;\n    ctx.beginPath(); ctx.moveTo(wx0, yy); ctx.lineTo(wx0 + ww, yy); ctx.stroke();\n    const xx = wx0 + (g / 4) * ww;\n    ctx.beginPath(); ctx.moveTo(xx, wy0); ctx.lineTo(xx, wy0 + wh); ctx.stroke();\n  }\n\n  const zeroY = wy0 + wh * 0.6;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(wx0, zeroY); ctx.lineTo(wx0 + ww, zeroY); ctx.stroke();\n\n  const xE1 = wx0 + (p0 / (N - 1)) * ww;\n  const xE2 = wx0 + (p1 / (N - 1)) * ww;\n  ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(xE1, wy0); ctx.lineTo(xE1, wy0 + wh); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(xE2, wy0); ctx.lineTo(xE2, wy0 + wh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xx = wx0 + (n / (N - 1)) * ww;\n    const yy = zeroY - orig[n] * (wh * 0.45);\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = keepPhase ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xx = wx0 + (n / (N - 1)) * ww;\n    const yy = zeroY - recon[n] * yScale * (wh * 0.45);\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  // Right side: mini Mag & Phase views\n  const my0 = 28, mh = 78;\n  const py0 = 132, phh = 78;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(sx0, my0, sw, mh);\n  ctx.strokeRect(sx0, py0, sw, phh);\n\n  ctx.strokeStyle = keepMag ? '#38bdf8' : 'rgba(56,189,248,0.6)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let k = 1; k <= M; k++) {\n    const xx = sx0 + ((k - 1) / (M - 1)) * sw;\n    const normM = Math.min(1, tMag[k] / Math.max(1e-3, mag[1]));\n    const yy = my0 + mh - normM * (mh - 8) - 4;\n    if (k === 1) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = keepPhase ? '#ec4899' : '#f59e0b';\n  for (let k = 1; k <= M; k++) {\n    const xx = sx0 + ((k - 1) / (M - 1)) * sw;\n    const yy = py0 + phh * 0.5 - (tPh[k] / Math.PI) * (phh * 0.42);\n    ctx.fillRect(xx - 1.2, yy - 1.2, 2.4, 2.4);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('重建波形 (虚线为原脉冲，粉线为边缘位置)', wx0, 18);\n  ctx.fillText(keepMag ? '幅度谱: 原始保留' : '幅度谱: 随机小幅度', sx0, 18);\n  ctx.fillText(keepPhase ? '相位谱: 原始保留' : '相位谱: 随机打乱', sx0, 124);\n\n  const modeStr = (keepMag && keepPhase) ? '完整重建' : (!keepMag && keepPhase ? '仅用相位重建 (边缘精确保留!)' : (keepMag && !keepPhase ? '仅用幅度重建 (边缘彻底丢失!)' : '幅度与相位均随机'));\n  lab.setReadout('边缘位置: [' + p0 + ', ' + p1 + '] | 当前模式: ' + modeStr);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 左右对称、零相位与复共轭 (Complex Conjugation)",
      "paragraphs": [
        "为什么时域波形关于样本 `0`（在圆周 DFT 中等价于同时关于样本 `N/2`）左右对称时，相位恰好为零或呈线性直线？把一个左右对称信号从对称中心一分为二（样本 `0` 的数值平分给左右两半），左半边与右半边互为精确的**镜像**。镜像信号的幅度谱完全相同，而相位谱恰好**符号相反**——两半相加时，所有非线性相位严丝合缝地相互抵消，只留下零相位（或平移后的线性相位）。",
        "反过来想，把时域信号左右翻转（即 `x[n]` 变为 `x[-n]`），并不会改变幅度谱，只会让相位谱的**每一个点都取反号**。在 DSP 中，把相位取反（或在直角坐标下保持实部不变、虚部取反）的操作非常重要，专门被命名为**复共轭（Complex Conjugation）**，记作上标星号 `X*[f]`。",
        "复共轭在工程中有两个立竿见影的妙用：第一，时域做**互相关（Correlation）**等价于把其中一个信号左右翻转再卷积，即 `a[n] * b[-n]`，在频域对应 `A[f] × B*[f]`；第二，任何任意信号 `x[n]` 只要与自身的左右翻转版本卷积（即自相关 `x[n] * x[-n]`），频域就是 `X[f] × X*[f]`——两个频谱相乘时相位相加，原相位与负相位彻底抵消，必然得到一个**绝对零相位**且关于样本 0 左右对称的结果。"
      ],
      "formula": {
        "expr": "x[-n]  <->  X*[f] = Mag X[f] ∠(-Phase X[f]) = Re X[f] - j·Im X[f]",
        "explain": "时域信号关于原点左右翻折 x[-n]，对应频域取复共轭 X*[f]：极坐标下幅度不变、相位取反；直角坐标下实部不变、虚部反号。因此 X[f]·X*[f] 的相位恒为零。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：Web Audio 听觉与对称实验——人耳听幅度还是听相位？",
      "instruction": "点击「播放对比音」后，交替开关「打乱各次谐波相位」与「压平谐波幅度」。仔细观察左侧对称波形与右侧频谱的变化，同时用耳朵聆听：哪种破坏几乎不改音色，哪种破坏让声音瞬间变刺耳？",
      "controls": [
        {
          "type": "slider",
          "id": "fundamental",
          "label": "基频 (f0)",
          "min": 110,
          "max": 440,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "scramblePhase",
          "label": "打乱各次谐波相位 (破坏对称)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "flattenMag",
          "label": "压平谐波幅度 (仅保留相位)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst H_NUM = 14;\nconst randPhases = [0, 1.85, 4.72, 0.45, 5.12, 2.63, 3.91, 1.15, 5.78, 2.04, 4.33, 0.89, 3.44, 5.41, 1.52];\nlet audioCtx = null, osc = null, gain = null;\n\nfunction syncAudio(real, imag) {\n  if (audioCtx && audioCtx.state === 'closed') {\n    audioCtx = null; osc = null; gain = null;\n  }\n  if (lab.values.play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gain = audioCtx.createGain();\n      gain.gain.value = 0.16;\n      osc.frequency.value = lab.values.fundamental;\n      osc.setPeriodicWave(wave);\n      osc.connect(gain);\n      gain.connect(audioCtx.destination);\n      osc.start();\n    } else {\n      osc.frequency.setTargetAtTime(lab.values.fundamental, audioCtx.currentTime, 0.02);\n      osc.setPeriodicWave(wave);\n    }\n  } else if (osc) {\n    try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch (e) {}\n    osc = null; gain = null;\n  }\n}\n\nfunction draw() {\n  const scramble = lab.values.scramblePhase;\n  const flatten = lab.values.flattenMag;\n  const f0 = lab.values.fundamental;\n  ctx.clearRect(0, 0, W, H);\n\n  const real = new Float32Array(H_NUM + 1);\n  const imag = new Float32Array(H_NUM + 1);\n  const mags = new Array(H_NUM + 1).fill(0);\n  const phs = new Array(H_NUM + 1).fill(0);\n\n  for (let k = 1; k <= H_NUM; k++) {\n    mags[k] = flatten ? 0.28 : (1 / k);\n    phs[k] = scramble ? randPhases[k] : 0;\n    real[k] = mags[k] * Math.cos(phs[k]);\n    imag[k] = -mags[k] * Math.sin(phs[k]);\n  }\n  syncAudio(real, imag);\n\n  const S = 240;\n  const wave = new Array(S);\n  let maxAbs = 1e-6;\n  for (let i = 0; i < S; i++) {\n    const theta = -2 * Math.PI + (4 * Math.PI) * (i / (S - 1));\n    let v = 0;\n    for (let k = 1; k <= H_NUM; k++) {\n      v += mags[k] * Math.cos(k * theta + phs[k]);\n    }\n    wave[i] = v;\n    if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);\n  }\n\n  const wx0 = 24, ww = 410, wy0 = 28, wh = 182;\n  const sx0 = 468, sw = 228;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const yy = wy0 + (g / 4) * wh;\n    ctx.beginPath(); ctx.moveTo(wx0, yy); ctx.lineTo(wx0 + ww, yy); ctx.stroke();\n    const xx = wx0 + (g / 4) * ww;\n    ctx.beginPath(); ctx.moveTo(xx, wy0); ctx.lineTo(xx, wy0 + wh); ctx.stroke();\n  }\n\n  const wZeroY = wy0 + wh * 0.56;\n  const wCenterX = wx0 + ww * 0.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(wx0, wZeroY); ctx.lineTo(wx0 + ww, wZeroY); ctx.stroke();\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(wCenterX, wy0); ctx.lineTo(wCenterX, wy0 + wh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = scramble ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < S; i++) {\n    const xx = wx0 + (i / (S - 1)) * ww;\n    const yy = wZeroY - (wave[i] / maxAbs) * (wh * 0.42);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  // Right top: Magnitude bars; Right bottom: Phase bars\n  const my0 = 28, mh = 76;\n  const py0 = 134, phh = 76;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(sx0, my0, sw, mh);\n  ctx.strokeRect(sx0, py0, sw, phh);\n\n  const barW = (sw - 16) / H_NUM;\n  for (let k = 1; k <= H_NUM; k++) {\n    const bx = sx0 + 8 + (k - 1) * barW;\n    const mhVal = mags[k] * (mh - 10);\n    ctx.fillStyle = flatten ? '#ec4899' : '#38bdf8';\n    ctx.fillRect(bx + 2, my0 + mh - mhVal - 2, barW - 4, mhVal);\n\n    const pNorm = ((phs[k] + Math.PI) % (2 * Math.PI)) - Math.PI;\n    const pMid = py0 + phh * 0.5;\n    ctx.fillStyle = scramble ? '#f59e0b' : '#10b981';\n    const py = pMid - (pNorm / Math.PI) * (phh * 0.38);\n    ctx.beginPath(); ctx.arc(bx + barW * 0.5, py, 3, 0, 2 * Math.PI); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(scramble ? '时域波形 (相位打乱: 对称性被破坏)' : '时域波形 (零相位: 关于 t=0 左右完全对称)', wx0, 18);\n  ctx.fillText('1~14 次谐波幅度谱 (决定音色)', sx0, 18);\n  ctx.fillText('1~14 次谐波相位谱 (决定对称与尖峰)', sx0, 124);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText('t=0', wCenterX - 10, wy0 + wh + 15);\n\n  const status = (!scramble && !flatten) ? '零相位对称原始音' : (scramble && !flatten ? '相位打乱: 波形大变但听感几乎不变!' : (!scramble && flatten ? '幅度压平: 波形保持尖锐对称但音色变刺耳!' : '幅度与相位均被破坏'));\n  lab.setReadout('基频 ' + f0 + ' Hz | ' + status + (lab.values.play ? ' | 🔊 正在发声' : ' | 🔇 已静音'));\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（相位斜率方向）：时域信号右移（延迟）会使相位斜率减小（变负）；左移（超前）会使斜率增大（变正）。在 Nyquist 频率 f=0.5 处，每移动 1 个样本正好对应 ±π 弧度的相移。",
        "避坑 2（解卷绕与 2π 模糊）：软件算出的相位通常被限制在 [-π, π] 之间呈锯齿状；判断线性相位或测量群延迟（斜率）时，必须先做相位解卷绕（Unwrapping）。",
        "避坑 3（远离直角坐标直觉）：时域平移后，频域实部与虚部会剧烈振荡、毫无规律；分析平移、滤波和对称性时，务必切换到极坐标（幅度 + 相位）视角。",
        "核心结论 1（信息分工）：脉冲边缘、图像轮廓等“时域编码”信息主要靠相位协同来定位；而语音、音乐等“频域编码”信号的听觉音色主要由幅度谱决定。",
        "核心结论 2（零相位与复共轭）：信号在时域关于样本 0（或圆周 DFT 的 N/2）左右对称时，相位恒为零；频域乘以自身复共轭 X[f]·X*[f] 是消除任意相位、构造零相位自相关的标准工程手法。"
      ]
    }
  ]
});
