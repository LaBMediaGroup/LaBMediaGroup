// One leaf of the three-staple Field Notes Original Kraft spread, in metres.
// The open-spread photograph shows bowed graph paper, rounded corners and a
// stationary stitched fold. The turn duration and corner lead are art-directed.
// Product: https://fieldnotesbrand.com/products/original-kraft
// Spread: https://pulpaddiction.com.au/products/field-notes-original-graph-notebooks-set-3
// Local X follows the page width and the points at X=0 stay on the fold.
const halfWidth=.0886, depth=.1396, radius=.0095, duration=.62;
const xs=26, rows=[0,.012,.034,.067,.14,.25,.38,.50,.62,.75,.86,.933,.966,.988,1];
const height=x=>.0035+.006*(.11+.87*Math.pow(Math.sin(Math.PI*Math.min(1,Math.abs(x)/.09)),1.4));

export function createNotebookTurn(T,frame,base,ink,makeCanvas,paint) {
  const previous=makeCanvas(ink.ctx.canvas.width,ink.ctx.canvas.height);
  const old={value:previous.texture},direction={value:0},phase={value:0};
  const material=base.material, fragment=material.fragmentShader;
  const uniforms='uniform sampler2D oldInk;uniform float turnDir,turnPhase;';
  Object.assign(material.uniforms,{oldInk:old,turnDir:direction,turnPhase:phase});
  const sample='vec3 base=texture2D(ink,tc).rgb;';
  material.fragmentShader=uniforms+fragment.replace(sample,`
    float side=(tc.x-.5)*turnDir;
    vec3 base=side<0.?texture2D(oldInk,tc).rgb:texture2D(ink,tc).rgb;
    // Narrow shadow under the lifted paper, falling toward the desk.
    float rise=sin(3.14159*turnPhase);
    float edge=.5*cos(3.14159*turnPhase)-.17*rise+.045*rise*(tc.y-.5);
    float shadow=smoothstep(edge-.07-rise*.05,edge,side)*(1.-smoothstep(edge,edge+.12,side));
    base*=1.-.23*shadow*rise*abs(turnDir);`);
  const leafMat=material.clone();
  // Keep the scene's light uniforms live. Only the two textures and the motion
  // uniforms are specific to the notebook.
  leafMat.uniforms=material.uniforms;
  leafMat.fragmentShader=uniforms+fragment.replace(sample,`
    bool recto=(turnDir>0.)==gl_FrontFacing;
    float side=recto?turnDir:-turnDir;
    vec2 pageUV=vec2(.5+.5*tc.x*side,tc.y);
    vec3 base=recto?texture2D(oldInk,pageUV).rgb:texture2D(ink,pageUV).rgb;
    base*=.97+.03*abs(dot(normalize(n),vec3(0.,1.,0.)));`)
    .replace('indoor(p,normalize(n))','indoor(p,normalize(gl_FrontFacing?n:-n))');
  const positions=new Float32Array((xs+1)*rows.length*3),uv=[],indices=[];
  for(let j=0;j<rows.length;j++)for(let i=0;i<=xs;i++){
    uv.push(i/xs,rows[j]);
    if(j&&i){const k=j*(xs+1)+i;indices.push(k-xs-2,k-xs-1,k-1,k-xs-1,k,k-1);}
  }
  const geometry=new T.BufferGeometry();
  const vertices=new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('position',vertices);geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setIndex(indices);
  const sheet=new T.Mesh(geometry,leafMat);sheet.name='Bound resource leaf, printed on both faces';
  sheet.visible=false;sheet.frustumCulled=false;frame.add(sheet);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let rest=null,turn=null,pending=null;
  function bend(physical,sign) {
    const p=physical*physical*(3-2*physical),swell=Math.sin(Math.PI*p);
    phase.value=p;
    for(let j=0;j<rows.length;j++){
      const v=rows[j],z=(.5-v)*depth;
      const d=Math.max(0,Math.abs(z)-(depth/2-radius));
      const width=halfWidth-radius+Math.sqrt(Math.max(0,radius*radius-d*d));
      let x=0,y=height(0)+.00019;
      for(let i=0;i<=xs;i++){
        if(i){
          const u=(i-.5)/xs;
          // Integrate the local tangent in equal paper-length segments. One
          // outer corner leads; the spine and page length stay fixed.
          const dx=width/xs,dh=height(i*dx)-height((i-1)*dx);
          const length=Math.hypot(dx,dh);
          const angle=Math.PI*p+swell*(-.52+1.06*u+.54*(.5-v)*u)
            +(1.-2.*p)*Math.atan2(dh,dx);
          x+=Math.cos(angle)*length; y+=Math.sin(angle)*length;
        }
        vertices.setXYZ(j*(xs+1)+i,sign*x,y,z);
      }
    }
    vertices.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
  }
  function show(content) {
    paint(ink.ctx,...content.values);ink.texture.needsUpdate=true;
  }
  function begin(content,dir,now) {
    previous.ctx.drawImage(ink.ctx.canvas,0,0);previous.texture.needsUpdate=true;
    turn={from:rest,to:content,p:0,speed:1,now};direction.value=dir;
    show(content);sheet.visible=true;bend(0,dir);
  }
  function settle(content) {
    turn=pending=null;rest=content;sheet.visible=false;direction.value=phase.value=0;
    show(content);
  }
  function set(title,category='',detail='',dir=0,now=0) {
    const values=[title,category,detail],content={values,key:JSON.stringify(values)};
    if(!dir||!rest||motion.matches) {
      if(!turn&&rest?.key===content.key)return;
      settle(content);return;
    }
    dir=Math.sign(dir);
    if(!turn){if(rest.key!==content.key)begin(content,dir,now);return;}
    if(content.key===turn.from.key||content.key===turn.to.key){
      pending=null;turn.speed=content.key===turn.from.key?-1:1;
    } else pending={content,dir};
  }
  function update(now){
    if(!turn)return;
    if(motion.matches){settle(pending?.content??(turn.speed>0?turn.to:turn.from));return;}
    turn.p+=turn.speed*Math.max(0,now-turn.now)/duration;turn.now=now;
    if(turn.p>0 && turn.p<1){bend(turn.p,direction.value);return;}
    if(turn.speed>0 && turn.p<1)return;
    const next=pending,completed=turn.speed>0?turn.to:turn.from;
    if(turn.speed<0)show(completed);
    rest=completed;turn=pending=null;sheet.visible=false;direction.value=phase.value=0;
    if(next && next.content.key!==rest.key)begin(next.content,next.dir,now);
  }
  function anchors(){
    return [[-.085,-.065],[.085,-.065],[.085,.065],[-.085,.065]]
      .map(([x,z])=>frame.localToWorld(new T.Vector3(x,height(x)+.0003,z)));
  }
  function hit(point){return frame.worldToLocal(point.clone()).x<0?'book:prev':'book:next';}
  return {set,update,anchors,hit,sheet};
}
