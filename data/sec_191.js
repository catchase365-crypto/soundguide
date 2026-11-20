window.__BOOK_REGISTER_SECTION__("sec_191", {
  "title": "评估神经网络训练结果：泛化检验、ROC 曲线与调参避坑 (Evaluating the Results)",
  "intuition": "训练误差降到零往往只是网络“背下了考题”；只有结合多起点寻优、未见数据的分布检验以及 ROC 曲线，才能选出在真实世界中真正有效的神经网络。",
  "blocks": [
    {
      "type": "concept",
      "heading": "多起点“山谷寻优”与隐藏层的黑箱本质",
      "paragraphs": [
        "在元音图像识别实验中，作者使用**三组不同的随机初始权重**分别运行了三次训练程序（在 100 MHz 奔腾电脑上完成 800 次迭代约需 1 小时）。随着迭代推进，网络总误差 `ESUM` 逐渐下降，并在几百次迭代后趋于稳定。",
        "由于每次起点不同，最终收敛到的解和性能也各不相同。这就像**伞兵降落到山地不同位置后各自往低处走，最终会停在深浅不一的不同山谷底部**。因为无法预先知道哪条路径通往最深的山谷，工程上必须**多次运行学习算法，并从中挑选表现最好的那一组权重作为最终方案**。",
        "观察图 26-10 中三次试验得到的 10 个隐藏节点权重图像，会发现神经网络的第一步操作其实是用输入图像与这些权重模板做**相关运算（先相乘再求和）**。但令人惊奇的是，这些有效权重在人眼看来完全像**随机噪声**——我们能证明它们有效，却很难解释“为什么有效”。相比之下，人类大脑拥有约 **100 万亿个神经元**，每个神经元平均有 **10,000 个连接**；连如此简单的网络权重都难以看透，理解人脑的复杂性更是 21 世纪的巨大挑战。"
      ],
      "formula": {
        "expr": "z_j = Σ_i ( W_{j,i} · X_i )",
        "explain": "X_i 是输入图像的第 i 个像素，W_{j,i} 是第 j 个隐藏节点对应的权重模板像素。隐藏节点输出的核心物理动作就是把输入信号与模板做逐点相乘并累加（相关性检测）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：训练/测试双分布直方图与 ROC 曲线实时切片",
      "instruction": "切换“训练集 / 新测试集”开关对比过拟合差异，拖动“判定阈值”观察直方图切分点与右侧 ROC 曲线上工作点的联动，调节“元音误差惩罚倍率”体验分布窄化效应。",
      "controls": [
        {
          "type": "toggle",
          "id": "dataset",
          "label": "使用新测试集 (261-1300号图像，关闭则看训练集)",
          "value": true
        },
        {
          "type": "slider",
          "id": "threshold",
          "label": "输出判定阈值",
          "min": 0.05,
          "max": 0.95,
          "step": 0.01,
          "value": 0.44,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "penalty",
          "label": "目标(元音)误差惩罚倍率",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 5,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "trial",
          "label": "模型试验编号 (1=a, 2=b最优, 3=c)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": "号"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction normPdf(x, mean, std) {\n  const z = (x - mean) / std;\n  return Math.exp(-0.5 * z * z) / (std * 2.506628);\n}\n\nfunction normCdf(x, mean, std) {\n  const z = (x - mean) / (std * 1.41421356);\n  const t = 1 / (1 + 0.3275911 * Math.abs(z));\n  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));\n  const erf = 1 - poly * Math.exp(-z * z);\n  return 0.5 * (1 + (z >= 0 ? erf : -erf));\n}\n\nfunction getParams(trialId, isTest, penalty) {\n  const penFactor = 1 + (penalty - 1) * 0.14;\n  if (!isTest) {\n    return {\n      nvMean: 0.15, nvStd: 0.068,\n      vMean: 0.85, vStd: 0.095 / penFactor\n    };\n  }\n  if (trialId === 1) {\n    return {\n      nvMean: 0.22, nvStd: 0.16,\n      vMean: 0.64, vStd: 0.25 / penFactor\n    };\n  }\n  if (trialId === 2) {\n    return {\n      nvMean: 0.19, nvStd: 0.145,\n      vMean: 0.68, vStd: 0.21 / penFactor\n    };\n  }\n  return {\n    nvMean: 0.26, nvStd: 0.18,\n    vMean: 0.60, vStd: 0.28 / penFactor\n  };\n}\n\nfunction draw() {\n  const isTest = lab.values.dataset;\n  const thresh = lab.values.threshold;\n  const penalty = lab.values.penalty;\n  const trial = lab.values.trial;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const hx0 = 42, hx1 = 368, hy0 = 28, hy1 = 205;\n  const hw = hx1 - hx0, hh = hy1 - hy0;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = hy0 + (hh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(hx0, yy); ctx.lineTo(hx1, yy); ctx.stroke();\n    const xx = hx0 + (hw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(xx, hy0); ctx.lineTo(xx, hy1); ctx.stroke();\n  }\n\n  ctx.strokeStyle = \"rgba(248,250,252,0.45)\";\n  ctx.beginPath();\n  ctx.moveTo(hx0, hy0); ctx.lineTo(hx0, hy1); ctx.lineTo(hx1, hy1);\n  ctx.stroke();\n\n  const p = getParams(trial, isTest, penalty);\n  const bins = 20;\n  const bw = hw / bins;\n  const nvMass = [], vMass = [];\n  let nvSum = 0, vSum = 0;\n  for (let b = 0; b < bins; b++) {\n    const xc = (b + 0.5) / bins;\n    const nv = normPdf(xc, p.nvMean, p.nvStd);\n    const v = normPdf(xc, p.vMean, p.vStd);\n    nvMass.push(nv);\n    vMass.push(v);\n    nvSum += nv;\n    vSum += v;\n  }\n\n  const maxBar = 0.48;\n  for (let b = 0; b < bins; b++) {\n    const nvRel = nvMass[b] / nvSum;\n    const vRel = vMass[b] / vSum;\n    const bx = hx0 + b * bw;\n\n    const nvH = Math.min(1, nvRel / maxBar) * hh;\n    ctx.fillStyle = \"rgba(56, 189, 248, 0.85)\";\n    ctx.fillRect(bx + 2, hy1 - nvH, bw * 0.42, nvH);\n\n    const vH = Math.min(1, vRel / maxBar) * hh;\n    ctx.fillStyle = \"rgba(16, 185, 129, 0.28)\";\n    ctx.fillRect(bx + bw * 0.48, hy1 - vH, bw * 0.42, vH);\n    ctx.strokeStyle = \"#10b981\";\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(bx + bw * 0.48, hy1 - vH, bw * 0.42, vH);\n  }\n\n  const tx = hx0 + thresh * hw;\n  ctx.strokeStyle = \"#f59e0b\";\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 3]);\n  ctx.beginPath(); ctx.moveTo(tx, hy0); ctx.lineTo(tx, hy1); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.font = \"11px sans-serif\";\n  ctx.fillText(\"阈值 \" + thresh.toFixed(2), Math.min(tx + 4, hx1 - 54), hy0 + 13);\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(isTest ? \"b. 新数据库直方图 (261-1300)\" : \"a. 训练集直方图 (前260张)\", hx0 + 4, 18);\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.font = \"11px sans-serif\";\n  ctx.fillText(\"■ 非元音\", hx0 + 6, hy0 + 28);\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"□ 元音\", hx1 - 52, hy0 + 28);\n  ctx.fillStyle = \"rgba(248,250,252,0.75)\";\n  ctx.fillText(\"0.0\", hx0 - 6, hy1 + 14);\n  ctx.fillText(\"0.5\", hx0 + hw * 0.5 - 8, hy1 + 14);\n  ctx.fillText(\"1.0 (输出值)\", hx1 - 48, hy1 + 14);\n\n  const rx0 = 445, rx1 = 685, ry0 = 28, ry1 = 205;\n  const rw = rx1 - rx0, rh = ry1 - ry0;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const yy = ry0 + (rh * i) / 5;\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx1, yy); ctx.stroke();\n    const xx = rx0 + (rw * i) / 5;\n    ctx.beginPath(); ctx.moveTo(xx, ry0); ctx.lineTo(xx, ry1); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(248,250,252,0.45)\";\n  ctx.beginPath();\n  ctx.moveTo(rx0, ry0); ctx.lineTo(rx0, ry1); ctx.lineTo(rx1, ry1);\n  ctx.stroke();\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.2)\";\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(rx0, ry1); ctx.lineTo(rx1, ry0); ctx.stroke();\n  ctx.setLineDash([]);\n\n  const trialNames = [\"\", \"a\", \"b (最优)\", \"c\"];\n  const trialColors = [\"\", \"#38bdf8\", \"#10b981\", \"#ec4899\"];\n\n  for (let t = 1; t <= 3; t++) {\n    const tp = getParams(t, isTest, penalty);\n    const active = (t === trial);\n    ctx.strokeStyle = active ? trialColors[t] : \"rgba(248,250,252,0.25)\";\n    ctx.lineWidth = active ? 2.8 : 1.3;\n    ctx.beginPath();\n    for (let s = 0; s <= 100; s++) {\n      const th = s / 100;\n      const fpr = 1 - normCdf(th, tp.nvMean, tp.nvStd);\n      const tpr = 1 - normCdf(th, tp.vMean, tp.vStd);\n      const px = rx0 + fpr * rw;\n      const py = ry1 - tpr * rh;\n      if (s === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const curFpr = 1 - normCdf(thresh, p.nvMean, p.nvStd);\n  const curTpr = 1 - normCdf(thresh, p.vMean, p.vStd);\n  const dotX = rx0 + curFpr * rw;\n  const dotY = ry1 - curTpr * rh;\n\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.beginPath();\n  ctx.arc(dotX, dotY, 5.5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = \"#f8fafc\";\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"ROC 性能曲线 (试验 \" + trialNames[trial] + \")\", rx0, 18);\n  ctx.font = \"11px sans-serif\";\n  ctx.fillStyle = \"rgba(248,250,252,0.75)\";\n  ctx.fillText(\"0%\", rx0 - 20, ry1 + 4);\n  ctx.fillText(\"100%\", rx0 - 32, ry0 + 6);\n  ctx.fillText(\"误报率 (非元音 %)\", rx0 + rw * 0.28, ry1 + 16);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.fillText(\"(\" + (curFpr * 100).toFixed(1) + \"%, \" + (curTpr * 100).toFixed(1) + \"%)\", Math.min(dotX + 8, rx1 - 78), Math.max(dotY + 12, ry0 + 14));\n\n  const modeStr = isTest ? \"新测试集\" : \"训练集(已见过答案)\";\n  lab.setReadout(\"模型: 试验\" + trialNames[trial] + \" | 数据: \" + modeStr + \" | 元音检出率: \" + (curTpr * 100).toFixed(1) + \"% | 非元音误报率: \" + (curFpr * 100).toFixed(1) + \"%\");\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "“作弊”的训练集直方图与非对称误差分布",
      "paragraphs": [
        "图 26-11a 展示了训练集中前 **260 张字母图像**的网络输出直方图。在训练阶段，我们的目标是让元音输出接近 `1`，非元音输出接近 `0`。从直方图可以看到，元音与非元音两个分布实现了**完全分离，没有任何重叠**。",
        "另外注意一个细节：图中的**元音分布比非元音分布更窄、更集中**。这是因为在编写训练代码（第 2220 行）时，作者特意设定**目标（元音）误差的重要性是非目标（非元音）误差的 5 倍**，从而迫使网络更严格地把元音输出压紧到目标值附近。",
        "然而，当把数据库中剩余的 **第 261 到第 1300 张图像**（共 1040 张未见图像）输入网络时，如图 26-11b 所示，两类分布虽然大致分开，但**出现了明显重叠**。为什么前 260 张表现完美，后 1040 张却变差了？书中给出了极其精辟的回答：**图 (a) 是在“作弊”！如果你事先已经看过考题的答案，考满分当然轻而易举**——神经网络往往先死记硬背了训练集里的特定图像特征，而非彻底学会区分元音与非元音的通用规律。"
      ],
      "formula": {
        "expr": "E_total = 5 · Σ E_target + 1 · Σ E_nontarget",
        "explain": "对目标类别（元音）施加 5 倍的误差权重，会使优化器优先压缩目标类输出分布的方差，导致在直方图上呈现“元音窄、非元音宽”的非对称形态。"
      }
    },
    {
      "type": "concept",
      "heading": "用 ROC 曲线量化并挑选最优神经网络",
      "paragraphs": [
        "为了客观比较三次随机试验得到的三个网络，图 26-12 使用了 **ROC 曲线（Receiver Operating Characteristic）**，横轴为**报告的非元音比例（误报率 / 假阳率）**，纵轴为**报告的元音比例（检出率 / 真阳率）**。",
        "ROC 曲线越贴近图表的**左上角** `(0%, 100%)`，说明模型在不误报非元音的前提下检出元音的能力越强。从图中可以清晰看出，**试验 (b) 的性能显著优于 (a) 和 (c)**——这完全源于初始随机权重所带来的随机运气。",
        "在某一特定阈值下，试验 (b) 设计出的网络可以正确检测出 **25 个目标中的 24 个（即 96% 的元音检出率）**，同时每 25 个非目标中仅产生 **1 次误报（即 4% 的假警报率）**，即曲线上的点 `(x = 4%, y = 96%)`。考虑到这个抽象问题的难度以及所用方法的高度通用性，这一成绩相当出色。"
      ],
      "formula": {
        "expr": "TPR = TP / (TP + FN) ,   FPR = FP / (FP + TN)",
        "explain": "TPR（纵轴）为真阳率，即正确检出的元音占全部元音的比例；FPR（横轴）为假阳率，即被误判为元音的非元音占全部非元音的比例。调整输出判定阈值即可在曲线上移动工作点。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：收敛调参三板斧与“神经网络墨菲定律”诊断仪",
      "instruction": "调节步长 MU 与初始权重幅度，观察左侧山谷寻优路径与右侧 ESUM 迭代曲线的收敛/震荡状态；增大“训练样本偏差”体验现实应用误差如何急剧恶化。",
      "controls": [
        {
          "type": "slider",
          "id": "mu",
          "label": "学习步长 MU",
          "min": 5,
          "max": 100,
          "step": 1,
          "value": 35,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "initScale",
          "label": "初始随机权重幅度",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 4,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "domainShift",
          "label": "训练样本与真实数据偏差",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 10,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "reseed",
          "label": "切换初始随机起点组",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction loss(w) {\n  return 0.54 + 0.21 * Math.sin(3.1 * w + 0.6) + 0.14 * Math.cos(5.6 * w) + 0.11 * w * w;\n}\n\nfunction dLoss(w) {\n  return 0.21 * 3.1 * Math.cos(3.1 * w + 0.6) - 0.14 * 5.6 * Math.sin(5.6 * w) + 0.22 * w;\n}\n\nfunction draw() {\n  const mu = lab.values.mu;\n  const initScale = lab.values.initScale;\n  const shift = lab.values.domainShift;\n  const reseed = lab.values.reseed;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx0 = 38, lx1 = 350, ly0 = 28, ly1 = 205;\n  const lw = lx1 - lx0, lh = ly1 - ly0;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ly0 + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx0, yy); ctx.lineTo(lx1, yy); ctx.stroke();\n    const xx = lx0 + (lw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(xx, ly0); ctx.lineTo(xx, ly1); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(248,250,252,0.45)\";\n  ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx0, ly1); ctx.lineTo(lx1, ly1); ctx.stroke();\n\n  // Draw error landscape\n  ctx.strokeStyle = \"rgba(248,250,252,0.6)\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 120; i++) {\n    const w = -1.5 + (3.0 * i) / 120;\n    const e = loss(w);\n    const px = lx0 + (i / 120) * lw;\n    const py = ly1 - Math.min(1, e / 1.15) * lh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Simulate 3 random trials\n  const baseStarts = reseed ? [-1.22, -0.08, 1.08] : [-0.88, -0.46, 0.78];\n  const scaleFactor = 0.65 + initScale * 0.065;\n  const tColors = [\"#38bdf8\", \"#10b981\", \"#ec4899\"];\n  const tLabels = [\"a\", \"b\", \"c\"];\n  const lr = (mu / 100) * 0.22;\n  let bestValley = 1.0;\n\n  for (let t = 0; t < 3; t++) {\n    let w = Math.max(-1.45, Math.min(1.45, baseStarts[t] * scaleFactor));\n    const wStart = w;\n    for (let step = 0; step < 30; step++) {\n      w = Math.max(-1.48, Math.min(1.48, w - lr * dLoss(w)));\n    }\n    const eEnd = loss(w);\n    if (eEnd < bestValley) bestValley = eEnd;\n\n    const sx = lx0 + ((wStart + 1.5) / 3.0) * lw;\n    const sy = ly1 - Math.min(1, loss(wStart) / 1.15) * lh;\n    const ex = lx0 + ((w + 1.5) / 3.0) * lw;\n    const ey = ly1 - Math.min(1, eEnd / 1.15) * lh;\n\n    ctx.strokeStyle = tColors[t];\n    ctx.lineWidth = 1.4;\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.fillStyle = \"rgba(248,250,252,0.5)\";\n    ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();\n\n    ctx.fillStyle = tColors[t];\n    ctx.beginPath(); ctx.arc(ex, ey, 5.2, 0, Math.PI * 2); ctx.fill();\n    ctx.font = \"bold 11px sans-serif\";\n    ctx.fillText(tLabels[t], ex - 3, ey - 9);\n  }\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"多起点山谷寻优地形 (3次随机试验)\", lx0 + 4, 18);\n  ctx.font = \"11px sans-serif\";\n  ctx.fillStyle = \"rgba(248,250,252,0.75)\";\n  ctx.fillText(\"权重空间 (不同初始位置)\", lx0 + lw * 0.25, ly1 + 16);\n\n  // Right panel: ESUM vs Iterations (0..800)\n  const rx0 = 405, rx1 = 695, ry0 = 28, ry1 = 205;\n  const rw = rx1 - rx0, rh = ry1 - ry0;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ry0 + (rh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx1, yy); ctx.stroke();\n    const xx = rx0 + (rw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(xx, ry0); ctx.lineTo(xx, ry1); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(248,250,252,0.45)\";\n  ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx0, ry1); ctx.lineTo(rx1, ry1); ctx.stroke();\n\n  const rate = 0.008 + (mu / 35) * 0.048;\n  const oscAmp = mu > 55 ? ((mu - 55) / 45) * (0.22 + initScale * 0.025) : (initScale > 7 && mu > 38 ? 0.06 : 0);\n  const trainArr = [], realArr = [];\n  let finalTrain = 0, finalReal = 0;\n\n  for (let i = 0; i <= 80; i++) {\n    const osc = oscAmp * Math.sin(i * 1.7 + Math.cos(i * 0.9) * 2.2);\n    const base = Math.max(0.08, bestValley * 0.45) + (0.92 - bestValley * 0.45) * Math.exp(-rate * i);\n    const tr = Math.max(0.05, Math.min(1.08, base + osc));\n    const rl = Math.max(0.08, Math.min(1.12, tr + 0.07 + (shift / 100) * (0.52 + 0.16 * (1 - Math.exp(-rate * i)))));\n    trainArr.push(tr);\n    realArr.push(rl);\n    if (i === 80) { finalTrain = tr; finalReal = rl; }\n  }\n\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 80; i++) {\n    const px = rx0 + (i / 80) * rw;\n    const py = ry1 - Math.min(1, trainArr[i] / 1.15) * rh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = \"#ec4899\";\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 3]);\n  ctx.beginPath();\n  for (let i = 0; i <= 80; i++) {\n    const px = rx0 + (i / 80) * rw;\n    const py = ry1 - Math.min(1, realArr[i] / 1.15) * rh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"800次迭代误差曲线 (ESUM)\", rx0, 18);\n  ctx.font = \"11px sans-serif\";\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"— 训练ESUM\", rx1 - 155, ry0 + 14);\n  ctx.fillStyle = \"#ec4899\";\n  ctx.fillText(\"-- 真实应用误差\", rx1 - 85, ry0 + 14);\n  ctx.fillStyle = \"rgba(248,250,252,0.75)\";\n  ctx.fillText(\"0\", rx0 - 4, ry1 + 14);\n  ctx.fillText(\"400\", rx0 + rw * 0.48, ry1 + 14);\n  ctx.fillText(\"800 (迭代次数)\", rx1 - 68, ry1 + 14);\n\n  let diag = \"稳步收敛\";\n  if (mu < 18) diag = \"收敛过慢 (建议增大 MU)\";\n  else if (mu > 55) diag = \"剧烈震荡不收敛 (按顺序先调小 MU!)\";\n  const murphy = shift >= 35 ? \" | 警告: 触发墨菲定律(训练数据失真)\" : \"\";\n  lab.setReadout(\"训练ESUM: \" + finalTrain.toFixed(2) + \" | 真实误差: \" + finalReal.toFixed(2) + \" | 状态: \" + diag + murphy);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "收敛调参的严格优先级与“神经网络墨菲定律”",
      "paragraphs": [
        "让神经网络在训练中顺利收敛往往颇为棘手。如果网络总误差 `ESUM` 没有稳步下降，就必须**立即终止程序、修改参数并重新启动**，有时甚至需要尝试好几次才能成功。",
        "书中明确给出了影响收敛的三大调节手段，并强调必须**严格按照以下先后顺序**进行调整：**（1）学习步长 `MU`；（2）初始随机权重的幅度；（3）隐藏层节点的数量**。",
        "最后，神经网络开发中最致命、最关键的环节是**训练样本的有效性（Validity）**。例如在研发全新商业产品时，手头往往只有来自原型机、计算机仿真或经验猜测的测试数据；一旦用这些初步数据训练网络，它在最终真实场景中就很可能失效。**训练数据库与最终实际数据之间的任何差异，都会直接导致神经网络性能大幅退化——这就是“神经网络的墨菲定律”。** 千万不要在这件事上心存侥幸或试图自欺欺人，现实绝不会给你留情面。"
      ],
      "formula": {
        "expr": null,
        "explain": "调参铁律：先调 MU（控步长），次调初始权重幅度（防饱和或卡死），最后才改隐藏节点数（调模型容量）；且训练集分布必须严格对齐真实应用分布。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（单次训练陷阱）：神经网络目标函数存在大量深浅不一的“山谷”，绝不能只跑一次就上线，必须用不同随机初始权重多跑几轮，通过独立验证集挑出最优解。",
        "避坑 2（训练集幻觉）：训练集 100% 分离极可能是“背题作弊”；评估性能必须盯紧未见测试集的分布重叠度与 ROC 曲线（越靠近左上角越好）。",
        "避坑 3（调参顺序）：当 ESUM 不稳步下降时，直接停机重来，严格按“1. MU -> 2. 初始权重幅度 -> 3. 隐藏节点数”的顺序调参。",
        "避坑 4（墨菲定律）：仿真数据、原型数据与量产真实数据之间哪怕存在微小偏差，也会彻底击垮网络表现，务必用真实场景采样数据进行训练。"
      ]
    }
  ]
});
