// Seven Cycles poses keep the pin stationary while the lower corner peels away.
const boardRender = (() => {
  const canvas=document.querySelector('#poster canvas'),ctx=canvas.getContext('2d');
  const cache=new Map();
  let pose=0,elevation=selectedElevation();
  function draw(){
    const weights=roomLight(elevation);
    let total=0;
    for(const [name,weight] of Object.entries(weights)){
      if(weight<=0)continue;
      const file='light/board-'+(name==='turn'?'day':name)+'-'+pose+'.webp';
      if(!cache.has(file)){
        const image=new Image();cache.set(file,image);image.onload=draw;image.src=file;
      }
      const image=cache.get(file);if(!image.naturalWidth)continue;
      total+=weight;ctx.globalAlpha=weight/total;ctx.drawImage(image,0,0);
    }
    ctx.globalAlpha=1;
  }
  addEventListener('message',e=>{
    if(e.source===parent && Number.isFinite(e.data?.roomElevation)){elevation=e.data.roomElevation;draw()}
  });
  draw();
  async function roll(reverse=false){
    if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const sequence=reverse?[5,4,3,2,1,0]:[0,1,2,3,4,5,6];
    for(const index of sequence){
      pose=index;draw();
      await Promise.allSettled([...cache.entries()].filter(([url])=>url.endsWith('-'+index+'.webp')).map(([,img])=>img.decode()));
      await new Promise(resolve=>setTimeout(resolve,42));
    }
  }
  return {roll};
})();
