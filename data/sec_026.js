window.__BOOK_REGISTER_SECTION__("sec_026", {
  "title": "空间探索中的数字图像处理 (Space)",
  "intuition": "在人类无法派维修工登月或登陆火星调焦距的深空探测中，DSP 是将恶劣条件下拍到的“烂照片”抢救并拼接成清晰星际地图的唯一手段。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把“烂照片”救回来：深空恶劣成像的 DSP 抢救术",
      "paragraphs": [
        "无人卫星和深空探测器（如火星车、旅行者号）在执行任务时，往往处于极度恶劣的光照、高速相对运动、强宇宙射线干扰和极窄通信带宽的环境中。正如书中所说：**没有人会派一个维修工去火星上拧相机的旋钮**。因此，地面接收到的原始图像通常又暗、又糊、布满噪点。",
        "数字信号处理（DSP）把二维图像看作离散像素矩阵 `I[x, y]`，通过一系列数学算法在地面站完成“无损硬件升级”：**亮度与对比度调整**可以把压缩在狭窄灰度区间里的地貌细节重新拉开；**去噪算法**（如空间域平滑滤波）利用邻域像素的相关性抑制随机传感器噪声；**失焦与运动模糊复原**通过反卷积（Deconvolution）抵消航天器高速飞掠带来的拖影；而**边缘检测**则能自动突出环形山、断层与岩石轮廓，辅助科学家识别地形或引导探测器避障。"
      ],
      "formula": {
        "expr": "I_out[x, y] = α · ( I_smooth[x, y] - c ) + c + β",
        "explain": "I_smooth 是经过邻域去噪后的像素亮度，α 为对比度增益（拉伸细节层次），c 为灰度锚点，β 为亮度偏移量；通过简单的线性映射与空间滤波，即可从昏暗模糊的原图中榨取最大信息量。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：深空探测器回传图像 DSP 抢救台",
      "instruction": "拖动【对比度增益】、【亮度偏移】与【空间去噪】滑块，并切换【边缘轮廓检测】，实时观察昏暗噪点满满的火星地貌如何被 DSP 清晰还原。",
      "controls": [
        {
          "type": "slider",
          "id": "contrast",
          "label": "对比度增益 (α)",
          "min": 0.5,
          "max": 3.5,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "brightness",
          "label": "亮度偏移 (β)",
          "min": -40,
          "max": 80,
          "step": 5,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "denoise",
          "label": "邻域平滑去噪",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "edgeEnhance",
          "label": "开启边缘轮廓增强",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width, H = lab.height;\nconst pw = 280, ph = 164;\nconst N = pw * ph;\nconst rawImg = new Float32Array(N);\n\nlet seed = 42;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\n\nfor (let y = 0; y < ph; y++) {\n  for (let x = 0; x < pw; x++) {\n    let v = 60 + 14 * Math.sin(x * 0.03) * Math.cos(y * 0.04) + 8 * Math.sin((x + y) * 0.06);\n    const d1 = Math.hypot(x - 92, y - 76);\n    if (d1 < 36) {\n      const r = d1 / 36;\n      v += (r > 0.76 ? 32 * (1 - Math.abs(r - 0.88) / 0.12) : -26 * (1 - r * r));\n    }\n    const d2 = Math.hypot(x - 196, y - 104);\n    if (d2 < 24) {\n      const r = d2 / 24;\n      v += (r > 0.74 ? 26 * (1 - Math.abs(r - 0.86) / 0.14) : -20 * (1 - r * r));\n    }\n    const d3 = Math.hypot(x - 152, y - 40);\n    if (d3 < 16) {\n      const r = d3 / 16;\n      v += (r > 0.7 ? 20 : -15 * (1 - r));\n    }\n    const ridge = Math.abs(y - (124 - 0.34 * x + 10 * Math.sin(x * 0.05)));\n    if (ridge < 5) v -= (5 - ridge) * 4.5;\n    const degraded = v * 0.38 + 14 + (rand() + rand() - 1) * 24;\n    rawImg[y * pw + x] = degraded < 0 ? 0 : (degraded > 255 ? 255 : degraded);\n  }\n}\n\nconst leftData = ctx.createImageData(pw, ph);\nconst rightData = ctx.createImageData(pw, ph);\nconst tmpH = new Float32Array(N);\nconst smoothed = new Float32Array(N);\n\nfunction clamp(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }\n\nlab.onUpdate(() => {\n  const contrast = lab.values.contrast;\n  const bright = lab.values.brightness;\n  const denoise = lab.values.denoise / 100;\n  const edgeOn = lab.values.edgeEnhance;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  for (let i = 0; i < N; i++) {\n    const v = rawImg[i];\n    const idx = i * 4;\n    leftData.data[idx] = v;\n    leftData.data[idx + 1] = v * 0.84;\n    leftData.data[idx + 2] = v * 0.72;\n    leftData.data[idx + 3] = 255;\n  }\n  ctx.putImageData(leftData, 36, 44);\n\n  const rad = denoise > 0.45 ? 2 : (denoise > 0 ? 1 : 0);\n  if (rad === 0) {\n    for (let i = 0; i < N; i++) smoothed[i] = rawImg[i];\n  } else {\n    for (let y = 0; y < ph; y++) {\n      const row = y * pw;\n      for (let x = 0; x < pw; x++) {\n        let sum = 0, cnt = 0;\n        for (let dx = -rad; dx <= rad; dx++) {\n          const xx = x + dx;\n          if (xx >= 0 && xx < pw) { sum += rawImg[row + xx]; cnt++; }\n        }\n        tmpH[row + x] = sum / cnt;\n      }\n    }\n    for (let y = 0; y < ph; y++) {\n      for (let x = 0; x < pw; x++) {\n        let sum = 0, cnt = 0;\n        for (let dy = -rad; dy <= rad; dy++) {\n          const yy = y + dy;\n          if (yy >= 0 && yy < ph) { sum += tmpH[yy * pw + x]; cnt++; }\n        }\n        const avg = sum / cnt;\n        const idx = y * pw + x;\n        smoothed[idx] = rawImg[idx] * (1 - denoise) + avg * denoise;\n      }\n    }\n  }\n\n  let edgeCount = 0;\n  for (let y = 0; y < ph; y++) {\n    for (let x = 0; x < pw; x++) {\n      const i = y * pw + x;\n      let v = clamp((smoothed[i] - 40) * contrast + 40 + bright);\n      let r = v, g = v * 0.86, b = v * 0.74;\n      if (edgeOn && x > 0 && x < pw - 1 && y > 0 && y < ph - 1) {\n        const gx = smoothed[i + 1] - smoothed[i - 1];\n        const gy = smoothed[i + pw] - smoothed[i - pw];\n        const mag = Math.hypot(gx, gy) * contrast;\n        if (mag > 16) {\n          const e = Math.min(1, (mag - 16) / 30);\n          r = r * (1 - e) + 16 * e;\n          g = g * (1 - e) + 185 * e;\n          b = b * (1 - e) + 129 * e;\n          edgeCount++;\n        }\n      }\n      const idx = i * 4;\n      rightData.data[idx] = r;\n      rightData.data[idx + 1] = g;\n      rightData.data[idx + 2] = b;\n      rightData.data[idx + 3] = 255;\n    }\n  }\n  ctx.putImageData(rightData, 404, 44);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(36, 44, pw, ph);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.strokeRect(404, 44, pw, ph);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('探测器原始回传 (低对比 / 高噪声)', 36, 30);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('DSP 地面站抢救输出 (增强 / 去噪 / 边缘)', 404, 30);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 16px sans-serif';\n  ctx.fillText('DSP ➔', 332, 130);\n\n  lab.setReadout('对比度: ' + contrast.toFixed(1) + 'x | 亮度偏移: ' + (bright >= 0 ? '+' : '') + bright + ' | 平滑去噪: ' + Math.round(denoise * 100) + '% | 环形山边缘提取: ' + (edgeOn ? edgeCount + ' 像素' : '关闭'));\n});"
    },
    {
      "type": "concept",
      "heading": "空间畸变扭曲校正与多图数据库虚拟飞越",
      "paragraphs": [
        "探测器面临的另一个棘手问题是**空间几何畸变（Spatial Distortion）**。相机传感器芯片是平面的，而被拍摄的行星却是一个巨大的三维球体。直接用平面成像去记录球面，会导致行星边缘区域的地形被严重压缩、经纬线弯曲变形，就像把橘子皮直接硬压在桌面上一样。",
        "利用 DSP 的**图像扭曲变换（Image Warping）**，我们可以根据拍摄时刻的探测器姿态、相机视角和行星半径建立几何映射模型，将畸变的二维像素坐标反向重采样（Resampling）回标准的平面地图坐标。完成单张校正后，科学家再把成千上万张不同轨道拍下的局部照片精准对齐、融合进**单一的大型地理数据库**中——这样不仅能生成全球无接缝全景图，还能让虚拟摄像机沿着任意航线掠过地表，渲染出震撼的“行星低空模拟飞越”视频序列。"
      ],
      "formula": {
        "expr": "(u, v) = T⁻¹(x, y)  →  I_rectified[x, y] = Interpolate( I_raw, u, v )",
        "explain": "T⁻¹ 是从标准平面地图坐标 (x, y) 到原始球面畸变照片坐标 (u, v) 的逆映射函数；通过反向查表并结合双线性插值（Interpolate），即可消除球面透视畸变，避免出现黑洞或像素撕裂。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：球面行星几何反演校正与模拟飞越",
      "instruction": "调节【球面透视畸变】滑块观察边缘地貌被压缩弯曲的现象，开启【DSP 空间反演校正】拉直网格并拼接数据库，体验【模拟轨道飞越】。",
      "controls": [
        {
          "type": "slider",
          "id": "distortion",
          "label": "球面透视畸变",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 85,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "warpCorrect",
          "label": "开启 DSP 空间反演校正",
          "value": false
        },
        {
          "type": "toggle",
          "id": "flyover",
          "label": "模拟轨道数据库飞越",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width, H = lab.height;\nlet lastT = 0;\n\nconst craters = [\n  { u: -0.55, v: -0.35, r: 0.16 },\n  { u: 0.22, v: -0.45, r: 0.13 },\n  { u: -0.12, v: 0.18, r: 0.20 },\n  { u: 0.52, v: 0.28, r: 0.15 },\n  { u: -0.62, v: 0.45, r: 0.12 },\n  { u: 0.05, v: -0.08, r: 0.09 }\n];\n\nfunction projectSphere(u, v, k) {\n  const r2 = u * u + v * v;\n  const scale = 1 - k * 0.36 * r2;\n  return [u * scale, v * scale];\n}\n\nfunction drawGrid(cx, cy, rw, rh, k, color, isWarpedPanel, corrected) {\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 1;\n  const steps = 16;\n  for (let i = -4; i <= 4; i++) {\n    const u0 = i / 4;\n    ctx.beginPath();\n    for (let s = 0; s <= steps; s++) {\n      const v0 = -1 + (2 * s) / steps;\n      const effK = (isWarpedPanel && corrected) ? 0 : (isWarpedPanel && !corrected ? k * 0.85 : k);\n      const [px, py] = projectSphere(u0, v0, effK);\n      const sx = cx + px * rw;\n      const sy = cy + py * rh;\n      if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.stroke();\n  }\n  for (let j = -3; j <= 3; j++) {\n    const v0 = j / 3;\n    ctx.beginPath();\n    for (let s = 0; s <= steps; s++) {\n      const u0 = -1 + (2 * s) / steps;\n      const effK = (isWarpedPanel && corrected) ? 0 : (isWarpedPanel && !corrected ? k * 0.85 : k);\n      const [px, py] = projectSphere(u0, v0, effK);\n      const sx = cx + px * rw;\n      const sy = cy + py * rh;\n      if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.stroke();\n  }\n}\n\nfunction render(t) {\n  const k = lab.values.distortion / 100;\n  const corrected = lab.values.warpCorrect;\n  const flyover = lab.values.flyover;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  // Left panel: Curved Planet Capture\n  const lcx = 175, lcy = 132, lrw = 128, lrh = 84;\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n  ctx.beginPath();\n  ctx.ellipse(lcx, lcy, lrw * (1 - k * 0.14), lrh * (1 - k * 0.14), 0, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  drawGrid(lcx, lcy, lrw, lrh, k, 'rgba(245, 158, 11, 0.45)', false, false);\n  craters.forEach(c => {\n    const [px, py] = projectSphere(c.u, c.v, k);\n    const sx = lcx + px * lrw;\n    const sy = lcy + py * lrh;\n    const squash = 1 - k * 0.45 * (c.u * c.u + c.v * c.v);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.ellipse(sx, sy, c.r * lrw * squash, c.r * lrh * squash, 0, 0, Math.PI * 2);\n    ctx.stroke();\n  });\n\n  // Right panel: Rectified Mosaic & Virtual Flyover\n  const rx = 380, ry = 46, rw = 304, rh = 172;\n  const rcx = rx + rw / 2, rcy = ry + rh / 2;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeStyle = corrected ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  drawGrid(rcx, rcy, rw * 0.46, rh * 0.44, k, corrected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(236, 72, 153, 0.45)', true, corrected);\n  craters.forEach(c => {\n    const effK = corrected ? 0 : k * 0.85;\n    const [px, py] = projectSphere(c.u, c.v, effK);\n    const sx = rcx + px * rw * 0.46;\n    const sy = rcy + py * rh * 0.44;\n    const squash = corrected ? 1 : (1 - effK * 0.45 * (c.u * c.u + c.v * c.v));\n    ctx.strokeStyle = corrected ? '#10b981' : '#ec4899';\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    ctx.ellipse(sx, sy, c.r * rw * 0.46 * squash, c.r * rh * 0.44 * squash, 0, 0, Math.PI * 2);\n    ctx.stroke();\n  });\n\n  // Seam alignment indicator\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = corrected ? 'rgba(56, 189, 248, 0.6)' : 'rgba(236, 72, 153, 0.8)';\n  ctx.beginPath();\n  ctx.moveTo(rcx, ry); ctx.lineTo(rcx, ry + rh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Virtual Flyover Reticle\n  const phase = t * 0.9;\n  const camX = rcx + Math.sin(phase) * (rw * 0.30);\n  const camY = rcy + Math.cos(phase * 0.7) * (rh * 0.25);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(camX - 36, camY - 22, 72, 44);\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';\n  ctx.fillRect(camX - 36, camY - 22, 72, 44);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(flyover ? '虚拟飞越视窗' : '视窗已暂停', camX - 33, camY - 27);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('原始球面畸变拍摄 (边缘压缩弯曲)', 36, 28);\n  ctx.fillStyle = corrected ? '#10b981' : '#ec4899';\n  ctx.fillText(corrected ? 'DSP 反演校正并拼接成全景数据库' : '未校正直接拼接 (接缝错位畸变)', 380, 28);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 16px sans-serif';\n  ctx.fillText('Warp ➔', 316, 134);\n\n  lab.setReadout('球面畸变: ' + Math.round(k * 100) + '% | 几何反演校正: ' + (corrected ? '已拉直对齐' : '未开启 (存在接缝错位)') + ' | 飞越视窗坐标: (' + Math.round(camX - rcx) + ', ' + Math.round(camY - rcy) + ')');\n}\n\nlab.onUpdate(() => {\n  render(lastT);\n});\n\nlab.onLoop((dt, timeSec) => {\n  lastT = timeSec;\n  if (lab.values.flyover) {\n    render(timeSec);\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要指望无中生有：对比度拉伸和锐化能凸显被隐藏的细节，但也会同步放大传感器噪声；工程上必须遵循“先降噪/标定，再增强/边缘提取”的流水线顺序。",
        "空间变换要用“反向映射”：做球面畸变校正（Warping）时，切忌从原图坐标正推新图坐标（会产生空洞锯齿），务必从目标规则网格逆推回原图坐标并配合插值采样。",
        "单帧有限，数据库无限：深空探测的核心思维是把离散的单次抓拍通过几何配准融合成统一的三维/二维地理数据库，从而支撑后续的全球测绘与虚拟漫游。"
      ]
    }
  ]
});
