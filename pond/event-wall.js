// Quartet 23 × 35 inch cork board, portrait. Dimensions and mounting notes in field-props.md.
export function buildEventWall({THREE:T,group,placement,box,add,cylinder,uniforms}){
  const cx=.33,cy=1.49,back=-1.1305,face=back+.016;
  const w=.5842,h=.889,lip=.017,iw=w-2*lip,ih=h-2*lip;
  const frame=placement(cx,cy,face),oak=[.64,.46,.30],brass=[.64,.54,.32];
  for(const dy of [-.34,.34]){
    box(.47,cy+dy,back-.0095,.85,.072,.019,oak,0,'x');
    for(const dx of [-.22,.22])cylinder(dx,dy,-.016,.004,.004,.017,brass,1,frame,Math.PI/2);
  }
  box(0,0,-.008,w,h,.016,[.55,.38,.23],5,'x',frame);
  for(const side of [-1,1]){
    box(side*(w-lip)/2,0,.002,lip,h,.020,oak,0,'y',frame);
    box(0,side*(h-lip)/2,.002,iw,lip,.020,oak,0,'x',frame);
  }
  const canvas=document.getElementById('boardPrint'),texture=new T.CanvasTexture(canvas);
  texture.anisotropy=4;canvas.addEventListener('boardprint',()=>{texture.needsUpdate=true;});
  const mat=new T.ShaderMaterial({uniforms:{print:{value:texture},day:uniforms.uDay},
    vertexShader:'varying vec2 v; void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform sampler2D print;uniform float day;varying vec2 v;void main(){vec3 ink=texture2D(print,v).rgb;vec3 toLamp=vec3(1.33,1.98,.54)-vec3(.33+(v.x-.5)*.5502,1.49+(v.y-.5)*.855,-1.1145);float light=.74+.08*day+.53*normalize(toLamp).z/(.52+dot(toLamp,toLamp));gl_FragColor=vec4(ink*vec3(1.,.94,.84)*light,1.);}'});
  function coords(x,y,z){return new T.Vector3(cx+(x/400-.5)*iw,cy+(.5-y/610)*ih,face+z);}
  function printed(x,y,width,height,z,name){
    const geo=new T.PlaneGeometry(iw*width/400,ih*height/610);
    const uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(x+uv.getX(i)*width)/400,1-(y+(1-uv.getY(i))*height)/610);
    const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.position.copy(coords(x+width/2,y+height/2,z));group.add(mesh);
    return mesh;
  }
  printed(0,0,400,610,.0001,'Cork and pinned notices');
  const page=coords(200,221,0);
  box(page.x,page.y,face+.002,.381,.3048,.004,[.86,.83,.74],5);
  printed(61.5,110,277,222,.0042,'Monthly calendar face');
  const notice=coords(200,457.5,0);
  box(notice.x,notice.y,face+.0004,348/400*iw,181/610*ih,.0008,[.82,.72,.52],5);
  printed(26,367,348,181,.0009,'Michigan event handbill');
  function pin(px,py,z){
    const pt=coords(px,py,z);cylinder(pt.x,pt.y,pt.z,.004,.004,.011,[.58,.23,.14],1,undefined,Math.PI/2);
  }
  pin(200,379,.004);pin(42,45,.003);pin(356,45,.003);
  const wire=new T.TorusGeometry(.0038,.0008,5,12);
  for(let i=0;i<18;i++)for(const offset of [0,.0023]){
    const p=coords(68+i*15,111,.004);add(wire,placement(p.x+offset,p.y,p.z,0,Math.PI/2,0),brass,1);
  }
  const hook=coords(200,106,.006);
  add(new T.TorusGeometry(.009,.0011,5,16,Math.PI),placement(hook.x,hook.y,hook.z),brass,1);
  pin(200,100,.005);
  return {
    corners:()=>[[0,0],[400,0],[400,610],[0,610]].map(([x,y])=>group.localToWorld(coords(x,y,.0045))),
    pose(camera){
      const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));
      const distance=Math.max(w/(2*tan*camera.aspect*.88),h/(2*tan*.70));
      const aim=coords(200,305,.004);
      const eye=aim.clone();eye.z+=distance;
      aim.y+=.043;eye.y+=.055;
      return {eye:group.localToWorld(eye),aim:group.localToWorld(aim)};
    }
  };
}
