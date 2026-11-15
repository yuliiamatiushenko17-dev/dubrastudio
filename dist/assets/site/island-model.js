(() => {
  const canvas = document.querySelector('#island-model');
  const ctx = canvas.getContext('2d');
  const faces = [];
  const face = (points, color) => faces.push({points, color});
  const box = (x, y, z, w, h, d, colors) => {
    const a=[x,y,z], b=[x+w,y,z], c=[x+w,y,z+d], e=[x,y,z+d];
    const f=[x,y+h,z], g=[x+w,y+h,z], j=[x+w,y+h,z+d], k=[x,y+h,z+d];
    [[a,b,g,f],[b,c,j,g],[c,e,k,j],[e,a,f,k],[f,g,j,k],[a,e,c,b]].forEach((p,i)=>face(p,colors[i]||colors[0]));
  };
  const wood=['#46342b','#372921','#594337','#523c31','#655044','#342820'];
  const stone=['#d8d1c6','#bbb2a5','#dfd7cc','#e4ddd2','#eee9df','#c6bdb1'];
  box(-1.23,0,-.49,2.43,.88,.98,wood);
  box(-1.47,.88,-.62,2.94,.065,1.24,stone);

  // The folded stone end and the diagonal crease continue around the front.
  const upperLeft=[-1.47,.88,.62], upperRight=[-.12,.88,.62];
  const foot=[-1.17,.025,.48], lowerRight=[-.12,.025,.52];
  const crease=[-.82,.39,.64];
  face([upperLeft,upperRight,crease,foot],'#e5ded2');
  face([upperRight,lowerRight,foot,crease],'#cfc6b8');
  face([upperLeft,foot,[-1.17,.025,-.49],[-1.47,.88,-.62]],'#d8d0c4');
  for(let i=0;i<3;i++) box(-.095,.075+i*.258,.492,.52,.234,.025,wood);
  for(let i=0;i<35;i++) box(.455+i*.021,.06,.492,.011,.80,.016,['#644b3b','#49372d','#564034']);
  box(-.79,.945,-.15,.61,.005,.34,['#494743']);
  box(-.78,.951,-.14,.59,.004,.32,['#2f302d']);

  // The brass tap is a tube built along a curved centreline.
  const tap = [];
  for(let i=0;i<=18;i++){
    const t=i*Math.PI/18;
    tap.push([-.52+.103*Math.cos(t),1.14+.12*Math.sin(t),-.21]);
  }
  tap.unshift([-.417,.946,-.21]);
  tap.push([-.623,1.095,-.21]);
  for(let i=0;i<tap.length-1;i++){
    const a=tap[i], b=tap[i+1], dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy);
    const ring=(p,t)=>[p[0]-.016*dy/len*Math.cos(t),p[1]+.016*dx/len*Math.cos(t),p[2]+.016*Math.sin(t)];
    for(let n=0;n<12;n++){
      const u=n*Math.PI/6,v=(n+1)*Math.PI/6;
      face([ring(a,u),ring(a,v),ring(b,v),ring(b,u)],['#997645','#b38c54','#d2ac72','#78603d'][n%4]);
    }
  }
  let yaw=-.36, pitch=.25;
  let drag=null;
  const project = (p, scale, cx, cy) => {
    const [x,y,z]=p, u=x*Math.cos(yaw)-z*Math.sin(yaw), v=x*Math.sin(yaw)+z*Math.cos(yaw);
    const depth=v*Math.cos(pitch)+(y-.56)*Math.sin(pitch);
    const ratio=5.5/(5.5-depth);
    return [cx+u*scale*ratio,cy-((y-.56)*Math.cos(pitch)-v*Math.sin(pitch))*scale*ratio,depth];
  };
  function draw(){
    const {width,height}=canvas.getBoundingClientRect();
    if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx=width/2,cy=height*.49,scale=Math.min(width/3.55,height/1.9);
    const shadow=project([0,0,0],scale,cx,cy);
    ctx.save();ctx.translate(shadow[0],shadow[1]+12);ctx.scale(scale*1.65,scale*.22);
    const shade=ctx.createRadialGradient(0,0,0,0,0,1);
    shade.addColorStop(0,'rgba(43,34,25,.25)');shade.addColorStop(1,'rgba(43,34,25,0)');
    ctx.fillStyle=shade;ctx.fillRect(-1,-1,2,2);ctx.restore();
    const projected=faces.map(({points,color})=>{
      const vertices=points.map(p=>project(p,scale,cx,cy));
      return {vertices,color,depth:vertices.reduce((sum,p)=>sum+p[2],0)/vertices.length};
    }).sort((a,b)=>a.depth-b.depth);
    for(const {vertices,color} of projected){
      ctx.beginPath();vertices.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
      ctx.fillStyle=color;ctx.fill();
      ctx.strokeStyle=color;ctx.lineWidth=.65;ctx.stroke();
    }
  }
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    yaw+=(e.clientX-drag.x)*.009;
    pitch=Math.max(.08,Math.min(.65,pitch+(e.clientY-drag.y)*.006));
    drag={x:e.clientX,y:e.clientY};draw();
  });
  canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')yaw-=.1;
    else if(e.key==='ArrowRight')yaw+=.1;
    else if(e.key==='ArrowUp')pitch=Math.min(.65,pitch+.06);
    else if(e.key==='ArrowDown')pitch=Math.max(.08,pitch-.06);
    else return;
    e.preventDefault();draw();
  });
  new ResizeObserver(draw).observe(canvas);
  draw();
})();
