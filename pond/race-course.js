// A metre-scale practice circuit on the dry side of the station.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function raceCourse(T,ground,material){
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const points=[[-3,4],[-4,6],[-4,8],[-4,10],[-3.7,11.9],[-1.8,12.7],
    [.3,11.6],[.9,9.4],[-.3,7.8],[.65,5.6],[.35,3.7],[-1.4,3.1]];
  const lap=new T.CatmullRomCurve3(points.map(([x,z])=>V(x,ground(x,z)+.86,z)),true,'centripetal');
  const parts=[], cream=[.89,.85,.71], orange=[.92,.32,.115], ink=[.13,.19,.19], pvc=[.66,.65,.58];
  const origin=V(0,0,0),axis=V(0,1,0);
  function piece(g,tint,yaw){
    if(g.index)g=g.toNonIndexed();
    g.rotateY(yaw).translate(origin.x,origin.y,origin.z);
    g.deleteAttribute('uv');
    const color=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<color.length;i+=3)color.set(tint,i);
    g.setAttribute('color',new T.BufferAttribute(color,3));parts.push(g);
  }
  function fixture(index,round){
    const t=index/points.length;
    lap.getPoint(t,origin);
    const tangent=lap.getTangent(t),yaw=Math.atan2(tangent.x,tangent.z);
    const box=(x,y,z,w,h,d,tint)=>piece(new T.BoxGeometry(w,h,d).translate(x,y,z),tint,yaw);
    const sideX=Math.cos(yaw),sideZ=-Math.sin(yaw);
    for(const sign of [-1,1]){
      const x=sign*(round?.24:1.056);
      const foot=ground(origin.x+x*sideX,origin.z+x*sideZ)-origin.y;
      const top=round?-.23:.968;
      piece(new T.CylinderGeometry(.015,.019,top-foot+.045,8).translate(x,(foot+top-.045)/2,.008),pvc,yaw);
      if(round)box(x,foot+.016,.018,.074,.032,.32,ink);
      else{
        const mid=sign*.9144;
        box(mid,(foot+.664)/2,0,.3048,.664-foot,.019,cream);
        for(let i=0;i<6;i++)box(mid+(.0762*(i%2?1:-1)),.56-i*.15,0,.1524,.15,.022,ink);
      }
    }
    if(round){
      for(let j=0;j<12;j++){
        const arc=new T.RingGeometry(.267,.39,5,1,j*Math.PI/6,Math.PI/6);
        piece(arc,j%2?cream:orange,yaw);
      }
      piece(new T.TorusGeometry(.39,.009,5,60),ink,yaw);
    }else{
      box(0,.8164,0,2.1336,.3048,.024,orange);
      box(0,.962,.018,2.14,.033,.033,pvc);
      for(let i=0;i<3;i++)box(-.89+i*.135,.815,-.001,.065,.24,.028,cream);
    }
  }
  [0,5,9].forEach(i=>fixture(i,false));
  [1,2,3,7].forEach(i=>fixture(i,true));
  // Paired painted course markers let the eye trace both bends from above.
  for(let i=0;i<48;i++){
    const t=i/48,p=lap.getPointAt(t),dir=lap.getTangentAt(t);
    const n=dir.clone().cross(axis).normalize();
    for(const s of [-1,1]){
      origin.copy(p).addScaledVector(n,.68*s);
      origin.y=ground(origin.x,origin.z)+.013;
      piece(new T.BoxGeometry(.085,.016,.23),i%4===0?orange:cream,Math.atan2(dir.x,dir.z));
    }
  }
  const mesh=new T.Mesh(mergeGeometries(parts),material);
  mesh.name='South field practice circuit';
  return {mesh,lap};
}
