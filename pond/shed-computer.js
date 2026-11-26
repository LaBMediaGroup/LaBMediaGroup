// Battery-powered field laptop, based on the 0.305 × 0.2065 m Lenovo X220i.
// Local +Z is the front of the keyboard and points into the open side of the shed.
export function shedComputer(T, std) {
  const group=new T.Group(); group.name='Shed journal computer';
  const shell=std(0x292b29,.78), trim=std(0x444845,.65), alloy=std(0x93948c,.45,.65);
  const block=(name,w,h,d,x,y,z,material,parent=group)=>{
    const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);
    m.name=name; m.position.set(x,y,z); parent.add(m); return m;
  };
  block('Base',.305,.019,.2065,0,.0095,0,shell);
  for(const x of [-.119,.119]) block('Hinge',.025,.013,.015,x,.021,-.092,alloy);
  const lid=new T.Group(); lid.name='Display hinge';lid.position.set(0,.024,-.092);lid.rotation.x=-.16;group.add(lid);
  block('Back and bezel',.303,.182,.008,0,.091,0,shell,lid);
  const screen=document.createElement('canvas');screen.width=640;screen.height=360;
  const pen=screen.getContext('2d');
  pen.fillStyle='#1d302d';pen.fillRect(0,0,640,360);pen.fillStyle='#d3dfc7';pen.font='32px monospace';pen.fillText('Field search',36,97);
  pen.strokeStyle='#8baf98';pen.lineWidth=2;pen.strokeRect(36,132,568,54);pen.fillRect(49,146,2,25);
  const tex=new T.CanvasTexture(screen);tex.colorSpace=T.SRGBColorSpace;
  const panel=new T.Mesh(new T.PlaneGeometry(.277,.156),std(0xffffff,.7,0,{map:tex,emissive:0x666666,emissiveMap:tex}));
  panel.position.set(0,.09,.0042);lid.add(panel);
  block('Camera',.006,.004,.001,0,.176,.0042,trim,lid);
  // Key legends and the touchpad share a single deck texture to keep this small prop inexpensive.
  const keys=document.createElement('canvas');keys.width=960;keys.height=624;
  const k=keys.getContext('2d');k.fillStyle='#353936';k.fillRect(0,0,960,624);
  const rows=['Esc F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 Del','1 2 3 4 5 6 7 8 9 0 - + Back','Tab Q W E R T Y U I O P [ ]','Caps A S D F G H J K L ; Enter','Shift Z X C V B N M , . / Shift','Ctrl Fn Alt Space Alt Ctrl ← ↑ →'];
  rows.forEach((row,i)=>{
    let x=25;
    const labels=row.split(' '),weights=labels.map(l=>l==='Space'?5:l.length>3?1.6:1);
    const unit=910/weights.reduce((a,b)=>a+b);
    labels.forEach((l,j)=>{
      const w=unit*weights[j]-4,y=42+i*55;
      k.fillStyle='#111614';k.fillRect(x,y,w,50);k.fillStyle='#424644';k.fillRect(x+2,y+1,w-4,44);
      k.fillStyle='#dfe3dc';k.font='15px sans-serif';k.fillText(l,x+7,y+21);x+=w+4;
    });
  });
  k.fillStyle='#a7433c';k.beginPath();k.arc(481,256,11,0,2*Math.PI);k.fill();
  k.fillStyle='#191d1b';k.fillRect(339,385,265,172);k.fillStyle='#535752';k.fillRect(344,421,255,131);
  k.fillStyle='#a14a41';k.fillRect(345,391,86,5);k.fillRect(507,391,87,5);
  k.fillStyle='#92af76';k.fillRect(827,17,9,4);
  const top=new T.CanvasTexture(keys);top.colorSpace=T.SRGBColorSpace;
  const deck=new T.Mesh(new T.PlaneGeometry(.298,.201),std(0xffffff,.78,0,{map:top}));
  deck.rotation.x=-Math.PI/2;deck.position.y=.0191;group.add(deck);
  return group;
}
