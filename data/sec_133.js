window.__BOOK_REGISTER_SECTION__("sec_133", {
  "title": "数字滤波器的分类体系 (Filter Classification)",
  "intuition": "所有数字滤波器都可以放进一张“3种用途 × 2种实现”的二维矩阵里：先问信号信息藏在波形形状还是频谱里，再决定用高精度但较慢的卷积（FIR），还是用极速但性能受限的递归（IIR）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "全景坐标：数字滤波器的二维分类矩阵（Table 14-1）",
      "paragraphs": [
        "在进入具体滤波器设计之前，必须先建立全局地图。原书 **Table 14-1** 用两个正交维度对所有数字滤波器进行了分类：**按用途划分（Filter Used For）** 与 **按实现方式划分（Filter Implemented By）**。",
        "如果把滤波器比作工厂的加工机床，“用途”决定了你要把原材料加工成什么样子（保留形状、切分频段，还是做特种修复）；而“实现方式”则决定了机床内部的机械原理（是把历史输入排成队做加权卷积，还是把刚加工完的输出再送回输入端做递归反馈）。",
        "在这张 `3 × 2` 的分类矩阵中，六个格子恰好对应了全书后续的核心章节：**时域**（FIR 移动平均 Ch.15 / IIR 单极点 Ch.19）、**频域**（FIR 窗函数 Sinc Ch.16 / IIR 切比雪夫 Ch.20）以及 **定制滤波**（FIR 定制 Ch.17 / IIR 迭代设计与神经网络 Ch.26）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "第一维：按“用途”分类——时域、频域与定制滤波",
      "paragraphs": [
        "**1. 时域滤波器（Time Domain）**：当信号携带的有效信息直接编码在**波形的时间形状**上时，就必须使用时域滤波器。它的典型任务包括：**信号平滑（Smoothing）**以压制随机噪声、**去除直流偏置（DC removal）**，以及**波形整形（Waveform shaping）**。此时我们关心的是阶跃边沿是否锐利、过冲是否够小，而不是频谱图好不好看。",
        "**2. 频域滤波器（Frequency Domain）**：当有效信息隐藏在组成信号的各正弦波分量的**幅度、频率和相位**中时，就要使用频域滤波器。它的唯一核心目标是**把一个频段从另一个频段中干净地分离出来**，对应低通、高通、带通和带阻四种基本频率响应。",
        "**3. 定制滤波器（Custom）**：当上面四种基本频响满足不了特殊需求时，就需要定制滤波器。一个极具代表性的应用是 **反卷积（Deconvolution，第17章）**——比如光学镜头失焦或传输信道畸变给信号叠加上了一个不想要的卷积效应，定制滤波器就像“解药”一样，反向抵消这个不需要的卷积过程。"
      ],
      "formula": {
        "expr": "定制反卷积直觉：x[n] * h_unwanted[n] * h_custom[n] ≈ x[n]",
        "explain": "x[n] 是原始纯净信号，h_unwanted[n] 是系统引入的讨厌畸变，定制滤波器 h_custom[n] 的目标就是把畸变抵消掉，还原出接近原始的波形。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：时域平滑 vs 频域选频——波形、频谱与真实听感对比",
      "instruction": "点击“▶ 播放对比音频”，先听原始含噪信号（低频主音 + 1650Hz 刺耳干扰 + 沙沙白噪声），再切换“频域陡峭滤波”开关并拖动强度滑块，观察左图时域波形与右图频域频谱的截然不同。",
      "controls": [
        {
          "type": "slider",
          "id": "strength",
          "label": "滤波强度 / 平滑尺度",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 5,
          "unit": " 档"
        },
        {
          "type": "toggle",
          "id": "freqMode",
          "label": "切换为频域陡峭滤波（关=时域移动平均 / 开=频域低通）",
          "value": false
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "直通原始含噪信号（对比原声）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "(function(){const ctx=lab.ctx;const W=lab.width;const H=lab.height;const N=128;const raw=new Float32Array(N);let seed=1337;function rand(){seed=(seed*16807)%2147483647;return(seed/2147483647)*2-1;}for(let i=0;i<N;i++){const base=(i>=24&&i<88)?0.55:-0.35;const hfTone=0.24*Math.sin(2*Math.PI*22*i/N);const noise=0.20*rand();raw[i]=base+hfTone+noise;}function applyMA(sig,M){const out=new Float32Array(N);const half=Math.floor(M/2);for(let i=0;i<N;i++){let sum=0;let cnt=0;for(let k=-half;k<=half;k++){const idx=i+k;if(idx>=0&&idx<N){sum+=sig[idx];cnt++;}}out[i]=sum/cnt;}return out;}function makeWindowedSinc(M,fc){const h=new Float32Array(M);const mid=(M-1)/2;let sum=0;for(let i=0;i<M;i++){const n=i-mid;const sinc=(n===0)?(2*fc):Math.sin(2*Math.PI*fc*n)/(Math.PI*n);const win=0.54-0.46*Math.cos(2*Math.PI*i/(M-1));h[i]=sinc*win;sum+=h[i];}for(let i=0;i<M;i++)h[i]/=sum;return h;}function applyFIR(sig,h){const out=new Float32Array(N);const M=h.length;const half=Math.floor(M/2);for(let i=0;i<N;i++){let acc=0;for(let k=0;k<M;k++){let idx=i-half+k;if(idx<0)idx=0;if(idx>=N)idx=N-1;acc+=sig[idx]*h[k];}out[i]=acc;}return out;}function computeSpectrum(sig){const bins=N/2;const mag=new Float32Array(bins);for(let k=0;k<bins;k++){let re=0,im=0;for(let n=0;n<N;n++){const ang=2*Math.PI*k*n/N;re+=sig[n]*Math.cos(ang);im-=sig[n]*Math.sin(ang);}mag[k]=Math.sqrt(re*re+im*im)/(N/2);}mag[0]*=0.5;return mag;}function computeKernelMag(h){const bins=N/2;const mag=new Float32Array(bins);for(let k=0;k<bins;k++){const f=k/N;let re=0,im=0;for(let n=0;n<h.length;n++){const ang=2*Math.PI*f*n;re+=h[n]*Math.cos(ang);im-=h[n]*Math.sin(ang);}mag[k]=Math.sqrt(re*re+im*im);}return mag;}let ac=null;let audioStarted=false;let preGain=null;let convNode=null;let masterGain=null;function setupAudio(){ac=lab.getAudioContext();if(!ac)return;if(ac.state==='suspended')ac.resume();if(audioStarted)return;audioStarted=true;preGain=ac.createGain();preGain.gain.value=0.35;masterGain=ac.createGain();masterGain.gain.value=0;masterGain.connect(ac.destination);const oscLow=ac.createOscillator();oscLow.type='triangle';oscLow.frequency.value=220;const gLow=ac.createGain();gLow.gain.value=0.55;oscLow.connect(gLow);gLow.connect(preGain);oscLow.start();const oscHigh=ac.createOscillator();oscHigh.type='sine';oscHigh.frequency.value=1650;const gHigh=ac.createGain();gHigh.gain.value=0.25;oscHigh.connect(gHigh);gHigh.connect(preGain);oscHigh.start();const bufLen=ac.sampleRate*2;const nBuf=ac.createBuffer(1,bufLen,ac.sampleRate);const nData=nBuf.getChannelData(0);for(let i=0;i<bufLen;i++)nData[i]=Math.random()*2-1;const nSrc=ac.createBufferSource();nSrc.buffer=nBuf;nSrc.loop=true;const gNoise=ac.createGain();gNoise.gain.value=0.22;nSrc.connect(gNoise);gNoise.connect(preGain);nSrc.start();}function updateAudioRouting(strength,freqMode,bypass,playing){if(!playing){if(masterGain&&ac){masterGain.gain.setTargetAtTime(0,ac.currentTime,0.02);}return;}setupAudio();if(!ac||!preGain||!masterGain)return;if(ac.state==='suspended')ac.resume();try{preGain.disconnect();}catch(e){}if(convNode){try{convNode.disconnect();}catch(e){}convNode=null;}if(bypass){preGain.connect(masterGain);}else{convNode=ac.createConvolver();convNode.normalize=false;const sr=ac.sampleRate;if(!freqMode){const M=Math.max(3,Math.round(strength*6));const buf=ac.createBuffer(1,M,sr);const d=buf.getChannelData(0);for(let i=0;i<M;i++)d[i]=1/M;convNode.buffer=buf;}else{const M=129;const fcHz=2600-strength*215;const fc=Math.max(0.005,Math.min(0.45,fcHz/sr));const h=makeWindowedSinc(M,fc);const buf=ac.createBuffer(1,M,sr);const d=buf.getChannelData(0);for(let i=0;i<M;i++)d[i]=h[i];convNode.buffer=buf;}preGain.connect(convNode);convNode.connect(masterGain);}masterGain.gain.setTargetAtTime(0.8,ac.currentTime,0.03);}function draw(){const strength=lab.values.strength;const freqMode=lab.values.freqMode;const bypass=lab.values.bypass;const playing=lab.values.play;updateAudioRouting(strength,freqMode,bypass,playing);ctx.clearRect(0,0,W,H);ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);const p1={x:18,y:28,w:332,h:194};const p2={x:370,y:28,w:332,h:194};function drawBox(p,title){ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1;ctx.strokeRect(p.x,p.y,p.w,p.h);ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.beginPath();for(let i=1;i<4;i++){const yy=p.y+(p.h*i)/4;ctx.moveTo(p.x,yy);ctx.lineTo(p.x+p.w,yy);const xx=p.x+(p.w*i)/4;ctx.moveTo(xx,p.y);ctx.lineTo(xx,p.y+p.h);}ctx.stroke();ctx.fillStyle='#f8fafc';ctx.font='bold 12px sans-serif';ctx.fillText(title,p.x,p.y-8);}drawBox(p1,'时域波形 (Time Domain: 关注脉冲形状与平滑)');drawBox(p2,'频域频谱 (Frequency Domain: 关注频段分离)');const maM=2*strength+1;const fcNorm=Math.max(0.03,0.28-strength*0.023);let filtered=raw;let kernelMag=null;if(!bypass){if(!freqMode){filtered=applyMA(raw,maM);const hMA=new Float32Array(maM);for(let i=0;i<maM;i++)hMA[i]=1/maM;kernelMag=computeKernelMag(hMA);}else{const hSinc=makeWindowedSinc(31,fcNorm);filtered=applyFIR(raw,hSinc);kernelMag=computeKernelMag(hSinc);}}const midY1=p1.y+p1.h*0.52;const scaleY1=p1.h*0.38;ctx.strokeStyle='rgba(248,250,252,0.22)';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<N;i++){const xx=p1.x+(i/(N-1))*p1.w;const yy=midY1-raw[i]*scaleY1;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.stroke();const mainColor=bypass?'#f8fafc':(freqMode?'#38bdf8':'#10b981');ctx.strokeStyle=mainColor;ctx.lineWidth=2.2;ctx.beginPath();for(let i=0;i<N;i++){const xx=p1.x+(i/(N-1))*p1.w;const yy=midY1-filtered[i]*scaleY1;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.stroke();const spec=computeSpectrum(filtered);const bins=spec.length;const baseLineY2=p2.y+p2.h-16;const maxH2=p2.h-32;const barW=p2.w/bins;for(let k=0;k<bins;k++){const amp=Math.min(1,spec[k]*1.6);const bh=amp*maxH2;const xx=p2.x+k*barW;ctx.fillStyle=(k>=19&&k<=25)?'#ec4899':mainColor;ctx.fillRect(xx,baseLineY2-bh,Math.max(1.5,barW-1),bh);}if(!bypass&&kernelMag){ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<bins;k++){const xx=p2.x+(k/(bins-1))*p2.w;const yy=baseLineY2-Math.min(1.05,kernelMag[k])*maxH2;if(k===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.stroke();}ctx.font='11px sans-serif';ctx.fillStyle='#ec4899';ctx.fillText('1650Hz 干扰峰',p2.x+(22/bins)*p2.w-30,p2.y+16);if(!bypass){ctx.fillStyle='#f59e0b';ctx.fillText('— |H(f)| 响应包络',p2.x+p2.w-110,p2.y+16);}if(bypass){lab.setReadout('当前：直通原始含噪信号（220Hz目标 + 1650Hz高频干扰 + 宽带白噪声）');}else if(!freqMode){lab.setReadout('当前：时域移动平均滤波（M='+maM+' 点）｜噪声平滑但高频旁瓣仍有泄露，脉冲边沿变缓');}else{lab.setReadout('当前：频域窗函数 Sinc 低通（fc='+fcNorm.toFixed(2)+'）｜高频干扰被彻底截断，但脉冲边沿出现轻微振铃');}}lab.onUpdate(draw);})();"
    },
    {
      "type": "concept",
      "heading": "第二维：按“实现方式”分类——卷积（FIR）与递归（IIR）的对决",
      "paragraphs": [
        "数字滤波器在代码里只有两种实现手段：**卷积（Convolution）** 与 **递归（Recursion）**。它们是一对竞争关系（Rival techniques，第21章将做正面对决），实际工程中你必须为特定场景二选一。",
        "**1. 卷积实现 / 有限冲激响应（FIR, Finite Impulse Response）**：输出完全由当前及过去有限个输入样本与滤波器核 `h[k]` 乘加得到。因为冲激响应在经过有限个点后就会彻底归零，所以称为“有限冲激响应”。它的优势是**滤波性能远优于递归滤波器**（可以做出极其陡峭的截止或线性相位），但缺点是**计算速度慢得多**（需要上百甚至上千次乘加）。为此，第18章专门介绍了 **FFT 卷积** 算法来大幅加速 FIR 的执行。",
        "**2. 递归实现 / 无限冲激响应（IIR, Infinite Impulse Response）**：输出不仅取决于输入样本，还直接把**之前算出的历史输出 `y[n-1]` 反馈回来**参与当前计算。正因为有反馈循环，即使输入只是一个单点脉冲，输出也会像敲响的钟一样拖着尾巴无限衰减下去，因此叫“无限冲激响应”。其中最基础的时域递归是单极点滤波器（Ch.19），频域代表是切比雪夫滤波器（Ch.20）；而想要用递归实现复杂定制响应，则需依赖**迭代设计技术**（Ch.26，与神经网络同属迭代优化过程）。"
      ],
      "formula": {
        "expr": "FIR: y[n] = Σ h[k]·x[n-k]   vs   IIR: y[n] = a₀x[n] + b₁y[n-1] + ...",
        "explain": "FIR 只对有限个历史输入 x 加权求和，算力开销随核长度线性增长；IIR 引入了历史输出 y[n-1] 的递归反馈，只需极少乘加即可产生无限长的等效冲激响应。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：FIR（有限冲激响应）与 IIR（无限冲激响应）的本质与算力博弈",
      "instruction": "拖动“FIR 卷积核长度”与“IIR 递归反馈系数 d”，观察左图有限截断与右图无限拖尾的差异，并对比底部单样本乘加（MACs）算力开销柱状条。",
      "controls": [
        {
          "type": "slider",
          "id": "firTaps",
          "label": "FIR 卷积核长度 (Taps)",
          "min": 5,
          "max": 61,
          "step": 4,
          "value": 21,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "iirDecay",
          "label": "IIR 递归反馈系数 d",
          "min": 0.5,
          "max": 0.96,
          "step": 0.02,
          "value": 0.85,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showStep",
          "label": "输入切换：关=单位冲激 δ[n] / 开=阶跃信号 u[n]",
          "value": false
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "动态扫描逐点计算过程",
          "value": true
        }
      ],
      "jsCode": "(function(){const ctx=lab.ctx;const W=lab.width;const H=lab.height;const N=64;let scanPos=0;let accumTime=0;function computeResponses(firTaps,d,isStep){const fir=new Float32Array(N);const iir=new Float32Array(N);const x=new Float32Array(N);for(let n=0;n<N;n++){x[n]=isStep?(n>=4?1:0):(n===4?1:0);}const h=new Float32Array(firTaps);let hSum=0;for(let k=0;k<firTaps;k++){h[k]=0.5-0.5*Math.cos(2*Math.PI*(k+1)/(firTaps+1));hSum+=h[k];}for(let k=0;k<firTaps;k++)h[k]/=hSum;for(let n=0;n<N;n++){let acc=0;for(let k=0;k<firTaps;k++){if(n-k>=0)acc+=h[k]*x[n-k];}fir[n]=acc;}for(let n=0;n<N;n++){const prev=n>0?iir[n-1]:0;iir[n]=(1-d)*x[n]+d*prev;}if(!isStep){let maxF=0,maxI=0;for(let n=0;n<N;n++){if(fir[n]>maxF)maxF=fir[n];if(iir[n]>maxI)maxI=iir[n];}if(maxF>0)for(let n=0;n<N;n++)fir[n]/=maxF;if(maxI>0)for(let n=0;n<N;n++)iir[n]/=maxI;}return{fir,iir};}function draw(){const firTaps=lab.values.firTaps;const d=lab.values.iirDecay;const isStep=lab.values.showStep;const animate=lab.values.animate;const{fir,iir}=computeResponses(firTaps,d,isStep);ctx.clearRect(0,0,W,H);ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);const p1={x:18,y:28,w:332,h:156};const p2={x:370,y:28,w:332,h:156};function drawStems(p,data,color,title,cutoffIdx){ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1;ctx.strokeRect(p.x,p.y,p.w,p.h);ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.beginPath();for(let i=1;i<4;i++){const yy=p.y+(p.h*i)/4;ctx.moveTo(p.x,yy);ctx.lineTo(p.x+p.w,yy);}ctx.stroke();ctx.fillStyle='#f8fafc';ctx.font='bold 12px sans-serif';ctx.fillText(title,p.x,p.y-8);const baseY=p.y+p.h-14;const maxH=p.h-28;const stepX=p.w/N;if(animate){if(cutoffIdx!==null){const wStart=Math.max(0,scanPos-firTaps+1);const wx1=p.x+wStart*stepX;const wx2=p.x+(scanPos+1)*stepX;ctx.fillStyle='rgba(16,185,129,0.12)';ctx.fillRect(wx1,p.y+1,wx2-wx1,p.h-2);}else if(scanPos>0){const xPrev=p.x+(scanPos-0.5)*stepX;const xCurr=p.x+(scanPos+0.5)*stepX;ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc((xPrev+xCurr)/2,p.y+18,8,Math.PI,0);ctx.stroke();ctx.fillStyle='#f59e0b';ctx.font='10px sans-serif';ctx.fillText('y[n-1]反馈',Math.min(p.x+p.w-58,xCurr-10),p.y+14);}}if(cutoffIdx!==null&&cutoffIdx<N){const cx=p.x+cutoffIdx*stepX;ctx.strokeStyle='rgba(236,72,153,0.7)';ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(cx,p.y+4);ctx.lineTo(cx,p.y+p.h-4);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ec4899';ctx.font='10px sans-serif';ctx.fillText('截断归零',Math.min(p.x+p.w-46,cx+4),p.y+15);}for(let n=0;n<N;n++){const xx=p.x+(n+0.5)*stepX;const val=Math.min(1,Math.max(0,data[n]));const yy=baseY-val*maxH;const isScan=animate&&n===scanPos;ctx.strokeStyle=isScan?'#f59e0b':color;ctx.lineWidth=isScan?2.2:1.5;ctx.beginPath();ctx.moveTo(xx,baseY);ctx.lineTo(xx,yy);ctx.stroke();ctx.fillStyle=isScan?'#f59e0b':color;ctx.beginPath();ctx.arc(xx,yy,isScan?3:2,0,Math.PI*2);ctx.fill();}}const cutoffIdx=isStep?null:Math.min(N,4+firTaps);drawStems(p1,fir,'#10b981','FIR 卷积实现 (有限冲激响应: '+firTaps+' 点)',cutoffIdx);drawStems(p2,iir,'#38bdf8','IIR 递归实现 (无限冲激响应: d='+d.toFixed(2)+')',null);const barY=196;ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fillRect(18,barY,W-36,34);ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.strokeRect(18,barY,W-36,34);ctx.fillStyle='#f8fafc';ctx.font='11px sans-serif';ctx.fillText('单样本算力开销 (MACs/样本):',26,barY+21);const maxBarW=220;const firW=(firTaps/61)*maxBarW;const iirW=Math.max(8,(2/61)*maxBarW);ctx.fillStyle='#10b981';ctx.fillRect(200,barY+7,firW,8);ctx.fillText('FIR = '+firTaps+' 次乘加 (随长度线性变慢)',206+firW,barY+15);ctx.fillStyle='#38bdf8';ctx.fillRect(200,barY+20,iirW,8);ctx.fillText('IIR = 2 次乘加 (恒定极速)',206+iirW,barY+28);const modeTxt=isStep?'阶跃响应':'冲激响应';lab.setReadout('当前对比 ['+modeTxt+']：FIR 需 '+firTaps+' 次乘加但有限长度严格可控；IIR 仅需 2 次乘加但靠反馈无限拖尾');}lab.onUpdate(draw);lab.onLoop(function(dt){if(!lab.values.animate)return;accumTime+=dt;if(accumTime>=0.09){accumTime=0;scanPos=(scanPos+1)%N;draw();}});})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "先问“用途”再选“算法”：信息在波形形状（如心电图脉冲、阶跃信号）选时域滤波（平滑/去直流）；信息在正弦频率里（如音频分频、通信载波）选频域滤波；要消除已知的信道或光学模糊，用反卷积定制滤波。",
        "避坑常见误区：千万不要拿时域的移动平均去当严苛的频域低通滤波器——它的频域旁瓣很高，高频干扰会顺着旁瓣漏进来；反过来，陡峭的频域滤波器用在阶跃信号上会产生振铃效应。",
        "FIR 与 IIR 的工程取舍：算力充裕且追求极致性能/线性相位时首选卷积（FIR），核太长就上第18章的 FFT 卷积加速；单片机资源吃紧、只求高速实时响应时，用递归（IIR）以极少乘加完成任务。",
        "如果既想用递归实现任意定制频响，手工凑极点会非常痛苦，第26章将通过迭代设计（与神经网络同源的优化思想）来解决这一难题。"
      ]
    }
  ]
});
