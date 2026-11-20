window.__BOOK_REGISTER_SECTION__("sec_179", {
  "title": "二维 FFT 卷积与目标匹配 (FFT Convolution)",
  "intuition": "当卷积核很大时，把图像与核都补零到 2 的幂次尺寸、转入频域做复数逐点相乘再反变换，不仅速度能暴增数十倍，还能通过“旋转 180° + 边缘增强”在复杂画面中精准锁定目标位置。",
  "blocks": [
    {
      "type": "concept",
      "heading": "大图大核的救星：为什么需要二维 FFT 卷积？",
      "paragraphs": [
        "虽然二维傅里叶变换本身计算量巨大（在早期的个人电脑上处理一张 512×512 图像就需要数分钟），但当你需要用**大尺寸滤波器核（PSF）**去卷积图像时，FFT 依然是速度最快的途径。例如，用 50×50 的点扩散函数（PSF）卷积 512×512 的图像，**FFT 卷积比常规空域直接卷积快约 20 倍**。二维 FFT 卷积本质上就是第 18 章一维 FFT 卷积的自然二维推广。",
        "我们用一个极具工程感的实战场景来演示它的威力：**自动识钞与印刷质检**。假设我们要为自动售货机或印钞厂设计一套一美元纸币检测系统——在采集到的 `100×100` 像素（以乔治·华盛顿肖像为中心）的图像中，精准找出已知的 `29×29` 像素人脸模板到底出现在哪里（或是否存在）。",
        "要从含噪图像中找出已知形状的信号，最优解就是**相关（Correlation，即匹配滤波器 Matched Filter）**，而相关运算完全可以通过**卷积（Convolution）**来实现。"
      ],
      "formula": {
        "expr": "N_padded >= N_img + N_psf - 1  (且向上取 2 的幂次)",
        "explain": "N_img 为待搜索图像边长（如 100），N_psf 为卷积核边长（如 29）。两者卷积后的线性尺寸为 100 + 29 - 1 = 128，恰好是 2 的 7 次幂，因此需补零至 128×128 再做 FFT。"
      }
    },
    {
      "type": "concept",
      "heading": "把“目标模板”变成“高效卷积核”的两步改造",
      "paragraphs": [
        "直接拿原始人脸模板去做卷积是找不到正确目标的，必须先做两步关键改造（对应原书 Fig. 24-12）：",
        "**第一步：将目标图像旋转 180°**（等价于先左右翻转、再上下翻转）。因为卷积运算在数学定义上自带“核函数翻转”特性；为了用卷积算出“相关（不翻转地直接滑动模板对比）”，必须提前把目标核旋转 180°，做到**“负负得正”**，抵消卷积自带的反转。",
        "**第二步（提效秘技）：边缘检测（Edge Detection）**。与其在原始灰度图里直接找人脸，不如用“人脸的边缘”去匹配“原图的边缘”。因为边缘特征比平滑的灰度区块更锐利，能让相关输出产生**极其尖锐的高亮峰值**。根据卷积的**结合律**，对原图和目标同时做 `3×3` 边缘滤波，等价于把边缘滤波对目标做两次而原图不动；实际工程中，**仅对旋转后的目标核应用一次 `3×3` 边缘检测核**就足以显著提升检测性能。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验一：180° 旋转、边缘增强与相关峰锐化实战",
      "instruction": "尝试开关“旋转 180°”和“边缘增强”观察虚假高亮区的抑制与峰值锐化；再拖动目标倾角滑块，亲眼见证相关法对角度变化的高度敏感性。",
      "controls": [
        {
          "type": "toggle",
          "id": "rotate180",
          "label": "目标核旋转 180° (实现相关)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "edgeEnhance",
          "label": "开启 3×3 边缘增强滤波",
          "value": true
        },
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "环境噪声强度",
          "min": 0,
          "max": 60,
          "step": 5,
          "value": 15,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "targetAngle",
          "label": "待检目标倾角误差",
          "min": -45,
          "max": 45,
          "step": 5,
          "value": 0,
          "unit": "°"
        }
      ],
      "jsCode": "const IMG_N = 40;\nconst T_N = 13;\nconst HALF = 6;\nconst TRUE_X = 26;\nconst TRUE_Y = 20;\n\nfunction makeFaceTemplate() {\n  const t = new Float32Array(T_N * T_N);\n  for (let y = 0; y < T_N; y++) {\n    for (let x = 0; x < T_N; x++) {\n      const dx = (x - HALF) / 5.5;\n      const dy = (y - HALF) / 6.0;\n      let val = 0.25;\n      if (dx * dx + dy * dy < 0.95) {\n        val = 0.78 - 0.18 * dx;\n        if (dy < -0.35) val = 0.15;\n        if (Math.abs(dy + 0.1) < 0.16 && (Math.abs(dx + 0.35) < 0.18 || Math.abs(dx - 0.32) < 0.18)) {\n          val = 0.12;\n        }\n        if (Math.abs(dx - 0.05) < 0.12 && dy > -0.05 && dy < 0.35) {\n          val = 0.95;\n        }\n        if (dy > 0.45 && dy < 0.62 && Math.abs(dx) < 0.35) {\n          val = 0.18;\n        }\n      }\n      t[y * T_N + x] = val;\n    }\n  }\n  return t;\n}\n\nconst baseFace = makeFaceTemplate();\n\nfunction sampleFaceRotated(angleDeg) {\n  const rad = (-angleDeg * Math.PI) / 180;\n  const ca = Math.cos(rad);\n  const sa = Math.sin(rad);\n  const out = new Float32Array(T_N * T_N);\n  for (let y = 0; y < T_N; y++) {\n    for (let x = 0; x < T_N; x++) {\n      const ux = x - HALF;\n      const uy = y - HALF;\n      const sx = Math.round(ux * ca - uy * sa + HALF);\n      const sy = Math.round(ux * sa + uy * ca + HALF);\n      if (sx >= 0 && sx < T_N && sy >= 0 && sy < T_N) {\n        out[y * T_N + x] = baseFace[sy * T_N + sx];\n      } else {\n        out[y * T_N + x] = 0.25;\n      }\n    }\n  }\n  return out;\n}\n\nfunction pseudoNoise(i) {\n  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n  return (s - Math.floor(s)) - 0.5;\n}\n\nfunction buildScene(angleDeg, noisePct) {\n  const img = new Float32Array(IMG_N * IMG_N);\n  const rotFace = sampleFaceRotated(angleDeg);\n  const noiseAmp = noisePct / 100;\n  for (let y = 0; y < IMG_N; y++) {\n    for (let x = 0; x < IMG_N; x++) {\n      let bg = 0.25;\n      const bx = (x - 10) / 7.5;\n      const by = (y - 12) / 8.5;\n      if (bx * bx + by * by < 1.0) bg = 0.85;\n      if (x === 2 || x === IMG_N - 3 || y === 2 || y === IMG_N - 3) bg = 0.65;\n      img[y * IMG_N + x] = bg;\n    }\n  }\n  for (let ty = 0; ty < T_N; ty++) {\n    for (let tx = 0; tx < T_N; tx++) {\n      const iy = TRUE_Y - HALF + ty;\n      const ix = TRUE_X - HALF + tx;\n      if (ix >= 0 && ix < IMG_N && iy >= 0 && iy < IMG_N) {\n        img[iy * IMG_N + ix] = rotFace[ty * T_N + tx];\n      }\n    }\n  }\n  for (let i = 0; i < img.length; i++) {\n    const v = img[i] + pseudoNoise(i) * noiseAmp;\n    img[i] = Math.max(0, Math.min(1, v));\n  }\n  return img;\n}\n\nfunction buildKernel(doRotate180, doEdge) {\n  const k = new Float32Array(T_N * T_N);\n  for (let y = 0; y < T_N; y++) {\n    for (let x = 0; x < T_N; x++) {\n      const sy = doRotate180 ? (T_N - 1 - y) : y;\n      const sx = doRotate180 ? (T_N - 1 - x) : x;\n      k[y * T_N + x] = baseFace[sy * T_N + sx];\n    }\n  }\n  if (!doEdge) return k;\n  const e = new Float32Array(T_N * T_N);\n  let mean = 0;\n  for (let y = 0; y < T_N; y++) {\n    for (let x = 0; x < T_N; x++) {\n      let sum = 0;\n      for (let dy = -1; dy <= 1; dy++) {\n        for (let dx = -1; dx <= 1; dx++) {\n          const ny = y + dy;\n          const nx = x + dx;\n          const val = (nx >= 0 && nx < T_N && ny >= 0 && ny < T_N) ? k[ny * T_N + nx] : 0.25;\n          sum += (dx === 0 && dy === 0) ? 8 * val : -val;\n        }\n      }\n      e[y * T_N + x] = sum;\n      mean += sum;\n    }\n  }\n  mean /= (T_N * T_N);\n  for (let i = 0; i < e.length; i++) e[i] -= mean;\n  return e;\n}\n\nfunction drawGrid(ctx, data, w, h, ox, oy, size, isSignedHeat) {\n  let minV = Infinity, maxV = -Infinity;\n  for (let i = 0; i < data.length; i++) {\n    if (data[i] < minV) minV = data[i];\n    if (data[i] > maxV) maxV = data[i];\n  }\n  const span = (maxV - minV) || 1;\n  const cell = size / w;\n  for (let y = 0; y < h; y++) {\n    for (let x = 0; x < w; x++) {\n      const v = data[y * w + x];\n      if (isSignedHeat === 'heat') {\n        const t = Math.max(0, Math.min(1, (v - minV) / span));\n        let r, g, b;\n        if (t < 0.35) {\n          const u = t / 0.35;\n          r = Math.round(10 + u * 6);\n          g = Math.round(18 + u * 70);\n          b = Math.round(45 + u * 110);\n        } else if (t < 0.72) {\n          const u = (t - 0.35) / 0.37;\n          r = Math.round(16 + u * 229);\n          g = Math.round(88 + u * 100);\n          b = Math.round(155 - u * 130);\n        } else {\n          const u = (t - 0.72) / 0.28;\n          r = Math.round(245 + u * 10);\n          g = Math.round(188 + u * 67);\n          b = Math.round(25 + u * 225);\n        }\n        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';\n      } else if (isSignedHeat === 'edge') {\n        const mag = Math.max(Math.abs(minV), Math.abs(maxV)) || 1;\n        const t = 0.5 + 0.5 * (v / mag);\n        const c = Math.round(Math.max(0, Math.min(255, t * 255)));\n        ctx.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')';\n      } else {\n        const c = Math.round(Math.max(0, Math.min(255, v * 255)));\n        ctx.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')';\n      }\n      ctx.fillRect(ox + x * cell, oy + y * cell, Math.ceil(cell), Math.ceil(cell));\n    }\n  }\n}\n\nlab.onUpdate(() => {\n  const { ctx, width, height, values } = lab;\n  const doRot = !!values.rotate180;\n  const doEdge = !!values.edgeEnhance;\n  const noisePct = values.noiseLevel;\n  const angleDeg = values.targetAngle;\n\n  const img = buildScene(angleDeg, noisePct);\n  const kern = buildKernel(doRot, doEdge);\n  const corr = new Float32Array(IMG_N * IMG_N);\n\n  let maxVal = -Infinity, maxX = 0, maxY = 0;\n  let sum = 0, sum2 = 0;\n  for (let y = 0; y < IMG_N; y++) {\n    for (let x = 0; x < IMG_N; x++) {\n      let acc = 0;\n      for (let ky = 0; ky < T_N; ky++) {\n        const iy = y - (ky - HALF);\n        if (iy < 0 || iy >= IMG_N) continue;\n        for (let kx = 0; kx < T_N; kx++) {\n          const ix = x - (kx - HALF);\n          if (ix < 0 || ix >= IMG_N) continue;\n          acc += img[iy * IMG_N + ix] * kern[ky * T_N + kx];\n        }\n      }\n      corr[y * IMG_N + x] = acc;\n      sum += acc;\n      sum2 += acc * acc;\n      if (acc > maxVal) { maxVal = acc; maxX = x; maxY = y; }\n    }\n  }\n  const nPix = IMG_N * IMG_N;\n  const mean = sum / nPix;\n  const std = Math.sqrt(Math.max(1e-9, sum2 / nPix - mean * mean));\n  const psr = (maxVal - mean) / std;\n  const err = Math.hypot(maxX - TRUE_X, maxY - TRUE_Y);\n  const locked = err <= 2.5 && psr > 3.2;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, width, height);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1. 待搜索图像 (含干扰亮斑)', 16, 22);\n  drawGrid(ctx, img, IMG_N, IMG_N, 16, 34, 160, 'gray');\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(16, 34, 160, 160);\n\n  const cell1 = 160 / IMG_N;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([3, 3]);\n  ctx.strokeRect(16 + (TRUE_X - HALF) * cell1, 34 + (TRUE_Y - HALF) * cell1, T_N * cell1, T_N * cell1);\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = locked ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const dx = 16 + (maxX + 0.5) * cell1;\n  const dy = 34 + (maxY + 0.5) * cell1;\n  ctx.arc(dx, dy, 8, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#64748b';\n  ctx.fillText('蓝虚框=真实人脸  圆圈=检测峰值', 16, 214);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('2. 卷积核 PSF', 202, 46);\n  drawGrid(ctx, kern, T_N, T_N, 202, 58, 104, doEdge ? 'edge' : 'gray');\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(202, 58, 104, 104);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = doRot ? '#10b981' : '#f59e0b';\n  ctx.fillText(doRot ? '已旋转 180°' : '未旋转 (错配)', 202, 180);\n  ctx.fillStyle = doEdge ? '#38bdf8' : '#64748b';\n  ctx.fillText(doEdge ? '已做 3×3 边缘增强' : '原始灰度模板', 202, 196);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('3. 卷积(相关)输出热力图', 332, 22);\n  drawGrid(ctx, corr, IMG_N, IMG_N, 332, 34, 160, 'heat');\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(332, 34, 160, 160);\n  ctx.strokeStyle = locked ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(332, 34 + (maxY + 0.5) * cell1);\n  ctx.lineTo(492, 34 + (maxY + 0.5) * cell1);\n  ctx.moveTo(332 + (maxX + 0.5) * cell1, 34);\n  ctx.lineTo(332 + (maxX + 0.5) * cell1, 194);\n  ctx.stroke();\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = locked ? '#10b981' : '#ec4899';\n  ctx.fillText(locked ? '成功锁定人脸坐标 (' + maxX + ',' + maxY + ')' : '锁定失效 / 被干扰吸引 (' + maxX + ',' + maxY + ')', 332, 214);\n\n  const px = 514, py = 34, pw = 190, ph = 160;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('4. 真实行 (y=' + TRUE_Y + ') 水平剖面', px, 22);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 1; g < 4; g++) {\n    const gy = py + (ph * g) / 4;\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n  }\n  let sMin = Infinity, sMax = -Infinity;\n  for (let i = 0; i < corr.length; i++) {\n    if (corr[i] < sMin) sMin = corr[i];\n    if (corr[i] > sMax) sMax = corr[i];\n  }\n  const sSpan = (sMax - sMin) || 1;\n  const trueTx = px + (TRUE_X / (IMG_N - 1)) * pw;\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(trueTx, py); ctx.lineTo(trueTx, py + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = locked ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let x = 0; x < IMG_N; x++) {\n    const val = corr[TRUE_Y * IMG_N + x];\n    const norm = (val - sMin) / sSpan;\n    const sx = px + (x / (IMG_N - 1)) * pw;\n    const sy = py + ph - 10 - norm * (ph - 20);\n    if (x === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('峰值信噪比 (PSR): ' + psr.toFixed(2), px, 214);\n\n  lab.setReadout('状态: ' + (locked ? '精准锁定目标' : '检测失败 / 误锁定') + ' | 检测坐标: [' + maxX + ', ' + maxY + '] (真实: [' + TRUE_X + ', ' + TRUE_Y + ']) | 峰值锐度 PSR: ' + psr.toFixed(2));\n});"
    },
    {
      "type": "concept",
      "heading": "FFT 卷积的四步流水线与“防混叠补零”铁律",
      "paragraphs": [
        "准备好卷积核后，FFT 卷积在频域的标准执行流程分为四步（对应原书 Fig. 24-13）：",
        "1. **零填充（Zero Padding）**：把输入图像（如 `100×100`）和卷积核（如 `29×29`）都用零填充到**相同的 2 的幂次尺寸**，且必须**大到足够装下完整的最终卷积图像**（`100 + 29 - 1 = 128`，故两者都补零成 `128×128`）。如果不这样做，频域相乘等价于**循环卷积（Circular Convolution）**，超出边界的能量会绕回到图像另一侧，造成严重失真。",
        "2. **二维 FFT 正变换**：对补零后的两个图像分别做二维 FFT，得到 **4 个** `128×128` 数组（图像 A 的实部/虚部，核 B 的实部/虚部）。",
        "3. **频域复数逐点相乘**：利用第 9 章复数乘法公式（Eq. 9-1）将两者的实部与虚部逐点相乘，生成输出频谱 C 的实部与虚部。",
        "4. **二维 IFFT 反变换**：对频谱 C 做二维逆傅里叶变换，即可得到最终的卷积（相关）结果图。图中每个像素的亮度代表该处与目标的匹配度；定位整张图最亮的那个像素，就是人脸的坐标。"
      ],
      "formula": {
        "expr": "Re{C} = Re{A}·Re{B} - Im{A}·Im{B},   Im{C} = Re{A}·Im{B} + Im{A}·Re{B}",
        "explain": "频域复数逐点相乘（Eq. 9-1）：将空间域复杂的二维滑动乘加，化简为频域每个坐标点上仅 4 次实数乘法与 2 次加减。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：真·2D FFT 卷积流水线与循环卷绕失真",
      "instruction": "把目标向右移到靠近边界，然后开关“2 的幂次补零”，观察未补零时左侧出现的粉色循环卷积鬼影；再拖动卷积核尺寸滑块，对比 512×512 图像在空域与 FFT 下的算力差距。",
      "controls": [
        {
          "type": "toggle",
          "id": "zeroPad",
          "label": "开启 2 的幂次补零 (32→64)",
          "value": true
        },
        {
          "type": "slider",
          "id": "kernelSize",
          "label": "卷积核尺寸 M×M",
          "min": 5,
          "max": 23,
          "step": 2,
          "value": 13,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "objX",
          "label": "目标水平位置 X",
          "min": 8,
          "max": 27,
          "step": 1,
          "value": 24,
          "unit": " px"
        }
      ],
      "jsCode": "const IMG_N = 32;\n\nfunction fft1d(re, im, invert) {\n  const n = re.length;\n  for (let i = 1, j = 0; i < n; i++) {\n    let bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      let tr = re[i]; re[i] = re[j]; re[j] = tr;\n      let ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (let len = 2; len <= n; len <<= 1) {\n    const ang = (2 * Math.PI / len) * (invert ? 1 : -1);\n    const wlenRe = Math.cos(ang);\n    const wlenIm = Math.sin(ang);\n    const half = len >> 1;\n    for (let i = 0; i < n; i += len) {\n      let wRe = 1, wIm = 0;\n      for (let j = 0; j < half; j++) {\n        const idx1 = i + j;\n        const idx2 = idx1 + half;\n        const uRe = re[idx1], uIm = im[idx1];\n        const vRe = re[idx2] * wRe - im[idx2] * wIm;\n        const vIm = re[idx2] * wIm + im[idx2] * wRe;\n        re[idx1] = uRe + vRe;\n        im[idx1] = uIm + vIm;\n        re[idx2] = uRe - vRe;\n        im[idx2] = uIm - vIm;\n        const nextWRe = wRe * wlenRe - wIm * wlenIm;\n        wIm = wRe * wlenIm + wIm * wlenRe;\n        wRe = nextWRe;\n      }\n    }\n  }\n  if (invert) {\n    for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }\n  }\n}\n\nfunction fft2d(re, im, N, invert) {\n  const rowRe = new Float64Array(N);\n  const rowIm = new Float64Array(N);\n  for (let y = 0; y < N; y++) {\n    const off = y * N;\n    for (let x = 0; x < N; x++) { rowRe[x] = re[off + x]; rowIm[x] = im[off + x]; }\n    fft1d(rowRe, rowIm, invert);\n    for (let x = 0; x < N; x++) { re[off + x] = rowRe[x]; im[off + x] = rowIm[x]; }\n  }\n  const colRe = new Float64Array(N);\n  const colIm = new Float64Array(N);\n  for (let x = 0; x < N; x++) {\n    for (let y = 0; y < N; y++) { colRe[y] = re[y * N + x]; colIm[y] = im[y * N + x]; }\n    fft1d(colRe, colIm, invert);\n    for (let y = 0; y < N; y++) { re[y * N + x] = colRe[y]; im[y * N + x] = colIm[y]; }\n  }\n}\n\nlab.onUpdate(() => {\n  const { ctx, width, height, values } = lab;\n  const padOn = !!values.zeroPad;\n  const M = values.kernelSize;\n  const objX = values.objX;\n  const objY = 16;\n  const Nfft = padOn ? 64 : 32;\n  const len = Nfft * Nfft;\n\n  const aRe = new Float64Array(len);\n  const aIm = new Float64Array(len);\n  const bRe = new Float64Array(len);\n  const bIm = new Float64Array(len);\n\n  for (let y = 0; y < IMG_N; y++) {\n    for (let x = 0; x < IMG_N; x++) {\n      let v = 0.06;\n      const d = Math.hypot(x - objX, y - objY);\n      if (d <= 2.6) v = 1.0;\n      if (Math.hypot(x - 6, y - 6) <= 1.2) v = 0.65;\n      aRe[y * Nfft + x] = v;\n    }\n  }\n\n  const halfM = (M - 1) / 2;\n  let kSum = 0;\n  for (let y = 0; y < M; y++) {\n    for (let x = 0; x < M; x++) {\n      const r = Math.hypot(x - halfM, y - halfM);\n      const kv = Math.exp(-(r * r) / (2 * (M * 0.22) * (M * 0.22)));\n      bRe[y * Nfft + x] = kv;\n      kSum += kv;\n    }\n  }\n  for (let i = 0; i < len; i++) bRe[i] /= kSum;\n\n  fft2d(aRe, aIm, Nfft, false);\n  fft2d(bRe, bIm, Nfft, false);\n\n  const cRe = new Float64Array(len);\n  const cIm = new Float64Array(len);\n  const specMag = new Float64Array(len);\n  let specMax = 1e-9;\n  for (let i = 0; i < len; i++) {\n    cRe[i] = aRe[i] * bRe[i] - aIm[i] * bIm[i];\n    cIm[i] = aRe[i] * bIm[i] + aIm[i] * bRe[i];\n    const m = Math.log(1 + Math.hypot(cRe[i], cIm[i]));\n    specMag[i] = m;\n    if (m > specMax) specMax = m;\n  }\n\n  fft2d(cRe, cIm, Nfft, true);\n\n  let outMax = 1e-9;\n  for (let i = 0; i < len; i++) {\n    if (cRe[i] > outMax) outMax = cRe[i];\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, width, height);\n\n  const s1 = 144, x1 = 16, y1 = 36;\n  const cell = s1 / Nfft;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1. 补零输入 A (' + Nfft + '×' + Nfft + ')', x1, 22);\n  for (let y = 0; y < Nfft; y++) {\n    for (let x = 0; x < Nfft; x++) {\n      const inPad = (x >= IMG_N || y >= IMG_N);\n      const val = inPad ? 0 : (Math.hypot(x - objX, y - objY) <= 2.6 ? 1 : (Math.hypot(x - 6, y - 6) <= 1.2 ? 0.65 : 0.06));\n      if (inPad) {\n        ctx.fillStyle = ((x + y) % 4 === 0) ? '#1e293b' : '#0f172a';\n      } else {\n        const c = Math.round(val * 245);\n        ctx.fillStyle = 'rgb(' + Math.round(c * 0.25) + ',' + Math.round(c * 0.85) + ',' + c + ')';\n      }\n      ctx.fillRect(x1 + x * cell, y1 + y * cell, Math.ceil(cell), Math.ceil(cell));\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(x1, y1, s1, s1);\n  if (padOn) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.setLineDash([3, 3]);\n    ctx.strokeRect(x1, y1, IMG_N * cell, IMG_N * cell);\n    ctx.setLineDash([]);\n    ctx.font = '10px sans-serif';\n    ctx.fillStyle = '#64748b';\n    ctx.fillText('灰纹区 = Zero Padding 补零区', x1, 198);\n  } else {\n    ctx.font = '10px sans-serif';\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('未补零! 需至少 ' + (IMG_N + M - 1) + '×' + (IMG_N + M - 1), x1, 198);\n  }\n\n  const s2 = 112, x2 = 178, y2 = 52;\n  const cell2 = s2 / Nfft;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('2. 频域乘积谱', x2, 22);\n  const halfN = Nfft >> 1;\n  for (let y = 0; y < Nfft; y++) {\n    const sy = (y + halfN) % Nfft;\n    for (let x = 0; x < Nfft; x++) {\n      const sx = (x + halfN) % Nfft;\n      const t = specMag[sy * Nfft + sx] / specMax;\n      const r = Math.round(t * 245);\n      const g = Math.round(t * 158);\n      const b = Math.round(30 + t * 200);\n      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';\n      ctx.fillRect(x2 + x * cell2, y2 + y * cell2, Math.ceil(cell2), Math.ceil(cell2));\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(x2, y2, s2, s2);\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#64748b';\n  ctx.fillText('FFT(A) × FFT(B)', x2 + 12, 182);\n\n  const s3 = 144, x3 = 308, y3 = 36;\n  const spill = Math.max(0, (objX + M - 1) - IMG_N);\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('3. 反变换输出 C', x3, 22);\n  for (let y = 0; y < Nfft; y++) {\n    for (let x = 0; x < Nfft; x++) {\n      const v = Math.max(0, cRe[y * Nfft + x] / outMax);\n      const r = Math.round(v * 16 + v * v * 220);\n      const g = Math.round(v * 185 + v * v * 65);\n      const b = Math.round(25 + v * 130);\n      ctx.fillStyle = 'rgb(' + Math.min(255, r) + ',' + Math.min(255, g) + ',' + Math.min(255, b) + ')';\n      ctx.fillRect(x3 + x * cell, y3 + y * cell, Math.ceil(cell), Math.ceil(cell));\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(x3, y3, s3, s3);\n  if (padOn) {\n    ctx.strokeStyle = '#10b981';\n    ctx.setLineDash([3, 3]);\n    ctx.strokeRect(x3, y3, IMG_N * cell, IMG_N * cell);\n    ctx.setLineDash([]);\n    ctx.font = '10px sans-serif';\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('溢出落入补零区，无卷绕失真', x3, 198);\n  } else if (spill > 0) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.strokeRect(x3 + 1, y3 + 1, Math.min(s3 - 2, (spill + 2) * cell), s3 - 2);\n    ctx.lineWidth = 1;\n    ctx.font = '10px sans-serif';\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('警报: 左侧出现循环卷绕鬼影!', x3, 198);\n  } else {\n    ctx.font = '10px sans-serif';\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('目标远离右边界，暂未越界', x3, 198);\n  }\n\n  const bx = 474, by = 36, bw = 230, bh = 160;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('4. 512×512 算力对比 (核 ' + M + '×' + M + ')', bx, 22);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(bx, by, bw, bh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(bx, by, bw, bh);\n\n  const spatialOps = 512 * 512 * M * M;\n  const fftOps = 33000000;\n  const speedup = spatialOps / fftOps;\n  const maxOps = Math.max(spatialOps, fftOps, 512 * 512 * 25 * 25);\n\n  const wSp = Math.max(4, (spatialOps / maxOps) * (bw - 24));\n  const wFft = Math.max(4, (fftOps / maxOps) * (bw - 24));\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('常规空域卷积: ' + (spatialOps / 1e6).toFixed(1) + 'M 次乘加', bx + 12, by + 28);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(bx + 12, by + 36, wSp, 18);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('2D FFT 卷积: ' + (fftOps / 1e6).toFixed(1) + 'M 固定开销', bx + 12, by + 82);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(bx + 12, by + 90, wFft, 18);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = speedup >= 1 ? '#10b981' : '#f59e0b';\n  ctx.fillText(speedup >= 1 ? ('FFT 提速: ' + speedup.toFixed(2) + ' 倍') : ('核太小，空域更快 (' + (1 / speedup).toFixed(1) + '×)'), bx + 12, by + 132);\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#64748b';\n  ctx.fillText('原书基准: M=50 时 FFT 快约 20 倍', bx + 12, by + 148);\n\n  const req = IMG_N + M - 1;\n  lab.setReadout('FFT 尺寸: ' + Nfft + '×' + Nfft + ' (安全线 ≥ ' + req + ') | ' + (padOn ? '线性卷积正常' : (spill > 0 ? '发生循环卷积卷绕 (' + spill + ' px 溢出)!' : '未补零但尚未越界')) + ' | 512² 算力比: ' + speedup.toFixed(2) + 'x');\n});"
    },
    {
      "type": "concept",
      "heading": "相关法的致命弱点：尺度与角度的苛刻约束",
      "paragraphs": [
        "尽管相关（匹配滤波）抗噪声能力很强，甚至各像素灰度有整体波动也无妨，但它有一个**致命的几何局限**：待检目标在图像中的**大小（尺度）和旋转角度**必须与模板**完全一模一样**。正如你在实验一中拖动“倾角误差”滑块所看到的，只要目标稍微偏转十几度，原本尖锐的相关峰就会瞬间崩塌。",
        "这个局限使得经典相关法在许多真实场景中几乎无能为力——例如：**军事侦察照片中姿态各异的敌方坦克**、**医学影像中形状千差万别的肿瘤**、以及**机场安检 X 光片中随意摆放的手枪**。",
        "虽然理论上可以用不同尺寸、不同旋转角度的多套模板对同一张图反复跑多次相关，但成百上千次的二维 FFT 执行时间会让你瞬间失去耐心。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "**大核用频域，小核留空域**：卷积核在 `10×10` 以下时直接空域滑窗更快；当核大到 `50×50` 时，512×512 图像的 FFT 卷积能提速约 20 倍。",
        "**补零尺寸宁大勿小**：线性卷积最小宽度为 `N_img + N_psf - 1`，必须把图像和核都补零到大于等于该值且为 2 的幂次，否则必然遭遇“边缘能量绕回对侧”的循环卷积失真。",
        "**用卷积算相关记得转 180°**：不旋转 180° 直接把目标当核去卷积，等于在图里找“倒立”的目标，遇到非对称物体必定失效。",
        "**边缘增强是相关峰的放大器**：对卷积核做一次 `3×3` 边缘滤波（高通化），能消除平滑高亮背景的干扰，把平缓的亮包变成针尖般锐利的高峰。",
        "**切勿滥用模板匹配**：经典 FFT 相关法对尺寸缩放和平面旋转零容忍，不适合寻找任意角度和大小变化的复杂目标。"
      ]
    }
  ]
});
