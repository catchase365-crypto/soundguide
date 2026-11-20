window.__BOOK_REGISTER_SECTION__("sec_034", {
  "title": "精密度与准确度 (Precision and Accuracy)",
  "intuition": "准确度衡量“瞄得准不准”（系统校准偏差），精密度衡量“手抖不抖”（随机噪声发散）；多次平均只能治手抖，系统校准才能治跑偏。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 打破日常误区：真实值、测量值与工程严格定义",
      "paragraphs": [
        "在测量、估计或预测任何物理系统时，总存在一个我们想要知道的客观参数，称为**真实值（True Value，或简称 Truth）**。而传感器或算法给出的结果，称为**测量值（Measured Value）**。工程上的核心任务，就是描述并缩小这两者之间的误差。",
        "在日常生活中，**精密度（Precision）**和**准确度（Accuracy）**经常被混用，甚至连英文词典也常常用其中一个来解释另一个。但在科学与数字信号处理工程中，这两个词有着截然不同且极其严格的数学定义——**绝不能混淆**。",
        "理解它们的关键，是把测量总误差拆解成两个正交的成分：**系统误差（Systematic Error）**与**随机误差（Random Error）**。前者决定了准确度，后者决定了精密度。"
      ],
      "formula": {
        "expr": "Measured Value = Truth + Systematic Error + Random Error",
        "explain": "Measured Value 为单次测量读数；Truth 为客观真实值；Systematic Error 为每次测量都以相同方式重复出现的固定偏差（决定准确度）；Random Error 为每次测量都随机变化的噪声波动（决定精密度）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 声呐测深案例：直方图里的秘密 (图 2-11)",
      "paragraphs": [
        "设想一位海洋学家用声呐测量水深：船底发射声波脉冲，遇到海底反射回波，通过往返时间差换算水深。实际测量会受到电子器件热噪声、海面波浪、海底水草以及水温变化导致的声速漂移等多种因素干扰。",
        "为了研究这些误差，科学家在已知**真实水深恰好为 1000 米**的位置连续测量了大量数据，并绘制成直方图。根据中心极限定理，测量结果呈**正态分布（Normal Distribution）**：分布的中心即**均值（Mean）**，代表所有数据给出的最佳估计；分布的宽度即**标准差（Standard Deviation）**，反映相邻测量之间的波动幅度。",
        "由此引出两个严格定义：**准确度（Accuracy）**是指“均值”偏离“真实值”的距离。准确度差源于**系统误差**，比如把毫秒换算成米时乘错了声速。它完全取决于**系统校准（Calibration）**——哪怕你把一万次测量求平均，也无法消除准确度偏差。",
        "**精密度（Precision）**则是指测量分布的宽度，常用标准差、**信噪比（SNR）**或**变异系数（CV）**来量化。精密度差意味**可重复性（Repeatability）**差，源于**随机误差**。好消息是：**对多次测量求平均，永远能提高精密度**（均值的标准差随平均次数 N 的平方根下降）。"
      ],
      "formula": {
        "expr": "σ_avg = σ / √N   (而 Mean_Bias 保持不变)",
        "explain": "σ 为单次测量的随机噪声标准差；N 为连续平均的采样次数；σ_avg 为平均后的有效标准差（精密度提升 √N 倍）。但系统偏差 Mean_Bias 不会因 N 增大而减小。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：声呐测深直方图——解剖“校准偏差”与“随机噪声”",
      "instruction": "拖动滑块改变系统校准偏差、随机噪声标准差与平均次数 N，观察直方图中心（准确度）与宽度（精密度）的独立变化规律。",
      "controls": [
        {
          "type": "slider",
          "id": "sysBias",
          "label": "系统校准偏差 (Bias)",
          "min": -120,
          "max": 120,
          "step": 5,
          "value": 35,
          "unit": " m"
        },
        {
          "type": "slider",
          "id": "randStd",
          "label": "单次随机噪声 (σ)",
          "min": 10,
          "max": 90,
          "step": 2,
          "value": 40,
          "unit": " m"
        },
        {
          "type": "slider",
          "id": "avgCount",
          "label": "连续平均次数 (N)",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 1,
          "unit": " 次"
        }
      ],
      "jsCode": "(function(){var ctx=lab.ctx,W=lab.width,H=lab.height;var samples=[];var seed=987654321;function rand(){seed=(1664525*seed+1013904223)%4294967296;return seed/4294967296;}for(var i=0;i<1000;i++){var u1=Math.max(1e-7,rand()),u2=rand();samples.push(Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2));}function draw(){var bias=lab.values.sysBias;var std=lab.values.randStd;var nAvg=Math.max(1,lab.values.avgCount);var effStd=std/Math.sqrt(nAvg);var trueVal=1000;var minX=600,maxX=1400,bins=80;var binW=(maxX-minX)/bins;var counts=new Array(bins).fill(0);var sum=0;for(var i=0;i<samples.length;i++){var v=trueVal+bias+samples[i]*effStd;sum+=v;var idx=Math.floor((v-minX)/binW);if(idx>=0&&idx<bins)counts[idx]++;}var meanVal=sum/samples.length;var maxCount=Math.max.apply(null,counts);ctx.clearRect(0,0,W,H);var padL=44,padR=44,padT=34,padB=36;var plotW=W-padL-padR,plotH=H-padT-padB;function xPos(v){return padL+((v-minX)/(maxX-minX))*plotW;}ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;for(var gx=600;gx<=1400;gx+=100){var x=xPos(gx);ctx.beginPath();ctx.moveTo(x,padT);ctx.lineTo(x,H-padB);ctx.stroke();ctx.fillStyle='rgba(248,250,252,0.55)';ctx.font='11px monospace';ctx.textAlign='center';ctx.fillText(gx+'m',x,H-16);}for(var gy=0;gy<=3;gy++){var y=padT+gy*(plotH/3);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();}var scaleY=plotH/Math.max(maxCount,220);var barPxW=plotW/bins;ctx.fillStyle='rgba(56,189,248,0.42)';for(var b=0;b<bins;b++){if(counts[b]>0){var bh=Math.min(plotH,counts[b]*scaleY);ctx.fillRect(padL+b*barPxW+0.5,(H-padB)-bh,Math.max(1,barPxW-1),bh);}}ctx.beginPath();ctx.strokeStyle='#f8fafc';ctx.lineWidth=1.5;for(var px=0;px<=plotW;px+=2){var xv=minX+(px/plotW)*(maxX-minX);var pdf=(1/(effStd*Math.sqrt(2*Math.PI)))*Math.exp(-0.5*Math.pow((xv-(trueVal+bias))/effStd,2));var expCnt=pdf*samples.length*binW;var py=(H-padB)-Math.min(plotH,expCnt*scaleY);if(px===0)ctx.moveTo(padL+px,py);else ctx.lineTo(padL+px,py);}ctx.stroke();var tx=xPos(trueVal);ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,18);ctx.lineTo(tx,H-padB);ctx.stroke();ctx.restore();ctx.fillStyle='#10b981';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('真实值 1000m',tx,13);var mx=xPos(meanVal);ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx,28);ctx.lineTo(mx,H-padB);ctx.stroke();ctx.fillStyle='#f59e0b';ctx.fillText('测量均值 '+meanVal.toFixed(0)+'m',mx,26);if(Math.abs(mx-tx)>4){ctx.strokeStyle='#ec4899';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tx,54);ctx.lineTo(mx,54);ctx.stroke();ctx.fillStyle='#ec4899';ctx.fillText('准确度误差(Bias)',(tx+mx)/2,48);}var pL=Math.max(padL,xPos(meanVal-2*effStd));var pR=Math.min(W-padR,xPos(meanVal+2*effStd));ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(pL,H-padB-12);ctx.lineTo(pR,H-padB-12);ctx.stroke();ctx.fillStyle='#38bdf8';ctx.fillText('精密度跨度 (±2σ)',(pL+pR)/2,H-padB-18);lab.setReadout('真实值: 1000m | 均值: '+meanVal.toFixed(1)+'m | 准确度偏差: '+(meanVal-trueVal>=0?'+':'')+(meanVal-trueVal).toFixed(1)+'m | 有效标准差(精密度): '+effStd.toFixed(1)+'m (N='+nAvg+')');}lab.onUpdate(draw);})();"
    },
    {
      "type": "concept",
      "heading": "3. 思维陷阱：1% 容差电阻放大器的“变脸”难题",
      "paragraphs": [
        "在实际工程中，精密度与准确度常常会互相交织。举个经典的例子：假设你用标称容差为 **1%** 的电阻搭建了一个电子放大器。这个 1% 意味着在温度、湿度、元件老化等各种条件下，每个电阻的实际阻值都在标称值的 ±1% 范围内，从而给放大器增益带来误差。那么，**这是准确度问题，还是精密度问题？**",
        "答案完全取决于你的**测量视角**：情景一，如果你只焊了**一台**放大器，在几分钟的稳定环境内反复测试，每次测出的增益误差都一模一样——此时这是一个**准确度（Accuracy）**问题；情景二，如果你批量生产了**一千台**放大器，逐台测试时增益在标称值附近随机波动——此时它变成了**精密度（Precision）**问题；情景三，即使只有**一台**放大器，但如果温度和环境剧烈变化，它的增益随环境不断漂移波动——它同样表现为**精密度（Precision）**问题。",
        "为了在复杂系统中一秒定性，请永远问自己**两个黄金问题**：第一，**对连续多次读数求平均，能让测量结果更好吗？**如果是，叫它**精密度**；如果否，叫它**准确度**。第二，**重新校准（Calibration）能消除这个误差吗？**如果是，叫它**准确度**；如果否，叫它**精密度**。"
      ],
      "formula": {
        "expr": null,
        "explain": "黄金诊断法则：平均有效 = 精密度（随机噪声）；校准有效 = 准确度（系统偏差）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：两问诊断台——实时平均滤波 vs. 系统校准（支持听感对比）",
      "instruction": "观察时序曲线并点击“播放测频听感对比”（以 440Hz 为真实基准音）：试着调大平均次数 N 看波形抖动与音高颤动如何收敛，再开启系统校准看均值如何回到 440Hz 绿线。",
      "controls": [
        {
          "type": "slider",
          "id": "sysErr",
          "label": "系统校准偏差",
          "min": -45,
          "max": 45,
          "step": 1,
          "value": 25,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "randNoise",
          "label": "随机噪声强度",
          "min": 0,
          "max": 40,
          "step": 1,
          "value": 18,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "avgN",
          "label": "滑动平均点数 (N)",
          "min": 1,
          "max": 20,
          "step": 1,
          "value": 1,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "doCalibrate",
          "label": "开启系统校准 (消除偏差)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测频听感对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "(function(){var ctx=lab.ctx,W=lab.width,H=lab.height;var totalLen=180,visLen=160;var noiseBuf=[];for(var i=0;i<totalLen;i++){var u1=Math.max(1e-7,Math.random()),u2=Math.random();noiseBuf.push(Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2));}var acc=0;var ac=null,oscMeas=null,oscRef=null,gainMeas=null,gainRef=null;function ensureAudio(){if(!ac){ac=lab.getAudioContext();oscMeas=ac.createOscillator();oscRef=ac.createOscillator();gainMeas=ac.createGain();gainRef=ac.createGain();oscMeas.type='sine';oscRef.type='sine';oscRef.frequency.value=440;gainMeas.gain.value=0;gainRef.gain.value=0;oscMeas.connect(gainMeas);oscRef.connect(gainRef);gainMeas.connect(ac.destination);gainRef.connect(ac.destination);oscMeas.start();oscRef.start();}if(ac.state==='suspended')ac.resume();}function render(){var sysErr=lab.values.sysErr;var noiseAmp=lab.values.randNoise;var avgN=Math.max(1,lab.values.avgN);var cal=lab.values.doCalibrate;var effBias=cal?0:sysErr;var truth=440,minY=375,maxY=505;var padL=52,padR=20,padT=20,padB=26;var plotW=W-padL-padR,plotH=H-padT-padB;function yPos(f){return padT+((maxY-f)/(maxY-minY))*plotH;}var rawArr=[],avgArr=[];for(var i=0;i<visLen;i++){var idx=i+20;var r=truth+effBias+noiseBuf[idx]*noiseAmp;rawArr.push(r);var sum=0;for(var k=0;k<avgN;k++)sum+=noiseBuf[idx-k];avgArr.push(truth+effBias+(sum/avgN)*noiseAmp);}ctx.clearRect(0,0,W,H);ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;for(var yf=380;yf<=500;yf+=20){var py=yPos(yf);ctx.beginPath();ctx.moveTo(padL,py);ctx.lineTo(W-padR,py);ctx.stroke();ctx.fillStyle='rgba(248,250,252,0.5)';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText(yf+'Hz',padL-6,py+4);}for(var xg=0;xg<=8;xg++){var gx=padL+xg*(plotW/8);ctx.beginPath();ctx.moveTo(gx,padT);ctx.lineTo(gx,H-padB);ctx.stroke();}var ty=yPos(truth);ctx.save();ctx.setLineDash([6,4]);ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(padL,ty);ctx.lineTo(W-padR,ty);ctx.stroke();ctx.restore();ctx.fillStyle='#10b981';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.fillText('真实基准值 (440 Hz)',padL+6,ty-6);var by=yPos(truth+effBias);ctx.save();ctx.setLineDash([3,3]);ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(padL,by);ctx.lineTo(W-padR,by);ctx.stroke();ctx.restore();ctx.beginPath();ctx.strokeStyle='rgba(236,72,153,0.38)';ctx.lineWidth=1.2;for(var i=0;i<visLen;i++){var px=padL+(i/(visLen-1))*plotW;var py=Math.max(padT,Math.min(H-padB,yPos(rawArr[i])));if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();ctx.beginPath();ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.5;for(var i=0;i<visLen;i++){var px=padL+(i/(visLen-1))*plotW;var py=Math.max(padT,Math.min(H-padB,yPos(avgArr[i])));if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();var curAvg=avgArr[visLen-1];var curRaw=rawArr[visLen-1];var effStd=noiseAmp/Math.sqrt(avgN);if(lab.values.play){try{ensureAudio();var now=ac.currentTime;oscMeas.frequency.setTargetAtTime(Math.max(120,Math.min(1200,curAvg)),now,0.015);gainMeas.gain.setTargetAtTime(0.11,now,0.02);gainRef.gain.setTargetAtTime(0.04,now,0.02);}catch(e){}}else if(ac){try{var now=ac.currentTime;gainMeas.gain.setTargetAtTime(0,now,0.02);gainRef.gain.setTargetAtTime(0,now,0.02);}catch(e){}}ctx.fillStyle='#f8fafc';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('粉线: 原始读数  |  蓝线: '+avgN+'点平均后  |  橙线: 系统均值',W-padR,H-8);lab.setReadout('真实值: 440Hz | 原始瞬时: '+curRaw.toFixed(1)+'Hz | 平均后: '+curAvg.toFixed(1)+'Hz | 校准偏差: '+(effBias>=0?'+':'')+effBias+'Hz | 残留随机波动(σ): '+effStd.toFixed(1)+'Hz');}lab.onUpdate(render);lab.onLoop(function(dt){acc+=Math.min(dt,0.1);var stepped=false;while(acc>=0.05){acc-=0.05;noiseBuf.shift();var u1=Math.max(1e-7,Math.random()),u2=Math.random();noiseBuf.push(Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2));stepped=true;}if(stepped)render();});})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【概念铁律】准确度（Accuracy）= 均值与真实值的偏离，由系统误差决定；精密度（Precision）= 测量分布的宽度（标准差/SNR/CV），由随机误差决定。",
        "【对症下药】平均（Averaging）只能压缩随机噪声、提升精密度，对消除固定偏差毫无作用；校准（Calibration）才能修正系统偏差、提升准确度。",
        "【两问诊断法】遇到误差分不清归属时，自问两句：① 多次平均能变好吗？（能→精密度）；② 重新校准能消除吗？（能→准确度）。",
        "【视角依赖】同一个器件误差（如 1% 电阻），单机短时复测表现为准确度问题，批量对比或跨温区漂移则表现为精密度问题。"
      ]
    }
  ]
});
