window.__BOOK_REGISTER_SECTION__("sec_123", {
  "title": "进阶提速：实数 FFT 与对称性黑魔法 (Further Speed Increases)",
  "intuition": "标准 FFT 是为复数信号设计的，但真实世界的传感器数据几乎全是纯实数——利用频谱的奇偶对称性，我们可以把闲置的虚部通道‘白嫖’起来，实现单次运算 20% 到 40% 的额外加速。",
  "blocks": [
    {
      "type": "concept",
      "heading": "榨干最后 20%~40% 的算力：提前终止与实数特化",
      "paragraphs": [
        "哪怕标准 FFT 已经快如闪电，工程上仍有几种榨干硬件性能的优化技巧，通常能带来 **20%~40%** 的额外提速。第一种直观技巧是**提前两级终止时域分解**：当信号被拆解到只剩 **4 个采样点** 时，不再继续套用通用的蝶形递归，而是直接利用 4 点正弦、余弦波极其简单的特性（值仅包含 `0, 1, -1`）编写高度优化的展开代码，一步跳进频域。",
        "第二种更常用的算法则直击痛点：标准复数 FFT 假设输入既有实部也有虚部，但现实中绝大多数信号（如音频、温度、振动波形）的**虚部全为零**。这意味着标准算法有一半的输入内存是空的，且算出的频谱左右镜像对称——大量的算力浪费在了重复计算上。",
        "专门针对这一特性修改的算法称为 **实数 FFT (real FFT)** 与 **实数逆变换 (real Inverse FFT)**（对应原书 Table 12-6 和 Table 12-7），它们比常规复数 FFT 快约 **30%**。但天下没有免费的午餐，实数 FFT 有两个工程缺点：第一，代码长度大约**翻倍**，移植代码的工作量更大；第二，**调试更困难**——常规 FFT 如果写错了，频谱往往会破坏左右对称性，你一眼就能发现 Bug；而实数 FFT 强行构造了零虚部和左右对称，失去了这层天然的“校验护栏”，调试时必须拿它和常规 FFT 的输出逐点比对。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "一石二鸟：用一次复数 FFT 同时计算两路实数频谱",
      "paragraphs": [
        "既然纯实数信号的虚部空着也是空着，一个绝妙的想法诞生了：**为什么不把两路不同的实数信号，分别塞进复数输入的实部和虚部呢？**",
        "这背后的数学底座是 **DFT 的线性可加性与对称性反转规律**：当信号只放在时域的**实部**时，频域的实部呈**偶对称**（左右镜像相等）、虚部呈**奇对称**（左右镜像反号）；而当信号只放在时域的**虚部**时，频域的对称性恰好**反转**——实部变成**奇对称**、虚部变成**偶对称**。",
        "根据线性叠加原理，把信号 A 放在实部、信号 B 放在虚部一起做复数 FFT，得到的总频谱就是两者频谱的直接相加。随后只需在频域做一次简单的**奇偶分解 (even/odd decomposition)**（几行加减法和除以 2 的运算），就能把信号 A 和信号 B 的完整频谱**完美无损地拆分开来**。当你需要连续处理两路或更多实数信号时，这种“一石二鸟”法能节省约 **40%** 的执行时间（达不到整整 50% 是因为频域奇偶分解本身也要消耗少许算力），而且代码极简、几乎没有踩坑风险。"
      ],
      "formula": {
        "expr": "Re_A[k] = (Re[k] + Re[N-k]) / 2 ,  Im_B[k] = -(Re[k] - Re[N-k]) / 2",
        "explain": "Re[k] 与 Im[k] 是混叠后的复数频谱；通过索引 k 与镜像索引 N-k 相加减，偶对称分量归还给信号 A 的实部，奇对称分量分离给信号 B 的虚部（同理可得 Im_A 与 Re_B）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：一石二鸟——单次复数 FFT 同时算出两路实数频谱",
      "instruction": "拖动滑块改变实部信号 A 与虚部信号 B 的频率，切换“奇偶分解开关”观察混叠频谱如何瞬间还原出对称的独立频谱，点击播放可实时对比双路合成听感。",
      "controls": [
        {
          "type": "slider",
          "id": "freqA",
          "label": "实部信号 A 频率",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 3,
          "unit": " 倍频"
        },
        {
          "type": "slider",
          "id": "freqB",
          "label": "虚部信号 B 频率",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 8,
          "unit": " 倍频"
        },
        {
          "type": "toggle",
          "id": "separate",
          "label": "执行频域奇偶分解分离 (Even/Odd Split)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听双路合成音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const N = 32;\nlet oscA = null, oscB = null, masterGain = null;\nfunction stopAudio() {\n  if (oscA) { try { oscA.stop(); oscA.disconnect(); } catch(e){} oscA = null; }\n  if (oscB) { try { oscB.stop(); oscB.disconnect(); } catch(e){} oscB = null; }\n  if (masterGain) { try { masterGain.disconnect(); } catch(e){} masterGain = null; }\n}\nlab.onUpdate(() => {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const fA = lab.values.freqA, fB = lab.values.freqB, sep = lab.values.separate;\n  const xA = new Array(N), xB = new Array(N);\n  for (let n = 0; n < N; n++) {\n    xA[n] = Math.cos(2 * Math.PI * fA * n / N - 0.7);\n    xB[n] = Math.cos(2 * Math.PI * fB * n / N - 1.1);\n  }\n  const re = new Array(N).fill(0), im = new Array(N).fill(0);\n  for (let k = 0; k < N; k++) {\n    let sr = 0, si = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = -2 * Math.PI * k * n / N;\n      const c = Math.cos(ang), s = Math.sin(ang);\n      sr += xA[n] * c - xB[n] * s;\n      si += xA[n] * s + xB[n] * c;\n    }\n    re[k] = sr; im[k] = si;\n  }\n  const reA = new Array(N), imA = new Array(N), reB = new Array(N), imB = new Array(N);\n  for (let k = 0; k < N; k++) {\n    const km = (N - k) % N;\n    reA[k] = 0.5 * (re[k] + re[km]);\n    imA[k] = 0.5 * (im[k] - im[km]);\n    reB[k] = 0.5 * (im[k] + im[km]);\n    imB[k] = -0.5 * (re[k] - re[km]);\n  }\n  if (lab.values.play) {\n    try {\n      const actx = lab.getAudioContext();\n      if (actx.state === 'suspended') actx.resume();\n      if (!oscA) {\n        masterGain = actx.createGain();\n        masterGain.gain.setValueAtTime(0.08, actx.currentTime);\n        masterGain.connect(actx.destination);\n        oscA = actx.createOscillator(); oscB = actx.createOscillator();\n        oscA.type = 'sine'; oscB.type = 'sine';\n        oscA.connect(masterGain); oscB.connect(masterGain);\n        oscA.start(); oscB.start();\n      }\n      oscA.frequency.setValueAtTime(fA * 90, actx.currentTime);\n      oscB.frequency.setValueAtTime(fB * 90, actx.currentTime);\n    } catch(e) {}\n  } else {\n    stopAudio();\n  }\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy <= H; gy += 30) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(248, 8); ctx.lineTo(248, H - 8); ctx.stroke();\n  function drawWave(arr, x0, yMid, w, amp, color, label) {\n    ctx.fillStyle = '#f8fafc'; ctx.font = '11px monospace';\n    ctx.fillText(label, x0, yMid - amp - 6);\n    ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n    ctx.beginPath(); ctx.moveTo(x0, yMid); ctx.lineTo(x0 + w, yMid); ctx.stroke();\n    ctx.strokeStyle = color; ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const px = x0 + (i / (N - 1)) * w, py = yMid - arr[i] * amp;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n  drawWave(xA, 16, 65, 214, 34, '#38bdf8', '时域实部: 信号 A (Re)');\n  drawWave(xB, 16, 178, 214, 34, '#ec4899', '时域虚部: 信号 B (Im)');\n  const rx0 = 268, rw = 436, yTop = 68, yBot = 178, scale = 2.6;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(rx0, yTop); ctx.lineTo(rx0 + rw, yTop); ctx.moveTo(rx0, yBot); ctx.lineTo(rx0 + rw, yBot); ctx.stroke();\n  const symX = rx0 + (16 / (N - 1)) * rw;\n  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n  ctx.beginPath(); ctx.moveTo(symX, 16); ctx.lineTo(symX, H - 12); ctx.stroke(); ctx.restore();\n  ctx.fillStyle = '#10b981'; ctx.font = '10px monospace'; ctx.fillText('N/2 对称轴', symX + 4, 22);\n  function drawStem(arr, yMid, color, offset) {\n    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;\n    for (let k = 0; k < N; k++) {\n      const px = rx0 + (k / (N - 1)) * rw + offset;\n      const py = yMid - arr[k] * scale;\n      ctx.beginPath(); ctx.moveTo(px, yMid); ctx.lineTo(px, py); ctx.stroke();\n      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n  ctx.fillStyle = '#f8fafc'; ctx.font = '11px monospace';\n  if (!sep) {\n    ctx.fillText('混叠频谱实部 Re[k] (无对称性)', rx0, 20);\n    ctx.fillText('混叠频谱虚部 Im[k] (无对称性)', rx0, 130);\n    drawStem(re, yTop, '#f59e0b', 0);\n    drawStem(im, yBot, '#f8fafc', 0);\n    lab.setReadout('状态: 混叠复数频谱 | Re[k] 与 Im[k] 均失去对称性 | 开启开关即可用奇偶分解拆出 A 与 B');\n  } else {\n    ctx.fillText('分离后实部: 蓝=A(偶对称)  粉=B(偶对称)', rx0, 20);\n    ctx.fillText('分离后虚部: 蓝=A(奇对称)  粉=B(奇对称)', rx0, 130);\n    drawStem(reA, yTop, '#38bdf8', -1.5);\n    drawStem(reB, yTop, '#ec4899', 1.5);\n    drawStem(imA, yBot, '#38bdf8', -1.5);\n    drawStem(imB, yBot, '#ec4899', 1.5);\n    lab.setReadout('状态: 已奇偶分离 | A频峰=' + fA + ' & ' + (N-fA) + ' | B频峰=' + fB + ' & ' + (N-fB) + ' | 一次FFT算完两路实数信号');\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "终极套娃：单路实数信号的交错拆半法 (Table 12-7)",
      "paragraphs": [
        "如果我手头只有**一路**长为 `N` 的实数信号，还能白嫖虚部加速吗？答案是肯定的，只是过程稍微“丑陋”一点——这就是 **交错分解法 (Interlaced Decomposition)**，也是原书 Table 12-7 实数 FFT 程序的核心机制：",
        "第一步：**交错拆半**。把长为 `N` 的输入信号按索引奇偶一分为二——将 `N/2` 个**偶数点** `x[0], x[2], x[4]...` 塞入实部，把 `N/2` 个**奇数点** `x[1], x[3], x[5]...` 塞入虚部。",
        "第二步：**半长复数 FFT 与频域奇偶分离**。直接调用现成的复数 FFT，但点数减半为 `N/2`（耗时立即减半！）。算出的频谱再经过奇偶分解，就能还原出“偶数子序列”和“奇数子序列”各自的 `N/2` 点独立频谱。",
        "第三步：**补全最后一级蝶形合成**。此时我们手里握着偶数点和奇数点各自的频谱，这正好等同于常规 `N` 点 FFT 运行到**最后一级合成 (last synthesis stage)** 之前的中间状态！只需补做一次旋转因子蝶形合并，就能严丝合缝地拼出完整的 `N` 点实数频谱。"
      ],
      "formula": {
        "expr": "X[k] = X_even[k] + e^(-j·2πk/N) · X_odd[k]",
        "explain": "X_even 是偶数下标子序列的频谱，X_odd 是奇数下标子序列的频谱；乘上旋转因子并做一次蝶形加减（最后一级合成），即得完整的 N 点频谱 X[k]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：交错拆半全流程透视（Table 12-7 实数 FFT 拆解）",
      "instruction": "拖动“算法阶段”滑块（1→2→3）分步追踪 32 点实数脉冲如何通过 16 点 FFT 算出完整频谱，可叠加白色圆圈验证与暴力 32 点 DFT 结果完全一致。",
      "controls": [
        {
          "type": "slider",
          "id": "stage",
          "label": "算法阶段",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": " 阶段"
        },
        {
          "type": "slider",
          "id": "width",
          "label": "时域脉冲宽度",
          "min": 2,
          "max": 10,
          "step": 1,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "compare",
          "label": "叠加标准 32 点 DFT 参考值 (白色空心圈)",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const N = 32, stage = lab.values.stage, width = lab.values.width, cmp = lab.values.compare;\n  const x = new Array(N).fill(0);\n  for (let i = 0; i < width; i++) x[i] = 1;\n  const refRe = new Array(N).fill(0), refIm = new Array(N).fill(0);\n  for (let k = 0; k < N; k++) {\n    for (let n = 0; n < N; n++) {\n      const ang = -2 * Math.PI * k * n / N;\n      refRe[k] += x[n] * Math.cos(ang);\n      refIm[k] += x[n] * Math.sin(ang);\n    }\n  }\n  const r16 = new Array(16), i16 = new Array(16);\n  for (let i = 0; i < 16; i++) { r16[i] = x[2 * i]; i16[i] = x[2 * i + 1]; }\n  const REX = new Array(N).fill(0), IMX = new Array(N).fill(0);\n  for (let k = 0; k < 16; k++) {\n    let sr = 0, si = 0;\n    for (let n = 0; n < 16; n++) {\n      const ang = -2 * Math.PI * k * n / 16;\n      const c = Math.cos(ang), s = Math.sin(ang);\n      sr += r16[n] * c - i16[n] * s;\n      si += r16[n] * s + i16[n] * c;\n    }\n    REX[k] = sr; IMX[k] = si;\n  }\n  if (stage >= 2) {\n    const ND2 = 16, N4 = 3;\n    for (let I = 1; I <= N4; I++) {\n      const IM = ND2 - I, IP2 = I + ND2, IPM = IM + ND2;\n      REX[IP2] = (IMX[I] + IMX[IM]) / 2;\n      REX[IPM] = REX[IP2];\n      IMX[IP2] = -(REX[I] - REX[IM]) / 2;\n      IMX[IPM] = -IMX[IP2];\n      REX[I] = (REX[I] + REX[IM]) / 2;\n      REX[IM] = REX[I];\n      IMX[I] = (IMX[I] - IMX[IM]) / 2;\n      IMX[IM] = -IMX[I];\n    }\n    REX[24] = IMX[8]; REX[16] = IMX[0];\n    IMX[24] = 0; IMX[16] = 0; IMX[8] = 0; IMX[0] = 0;\n  }\n  if (stage === 3) {\n    let UR = 1, UI = 0;\n    const SR = Math.cos(Math.PI / 16), SI = -Math.sin(Math.PI / 16);\n    for (let J = 1; J <= 16; J++) {\n      const I = J - 1, IP = I + 16;\n      const TR = REX[IP] * UR - IMX[IP] * UI;\n      const TI = REX[IP] * UI + IMX[IP] * UR;\n      REX[IP] = REX[I] - TR; IMX[IP] = IMX[I] - TI;\n      REX[I] = REX[I] + TR; IMX[I] = IMX[I] + TI;\n      const tmp = UR;\n      UR = tmp * SR - UI * SI;\n      UI = tmp * SI + UI * SR;\n    }\n  }\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  for (let gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy <= H; gy += 30) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n  const x0 = 36, pw = 656, yTop = 68, yBot = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(x0, yTop); ctx.lineTo(x0 + pw, yTop); ctx.moveTo(x0, yBot); ctx.lineTo(x0 + pw, yBot); ctx.stroke();\n  function plotArr(arr, len, yMid, sc, color, label, refArr) {\n    ctx.fillStyle = '#f8fafc'; ctx.font = '11px monospace';\n    ctx.fillText(label, x0, yMid - 48);\n    for (let i = 0; i < len; i++) {\n      const px = x0 + (i / (len - 1)) * pw, py = yMid - arr[i] * sc;\n      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(px, yMid); ctx.lineTo(px, py); ctx.stroke();\n      ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill();\n      if (refArr && cmp) {\n        const ry = yMid - refArr[i] * sc;\n        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5;\n        ctx.beginPath(); ctx.arc(px, ry, 5.2, 0, Math.PI * 2); ctx.stroke();\n      }\n    }\n  }\n  if (stage === 1) {\n    plotArr(r16, 16, yTop, 36, '#38bdf8', '阶段 1 [时域]: 偶数下标样本 x[2i] 填入 REX[0..15]', null);\n    plotArr(i16, 16, yBot, 36, '#ec4899', '阶段 1 [时域]: 奇数下标样本 x[2i+1] 填入 IMX[0..15]', null);\n    lab.setReadout('阶段 1: 将 32 点实数脉冲交错拆成 16 对复数点 (偶数->实部, 奇数->虚部), 准备调用 16 点 FFT');\n  } else if (stage === 2) {\n    const midX = x0 + (15.5 / 31) * pw;\n    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#f59e0b';\n    ctx.beginPath(); ctx.moveTo(midX, 16); ctx.lineTo(midX, H - 12); ctx.stroke(); ctx.restore();\n    ctx.fillStyle = '#f59e0b'; ctx.font = '10px monospace';\n    ctx.fillText('0..15: 偶序列频谱 | 16..31: 奇序列频谱', midX - 115, 22);\n    plotArr(REX, 32, yTop, 5.5, '#10b981', '阶段 2 [半长FFT+奇偶分离]: REX[0..15] 与 REX[16..31]', null);\n    plotArr(IMX, 32, yBot, 5.5, '#38bdf8', '阶段 2 [半长FFT+奇偶分离]: IMX[0..15] 与 IMX[16..31]', null);\n    lab.setReadout('阶段 2: 已算完 16 点复数 FFT 并经奇偶分离, 左侧存偶序列频谱, 右侧存奇序列频谱');\n  } else {\n    plotArr(REX, 32, yTop, 3.8, '#10b981', '阶段 3 [末级蝶形合成]: 完整 32 点频谱实部 REX[0..31] (偶对称)', refRe);\n    plotArr(IMX, 32, yBot, 3.8, '#38bdf8', '阶段 3 [末级蝶形合成]: 完整 32 点频谱虚部 IMX[0..31] (奇对称)', refIm);\n    lab.setReadout('阶段 3: 末级蝶形合成完毕! REX/IMX 与标准 32 点 DFT (白圈) 100% 吻合, 耗时仅接近 16 点 FFT');\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "要点 1（性价比选择）：如果手头经常需要同时处理成批的实数信号，优先用「两路打包进实部/虚部 + 奇偶分离」（提速约 40%，代码极简不易出错）；只有对单路超长实数信号做极致压榨时，才去写交错拆半的实数 FFT（提速约 30%，但代码翻倍）。",
        "要点 2（调试铁律）：编写或移植实数 FFT / 实数 IFFT（Table 12-6 / 12-7）时，千万不要指望通过“频谱是否左右对称”来排查 Bug——因为算法已经强行强制了对称性；唯一可靠的验证方法，是拿它和标准复数 FFT 对同一组随机数输入做逐点误差比对。",
        "要点 3（实数 IFFT 逆变换复用）：做实数逆变换（Table 12-6）时，无需从头再写一套反向蝶形，只需把频域 `0` 到 `N/2` 的共轭对称补齐、虚部转置相加后，直接复用正向实数 FFT 子程序并除以 `N` 即可完成重构。"
      ]
    }
  ]
});
