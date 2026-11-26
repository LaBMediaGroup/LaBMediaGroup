// World-space precipitation around the current camera. Terrain and prop depth hide drops behind them.
import * as THREE from 'three';
import {distantThunder} from './explore-audio.js?v=2';

function layer(snow,capacity,uniforms) {
  const vertices=snow ? 1 : 2;
  const positions=new Float32Array(capacity*vertices*3), ends=new Float32Array(capacity*vertices);
  for(let i=0;i<capacity;i++){
    const x=Math.random()*12,y=Math.random()*6,z=Math.random()*12;
    for(let j=0;j<vertices;j++){
      const k=i*vertices+j; positions.set([x,y,z],k*3); ends[k]=j;
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(positions,3));
  g.setAttribute('aTip',new THREE.BufferAttribute(ends,1));
  const material=new THREE.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,
    defines:snow?{FLAKES:1}:{},
    vertexShader:`uniform float elapsed,pixelRatio; uniform vec2 drift; attribute float aTip; varying float opacity;
    void main(){
      vec3 p=position;
      float fall;
      #ifdef FLAKES
        fall=.65+.22*sin(position.x);
        p.xz+=.18*vec2(sin(elapsed*1.2+position.z),cos(elapsed*.8+position.x));
        p.xz+=drift*elapsed*.48;
      #else
        fall=5.8+.85*sin(position.x);
        p.xz+=drift*elapsed;
      #endif
      p.y-=elapsed*fall;
      vec3 span=vec3(12.,6.,12.);
      p=mod(p-cameraPosition+.5*span,span)-.5*span+cameraPosition;
      #ifndef FLAKES
        p+=aTip*vec3(drift.x,-fall,drift.y)*.018;
      #endif
      vec4 eye=viewMatrix*vec4(p,1.);
      float dist=length(eye.xyz);
      opacity=smoothstep(.30,.85,dist)*(1.-smoothstep(4.2,6.,dist))*step(.015,p.y);
      gl_Position=projectionMatrix*eye;
      gl_PointSize=clamp(pixelRatio*7./max(.3,-eye.z),1.,pixelRatio*5.);
    }`,
    fragmentShader:`varying float opacity; uniform float daylight;
    void main(){
      #ifdef FLAKES
        float radius=length(gl_PointCoord-.5);
        float alpha=(1.-smoothstep(.24,.5,radius))*.87;
        vec3 tint=mix(vec3(.50,.58,.65),vec3(.95,.97,.98),daylight);
      #else
        float alpha=.40;
        vec3 tint=mix(vec3(.47,.56,.60),vec3(.77,.84,.88),daylight);
      #endif
      gl_FragColor=vec4(tint,alpha*opacity);
    }`
  });
  const mesh=snow?new THREE.Points(g,material):new THREE.LineSegments(g,material);
  mesh.name=snow?'Falling snow':'Falling rain';
  mesh.frustumCulled=false;mesh.visible=false;
  return {mesh,set(amount){mesh.visible=amount>.005;g.setDrawRange(0,vertices*Math.round(capacity*amount));}};
}

export function precipitation(world,reduced){
  const uniforms={elapsed:{value:0},drift:{value:new THREE.Vector2()},pixelRatio:{value:world.renderer.getPixelRatio()},daylight:{value:1}};
  const rain=layer(false,reduced?700:2400,uniforms),snow=layer(true,reduced?480:1600,uniforms);
  world.scene.add(rain.mesh,snow.mesh);
  let drops=0,flakes=0,lastRumble=-1;
  function stormSky(active){
    world.uniforms.uLightning.value=0;
    if(!active || document.hidden)return;
    // Visitors share the timing of these distant illustrative strikes during a storm report.
    const now=Date.now()/1000, block=Math.floor(now/60);
    const seed=Math.abs(Math.sin(block*31.13)*1697.3)%1;
    const age=now-block*60-(6+seed*37);
    world.uniforms.uStrikeAngle.value=seed*Math.PI*2;
    if(!reduced && age>=0 && age<.8)world.uniforms.uLightning.value=.76*Math.exp(-age*5)*Math.min(1,age/.08);
    if(age>=3+seed*4 && age<4+seed*4 && lastRumble!==block){
      lastRumble=block;distantThunder();
    }
  }
  return (dt,weather)=>{
    stormSky(weather?.storm);
    const blend=1-Math.exp(-dt*1.4);
    drops+=((weather?.rain||0)-drops)*blend;flakes+=((weather?.snow||0)-flakes)*blend;
    rain.set(drops);snow.set(flakes);
    world.uniforms.uRain.value=drops;
    if(!rain.mesh.visible&&!snow.mesh.visible)return;
    uniforms.elapsed.value+=dt*(reduced?.6:1);
    uniforms.daylight.value=world.uniforms.uDay.value;
    const d=world.uniforms.uWindDir.value;
    const speed=Math.min(4,(weather?.wind??0)*.13);
    uniforms.drift.value.set(d.x*speed,d.z*speed);
  };
}
