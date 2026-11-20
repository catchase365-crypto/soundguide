window.__BOOK_REGISTER_SECTION__("sec_187", {
  "title": "目标检测与决策边界：从单阈值权衡到高维参数空间 (Target Detection)",
  "intuition": "目标检测的本质不是单看机器给出了几分，而是结合先验患病率、误报与漏报代价，在多维特征空间里切出最合理的决策边界。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从直方图到后验概率：千万别掉进「先验患病率」陷阱",
      "paragraphs": [
        "在地质找油、天文搜寻地外信号或医学癌症筛查中，我们常通过传感器获得一个测量值（例如 0 到 30 之间的数值），并据此判断「目标 (Target)」是否存在。以癌症检测仪为例：正常人（非目标，Nontarget）的读数通常偏低，而癌症患者（目标，Target）的读数通常偏高。用大量已知健康人和患者的测试结果画出直方图，就能估算出两者的 **概率密度函数 (pdf)**。",
        "然而，真实世界中健康人与患者的分布几乎总是存在重叠。假如一位未知健康状况的新病人测出了 `15` 分：查分布可知健康人测出 15 分的概率为 `2.1%`，癌症患者测出 15 分的概率为 `0.7%`。如果只看机器读数（默认两类人群各占 50%），我们会认为他健康可能性是患癌的 3 倍，即患癌后验概率为 **25%**。",
        "**但这是一个极其危险的常见错误！** 你必须把目标在总人群中的 **先验比例（患病率 Prevalence）** 纳入计算。如果某种癌症在人群中的真实患病率只有千分之一（`0.001`），就必须把健康人 pdf 的面积缩放为 `0.999`，患者 pdf 的面积缩放为 `0.001`。此时再测出 `15` 分，该病人真实患癌的概率骤降到仅 **0.025%**——与原先的 25% 相差整整一千倍！"
      ],
      "formula": {
        "expr": "P(Target | x) = [ p * pdf_t(x) ] / [ p * pdf_t(x) + (1 - p) * pdf_nt(x) ]",
        "explain": "x 为传感器读数；p 为目标在待测总人群中的先验比例（患病率）；pdf_t(x) 与 pdf_nt(x) 分别为目标群与非目标群在 x 处的概率密度。若忽略 p（相当于强行假设 p=0.5），后验概率会严重失真。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：亲眼见证「患病率陷阱」如何颠覆诊断结论",
      "instruction": "保持检测值 x=15 不变，将「人群先验患病率」从 50% 拖低到 0.1%，观察右侧黄色的真实后验概率曲线如何剧烈坍缩；也可勾选下方开关观察左侧 PDF 面积的真实缩放比例。",
      "controls": [
        {
          "type": "slider",
          "id": "testVal",
          "label": "病人检测读数 x",
          "min": 0,
          "max": 30,
          "step": 0.5,
          "value": 15,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "prevPct",
          "label": "人群先验患病率 p",
          "min": 0.1,
          "max": 50,
          "step": 0.1,
          "value": 0.1,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "weightView",
          "label": "按患病率缩放左侧 PDF 面积",
          "value": false
        }
      ],
      "jsCode": "function gauss(x, mu, sig) { const z = (x - mu) / sig; return Math.exp(-0.5 * z * z) / (sig * 2.50662827); }\nfunction draw() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const xVal = lab.values.testVal;\n  const prev = lab.values.prevPct / 100;\n  const scalePdf = lab.values.weightView;\n  ctx.clearRect(0, 0, W, H);\n  const lx0 = 46, lw = 296, y0 = 30, ch = 174, yBot = y0 + ch;\n  const rx0 = 404, rw = 296;\n  const mu1 = 7, s1 = 4.8, mu2 = 21, s2 = 2.4;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = y0 + (ch * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx0, yy); ctx.lineTo(lx0 + lw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx0 + rw, yy); ctx.stroke();\n  }\n  for (let v = 0; v <= 30; v += 5) {\n    const pxL = lx0 + (v / 30) * lw;\n    const pxR = rx0 + (v / 30) * rw;\n    ctx.beginPath(); ctx.moveTo(pxL, y0); ctx.lineTo(pxL, yBot); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(pxR, y0); ctx.lineTo(pxR, yBot); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(lx0, y0, lw, ch);\n  ctx.strokeRect(rx0, y0, rw, ch);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  for (let v = 0; v <= 30; v += 5) {\n    ctx.fillText(String(v), lx0 + (v / 30) * lw, yBot + 15);\n    ctx.fillText(String(v), rx0 + (v / 30) * rw, yBot + 15);\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(scalePdf ? '患病率加权后 PDF (面积=先验比例)' : '原始估计概率密度函数 (PDF)', lx0 + lw / 2, 18);\n  ctx.fillText('后验概率 P(患癌 | x)', rx0 + rw / 2, 18);\n  ctx.textAlign = 'right';\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  const maxPdf = 0.18;\n  for (let i = 0; i <= 4; i++) {\n    const yy = yBot - (ch * i) / 4 + 3;\n    ctx.fillText((maxPdf * i / 4).toFixed(2), lx0 - 5, yy);\n    ctx.fillText((25 * i) + '%', rx0 - 5, yy);\n  }\n  const wNt = scalePdf ? (1 - prev) : 1;\n  const wT = scalePdf ? prev : 1;\n  ctx.lineWidth = 2.2;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const p = gauss(v, mu1, s1) * wNt;\n    const px = lx0 + (v / 30) * lw;\n    const py = yBot - Math.min(1, p / maxPdf) * ch;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const p = gauss(v, mu2, s2) * wT;\n    const px = lx0 + (v / 30) * lw;\n    const py = yBot - Math.min(1, p / maxPdf) * ch;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const p1 = gauss(v, mu1, s1), p2 = gauss(v, mu2, s2);\n    const post = p2 / (p1 + p2 + 1e-12);\n    const px = rx0 + (v / 30) * rw;\n    const py = yBot - post * ch;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const p1 = gauss(v, mu1, s1) * (1 - prev), p2 = gauss(v, mu2, s2) * prev;\n    const post = p2 / (p1 + p2 + 1e-12);\n    const px = rx0 + (v / 30) * rw;\n    const py = yBot - post * ch;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  const p1x = gauss(xVal, mu1, s1), p2x = gauss(xVal, mu2, s2);\n  const naiveP = p2x / (p1x + p2x + 1e-12);\n  const trueP = (prev * p2x) / (prev * p2x + (1 - prev) * p1x + 1e-12);\n  const cxL = lx0 + (xVal / 30) * lw;\n  const cxR = rx0 + (xVal / 30) * rw;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(cxL, y0); ctx.lineTo(cxL, yBot); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cxR, y0); ctx.lineTo(cxR, yBot); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(cxR, yBot - naiveP * ch, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cxR, yBot - trueP * ch, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.textAlign = 'left'; ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 健康 (Nontarget)', lx0 + 8, y0 + 16);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 癌症 (Target)', lx0 + 8, y0 + 32);\n  ctx.fillStyle = 'rgba(248,250,252,0.75)'; ctx.fillText('-- 忽略先验 (假设50%)', rx0 + 8, y0 + 16);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('— 计入患病率真实后验', rx0 + 8, y0 + 32);\n  lab.setReadout('读数 x=' + xVal.toFixed(1) + ' | 健康密度=' + (p1x * 100).toFixed(2) + '% | 癌症密度=' + (p2x * 100).toFixed(2) + '% | 忽略先验误判=' + (naiveP * 100).toFixed(1) + '% → 真实患癌概率=' + (trueP * 100).toFixed(3) + '%');\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "二、二元阈值判决、四类结果与 ROC 曲线权衡",
      "paragraphs": [
        "虽然计算后验概率有助于理解问题，但实际工程往往必须给出干脆的「是 / 否」动作指令（例如：结果高于 **阈值 (Threshold)** 就判为 **阳性 (Positive)**，立即安排穿刺活检；低于阈值则判为 **阴性 (Negative)**，让病人回家）。",
        "因为目标与非目标分布存在重叠，任何阈值都不可避免地产生错误，由此构成目标检测的四种基本结果：**真阳性 (True-Positive, TP)**（有病且检出）、**真阴性 (True-Negative, TN)**（健康且排除）、**假阳性 (False-Positive, FP)**（健康人被误判为阳性，承受不必要的惊吓、穿刺痛苦与费用）、以及最致命的 **假阴性 (False-Negative, FN)**（患者被漏诊放回家，延误治疗甚至危及生命）。",
        "为了直观评估阈值移动带来的得失，工程上广泛使用 **ROC 曲线 (Receiver Operating Characteristic)**：纵轴画目标被正确报阳性的比例（TP 率，越高越好），横轴画非目标被误报阳性的比例（FP 率，越低越好）。检测系统越优秀，ROC 曲线就越向左上角弯曲；若传感器毫无区分能力，ROC 就退化为 45° 对角线（纯瞎猜）。",
        "在单参数问题中，**没有绝对「正确」或「错误」的阈值**。提高阈值能减少假阳性，却必然增加假阴性；降低阈值能抓出更多患者，却会制造大量虚惊一场的假阳性。最终阈值选在哪儿，取决于人类工程师对两种错误代价的伦理与工程权衡——直至达到某种社会可接受的平衡点。"
      ],
      "formula": {
        "expr": "ROC(T) = ( FP_rate(T),  TP_rate(T) ) = ( ∫_{T}^{∞} pdf_nt(x)dx ,  ∫_{T}^{∞} pdf_t(x)dx )",
        "explain": "随着阈值 T 从右向左移动，两个积分面积（阈值右侧的面积）同步增大，ROC 曲线上的工作点沿着曲线从左下角 (0%, 0%) 滑向右上角 (100%, 100%)。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：滑动阈值观察误报/漏报面积与 ROC 工作点联动",
      "instruction": "拖动「判决阈值 T」观察左图粉色假阳性面积(FP)与青绿真阳性面积(TP)的此消彼长；再拖动「分布间距」感受传感器性能如何把 ROC 曲线推向左上角或退化回 45° 瞎猜线。",
      "controls": [
        {
          "type": "slider",
          "id": "threshold",
          "label": "判决阈值 T",
          "min": 0,
          "max": 30,
          "step": 0.5,
          "value": 16,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sep",
          "label": "信号区分度 (分布间距)",
          "min": 0,
          "max": 18,
          "step": 0.5,
          "value": 10,
          "unit": ""
        }
      ],
      "jsCode": "function normCdf(z) {\n  const t = 1 / (1 + 0.2316419 * Math.abs(z));\n  const d = 0.39894228 * Math.exp(-0.5 * z * z);\n  const p = d * t * (0.31938153 + t * (-0.35656378 + t * (1.78147794 + t * (-1.82125598 + t * 1.33027443))));\n  return z > 0 ? 1 - p : p;\n}\nfunction gauss(x, mu, sig) { const z = (x - mu) / sig; return Math.exp(-0.5 * z * z) / (sig * 2.50662827); }\nfunction draw() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const T = lab.values.threshold;\n  const sep = lab.values.sep;\n  const mu1 = 15 - sep / 2, mu2 = 15 + sep / 2, sig = 4.2;\n  ctx.clearRect(0, 0, W, H);\n  const lx0 = 44, lw = 326, y0 = 28, ch = 178, yBot = y0 + ch;\n  const rx0 = 468, rw = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const yy = y0 + (ch * i) / 5;\n    ctx.beginPath(); ctx.moveTo(lx0, yy); ctx.lineTo(lx0 + lw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx0 + rw, yy); ctx.stroke();\n    const rx = rx0 + (rw * i) / 5;\n    ctx.beginPath(); ctx.moveTo(rx, y0); ctx.lineTo(rx, yBot); ctx.stroke();\n  }\n  for (let v = 0; v <= 30; v += 5) {\n    const px = lx0 + (v / 30) * lw;\n    ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, yBot); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(lx0, y0, lw, ch);\n  ctx.strokeRect(rx0, y0, rw, ch);\n  const maxPdf = 0.14;\n  const tx = lx0 + (T / 30) * lw;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';\n  ctx.beginPath(); ctx.moveTo(tx, yBot);\n  for (let i = 0; i <= 100; i++) {\n    const v = T + (30 - T) * (i / 100);\n    const py = yBot - Math.min(1, gauss(v, mu2, sig) / maxPdf) * ch;\n    ctx.lineTo(lx0 + (v / 30) * lw, py);\n  }\n  ctx.lineTo(lx0 + lw, yBot); ctx.closePath(); ctx.fill();\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';\n  ctx.beginPath(); ctx.moveTo(tx, yBot);\n  for (let i = 0; i <= 100; i++) {\n    const v = T + (30 - T) * (i / 100);\n    const py = yBot - Math.min(1, gauss(v, mu1, sig) / maxPdf) * ch;\n    ctx.lineTo(lx0 + (v / 30) * lw, py);\n  }\n  ctx.lineTo(lx0 + lw, yBot); ctx.closePath(); ctx.fill();\n  ctx.lineWidth = 2.2;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const py = yBot - Math.min(1, gauss(v, mu1, sig) / maxPdf) * ch;\n    if (i === 0) ctx.moveTo(lx0 + (v / 30) * lw, py); else ctx.lineTo(lx0 + (v / 30) * lw, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const v = (i / 150) * 30;\n    const py = yBot - Math.min(1, gauss(v, mu2, sig) / maxPdf) * ch;\n    if (i === 0) ctx.moveTo(lx0 + (v / 30) * lw, py); else ctx.lineTo(lx0 + (v / 30) * lw, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx, yBot); ctx.stroke();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(rx0, yBot); ctx.lineTo(rx0 + rw, y0); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 160; i++) {\n    const tt = -8 + (46 * i) / 160;\n    const fp = normCdf((mu1 - tt) / sig);\n    const tp = normCdf((mu2 - tt) / sig);\n    const px = rx0 + fp * rw;\n    const py = yBot - tp * ch;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  const curFP = normCdf((mu1 - T) / sig);\n  const curTP = normCdf((mu2 - T) / sig);\n  const dotX = rx0 + curFP * rw;\n  const dotY = yBot - curTP * ch;\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(dotX, yBot); ctx.lineTo(dotX, dotY); ctx.lineTo(rx0, dotY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(dotX, dotY, 5.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';\n  ctx.fillText('分布曲线与阈值 T=' + T.toFixed(1), lx0 + lw / 2, 17);\n  ctx.fillText('ROC 曲线 (性能权衡)', rx0 + rw / 2, 17);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';\n  for (let v = 0; v <= 30; v += 5) ctx.fillText(String(v), lx0 + (v / 30) * lw, yBot + 14);\n  for (let i = 0; i <= 5; i++) {\n    ctx.textAlign = 'center'; ctx.fillText((i * 20) + '%', rx0 + (rw * i) / 5, yBot + 14);\n    ctx.textAlign = 'right'; ctx.fillText((i * 20) + '%', rx0 - 5, yBot - (ch * i) / 5 + 3);\n  }\n  ctx.textAlign = 'left'; ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981'; ctx.fillText('■ 真阳性 TP (检出目标)', lx0 + 8, y0 + 16);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('■ 假阳性 FP (误报虚惊)', lx0 + 8, y0 + 32);\n  ctx.fillStyle = 'rgba(248,250,252,0.5)'; ctx.fillText('45° 瞎猜线', rx0 + rw * 0.48, yBot - rw * 0.35);\n  lab.setReadout('阈值 T=' + T.toFixed(1) + ' | 真阳性 TP=' + (curTP * 100).toFixed(1) + '% | 漏报率 FN=' + ((1 - curTP) * 100).toFixed(1) + '% | 误报率 FP=' + (curFP * 100).toFixed(1) + '% | 真阴性 TN=' + ((1 - curFP) * 100).toFixed(1) + '%');\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "三、多维参数空间：为什么「分别设阈值 + AND 逻辑」效率极低？",
      "paragraphs": [
        "现实中我们往往能提取多个指标。例如用 X 光图像检测肿瘤时，算法可以先提取可疑区域的 **直径 (参数 1)** 和 **亮度 (参数 2)**。常见但低效的做法是：先用 ROC 分别给直径和亮度各找一个阈值，然后用逻辑门拼接（`直径 > T1 AND 亮度 > T2`）。",
        "为什么这很糟糕？只要把两个参数画成二维平面上的散点图（**参数空间 Parameter Space**），真相就一目了然：许多样本在「直径」单独一维的投影上严重重叠，在「亮度」单独一维的投影上也严重重叠，所以各自设阈值根本分不开；但把它们合在一起放到二维平面里，目标与非目标群体却各自占据不同区域——**只需画一条斜向直线，就能实现 100% 完美分离！**",
        "更深刻的区别在于：一维阈值只有平移权衡，没有绝对对错；但二维及以上的参数空间 **存在绝对错误的划分**。比如在微调斜线位置（向右上或左下平移）时，你是在合理权衡 FP 与 FN；但如果你 **旋转** 了斜线的角度，就会导致假阳性和假阴性 **同时飙升**！",
        "传统模式识别分为两步：1）**特征提取 (Feature Extraction)**，把百万像素的原始图像浓缩成直径、亮度、边缘锐度等少数几个特征（高度依赖经验与试错）；2）**参数空间划分**。在三维空间里人类还能勉强想象分割平面或曲面，但一旦超过三维进入 **超空间 (Hyperspace)**，人脑就会彻底「爆炸」——而这正是我们需要 **神经网络** 来自动完成高维空间划分的根本原因。"
      ],
      "formula": {
        "expr": "w1 * P1 + w2 * P2 + ... + wn * Pn > Threshold",
        "explain": "通过线性加权组合多个特征（等价于在参数空间中画斜线、斜平面或超平面），能够捕捉特征之间的联合分布信息，彻底超越单个参数独立设阈值的逻辑门方案。"
      }
    },
    {
      "type": "lab",
      "heading": "实验三：二维参数空间对决——独立阈值 AND 门 vs 斜向线性分界",
      "instruction": "先在默认的「AND 逻辑门」模式下左右拖动偏移滑块，你会发现无论怎么调都无法避免大量误判；随后开启「使用斜向分界线」，体验 100% 完美分割，并尝试旋转「分界线偏转角度」观察两类错误同时恶化！",
      "controls": [
        {
          "type": "toggle",
          "id": "useDiag",
          "label": "使用斜向分界线 (关闭=传统AND门)",
          "value": false
        },
        {
          "type": "slider",
          "id": "offset",
          "label": "决策边界平移偏移",
          "min": -50,
          "max": 50,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "angle",
          "label": "斜线偏转角度 (仅斜向模式)",
          "min": -45,
          "max": 45,
          "step": 1,
          "value": 0,
          "unit": "°"
        }
      ],
      "jsCode": "const pts = [];\nlet seed = 137;\nfunction rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }\nfor (let i = 0; i < 35; i++) {\n  const u1 = (rand() * 2 - 1) * 26, vNt = -(4 + rand() * 18);\n  const u2 = (rand() * 2 - 1) * 26, vT = 4 + rand() * 18;\n  pts.push({ p2: 50 + u1 + vNt, p1: 50 - u1 + vNt, t: 0 });\n  pts.push({ p2: 50 + u2 + vT, p1: 50 - u2 + vT, t: 1 });\n}\nfunction draw() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const useDiag = lab.values.useDiag;\n  const off = lab.values.offset;\n  const angDeg = lab.values.angle;\n  ctx.clearRect(0, 0, W, H);\n  const bx = 95, by = 52, bs = 168;\n  const mapX = v => bx + (v / 100) * bs;\n  const mapY = v => by + bs - (v / 100) * bs;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const xx = bx + (bs * i) / 5, yy = by + (bs * i) / 5;\n    ctx.beginPath(); ctx.moveTo(xx, by); ctx.lineTo(xx, by + bs); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx + bs, yy); ctx.stroke();\n  }\n  ctx.save();\n  ctx.beginPath(); ctx.rect(bx, by, bs, bs); ctx.clip();\n  const T = 50 + off * 0.5;\n  const theta = Math.PI / 4 + (angDeg * Math.PI) / 180;\n  const nx = Math.cos(theta), ny = Math.sin(theta);\n  const cOff = off * 0.5;\n  if (!useDiag) {\n    const rx = mapX(T), ry = mapY(T);\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n    ctx.fillRect(rx, by, bx + bs - rx, ry - by);\n    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.2;\n    ctx.beginPath(); ctx.moveTo(rx, by); ctx.lineTo(rx, ry); ctx.lineTo(bx + bs, ry); ctx.stroke();\n  } else {\n    const poly = [];\n    const corners = [{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}];\n    for (let i = 0; i < 4; i++) {\n      const a = corners[i], b = corners[(i + 1) % 4];\n      const fa = (a.x - 50) * nx + (a.y - 50) * ny - cOff;\n      const fb = (b.x - 50) * nx + (b.y - 50) * ny - cOff;\n      if (fa >= 0) poly.push(a);\n      if ((fa >= 0) !== (fb >= 0)) {\n        const r = fa / (fa - fb);\n        poly.push({ x: a.x + r * (b.x - a.x), y: a.y + r * (b.y - a.y) });\n      }\n    }\n    if (poly.length >= 3) {\n      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n      ctx.beginPath();\n      ctx.moveTo(mapX(poly[0].x), mapY(poly[0].y));\n      for (let i = 1; i < poly.length; i++) ctx.lineTo(mapX(poly[i].x), mapY(poly[i].y));\n      ctx.closePath(); ctx.fill();\n    }\n    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.2;\n    const tx = -ny, ty = nx;\n    const cx = 50 + cOff * nx, cy = 50 + cOff * ny;\n    ctx.beginPath();\n    ctx.moveTo(mapX(cx - tx * 150), mapY(cy - ty * 150));\n    ctx.lineTo(mapX(cx + tx * 150), mapY(cy + ty * 150));\n    ctx.stroke();\n  }\n  ctx.restore();\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(bx, by, bs, bs);\n  let tp = 0, tn = 0, fp = 0, fn = 0;\n  for (const pt of pts) {\n    const pred = useDiag ? ((pt.p2 - 50) * nx + (pt.p1 - 50) * ny > cOff) : (pt.p2 > T && pt.p1 > T);\n    if (pt.t === 1 && pred) tp++;\n    else if (pt.t === 0 && !pred) tn++;\n    else if (pt.t === 0 && pred) fp++;\n    else fn++;\n    const err = (pred ? 1 : 0) !== pt.t;\n    const px = mapX(pt.p2), py = mapY(pt.p1);\n    if (err) {\n      ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 1.6;\n      ctx.beginPath(); ctx.arc(px, py, 6.5, 0, Math.PI * 2); ctx.stroke();\n    }\n    if (pt.t === 1) {\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath(); ctx.moveTo(px, py - 4); ctx.lineTo(px - 3.8, py + 3.2); ctx.lineTo(px + 3.8, py + 3.2); ctx.closePath(); ctx.fill();\n    } else {\n      ctx.fillStyle = '#38bdf8';\n      ctx.fillRect(px - 3, py - 3, 6, 6);\n    }\n  }\n  const binsNt = new Array(10).fill(0), binsT = new Array(10).fill(0);\n  const binsNtY = new Array(10).fill(0), binsTY = new Array(10).fill(0);\n  for (const pt of pts) {\n    const ix = Math.min(9, Math.max(0, Math.floor(pt.p2 / 10)));\n    const iy = Math.min(9, Math.max(0, Math.floor(pt.p1 / 10)));\n    if (pt.t === 0) { binsNt[ix]++; binsNtY[iy]++; } else { binsT[ix]++; binsTY[iy]++; }\n  }\n  ctx.lineWidth = 1.6;\n  ctx.strokeStyle = '#38bdf8'; ctx.beginPath();\n  for (let i = 0; i < 10; i++) { const xx = bx + ((i + 0.5) / 10) * bs, yy = by - 4 - (binsNt[i] / 12) * 34; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981'; ctx.beginPath();\n  for (let i = 0; i < 10; i++) { const xx = bx + ((i + 0.5) / 10) * bs, yy = by - 4 - (binsT[i] / 12) * 34; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }\n  ctx.stroke();\n  ctx.strokeStyle = '#38bdf8'; ctx.beginPath();\n  for (let i = 0; i < 10; i++) { const yy = by + bs - ((i + 0.5) / 10) * bs, xx = bx + bs + 4 + (binsNtY[i] / 12) * 34; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981'; ctx.beginPath();\n  for (let i = 0; i < 10; i++) { const yy = by + bs - ((i + 0.5) / 10) * bs, xx = bx + bs + 4 + (binsTY[i] / 12) * 34; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }\n  ctx.stroke();\n  ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';\n  ctx.fillText('参数 2 (亮度) — 一维投影严重重叠', bx + bs / 2, by + bs + 15);\n  ctx.save(); ctx.translate(bx - 16, by + bs / 2); ctx.rotate(-Math.PI / 2);\n  ctx.fillText('参数 1 (直径) — 一维重叠', 0, 0); ctx.restore();\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';\n  const px0 = 365;\n  ctx.fillText(useDiag ? '当前策略：二维斜向线性分界' : '当前策略：单阈值 AND 逻辑门', px0, 34);\n  const acc = ((tp + tn) / pts.length) * 100;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = acc === 100 ? '#10b981' : '#f59e0b';\n  ctx.fillText('分类总准确率：' + acc.toFixed(1) + '%  (' + (tp + tn) + ' / ' + pts.length + ')', px0, 58);\n  const bars = [\n    { label: '真阳性 TP (正确检出)', val: tp, col: '#10b981' },\n    { label: '真阴性 TN (正确排除)', val: tn, col: '#38bdf8' },\n    { label: '假阳性 FP (误报虚惊)', val: fp, col: '#ec4899' },\n    { label: '假阴性 FN (漏诊错放)', val: fn, col: '#f59e0b' }\n  ];\n  for (let i = 0; i < bars.length; i++) {\n    const b = bars[i], yy = 80 + i * 34;\n    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px sans-serif';\n    ctx.fillText(b.label + '：' + b.val + ' 例', px0, yy);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(px0, yy + 6, 300, 10);\n    ctx.fillStyle = b.col;\n    ctx.fillRect(px0, yy + 6, (b.val / 35) * 300, 10);\n  }\n  ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';\n  ctx.fillText('△ 绿色=目标  □ 蓝色=非目标  ○ 粉圈=被错分样本', px0, 226);\n  lab.setReadout((useDiag ? '斜向分界' : 'AND逻辑门') + ' | 准确率=' + acc.toFixed(1) + '% | 假阳性 FP=' + fp + ' | 假阴性 FN=' + fn + (useDiag && angDeg !== 0 ? ' (注意：旋转角度使FP与FN双双上升!)' : ''));\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【先验患病率陷阱】忽略待测人群中目标的真实占比（如千分之一的罕见病），直接用两个实验直方图计算概率，会把极低概率误夸大上千倍。",
        "【单维阈值无绝对对错】一维测试的阈值选择永远是假阳性（误报代价）与假阴性（漏报代价）之间的人为妥协，ROC 曲线越靠近左上角说明传感器本身区分能力越强。",
        "【别用逻辑门硬拼多维特征】单个指标重叠不代表整体不可分；用 AND/OR 独立设阈值会丢弃特征间的相关性，高维参数空间需要斜线、平面乃至曲面来分割。",
        "【为什么需要神经网络】在二维空间可以平移（权衡）但不能乱旋转（双错齐升）；当特征扩展到 3 维以上（超空间）时，人眼彻底无法可视化画线，只能交给神经网络从样本中自动学习出划分超空间的复杂边界。"
      ]
    }
  ]
});
