window.__BOOK_REGISTER_SECTION__("sec_214", {
  "title": "复数的极坐标表示法与欧拉公式 (Polar Notation)",
  "intuition": "与其用“向东走几步、向北走几步”描述复平面上的点，不如直接给出“离原点多远（模长 M）”和“朝哪个方向（相位角 θ）”；再借助欧拉公式把它写成复指数 M·e^(jθ)，就能把繁琐的复数乘除法瞬间变成长度缩放与角度旋转。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从直角坐标到极坐标：模长 M 与相位角 θ",
      "paragraphs": [
        "复数在复平面上既可以用直角坐标 `a + jb`（实部 `Re A` 与虚部 `Im A`）定位，也可以用**极坐标表示法（Polar Notation）**来描述。极坐标使用两个直观的几何量：**模长（Magnitude, M）**表示从原点出发指向该复数点的向量长度；**相位角（Phase Angle, θ）**表示该向量与实轴正方向（正 x 轴）之间的夹角。",
        "两者之间的相互转换由**勾股定理**和**三角函数**直接给出（对应原书 Eq. 30-8 与 Eq. 30-9）。但在工程计算中有一个极易踩坑的细节：直接调用单参数 `arctan(Im A / Re A)` 只能返回 `(-90°, +90°)` 范围内的角度。当实部 `Re A < 0` 时（例如原书图 30-2 中的第三象限点 `-4 - 1.5j`），分子分母同为负数，负负得正后，普通 `arctan(-1.5 / -4)` 会误判到第一象限，产生整整 **180°（π 弧度）** 的象限错误！因此在代码实现中必须使用 `atan2(Im A, Re A)`。"
      ],
      "formula": {
        "expr": "M = √((Re A)² + (Im A)²),   θ = arctan(Im A / Re A)   |   Re A = M cos(θ),   Im A = M sin(θ)",
        "explain": "左侧为直角转极坐标（Eq. 30-8）：用实部和虚部求向量长度 M 与方向角 θ；右侧为极坐标转直角（Eq. 30-9）：将长度 M 分别向实轴（cos）与虚轴（sin）投影还原出实部与虚部。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复平面直角/极坐标互转与 arctan 象限陷阱",
      "instruction": "拖动实部 a 与虚部 b 滑块（尝试将 a 设为负数如 -4, b = -1.5），并开启「对比普通 arctan(b/a)」，观察真实向量（青绿）与错误象限向量（粉红虚线）的 180° 偏差。",
      "controls": [
        {
          "type": "slider",
          "id": "re",
          "label": "实部 Re(A) = a",
          "min": -8,
          "max": 8,
          "step": 0.5,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im",
          "label": "虚部 Im(A) = b",
          "min": -8,
          "max": 8,
          "step": 0.5,
          "value": 6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showNaive",
          "label": "对比普通 arctan(b/a) 的象限陷阱",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\nconst cx = 190;\nconst cy = 120;\nconst s = 12;\n\nfunction draw() {\n  ctx.clearRect(0, 0, w, h);\n  const a = lab.values.re;\n  const b = lab.values.im;\n  const showNaive = lab.values.showNaive;\n\n  ctx.lineWidth = 1;\n  for (let i = -8; i <= 8; i++) {\n    const x = cx + i * s;\n    const y = cy - i * s;\n    ctx.strokeStyle = i === 0 ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(x, cy - 8 * s);\n    ctx.lineTo(x, cy + 8 * s);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(cx - 8 * s, y);\n    ctx.lineTo(cx + 8 * s, y);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re (+8)', cx + 8 * s + 5, cy + 4);\n  ctx.fillText('Im (+8j)', cx - 18, cy - 8 * s - 6);\n\n  const px = cx + a * s;\n  const py = cy - b * s;\n  const M = Math.hypot(a, b);\n  const theta = Math.atan2(b, a);\n  const deg = theta * 180 / Math.PI;\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n  ctx.beginPath();\n  ctx.moveTo(px, py);\n  ctx.lineTo(px, cy);\n  ctx.moveTo(px, py);\n  ctx.lineTo(cx, py);\n  ctx.stroke();\n  ctx.restore();\n\n  if (M > 0.25) {\n    const arcR = Math.min(28, M * s * 0.65);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.arc(cx, cy, arcR, 0, -theta, theta >= 0);\n    ctx.stroke();\n  }\n\n  const naiveRad = a === 0 ? (b >= 0 ? Math.PI / 2 : -Math.PI / 2) : Math.atan(b / a);\n  const hasQuadrantError = showNaive && a < 0 && M > 0.1;\n  if (hasQuadrantError) {\n    const nx = cx + M * Math.cos(naiveRad) * s;\n    const ny = cy - M * Math.sin(naiveRad) * s;\n    ctx.save();\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(cx, cy);\n    ctx.lineTo(nx, ny);\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath();\n    ctx.arc(nx, ny, 4, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '11px sans-serif';\n    ctx.fillText('atan 错误象限', nx + 6, ny - 4);\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.8;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n\n  if (M > 0.15) {\n    const ang = Math.atan2(py - cy, px - cx);\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath();\n    ctx.moveTo(px, py);\n    ctx.lineTo(px - 9 * Math.cos(ang - 0.35), py - 9 * Math.sin(ang - 0.35));\n    ctx.lineTo(px - 9 * Math.cos(ang + 0.35), py - 9 * Math.sin(ang + 0.35));\n    ctx.closePath();\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath();\n  ctx.arc(px, py, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  const rx = 355;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(rx - 12, 18, 360, 204);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx - 12, 18, 360, 204);\n\n  const signB = b >= 0 ? '+' : '-';\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 14px monospace';\n  ctx.fillText('直角坐标: A = ' + a.toFixed(1) + ' ' + signB + ' ' + Math.abs(b).toFixed(1) + 'j', rx, 44);\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('极坐标模长: M = √(' + (a * a + b * b).toFixed(2) + ') = ' + M.toFixed(3), rx, 74);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('真实相位 atan2: θ = ' + deg.toFixed(1) + '° (' + theta.toFixed(3) + ' rad)', rx, 102);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '13px monospace';\n  ctx.fillText('欧拉指数: ' + M.toFixed(2) + ' · e^(j · ' + theta.toFixed(2) + ')', rx, 134);\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.fillText('投影验证: M·cosθ = ' + (M * Math.cos(theta)).toFixed(2) + ', M·sinθ = ' + (M * Math.sin(theta)).toFixed(2), rx, 160);\n\n  if (hasQuadrantError) {\n    const nDeg = naiveRad * 180 / Math.PI;\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('⚠ 象限陷阱: atan(b/a) = ' + nDeg.toFixed(1) + '° (相差 180°!)', rx, 196);\n  } else {\n    ctx.fillStyle = 'rgba(16,185,129,0.85)';\n    ctx.font = '12px sans-serif';\n    ctx.fillText(a < 0 ? '提示: 开启上方开关可查看 atan 象限错误' : '当前位于右半平面 (Re ≥ 0)，atan 与 atan2 一致', rx, 196);\n  }\n\n  lab.setReadout('A = ' + a.toFixed(1) + ' ' + signB + ' ' + Math.abs(b).toFixed(1) + 'j  |  Mag(A) = ' + M.toFixed(3) + '  |  Phase(A) = ' + deg.toFixed(1) + '° (' + theta.toFixed(3) + ' rad)');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "从几何投影到欧拉公式：为什么极坐标写成 M·e^(jθ)？",
      "paragraphs": [
        "在直角坐标下，信息虽然藏在 `a` 和 `b` 两个数里，但**完整的复数表达式**是 `a + jb`。那么极坐标下虽然信息藏在 `M` 和 `θ` 里，完整的复数表达式又该长什么样？把 Eq. 30-9 直接代入 `a + jb`，我们就会顺理成章地得到极坐标的展开式：`a + jb = M(cos θ + j sin θ)`（Eq. 30-10）。",
        "虽然逻辑严丝合缝，但 `cos θ + j sin θ` 写起来依然很笨重。此时，瑞士数学大师莱昂哈德·欧拉（Leonhard Euler，发音接近“Oiler”）提出了科学工程界最重要的桥梁之一——**欧拉公式（Euler's Relation，Eq. 30-11）**：`e^(jx) = cos x + j sin x`。如果将 `e^(jx)` 展开为泰勒级数，偶数次幂正好凑出 `cos(x)` 的级数，而 `j` 乘以奇数次幂正好凑出 `sin(x)` 的级数，两者完美等价。",
        "用欧拉公式重写 Eq. 30-10，就得到了数字信号处理（DSP）数学的绝对基石——**复指数形式（Complex Exponential，Eq. 30-12）**：`a + jb = M·e^(jθ)`。在这个形式下，任意复数都被统一写成“长度乘以单位圆旋转因子”的简洁形态。"
      ],
      "formula": {
        "expr": "a + jb = M(cos θ + j sin θ) = M·e^(jθ)     其中  e^(jx) = cos x + j sin x",
        "explain": "M(cos θ + j sin θ) 是极坐标的三角展开（Eq. 30-10）；欧拉公式 e^(jx) = cos x + j sin x（Eq. 30-11）把括号里的三角组合压缩成单一的复指数 e^(jθ)，最终得到复指数表示 a + jb = M·e^(jθ)（Eq. 30-12）。"
      }
    },
    {
      "type": "concept",
      "heading": "复指数的杀手锏：乘除法秒变“长度缩放 + 角度加减”",
      "paragraphs": [
        "为什么要费这么大劲把 `a + jb` 变成 `M·e^(jθ)`？因为在直角坐标下做复数乘法需要展开四项并处理 `j² = -1`，除法更是需要分子分母同乘共轭复数；而在指数形式下，遵循最基本的幂次运算法则：**同底数相乘，指数相加；同底数相除，指数相减**！",
        "具体来说（Eq. 30-13 与 Eq. 30-14）：两个极坐标复数相乘，只需**模长相乘、相位角相加**；两个复数相除，只需**模长相除、相位角相减**。相反，如果要做**加法或减法**，最省事的办法则是先转回直角坐标，实部加实部、虚部加虚部，算完后再转回极坐标。",
        "因此，工程实践中形成了非常鲜明的分工：**写公式和做数学推导时用极坐标（`M·e^(jθ)`）**，**写计算机程序存储和做加减运算时用直角坐标（`a, b`）**。正如 `Re()` 和 `Im()` 用于提取直角坐标分量，工程中也常使用 `Mag()` 和 `Phase()` 算子来提取极坐标分量（例如若 `A = 5·e^(jπ/7)`，则 `Mag(A) = 5`，`Phase(A) = π/7`）。"
      ],
      "formula": {
        "expr": "(M₁ e^(jθ₁)) · (M₂ e^(jθ₂)) = (M₁M₂) e^(j(θ₁+θ₂))   |   (M₁ e^(jθ₁)) / (M₂ e^(jθ₂)) = (M₁/M₂) e^(j(θ₁-θ₂))",
        "explain": "Eq. 30-13（乘法）：结果模长是两模长之积，结果相位是两相位之和（逆时针累加旋转）；Eq. 30-14（除法）：结果模长是两模长之商，结果相位是两相位之差（顺时针回退旋转）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：复指数乘除法几何实验室（旋转与缩放）",
      "instruction": "调节 Z₁（天蓝）与 Z₂（琥珀）的模长 M 和相位角 θ，并切换「乘法 / 除法」模式，观察结果向量 Z_res（青绿）是如何通过长度缩放与角度旋转直接生成的。",
      "controls": [
        {
          "type": "slider",
          "id": "m1",
          "label": "M₁ (Z₁ 模长)",
          "min": 0.4,
          "max": 2,
          "step": 0.1,
          "value": 1.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "deg1",
          "label": "θ₁ (Z₁ 相位)",
          "min": -180,
          "max": 180,
          "step": 5,
          "value": 30,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "m2",
          "label": "M₂ (Z₂ 模长)",
          "min": 0.5,
          "max": 2,
          "step": 0.1,
          "value": 1.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "deg2",
          "label": "θ₂ (Z₂ 相位)",
          "min": -180,
          "max": 180,
          "step": 5,
          "value": 45,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "isDiv",
          "label": "切换为除法 Z₁ ÷ Z₂（关闭为乘法 Z₁ × Z₂）",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\nconst cx = 175;\nconst cy = 120;\nconst s = 24;\n\nfunction normDeg(d) {\n  let x = ((d + 180) % 360 + 360) % 360 - 180;\n  if (x === -180 && d > 0) x = 180;\n  return x;\n}\n\nfunction drawVec(mag, rad, color, lw, label) {\n  const px = cx + mag * Math.cos(rad) * s;\n  const py = cy - mag * Math.sin(rad) * s;\n  ctx.strokeStyle = color;\n  ctx.lineWidth = lw;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n  const ang = Math.atan2(py - cy, px - cx);\n  ctx.fillStyle = color;\n  ctx.beginPath();\n  ctx.moveTo(px, py);\n  ctx.lineTo(px - 8 * Math.cos(ang - 0.35), py - 8 * Math.sin(ang - 0.35));\n  ctx.lineTo(px - 8 * Math.cos(ang + 0.35), py - 8 * Math.sin(ang + 0.35));\n  ctx.closePath();\n  ctx.fill();\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(label, px + 7 * Math.cos(ang), py + 7 * Math.sin(ang) + 4);\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, w, h);\n  const m1 = lab.values.m1;\n  const d1 = lab.values.deg1;\n  const m2 = lab.values.m2;\n  const d2 = lab.values.deg2;\n  const isDiv = lab.values.isDiv;\n\n  const t1 = d1 * Math.PI / 180;\n  const t2 = d2 * Math.PI / 180;\n  const mRes = isDiv ? (m1 / m2) : (m1 * m2);\n  const dResRaw = isDiv ? (d1 - d2) : (d1 + d2);\n  const dRes = normDeg(dResRaw);\n  const tRes = dRes * Math.PI / 180;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - 108, cy);\n  ctx.lineTo(cx + 108, cy);\n  ctx.moveTo(cx, cy - 108);\n  ctx.lineTo(cx, cy + 108);\n  ctx.stroke();\n\n  for (let r = 1; r <= 4; r++) {\n    ctx.strokeStyle = r === 1 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '10px monospace';\n  ctx.fillText('r=1', cx + s + 2, cy + 11);\n  ctx.fillText('r=4', cx + 4 * s + 2, cy + 11);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, cy, 18, 0, -t1, t1 >= 0);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(16,185,129,0.75)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.arc(cx, cy, 28, 0, -tRes, tRes >= 0);\n  ctx.stroke();\n\n  drawVec(m1, t1, '#38bdf8', 2.2, 'Z1');\n  drawVec(m2, t2, '#f59e0b', 2.2, 'Z2');\n  drawVec(mRes, tRes, '#10b981', 3.0, 'Z_res');\n\n  const rx = 340;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(rx - 14, 16, 380, 208);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx - 14, 16, 380, 208);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText(isDiv ? '当前运算：除法 Z_res = Z₁ / Z₂  (Eq. 30-14)' : '当前运算：乘法 Z_res = Z₁ × Z₂  (Eq. 30-13)', rx, 40);\n\n  ctx.font = '13px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('Z₁ = ' + m1.toFixed(1) + ' · e^(j · ' + d1 + '°)', rx, 68);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('Z₂ = ' + m2.toFixed(1) + ' · e^(j · ' + d2 + '°)', rx, 90);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 13px monospace';\n  const mExpr = isDiv ? (m1.toFixed(1) + ' / ' + m2.toFixed(1)) : (m1.toFixed(1) + ' × ' + m2.toFixed(1));\n  const dExpr = isDiv ? (d1 + '° - (' + d2 + '°)') : (d1 + '° + (' + d2 + '°)');\n  ctx.fillText('Mag(Z_res)   = ' + mExpr + ' = ' + mRes.toFixed(3), rx, 122);\n  ctx.fillText('Phase(Z_res) = ' + dExpr + ' = ' + dRes.toFixed(0) + '°', rx, 146);\n\n  const aRes = mRes * Math.cos(tRes);\n  const bRes = mRes * Math.sin(tRes);\n  const sB = bRes >= 0 ? '+' : '-';\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '12px monospace';\n  ctx.fillText('等价直角坐标: ' + aRes.toFixed(2) + ' ' + sB + ' ' + Math.abs(bRes).toFixed(2) + 'j', rx, 174);\n\n  const barMax = 160;\n  const scaleBar = barMax / 4.0;\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(rx, 192, m1 * scaleBar, 6);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(rx, 201, m2 * scaleBar, 6);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rx, 210, Math.min(mRes, 4.0) * scaleBar, 6);\n  ctx.fillStyle = 'rgba(255,255,255,0.55)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('模长对比条 (M₁蓝 / M₂黄 / 结果绿)', rx + 170, 210);\n\n  lab.setReadout((isDiv ? 'Z₁/Z₂' : 'Z₁·Z₂') + ' = ' + mRes.toFixed(3) + '·e^(j·' + dRes.toFixed(0) + '°)  |  直角坐标 ≈ ' + aRes.toFixed(2) + ' ' + sB + ' ' + Math.abs(bRes).toFixed(2) + 'j');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "象限陷阱零容忍：手工或写代码把直角坐标 `a + jb` 转为极坐标相位 `θ` 时，切勿直接调用单参数 `atan(b/a)`——只要 `a < 0` 就会丢掉 180°（π 弧度）；在任何编程语言中请永远使用 `atan2(b, a)`。",
        "算子搭配看场合：涉及复数**加减法**及编写底层数值循环时，优先保持直角坐标 `a + jb`；涉及**乘除法、幂次、频域推导与相位旋转**时，立刻切换成极坐标复指数 `M·e^(jθ)`。",
        "牢记四句转换口诀：`Mag(A) = √(a² + b²)`、`Phase(A) = atan2(b, a)`、`a = M cos θ`、`b = M sin θ`，加上欧拉公式 `e^(jx) = cos x + j sin x`，这就是整个 DSP 复数运算的根基。"
      ]
    }
  ]
});
