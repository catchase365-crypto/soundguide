window.__BOOK_REGISTER_SECTION__("sec_242", {
  "title": "弗兰克·本福特的发现：反直觉的首位数字定律 (Frank Benford’s Discovery)",
  "intuition": "现实生活中的大量数据并非等概率地以 1~9 开头，而是遵循对数刻度间距——近 30.1% 的数字以 1 开头；更神奇的是，把整组数据乘以任意常数或换算成外星八进制，这一比例依然纹丝不动。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 对数表翻旧的秘密与“首位数字”定义",
      "paragraphs": [
        "20 世纪 30 年代，美国通用电气（GE）的研究物理学家**弗兰克·本福特（Frank Benford）**在翻阅对数表手册时注意到一个反常现象：书本靠前的页码总是比靠后的页码磨损得更严重。这说明人们查表时，**以数字 1 开头的数被查询的频率远高于以 2 到 9 开头的数**。",
        "为了验证这并非巧合，本福特花费数年收集了超过 **20,000 个**来自自然界与人类社会的数据（包括原子量、杂志文章中的数字、棒球统计数据、河流面积等），并于 1938 年发表了著名的论文《反常数字定律》（*The Law of Anomalous Numbers*），后人称之为**本福特定律（Benford's Law）**。",
        "要统计**首位数字（Leading Digit）**，规则很简单：从每个数的最左侧看起，**忽略正负号、小数点和所有前导零**，遇到的第一个处于 1 到 9 之间的数字就是首位数字。例如：`37.3447` 的首位数字是 `3`，`-0.06345` 的首位数字是 `6`。按直觉猜测，1~9 九个数字平分天下，每个数字出现的概率应为 `1/9 ≈ 11.11%`。但在报纸统计、物理常数表和 **14,414 个美国企业所得税申报数字**中，首位为 `1` 的比例高达 **30.1%**，首位为 `2` 的比例约为 **17.6%**，随后逐级递减。"
      ],
      "formula": {
        "expr": "P(d) = log₁₀(d + 1) - log₁₀(d) = log₁₀(1 + 1/d)",
        "explain": "P(d) 为首位数字 d（d = 1, 2, ..., 9）出现的理论概率；log₁₀(d+1) - log₁₀(d) 恰好等于十进制对数数轴上相邻整数之间的物理间距，例如 log(2)-log(1) = 0.301（占 30.1%），log(3)-log(2) = 0.176（占 17.6%）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 为什么有的数字服从，有的却彻底失效？",
      "paragraphs": [
        "本福特定律并非放之四海而皆准。在原书图 34-2 的对比实验中，左侧来自真实税务申报的数据完美贴合对数分布；而右侧由计算机随机数生成器（RNG）产生的**正态分布样本（均值 μ = 5，标准差 σ = 3）**却完全不服从本福特定律。",
        "更令人困惑的是，对于正态分布或统计学课本里大多数常见分布，只要稍微改变均值或标准差，首位数字直方图的形状就会毫无章法地剧烈变化。几十年来，数学家和物理学家一直在追问：**为什么有些数据集严格遵守对数规律，而另一些却完全不遵守？**"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 1：正态分布随机数 vs. 本福特对数标尺",
      "instruction": "拖动正态分布的均值 μ 和标准差 σ 滑块，观察右侧随机数的首位数字分布如何剧烈乱跳，并对比左侧（绿色）本福特定律在对数刻度上的天然间距。",
      "controls": [
        {
          "type": "slider",
          "id": "mean",
          "label": "正态分布均值 μ",
          "min": -5,
          "max": 15,
          "step": 0.5,
          "value": 5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "std",
          "label": "正态分布标准差 σ",
          "min": 0.5,
          "max": 8,
          "step": 0.5,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showLogRuler",
          "label": "显示对数数轴间距对比",
          "value": true
        }
      ],
      "jsCode": "function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}\nfunction leadingDigit(x){var ax=Math.abs(x);if(ax<1e-12||!isFinite(ax))return 0;while(ax>=10)ax/=10;while(ax<1)ax*=10;var d=Math.floor(ax);if(d<1)d=1;if(d>9)d=9;return d;}\nfunction draw(){\n  var ctx=lab.ctx, W=lab.width, H=lab.height;\n  ctx.clearRect(0,0,W,H);\n  var mu=lab.values.mean, sigma=lab.values.std, showRuler=lab.values.showLogRuler;\n  var rng=mulberry32(2025034);\n  var counts=[0,0,0,0,0,0,0,0,0,0], total=0, samples=[];\n  for(var i=0;i<2500;i++){\n    var u1=Math.max(1e-9,rng()), u2=rng();\n    var z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);\n    var val=mu+sigma*z;\n    var d=leadingDigit(val);\n    if(d>=1&&d<=9){counts[d]++;total++;}\n    if(i<7)samples.push(val);\n  }\n  var gx=48, gy=28, gw=395, gh=172;\n  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;\n  ctx.font='11px monospace'; ctx.fillStyle='rgba(248,250,252,0.55)';\n  for(var p=0;p<=40;p+=10){\n    var y=gy+gh-(p/45)*gh;\n    ctx.beginPath(); ctx.moveTo(gx,y); ctx.lineTo(gx+gw,y); ctx.stroke();\n    ctx.fillText(p+'%', 14, y+4);\n  }\n  var uniformY=gy+gh-((100/9)/45)*gh;\n  ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(248,250,252,0.3)';\n  ctx.beginPath(); ctx.moveTo(gx,uniformY); ctx.lineTo(gx+gw,uniformY); ctx.stroke();\n  ctx.restore();\n  var slotW=gw/9;\n  var benfordPts=[];\n  for(var d=1;d<=9;d++){\n    var pct=total>0?(counts[d]/total)*100:0;\n    var bPct=(Math.log(1+1/d)/Math.LN10)*100;\n    var cx=gx+(d-0.5)*slotW;\n    var barH=Math.min(gh,(pct/45)*gh);\n    ctx.fillStyle='#38bdf8';\n    ctx.fillRect(cx-slotW*0.32, gy+gh-barH, slotW*0.64, barH);\n    var by=gy+gh-(bPct/45)*gh;\n    benfordPts.push({x:cx,y:by,bPct:bPct});\n    ctx.fillStyle='#f8fafc'; ctx.textAlign='center';\n    ctx.fillText(String(d), cx, gy+gh+16);\n  }\n  ctx.strokeStyle='#10b981'; ctx.lineWidth=2.5;\n  ctx.beginPath();\n  for(var i=0;i<benfordPts.length;i++){\n    if(i===0)ctx.moveTo(benfordPts[i].x,benfordPts[i].y);\n    else ctx.lineTo(benfordPts[i].x,benfordPts[i].y);\n  }\n  ctx.stroke();\n  for(var i=0;i<benfordPts.length;i++){\n    ctx.fillStyle='#10b981'; ctx.beginPath(); ctx.arc(benfordPts[i].x,benfordPts[i].y,4,0,Math.PI*2); ctx.fill();\n  }\n  ctx.textAlign='left'; ctx.font='bold 12px sans-serif';\n  ctx.fillStyle='#38bdf8'; ctx.fillRect(gx,8,10,10); ctx.fillStyle='#f8fafc'; ctx.fillText('正态分布 RNG 直方图', gx+15, 17);\n  ctx.fillStyle='#10b981'; ctx.fillRect(gx+165,8,10,10); ctx.fillStyle='#f8fafc'; ctx.fillText('本福特理论曲线', gx+180, 17);\n  var rx=468, rw=236;\n  ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(rx,16,rw,202);\n  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.strokeRect(rx,16,rw,202);\n  if(showRuler){\n    ctx.fillStyle='#f8fafc'; ctx.font='bold 12px sans-serif';\n    ctx.fillText('线性标尺 vs 对数标尺 [1..10]', rx+12, 36);\n    var lx1=rx+18, lx2=rx+rw-18, lw=lx2-lx1;\n    ctx.fillStyle='rgba(248,250,252,0.65)'; ctx.font='11px sans-serif';\n    ctx.fillText('线性刻度 (等距: 各占 11.1%)', lx1, 60);\n    ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(lx1,74); ctx.lineTo(lx2,74); ctx.stroke();\n    for(var d=1;d<=10;d++){\n      var px=lx1+((d-1)/9)*lw;\n      ctx.beginPath(); ctx.moveTo(px,68); ctx.lineTo(px,80); ctx.stroke();\n      ctx.fillStyle='#cbd5e1'; ctx.textAlign='center'; ctx.fillText(String(d), px, 93);\n    }\n    ctx.textAlign='left'; ctx.fillStyle='#10b981'; ctx.font='11px sans-serif';\n    ctx.fillText('对数刻度 log10(x) (1→2 占 30.1%!)', lx1, 122);\n    ctx.fillStyle='rgba(16,185,129,0.22)';\n    ctx.fillRect(lx1, 130, (Math.log(2)/Math.LN10)*lw, 18);\n    ctx.strokeStyle='#10b981'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(lx1,139); ctx.lineTo(lx2,139); ctx.stroke();\n    for(var d=1;d<=10;d++){\n      var px=lx1+(Math.log(d)/Math.LN10)*lw;\n      ctx.beginPath(); ctx.moveTo(px,131); ctx.lineTo(px,147); ctx.stroke();\n      if(d<=5||d===10){ctx.fillStyle='#10b981'; ctx.textAlign='center'; ctx.fillText(String(d), px, 161);}\n    }\n    ctx.textAlign='left'; ctx.fillStyle='#f59e0b'; ctx.font='11px monospace';\n    ctx.fillText('log(2)-log(1) = 0.301', lx1, 186);\n    ctx.fillText('log(3)-log(2) = 0.176', lx1, 203);\n  } else {\n    ctx.fillStyle='#f8fafc'; ctx.font='bold 12px sans-serif';\n    ctx.fillText('当前生成的正态分布样本预览', rx+12, 36);\n    for(var i=0;i<samples.length;i++){\n      var v=samples[i], d=leadingDigit(v);\n      ctx.fillStyle='#cbd5e1'; ctx.font='12px monospace';\n      ctx.fillText(v.toFixed(4), rx+16, 62+i*21);\n      ctx.fillStyle='#38bdf8';\n      ctx.fillText('→ 首位: '+d, rx+130, 62+i*21);\n    }\n  }\n  var p1=total>0?(counts[1]/total)*100:0;\n  lab.setReadout('N(μ='+mu.toFixed(1)+', σ='+sigma.toFixed(1)+') 首位为 1 实测比例: '+p1.toFixed(1)+'%  |  本福特理论: 30.1%  |  直觉等概率线: 11.1%');\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "3. 令人夜不能寐的两大不变性：尺度不变性与进制不变性",
      "paragraphs": [
        "本福特定律最神奇的地方在于它的两大“不变性”。首先，税务报表里的 14,414 个数字全都是以**美元**计价的。如果一位印度金融分析师为了方便，将所有数据乘以汇率常数统一换算成**印度卢比**，那么几乎每一个数字的首位数字都会被改写。然而统计结果却显示，新数据中仍有约 **30.1%** 的数字以 1 开头！这种“将整组数据乘以任意非零常数后，分布规律保持不变”的性质，称为**尺度不变性（Scale Invariance）**。相反，对正态分布 RNG 乘以常数，只会把它的直方图彻底打乱。",
        "其次，假设一位长着八根手指的外星人拿到了这批税务数据，并将所有数字全部转换成**八进制（Base 8）**。虽然所有数字的具体写法又一次面目全非（且八进制中没有 8 和 9），但转换后的数字依然严格服从八进制下的本福特定律（首位为 1 的比例恰好升至 `log₈(2) = 1/3 ≈ 33.3%`）。这种性质称为**进制不变性（Base Invariance）**。"
      ],
      "formula": {
        "expr": "P_B(d) = log_B(1 + 1/d) = ln(1 + 1/d) / ln(B)",
        "explain": "通用进制 B 下的本福特定律公式：其中 B 为进制基数（如十进制 B=10，八进制 B=8），d 为该进制下的有效首位数字（1 ≤ d ≤ B-1）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：汇率缩放与外星八进制转换实验室",
      "instruction": "拖动乘数因子 k（模拟美元→卢比汇率换算）或开启“外星八进制模式”，对比跨量级数据与正态分布数据在变换下的惊人差异。",
      "controls": [
        {
          "type": "slider",
          "id": "scale",
          "label": "常数乘数因子 k",
          "min": 0.2,
          "max": 25,
          "step": 0.2,
          "value": 1,
          "unit": " ×"
        },
        {
          "type": "toggle",
          "id": "base8",
          "label": "外星八进制模式 (Base 8)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "benfordSource",
          "label": "跨量级税务数据 (关=正态RNG)",
          "value": true
        }
      ],
      "jsCode": "function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}\nvar rng=mulberry32(99134);\nvar taxData=[], normData=[];\nfor(var i=0;i<2400;i++){\n  taxData.push(Math.pow(10, 1+rng()*4.2));\n  var u1=Math.max(1e-9,rng()), u2=rng();\n  normData.push(5+3*Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2));\n}\nfunction getLeadBase(x,B){\n  var ax=Math.abs(x); if(ax<1e-12||!isFinite(ax))return 0;\n  while(ax>=B)ax/=B; while(ax<1)ax*=B;\n  var d=Math.floor(ax); if(d<1)d=1; if(d>=B)d=B-1; return d;\n}\nfunction draw(){\n  var ctx=lab.ctx, W=lab.width, H=lab.height;\n  ctx.clearRect(0,0,W,H);\n  var k=lab.values.scale, B=lab.values.base8?8:10, isBen=lab.values.benfordSource;\n  var src=isBen?taxData:normData;\n  var counts=new Array(B).fill(0), total=0;\n  for(var i=0;i<src.length;i++){\n    var d=getLeadBase(src[i]*k, B);\n    if(d>=1&&d<B){counts[d]++; total++;}\n  }\n  var gx=48, gy=28, gw=375, gh=172;\n  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;\n  ctx.font='11px monospace'; ctx.fillStyle='rgba(248,250,252,0.55)';\n  for(var p=0;p<=40;p+=10){\n    var y=gy+gh-(p/45)*gh;\n    ctx.beginPath(); ctx.moveTo(gx,y); ctx.lineTo(gx+gw,y); ctx.stroke();\n    ctx.fillText(p+'%', 14, y+4);\n  }\n  var maxD=B-1, slotW=gw/maxD, pts=[], errSum=0;\n  for(var d=1;d<=maxD;d++){\n    var pct=total>0?(counts[d]/total)*100:0;\n    var bPct=(Math.log(1+1/d)/Math.log(B))*100;\n    errSum+=Math.abs(pct-bPct);\n    var cx=gx+(d-0.5)*slotW;\n    var barH=Math.min(gh,(pct/45)*gh);\n    ctx.fillStyle=isBen?'#10b981':'#ec4899';\n    ctx.fillRect(cx-slotW*0.32, gy+gh-barH, slotW*0.64, barH);\n    var by=gy+gh-(bPct/45)*gh;\n    pts.push({x:cx,y:by});\n    ctx.fillStyle='#f8fafc'; ctx.textAlign='center';\n    ctx.fillText(String(d), cx, gy+gh+16);\n  }\n  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.5;\n  ctx.beginPath();\n  for(var i=0;i<pts.length;i++){if(i===0)ctx.moveTo(pts[i].x,pts[i].y);else ctx.lineTo(pts[i].x,pts[i].y);}\n  ctx.stroke();\n  for(var i=0;i<pts.length;i++){ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(pts[i].x,pts[i].y,4,0,Math.PI*2); ctx.fill();}\n  ctx.textAlign='left'; ctx.font='bold 12px sans-serif';\n  ctx.fillStyle=isBen?'#10b981':'#ec4899'; ctx.fillRect(gx,8,10,10);\n  ctx.fillStyle='#f8fafc'; ctx.fillText((isBen?'跨量级税务数据':'正态 RNG 数据')+' (Base '+B+')', gx+15, 17);\n  ctx.fillStyle='#f59e0b'; ctx.fillRect(gx+215,8,10,10);\n  ctx.fillStyle='#f8fafc'; ctx.fillText('Base '+B+' 本福特理论', gx+230, 17);\n  var rx=445, rw=260;\n  ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(rx,16,rw,202);\n  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.strokeRect(rx,16,rw,202);\n  ctx.fillStyle='#f8fafc'; ctx.font='bold 12px sans-serif';\n  ctx.fillText('个例变换: 原值 × '+k.toFixed(1)+' → Base '+B, rx+12, 36);\n  for(var i=0;i<6;i++){\n    var orig=src[i], scaled=orig*k;\n    var origStr=isBen?Math.round(orig).toString():orig.toFixed(2);\n    var absVal=Math.abs(scaled);\n    var baseStr=(scaled<0?'-':'')+(isBen?Math.round(absVal).toString(B):absVal.toString(B).slice(0,7));\n    var dNew=getLeadBase(scaled,B);\n    var py=62+i*25;\n    ctx.fillStyle='#94a3b8'; ctx.font='11px monospace';\n    ctx.fillText(origStr, rx+12, py);\n    ctx.fillStyle='#38bdf8'; ctx.fillText('→', rx+78, py);\n    ctx.fillStyle='#f8fafc'; ctx.fillText(baseStr.slice(0,10), rx+96, py);\n    ctx.fillStyle='#f59e0b'; ctx.fillText('['+dNew+']', rx+218, py);\n  }\n  var p1=total>0?(counts[1]/total)*100:0;\n  var th1=(Math.log(2)/Math.log(B))*100;\n  lab.setReadout('Base '+B+' | 乘数 k='+k.toFixed(1)+' | 首位为1: 实测 '+p1.toFixed(1)+'% (理论 '+th1.toFixed(1)+'%) | 总绝对偏差: '+errSum.toFixed(1)+'%');\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "4. 破除“宇宙神秘学”迷思：不是自然密码，而是巧妙的魔术",
      "paragraphs": [
        "由于同时具备尺度不变性和进制不变性，数学家甚至证明：**对数首位数字分布是唯一同时满足这两种不变性的分布**。过去七十年里，本福特定律几乎吸引了一群“狂热信徒”。本福特本人就曾试图将它与自然界挂钩，声称“凡人用算术计数 `1, 2, 3, 4...`，而大自然用指数计数 `e⁰, eˣ, e²ˣ...`”；另一些流行解释则认为大自然存在某种“通用宇宙分布”，甚至有人宣称本福特定律只适用于带物理单位（如美元、米、摄氏度）的数字，或者干脆把它与超自然通灵现象扯在一起。",
        "但在本章结尾，作者 Steven W. Smith 直言不讳地泼了一盆冷水：**别浪费时间去理解上述神秘主义解释，它们完全走偏了方向。世界上并不存在什么“通用分布”，这个现象也和“物理单位”毫无关系。** 等到用数字信号处理（DSP）的同态滤波与对数域视角拆解之后，你会发现本福特定律更像是一个**设计精巧的数学魔术**，而非宇宙隐藏的神秘密码。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "本节核心直觉与避坑速记",
      "items": [
        "提取首位数字必须跳过符号、小数点和前导零（如 -0.06345 的首位是 6），不要被小数位迷惑。",
        "本福特定律中首位数字的概率等于十进制对数刻度上的区间长度：log₁₀(1 + 1/d)，首位 1 占 30.1%，首位 9 仅占 4.6%。",
        "避坑：常见统计学分布（如固定均值与方差的正态分布、均匀分布）通常不服从本福特定律，也完全不具备尺度不变性。",
        "破除迷信：尺度不变性与进制不变性并不意味着它是“宇宙通用分布”或依赖“物理单位”，后续 DSP 频域/对数分析将彻底揭开它的魔术面纱。"
      ]
    }
  ]
});
