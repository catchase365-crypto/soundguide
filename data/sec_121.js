window.__BOOK_REGISTER_SECTION__("sec_121", {
  "title": "FFT 程序实战：就地计算、算法变体与逆变换调试 (FFT Programs)",
  "intuition": "把暴力相关法替换成“就地计算”的 FFT 子程序，只需在 0/1 索引基准与位反转位置上避开接口陷阱，就能用同一个正变换核心同时搞定正、逆傅里叶变换并完成精度自检。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 从暴力相关到就地 FFT：公平对比的起点",
      "paragraphs": [
        "在前文我们已经知道如何用正弦和余弦波形与时域信号做相关来求实数 DFT。本书 **表 12-2** 给出了用同样相关思想计算**复数 DFT（Complex DFT）**的 BASIC 程序：两层嵌套循环遍历每个频点 `K%` 与时域点 `I%`，将输入数组 `XR[ ]`、`XI[ ]` 与复正弦 `SR`、`SI` 相乘累加到输出数组 `REX[ ]`、`IMX[ ]` 中。",
        "这个程序正是衡量 FFT 性能的“同口径（apples-to-apples）对比基准”。而 **表 12-4** 的 BASIC 快速傅里叶变换（FFT）子程序产生与表 12-2 **完全一致的数值结果**，却快出几个数量级。",
        "除了算法复杂度跃迁，FFT 在内存管理上也做了极致优化：数据通过 `REX[ ]` 和 `IMX[ ]`（下标 `0` 到 `N-1`）传入子程序，计算完成后，**频域输出直接覆盖原数组**。输入、中间临时结果和输出共用同一组数组，这种高效内存模式被称为**就地计算（In-place computation）**，对高速硬件实现尤为关键。"
      ],
      "formula": {
        "expr": "REX[k] + j·IMX[k] = Σ_{i=0}^{N-1} (XR[i] + j·XI[i]) · (cos(2πki/N) - j·sin(2πki/N))",
        "explain": "表 12-2 暴力复数 DFT 的核心公式：XR/XI 为输入时域实/虚部，REX/IMX 为输出频域实/虚部，括号内是旋转复正弦核 SR + j·SI，FFT 正是用蝶形分解来加速并“就地”得出完全相同的 REX/IMX。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 时域抽取（DIT）vs. 频域抽取（DIF）与 0/1 索引陷阱",
      "paragraphs": [
        "所有的标准 FFT 程序算出的数值结果都相同，但程序结构上存在几个容易让人困惑的细微差异。对比 **表 12-4（BASIC）** 与 **表 12-3（FORTRAN）** 可以看清两类主流实现：",
        "1）**算法流派与位反转顺序**：BASIC 版本采用**时域抽取（Decimation in Time, DIT）**，先在三层嵌套蝶形循环**之前**完成位反转排序（Bit-reversal sorting）；FORTRAN 版本采用**频域抽取（Decimation in Frequency, DIF）**，把位反转排序放到了三层循环**之后**。甚至还有完全消除位反转排序的变体，但这些变体对运行速度几乎没有实质提升，工程上无需纠结选用哪一种。",
        "2）**真正重要的是子程序接口与数组索引**：BASIC 传入总点数 `N%`，实部与虚部分别放在 `REX[ ]`、`IMX[ ]`，下标从 `0` 到 `N-1`。而 FORTRAN 传入以 2 为底的对数阶数 `M`（如 256 点传 `M=8`，4096 点传 `M=12`），并使用单一复数数组 `X( )`，下标却从 `1` 运行到 `N`。",
        "数组从 `1` 到 `N` 编号在 DSP 工程中非常令人头疼——绝大多数教材与文献都按 `0` 到 `N-1` 推导算法。一旦下标变成 `1` 到 `N`，频域的对称中心就会从熟悉的样本点 `0` 和 `N/2` 整体右移为 `1` 和 `N/2 + 1`，极易引发差一错误（off-by-one bug）。"
      ],
      "formula": {
        "expr": "M = log₂(N)  ⇔  N = 2^M ； 对称中心：0, N/2 (0-based)  →  1, N/2 + 1 (1-based)",
        "explain": "FORTRAN 接口传入 M 而非 N；且 1-based 索引会把原本位于 0 与 N/2 的频谱对称轴平移到 1 与 N/2 + 1。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：DIT 与 DIF 蝶形阶段、位反转排序与 0/1 索引偏移透视",
      "instruction": "调节阶数 M 与当前高亮阶段，切换 DIT（BASIC 表 12-4）与 DIF（FORTRAN 表 12-3）算法及 1..N 索引，观察位反转发生时机与对称中心偏移。",
      "controls": [
        {
          "type": "slider",
          "id": "mBits",
          "label": "阶数 M = log₂(N)",
          "min": 2,
          "max": 4,
          "step": 1,
          "value": 3,
          "unit": " (N=2^M)"
        },
        {
          "type": "slider",
          "id": "stage",
          "label": "高亮执行阶段",
          "min": 0,
          "max": 5,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "algo",
          "label": "切换为 DIF 算法 (FORTRAN 表12-3)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "oneBased",
          "label": "启用 1..N 索引 (观察对称中心右移)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction bitRev(val, bits) {\n  var r = 0;\n  for (var b = 0; b < bits; b++) r = (r << 1) | ((val >> b) & 1);\n  return r;\n}\nlab.onUpdate(function() {\n  var M = lab.values.mBits;\n  var N = 1 << M;\n  var isDIF = !!lab.values.algo;\n  var oneBased = !!lab.values.oneBased;\n  var totalStages = M + 1;\n  var activeStage = Math.max(0, Math.min(totalStages, lab.values.stage));\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 40; gx < 470; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 26); ctx.lineTo(gx, H - 14); ctx.stroke();\n  }\n\n  var x0 = 44, x1 = 442;\n  var colStep = (x1 - x0) / totalStages;\n  var y0 = 40, y1 = H - 22;\n  var rowStep = (y1 - y0) / (N - 1);\n  function colX(c) { return x0 + c * colStep; }\n  function rowY(i) { return y0 + i * rowStep; }\n\n  var activeInfo = '输入阶段';\n  for (var s = 1; s <= totalStages; s++) {\n    var isBitRev = (!isDIF && s === 1) || (isDIF && s === totalStages);\n    var isActive = (s === activeStage);\n    var cx0 = colX(s - 1), cx1 = colX(s);\n\n    ctx.font = 'bold 11px monospace';\n    ctx.textAlign = 'center';\n    if (isBitRev) {\n      ctx.fillStyle = isActive ? '#f59e0b' : 'rgba(248,250,252,0.5)';\n      ctx.fillText('位反转', (cx0 + cx1) * 0.5, 18);\n      if (isActive) activeInfo = '位反转排序 (Bit-Reversal)';\n      for (var i = 0; i < N; i++) {\n        var j = bitRev(i, M);\n        ctx.beginPath();\n        ctx.strokeStyle = isActive ? (i === j ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.14)';\n        ctx.lineWidth = isActive ? 1.8 : 1;\n        ctx.moveTo(cx0, rowY(i));\n        ctx.lineTo(cx1, rowY(j));\n        ctx.stroke();\n      }\n    } else {\n      var L = isDIF ? s : (s - 1);\n      var LE = isDIF ? (1 << (M + 1 - L)) : (1 << L);\n      var LE2 = LE >> 1;\n      ctx.fillStyle = isActive ? '#38bdf8' : 'rgba(248,250,252,0.5)';\n      ctx.fillText('L=' + L + ' (LE=' + LE + ')', (cx0 + cx1) * 0.5, 18);\n      if (isActive) activeInfo = '蝶形阶段 L=' + L + ' (LE=' + LE + ', LE2=' + LE2 + ')';\n      for (var jj = 0; jj < LE2; jj++) {\n        for (var ii = jj; ii < N; ii += LE) {\n          var ip = ii + LE2;\n          ctx.lineWidth = isActive ? 1.6 : 1;\n          ctx.strokeStyle = isActive ? '#10b981' : 'rgba(255,255,255,0.13)';\n          ctx.beginPath(); ctx.moveTo(cx0, rowY(ii)); ctx.lineTo(cx1, rowY(ii)); ctx.stroke();\n          ctx.beginPath(); ctx.moveTo(cx0, rowY(ip)); ctx.lineTo(cx1, rowY(ip)); ctx.stroke();\n          ctx.strokeStyle = isActive ? '#38bdf8' : 'rgba(255,255,255,0.11)';\n          ctx.beginPath(); ctx.moveTo(cx0, rowY(ii)); ctx.lineTo(cx1, rowY(ip)); ctx.stroke();\n          ctx.beginPath(); ctx.moveTo(cx0, rowY(ip)); ctx.lineTo(cx1, rowY(ii)); ctx.stroke();\n        }\n      }\n    }\n  }\n\n  var r = N >= 16 ? 2.8 : 4;\n  for (var c = 0; c <= totalStages; c++) {\n    var cx = colX(c);\n    var nodeHighlight = (c === activeStage) || (activeStage > 0 && c === activeStage - 1);\n    for (var row = 0; row < N; row++) {\n      var cy = rowY(row);\n      ctx.beginPath();\n      ctx.arc(cx, cy, r, 0, Math.PI * 2);\n      ctx.fillStyle = nodeHighlight ? '#f8fafc' : 'rgba(248,250,252,0.35)';\n      ctx.fill();\n      var idxText = String(oneBased ? row + 1 : row);\n      if (c === 0) {\n        ctx.fillStyle = '#94a3b8';\n        ctx.font = (N >= 16 ? '9px' : '11px') + ' monospace';\n        ctx.textAlign = 'right';\n        ctx.fillText(idxText, cx - 8, cy + 3);\n      } else if (c === totalStages) {\n        var isSym = (row === 0 || row === N / 2);\n        ctx.fillStyle = isSym ? '#ec4899' : '#94a3b8';\n        ctx.font = (isSym ? 'bold ' : '') + (N >= 16 ? '9px' : '11px') + ' monospace';\n        ctx.textAlign = 'left';\n        ctx.fillText(idxText, cx + 8, cy + 3);\n      }\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(474, 14); ctx.lineTo(474, H - 14); ctx.stroke();\n\n  var rx0 = 492, rx1 = 702, rw = rx1 - rx0;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(oneBased ? 'FORTRAN 1..N 频域对称性' : 'BASIC 0..N-1 频域对称性', (rx0 + rx1) * 0.5, 22);\n\n  var baseReY = 112, baseImY = 192, barScale = 34;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(rx0, baseReY); ctx.lineTo(rx1, baseReY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx0, baseImY); ctx.lineTo(rx1, baseImY); ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';\n  ctx.fillText('REX (偶对称)', rx0, 44);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('IMX (奇对称)', rx0, 144);\n\n  var stepX = rw / N;\n  var bw = Math.max(4, stepX * 0.62);\n  for (var k = 0; k < N; k++) {\n    var bx = rx0 + (k + 0.5) * stepX;\n    var reVal = 0.25 + 0.65 * Math.cos(2 * Math.PI * k / N) + 0.2 * Math.cos(4 * Math.PI * k / N);\n    var imVal = -0.75 * Math.sin(2 * Math.PI * k / N) - 0.25 * Math.sin(4 * Math.PI * k / N);\n    var isSymAxis = (k === 0 || k === N / 2);\n    if (isSymAxis) {\n      ctx.save();\n      ctx.setLineDash([3, 3]);\n      ctx.strokeStyle = '#ec4899';\n      ctx.beginPath(); ctx.moveTo(bx, 50); ctx.lineTo(bx, 220); ctx.stroke();\n      ctx.restore();\n      ctx.fillStyle = '#ec4899';\n      ctx.font = 'bold 10px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(oneBased ? k + 1 : k), bx, 232);\n    }\n    ctx.fillStyle = isSymAxis ? '#ec4899' : '#38bdf8';\n    ctx.fillRect(bx - bw * 0.5, baseReY - reVal * barScale, bw, reVal * barScale);\n    ctx.fillStyle = isSymAxis ? '#ec4899' : '#f59e0b';\n    if (imVal >= 0) ctx.fillRect(bx - bw * 0.5, baseImY - imVal * barScale, bw, imVal * barScale);\n    else ctx.fillRect(bx - bw * 0.5, baseImY, bw, -imVal * barScale);\n  }\n\n  var c1 = oneBased ? 1 : 0;\n  var c2 = oneBased ? (N / 2 + 1) : (N / 2);\n  lab.setReadout((isDIF ? 'DIF(FORTRAN 表12-3)' : 'DIT(BASIC 表12-4)') + ' | N=' + N + ' (M=' + M + ') | ' + activeInfo + ' | 索引:' + (oneBased ? '1..' + N : '0..' + (N - 1)) + ' | 对称中心: ' + c1 + ' 与 ' + c2);\n});"
    },
    {
      "type": "concept",
      "heading": "3. 强对偶性红利：直接用正 FFT 计算逆 FFT",
      "paragraphs": [
        "用复数 DFT 处理实信号还有一项意外之喜：相比实数 DFT，复数 DFT 在时域和频域之间具有**更强的对偶性（Duality）**。这种对称性意味着**逆 DFT（IDFT）与正 DFT（DFT）几乎一模一样**。",
        "因此，工程上求**逆 FFT（Inverse FFT）**最省事的方法，就是把数据稍作符号调整后，直接调用写好的**正 FFT 子程序**。**表 12-5** 展示了仅需三步的逆 FFT 算法：",
        "1）输入频域数据后，先将虚部全部取反：`IMX[K%] = -IMX[K%]`（即求复共轭）；",
        "2）直接调用正变换子程序 `GOSUB 1000`（原书注：调用前文的正 FFT 子程序）；",
        "3）正 FFT 返回后，遍历所有样本，将实部除以点数 `N%`，并将虚部取反后再除以 `N%`：`REX[I%] = REX[I%]/N%`，`IMX[I%] = -IMX[I%]/N%`。"
      ],
      "formula": {
        "expr": "IDFT{ X[k] } = (1 / N) · conj( FFT{ conj( X[k] ) } )",
        "explain": "表 12-5 的核心数学原理：conj 表示将虚部 IMX 取反。两次共轭配合正 FFT 与除以 N 的归一化，无需额外编写一套逆变换蝶形代码。"
      }
    },
    {
      "type": "concept",
      "heading": "4. FFT 代码必学的两大黄金调试秘诀",
      "paragraphs": [
        "当你把教材里的 FFT 子程序敲进计算机并跑起来后，如何确认自己没有写错哪怕一个符号或循环边界？原书给出了两个工程师必备的调试技巧：",
        "**秘诀一：往返一致性测试（Round-trip Test）**。先用随机数生成器构造一段任意的时域信号，让它通过正 FFT 得到频谱；接着把这组频谱送入逆 FFT，将输出与原始随机信号逐点对比。如果程序完全正确，两者应当**几乎完全一致**，唯一的差异只是单精度浮点运算带来的约**百万分之几（a few parts-per-million）**的舍入噪声。",
        "**秘诀二：零虚部对称性检验（Symmetry Check）**。在最常见的使用场景下，输入时域信号的虚部全为 0。此时正 FFT 算出的频域结果必定以样本点 `0` 和 `N/2` 为中心呈共轭对称（实部偶对称、虚部奇对称，且 `IMX[0] = IMX[N/2] = 0`）。反之，若把具备这种正确对称性的频域数据送入逆 FFT，重建出的时域虚部必定全为 0（仅叠加微小舍入噪声）。"
      ],
      "formula": {
        "expr": "当 IMX_time[n] ≡ 0 时 ⇒ REX_freq[k] = REX_freq[N-k] 且 IMX_freq[k] = -IMX_freq[N-k]",
        "explain": "0-based 数组下的实信号频域对称条件（对称中心为 0 与 N/2）。若任一点不满足此关系，说明 FFT 代码存在索引或旋转因子错误。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：表 12-5 逆 FFT 共轭技巧、对称性检验与往返听觉调试",
      "instruction": "调节频率分量 f1、f2，尝试注入非零时域虚部或模拟“漏写表 12-5 共轭负号”Bug，观察频域对称性、往返误差并点击播放监听重建波形。",
      "controls": [
        {
          "type": "slider",
          "id": "f1",
          "label": "频率分量 f1",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": " bin"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "频率分量 f2",
          "min": 2,
          "max": 14,
          "step": 1,
          "value": 5,
          "unit": " bin"
        },
        {
          "type": "toggle",
          "id": "imagInject",
          "label": "注入非零时域虚部 (观察对称破坏)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "bugMode",
          "label": "模拟 Bug：漏写表12-5共轭负号",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放重建波形",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar N = 32, M = 5;\nvar audioCtx = null, sourceNode = null, gainNode = null;\n\nfunction runBasicFFT(re, im) {\n  var j = N >> 1;\n  for (var i = 1; i <= N - 2; i++) {\n    if (i < j) {\n      var tr = re[j], ti = im[j];\n      re[j] = re[i]; im[j] = im[i];\n      re[i] = tr; im[i] = ti;\n    }\n    var k = N >> 1;\n    while (k <= j) { j -= k; k >>= 1; }\n    j += k;\n  }\n  for (var L = 1; L <= M; L++) {\n    var LE = 1 << L, LE2 = LE >> 1;\n    var ur = 1, ui = 0;\n    var sr = Math.cos(Math.PI / LE2), si = -Math.sin(Math.PI / LE2);\n    for (var jj = 1; jj <= LE2; jj++) {\n      for (var ii = jj - 1; ii < N; ii += LE) {\n        var ip = ii + LE2;\n        var tr2 = re[ip] * ur - im[ip] * ui;\n        var ti2 = re[ip] * ui + im[ip] * ur;\n        re[ip] = re[ii] - tr2;\n        im[ip] = im[ii] - ti2;\n        re[ii] += tr2;\n        im[ii] += ti2;\n      }\n      var tr3 = ur;\n      ur = tr3 * sr - ui * si;\n      ui = tr3 * si + ui * sr;\n    }\n  }\n}\n\nfunction stopAudio() {\n  if (sourceNode) { try { sourceNode.stop(); sourceNode.disconnect(); } catch (e) {} sourceNode = null; }\n  if (gainNode) { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }\n}\n\nlab.onUpdate(function() {\n  var f1 = lab.values.f1, f2 = lab.values.f2;\n  var imagInject = !!lab.values.imagInject;\n  var bugMode = !!lab.values.bugMode;\n\n  var xr = new Array(N), xi = new Array(N);\n  for (var n = 0; n < N; n++) {\n    xr[n] = Math.cos(2 * Math.PI * f1 * n / N) + 0.65 * Math.sin(2 * Math.PI * f2 * n / N);\n    xi[n] = imagInject ? (0.75 * Math.cos(2 * Math.PI * (f1 + 1) * n / N) - 0.45 * Math.sin(2 * Math.PI * f2 * n / N)) : 0;\n  }\n\n  var fkRe = xr.slice(), fkIm = xi.slice();\n  runBasicFFT(fkRe, fkIm);\n\n  var outRe = fkRe.slice(), outIm = fkIm.slice();\n  if (!bugMode) {\n    for (var k = 0; k < N; k++) outIm[k] = -outIm[k];\n  }\n  runBasicFFT(outRe, outIm);\n  for (var i = 0; i < N; i++) {\n    outRe[i] = outRe[i] / N;\n    outIm[i] = -outIm[i] / N;\n  }\n\n  var maxErr = 0;\n  for (var p = 0; p < N; p++) {\n    var er = Math.abs(outRe[p] - xr[p]);\n    var ei = Math.abs(outIm[p] - xi[p]);\n    if (er > maxErr) maxErr = er;\n    if (ei > maxErr) maxErr = ei;\n  }\n  var symErr = Math.max(Math.abs(fkIm[0]), Math.abs(fkIm[N / 2]));\n  for (var s = 1; s < N / 2; s++) {\n    var srErr = Math.abs(fkRe[s] - fkRe[N - s]);\n    var siErr = Math.abs(fkIm[s] + fkIm[N - s]);\n    if (srErr > symErr) symErr = srErr;\n    if (siErr > symErr) symErr = siErr;\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 10); ctx.lineTo(gx, H - 10); ctx.stroke(); }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(360, 12); ctx.lineTo(360, H - 12); ctx.stroke();\n\n  function drawTimeBox(x0, x1, yMid, ampScale, origArr, recArr, origCol, recCol, title) {\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n    ctx.fillText(title, x0, yMid - ampScale - 8);\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath(); ctx.moveTo(x0, yMid); ctx.lineTo(x1, yMid); ctx.stroke();\n    var dx = (x1 - x0) / (N - 1);\n    ctx.strokeStyle = origCol; ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + i * dx, py = yMid - origArr[i] * ampScale * 0.52;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.save(); ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = recCol; ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var j = 0; j < N; j++) {\n      var qx = x0 + j * dx, qy = yMid - recArr[j] * ampScale * 0.52;\n      if (j === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);\n    }\n    ctx.stroke(); ctx.restore();\n  }\n\n  var recColor = (maxErr > 1e-4) ? '#ec4899' : '#10b981';\n  drawTimeBox(16, 344, 74, 38, xr, outRe, '#38bdf8', recColor, '时域实部: 原信号(蓝) vs IFFT重建(绿/粉虚线)');\n  drawTimeBox(16, 344, 182, 34, xi, outIm, '#f59e0b', recColor, '时域虚部: 原信号(琥珀) vs IFFT重建(虚线)');\n\n  function drawFreqBars(x0, x1, yMid, ampScale, arr, barCol, title) {\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n    ctx.fillText(title, x0, yMid - ampScale - 8);\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath(); ctx.moveTo(x0, yMid); ctx.lineTo(x1, yMid); ctx.stroke();\n    var step = (x1 - x0) / N, bw = step * 0.68;\n    for (var k = 0; k < N; k++) {\n      var bx = x0 + (k + 0.5) * step;\n      var isAxis = (k === 0 || k === N / 2);\n      if (isAxis) {\n        ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ec4899';\n        ctx.beginPath(); ctx.moveTo(bx, yMid - ampScale); ctx.lineTo(bx, yMid + ampScale); ctx.stroke(); ctx.restore();\n      }\n      var val = arr[k] / N;\n      var h = val * ampScale * 1.15;\n      ctx.fillStyle = isAxis ? '#ec4899' : barCol;\n      if (h >= 0) ctx.fillRect(bx - bw * 0.5, yMid - h, bw, h);\n      else ctx.fillRect(bx - bw * 0.5, yMid, bw, -h);\n    }\n  }\n\n  drawFreqBars(376, 704, 74, 38, fkRe, '#38bdf8', '频域实部 REX[0..31] (对称轴: 0 与 16)');\n  drawFreqBars(376, 704, 182, 34, fkIm, '#f59e0b', '频域虚部 IMX[0..31] (对称轴: 0 与 16)');\n\n  if (lab.values.play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n    stopAudio();\n    if (audioCtx) {\n      var sr = audioCtx.sampleRate || 44100;\n      var periodSamples = Math.round(sr / 110);\n      var buf = audioCtx.createBuffer(1, periodSamples, sr);\n      var ch = buf.getChannelData(0);\n      for (var sIdx = 0; sIdx < periodSamples; sIdx++) {\n        var pos = (sIdx / periodSamples) * N;\n        var i0 = Math.floor(pos) % N;\n        var i1 = (i0 + 1) % N;\n        var frac = pos - Math.floor(pos);\n        var sampleVal = outRe[i0] * (1 - frac) + outRe[i1] * frac;\n        ch[sIdx] = Math.max(-0.9, Math.min(0.9, sampleVal * 0.35));\n      }\n      gainNode = audioCtx.createGain();\n      gainNode.gain.value = 0.32;\n      gainNode.connect(audioCtx.destination);\n      sourceNode = audioCtx.createBufferSource();\n      sourceNode.buffer = buf;\n      sourceNode.loop = true;\n      sourceNode.connect(gainNode);\n      sourceNode.start(0);\n    }\n  } else {\n    stopAudio();\n  }\n\n  var symStatus = symErr < 1e-6 ? '严格对称' : '对称性已破坏(偏差 ' + symErr.toFixed(2) + ')';\n  var rtStatus = maxErr < 1e-6 ? '通过 (误差 ' + maxErr.toExponential(1) + ')' : '失败！(误差 ' + maxErr.toFixed(3) + '，未取共轭导致时域反转)';\n  lab.setReadout('往返测试: ' + rtStatus + ' | 频域对称性: ' + symStatus + ' | 基频: 110Hz (f1=' + (f1 * 110) + 'Hz, f2=' + (f2 * 110) + 'Hz)');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "就地计算省内存：标准 FFT 直接覆盖传入的 `REX[ ]` 与 `IMX[ ]`，无需额外开辟输出缓冲区。",
        "别纠结 DIT 还是 DIF：位反转排序放在蝶形循环之前（BASIC）或之后（FORTRAN）速度几乎没差别，数值结果完全一致。",
        "死盯 0-based 与 1-based 接口差异：FORTRAN 类 1..N 子程序会把频域对称中心从 `0` 和 `N/2` 变成 `1` 和 `N/2 + 1`，移植代码时务必核对。",
        "逆 FFT 不用重写：利用复数 DFT 的强对偶性，把输入虚部取反 → 跑正 FFT → 结果实部除以 `N`、虚部取反再除以 `N` 即可。",
        "上线前必跑两项自检：随机数做“正 FFT + 逆 FFT”往返误差应仅为浮点舍入噪声（约 ppm 级）；实信号输入的频域必须严格关于 `0` 和 `N/2` 共轭对称。"
      ]
    }
  ]
});
