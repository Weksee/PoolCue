/* Мини-игры Pool&Cue: бильярд на canvas, магический шар, измеритель силы удара */
function initPool(cv,cb){
const W=900,H=450,M=38,R=11,PT=28;cv.width=W;cv.height=H;const g=cv.getContext('2d');
const P=[[M-4,M-4],[W/2,M-10],[W-M+4,M-4],[M-4,H-M+4],[W/2,H-M+10],[W-M+4,H-M+4]];
const cols=['#d33a2f','#e8a21c','#2b6fd1','#8a3fd1','#e0661c','#1f9e5a','#8b1a1a','#d9d9d9','#d1388f','#20a7b5'];
let balls,shots,score,aim=null,respawnAt=0,won=false;
const left=()=>balls.filter(b=>!b.cue&&!b.out).length,moving=()=>balls.some(b=>!b.out&&(b.vx||b.vy));
function upd(){cb.onUpdate(score,shots,left())}
function rack(){balls=[{x:W*.25,y:H/2,vx:0,vy:0,c:'#fff',cue:1}];let k=0;for(let r=0;r<4;r++)for(let i=0;i<=r;i++)balls.push({x:W*.68+r*R*1.8,y:H/2+(i-r/2)*R*2.05,vx:0,vy:0,c:cols[k++]});shots=0;score=0;won=false;upd()}
function step(){for(let s=0;s<4;s++){
 for(const b of balls){if(b.out)continue;b.x+=b.vx/4;b.y+=b.vy/4;
  if(b.x<M+R){b.x=M+R;b.vx=Math.abs(b.vx)*.9}if(b.x>W-M-R){b.x=W-M-R;b.vx=-Math.abs(b.vx)*.9}
  if(b.y<M+R){b.y=M+R;b.vy=Math.abs(b.vy)*.9}if(b.y>H-M-R){b.y=H-M-R;b.vy=-Math.abs(b.vy)*.9}
  for(const p of P)if(Math.hypot(b.x-p[0],b.y-p[1])<PT){b.out=true;b.vx=b.vy=0;if(!b.cue){score++;upd()}else cb.onScratch()}}
 for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];if(a.out||b.out)continue;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<2*R&&d>0){const nx=dx/d,ny=dy/d,o=(2*R-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
   const p=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(p>0){a.vx-=p*nx;a.vy-=p*ny;b.vx+=p*nx;b.vy+=p*ny}}}}
 for(const b of balls){b.vx*=.988;b.vy*=.988;if(Math.hypot(b.vx,b.vy)<.07)b.vx=b.vy=0}}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
cv.addEventListener('pointerdown',e=>{if(moving()||balls[0].out)return;aim=pos(e);cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(aim)aim=pos(e)});
cv.addEventListener('pointerup',()=>{if(!aim)return;const c=balls[0],dx=c.x-aim.x,dy=c.y-aim.y,d=Math.hypot(dx,dy);aim=null;if(d<14)return;
 const sp=4+Math.min(d,180)/180*26;c.vx=dx/d*sp;c.vy=dy/d*sp;shots++;upd()});
cv.addEventListener('pointercancel',()=>aim=null);
function ball(b){g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=8;g.shadowOffsetY=4;const gr=g.createRadialGradient(b.x-4,b.y-4,1,b.x,b.y,R);gr.addColorStop(0,'#fff');gr.addColorStop(.25,b.c);gr.addColorStop(1,'#000');g.fillStyle=b.cue?'#f6f1e4':gr;g.beginPath();g.arc(b.x,b.y,R,0,7);g.fill();g.restore();
 if(b.cue){g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.arc(b.x+3,b.y+3,R-3,0,7);g.fill()}}
function draw(){
 let w=g.createLinearGradient(0,0,0,H);w.addColorStop(0,'#8a4a2a');w.addColorStop(.5,'#5d2f19');w.addColorStop(1,'#3a1c0d');g.fillStyle=w;g.beginPath();g.roundRect(0,0,W,H,26);g.fill();
 g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(let y=4;y<H;y+=7){g.beginPath();g.moveTo(0,y);g.lineTo(W,y+2);g.stroke()}
 g.fillStyle='#d3a54a';for(let i=1;i<8;i++){if(i===4)continue;const x=M+(W-2*M)*i/8;for(const y of[M/2,H-M/2]){g.beginPath();g.arc(x,y,3.5,0,7);g.fill()}}
 for(let i=1;i<4;i++)for(const x of[M/2,W-M/2]){g.beginPath();g.arc(x,M+(H-2*M)*i/4,3.5,0,7);g.fill()}
 const f=g.createRadialGradient(W/2,H/2,40,W/2,H/2,W/2);f.addColorStop(0,'#2f8a66');f.addColorStop(1,'#14503a');g.fillStyle=f;g.fillRect(M,M,W-2*M,H-2*M);
 g.strokeStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(W*.25+30,M);g.lineTo(W*.25+30,H-M);g.stroke();
 for(const p of P){g.fillStyle='#050302';g.beginPath();g.arc(p[0],p[1],21,0,7);g.fill()}
 balls.forEach(b=>{if(!b.out)ball(b)});
 const c=balls[0];if(aim&&!c.out){const dx=aim.x-c.x,dy=aim.y-c.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,pw=Math.min(d,180)/180;
  let t=0,hx=c.x,hy=c.y;for(t=0;t<800;t+=3){hx=c.x-ux*t;hy=c.y-uy*t;if(hx<M+R||hx>W-M-R||hy<M+R||hy>H-M-R)break;if(balls.some(b=>!b.cue&&!b.out&&Math.hypot(b.x-hx,b.y-hy)<2*R))break}
  g.setLineDash([6,7]);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.beginPath();g.moveTo(c.x,c.y);g.lineTo(hx,hy);g.stroke();g.setLineDash([]);g.beginPath();g.arc(hx,hy,R,0,7);g.stroke();
  const s=R+6+pw*40,e=s+330;const sg=g.createLinearGradient(c.x+ux*s,c.y+uy*s,c.x+ux*e,c.y+uy*e);sg.addColorStop(0,'#f0cf86');sg.addColorStop(.12,'#e8d3a8');sg.addColorStop(.14,'#7a4a24');sg.addColorStop(1,'#2a160a');
  g.strokeStyle=sg;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(c.x+ux*s,c.y+uy*s);g.lineTo(c.x+ux*e,c.y+uy*e);g.stroke();
  g.fillStyle='#fbf1dc';g.font='700 15px system-ui,sans-serif';g.fillText('Сила '+Math.round(pw*100)+'%',c.x+ux*(s+30)+10,c.y+uy*(s+30)-12)}}
function loop(){if(moving())step();
 if(balls[0].out&&!moving()){if(!respawnAt)respawnAt=performance.now()+900;else if(performance.now()>respawnAt){Object.assign(balls[0],{x:W*.25,y:H/2,vx:0,vy:0,out:false});respawnAt=0}}
 if(!won&&left()===0&&!moving()){won=true;cb.onWin(shots)}
 draw();requestAnimationFrame(loop)}
rack();loop();return{reset:rack}}
