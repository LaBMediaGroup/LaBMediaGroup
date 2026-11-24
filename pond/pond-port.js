// Split view through an approximately 0.20 m dome port; see pond-entry.md.
// Only the narrow crossing band needs a second color target. The underwater
// scene renders directly to the drawing buffer, preserving the CRT color pipeline.
import * as THREE from 'three';
// A 0.2032 m dome displaces the free surface. The crown and entrained air use
// the point of first contact, so they stay in the pond as the eye passes them.
// Small bur-oak leaves on the entry patch give the downward view a fixed
// surface and a familiar scale. The nearest blades slide with the contact wave.
function entryLeaves(impact,contact) {
  const vertices=[],coords=[],centers=[],indices=[];
  const width=[[0,.006],[.06,.018],[.11,.093],[.18,.15],[.24,.12],[.31,.058],
    [.37,.14],[.42,.20],[.47,.11],[.51,.059],[.56,.24],[.63,.31],
    [.69,.29],[.74,.23],[.78,.27],[.84,.25],[.90,.17],[.96,.095],[1,.014]];
  for(const [x,z,len,angle] of [[-.27,-.30,.155,.76],[.21,-.14,.12,-1.2],
    [-.16,.14,.144,-.29],[.16,.42,.114,1.88]]) {
    const base=vertices.length/3,cs=Math.cos(angle),sn=Math.sin(angle);
    function add(t,w,up) {
      vertices.push(len*((t-.5)*cs-w*sn),up,len*((t-.5)*sn+w*cs));
      coords.push(t,w);centers.push(contact.x+x,contact.z+z);
    }
    for(const [t,w] of width) {
      add(t,-w,.002+w*.008);
      add(t,0,.0016+.002*Math.sin(t*3.14));add(t,w*(.94+.06*Math.sin(9*t)),.002+w*.004);
    }
    for(let j=1;j<width.length;j++)for(let k=0;k<2;k++){
      const a=base+(j-1)*3+k;indices.push(a,a+3,a+1,a+1,a+3,a+4);
    }
    const stem=vertices.length/3;
    add(.055,-.007,.001);add(.055,.007,.001);add(-.14,-.005,.001);add(-.14,.005,.001);
    indices.push(stem,stem+1,stem+2,stem+1,stem+2,stem+3);
  }
  const geo=new THREE.BufferGeometry();geo.setIndex(indices);
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(coords,2));
  geo.setAttribute('pool',new THREE.Float32BufferAttribute(centers,2));
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,
    uniforms:{elapsed:{value:0},age:impact.clock,center:{value:impact.origin},day:impact.light,wind:{value:0}},
    vertexShader:`attribute vec2 pool;varying vec2 leaf;uniform float elapsed,age,wind;uniform vec3 center;
      void main(){
        float a=pool.y*16.+elapsed*(.16+.011*min(25.,wind));
        vec2 drift=.036*vec2(sin(a),cos(a*.83));
        vec2 rel=pool+drift-center.xz;float d=length(rel);
        float wave=exp(-pow((d-(.065+.78*age))/.14,2.))*(1.-smoothstep(.35,1.1,age));
        vec3 p=position;p.xz+=pool+drift+rel/max(.02,d)*wave*.032;
        p.y+=.0006*sin(a*3.)+wave*.010;leaf=uv;
        gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
      }`,
    fragmentShader:`varying vec2 leaf;uniform float day;
      void main(){
        float t=leaf.x,w=leaf.y;
        float grain=fract(sin(dot(floor(vec2(t,w)*790.),vec2(12.9898,78.233)))*43758.5);
        float rib=1.-smoothstep(.004,.016,abs(w));
        float vein=1.-smoothstep(.012,.066,abs(fract((t-abs(w)*.60)*5.8+.11*sin(10.*t))-.5));
        float mottling=.5+.5*sin(24.*t+10.*w)*cos(17.*w-9.*t);
        vec3 c=mix(vec3(.26,.165,.085),vec3(.42,.275,.15),mottling)*(.83+.21*grain);
        c*=1.-.30*vein;c+=rib*vec3(.065,.045,.022);
        gl_FragColor=vec4(c*(.24+.76*day),1.);
      }`
  });
  const mesh=new THREE.Mesh(geo,material);mesh.name='Floating bur oak leaves at the entry';mesh.frustumCulled=false;mesh.renderOrder=3;
  return mesh;
}

function createImpact(scene) {
  const origin=new THREE.Vector3(), bearing=new THREE.Vector2(), clock={value:9}, light={value:1};
  const air=new THREE.Group(), wet=new THREE.Group();
  air.name='Dome entry crown and spray';wet.name='Entrained air at dome entry';
  air.visible=wet.visible=false;
  scene.add(air);
  const positions=[], uv=[], index=[];
  const sectors=84,rows=6;
  for(let j=0;j<=rows;j++) for(let i=0;i<=sectors;i++){
    positions.push(0,0,0);uv.push(i/sectors,j/rows);
    if(j&&i){const k=j*(sectors+1)+i;index.push(k-sectors-2,k-sectors-1,k,k-sectors-2,k,k-1);}
  }
  const wall=new THREE.BufferGeometry();
  wall.setIndex(index);wall.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  wall.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const wallMaterial=new THREE.ShaderMaterial({
    uniforms:{age:clock,day:light},side:THREE.DoubleSide,transparent:true,depthWrite:false,
    vertexShader:`uniform float age;varying vec2 st;varying float hitLight;
      void main(){st=uv;float a=uv.x*6.2831853,h=uv.y;
        float swell=smoothstep(0.,.032,age)*(1.-smoothstep(.045,.40,age));
        float lobe=.58+.17*sin(a*5.+.8)+.15*cos(a*9.)+.10*sin(a*16.);
        float radius=.045+.25*(1.-exp(-age*7.3))+.068*swell*h*h;
        float up=swell*(.052+.105*lobe)*h;
        vec3 p=vec3(sin(a)*radius,up+.001,cos(a)*radius);
        hitLight=.5+.5*cos(a-1.1);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }`,
    fragmentShader:`uniform float age,day;varying vec2 st;varying float hitLight;
      void main(){float rib=.5+.5*cos(6.28318*st.x*28.+st.y*2.);
        float rim=smoothstep(.79,1.,st.y), veil=(.7+.3*rib)*(.26+.66*rim);
        float split=sin(st.x*188.4+st.y*3.)+sin(st.x*75.4-st.y*5.);
        if(age>.15 && st.y>.57 && split>(2.9-age*5.))discard;
        float alpha=veil*(1.-smoothstep(.26,.43,age))*smoothstep(0.,.012,age);
        vec3 water=mix(vec3(.075,.18,.17),vec3(.70,.81,.74),rim*.72+hitLight*.23);
        gl_FragColor=vec4(water*(.25+.75*day),alpha);}`
  });
  const crown=new THREE.Mesh(wall,wallMaterial);crown.frustumCulled=false;crown.renderOrder=4;air.add(crown);
  let seed=963;
  const random=()=>((seed=Math.imul(1664525,seed)+1013904223>>>0)/4294967296);
  function particles(under,n) {
    const params=[],shapes=[];
    for(let i=0;i<n;i++){
      params.push(2*Math.PI*(i+random())/n,random(),random(),random());
      shapes.push(random(),random(),random());
    }
    const g=new THREE.InstancedBufferGeometry();
    const ball=new THREE.SphereGeometry(1,7,5);
    g.index=ball.index;g.attributes.position=ball.attributes.position;g.attributes.normal=ball.attributes.normal;
    g.setAttribute('trajectory',new THREE.InstancedBufferAttribute(new Float32Array(params),4));
    g.setAttribute('shape',new THREE.InstancedBufferAttribute(new Float32Array(shapes),3));g.instanceCount=n;
    const material=new THREE.ShaderMaterial({
      uniforms:{age:clock,day:light,heading:{value:bearing}},transparent:true,depthWrite:false,
      vertexShader:`uniform float age;uniform vec2 heading;attribute vec4 trajectory;attribute vec3 shape;
        varying vec3 norm,eye;varying float fade;
        void main(){
          float a=trajectory.x,v=trajectory.y,d=trajectory.z;
          vec2 radial=vec2(cos(a),sin(a));float t=age-trajectory.w*${under?'.24':'.048'};
          float tau=max(0.,t);
          ${under?`
            // Air carried down around the housing separates and rises buoyantly.
            vec2 ring=radial*(.030+.23*v+.07*tau);
            vec2 lateral=ring+heading*(.07+.38*d)+vec2(.019*sin(a+tau*5.),.017*cos(a-tau*4.));
            float y=-.08-.43*d-.105*v+.010*sin(a)+tau*(.15+.13*shape.y);
            float r=(.002+.0175*pow(shape.x,3.))*(.78+.22*sin(d*9.+tau*3.));
            vec3 scale=vec3(r,r*(.92+.21*sin(tau*7.+a)),r);
            fade=step(0.,t)*smoothstep(0.,.07,t)*(1.-smoothstep(.92,1.65,t))*smoothstep(0.,.055,-y);
          `:`
            vec2 lateral=radial*(.057+tau*(.16+.49*v))+heading*.018;
            float y=.002+tau*(.73+.87*d)-4.9*tau*tau;
            float r=.0018+.0048*shape.x;
            vec3 scale=vec3(r,r*(1.25+.74*d),r);
            fade=step(0.,t)*smoothstep(0.,.014,y)*(1.-smoothstep(.32,.46,t));
          `}
          vec3 p=vec3(lateral.x,y,lateral.y)+scale*position;
          vec4 w=modelMatrix*vec4(p,1.);norm=normalize(mat3(modelMatrix)*(normal/scale));eye=cameraPosition-w.xyz;
          gl_Position=projectionMatrix*viewMatrix*w;
        }`,
      fragmentShader:`uniform float day;varying vec3 norm,eye;varying float fade;
        void main(){if(fade<.01)discard;vec3 n=normalize(norm);
          float edge=pow(1.-abs(dot(n,normalize(eye))),1.3),glint=pow(max(dot(n,vec3(-.44,.75,.49)),0.),9.);
          float sky=.5+.5*n.y;
          vec3 c=mix(vec3(.08,.18,.16),vec3(.74,.86,.77),.64*edge+.26*sky);
          gl_FragColor=vec4((c+vec3(.35)*glint)*(.32+day*.68),fade*(.11+.68*edge+.55*glint));}`
    });
    const drops=new THREE.Mesh(g,material);drops.frustumCulled=false;drops.renderOrder=5;
    return drops;
  }
  air.add(particles(false,72));wet.add(particles(true,92));
  let start=-10;
  function trigger(t,position,direction) {
    start=t;clock.value=0;
    bearing.set(direction.x,direction.z).normalize();
    // The forward sector of the tilted port touches before the eye.
    origin.set(position.x+direction.x*.09,0,position.z+direction.z*.09);
    air.position.copy(origin);wet.position.copy(origin);
  }
  function update(t,day) {
    clock.value=t-start;light.value=day;
    air.visible=clock.value<.46;wet.visible=clock.value<1.75;
  }
  function clear(){start=-10;clock.value=9;air.visible=wet.visible=false;}
  return {attach:room=>room.add(wet),trigger,update,clear,origin,clock,light};
}

// Brief refracting sheet on the glass. Copy the just-rendered frame so every
// transparent fold bends the live field or mud image below it.
function createWetFilm(impact) {
  const display=new THREE.Scene(), quadCamera=new THREE.Camera(), size=new THREE.Vector2();
  const u={source:{value:null},age:impact.clock,breach:{value:8},day:impact.light,aspect:{value:1}};
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
    uniforms:u,depthTest:false,depthWrite:false,toneMapped:false,
    vertexShader:'varying vec2 st;void main(){st=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D source;uniform float age,breach,day,aspect;varying vec2 st;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.54);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      void main(){
        vec2 p=st*2.-1.;vec2 q=vec2(p.x*aspect,p.y);
        if(breach<.94){
          // Gravity draws the water film off the port. Its uneven lower
          // edge bends the live branches as they come into view.
          float runoff=1.20-3.9*breach+.21*sin(q.x*4.3)+.12*noise(vec2(q.x*10.,breach));
          float edge=q.y-runoff;
          float ridge=exp(-abs(edge)*18.);
          float streak=sin(q.x*22.+2.9*noise(vec2(q.x*7.,q.y)));
          float sheet=(1.-smoothstep(-.06,.05,edge))*(1.-smoothstep(.18,.84,breach));
          vec2 offset=vec2(.008*streak*sheet,.022*ridge+.011*sheet);
          vec3 color=texture2D(source,clamp(st+offset,.001,.999)).rgb;
          gl_FragColor=vec4(color*(1.-.055*sheet)+ridge*vec3(.042,.057,.049)*(day*.7+.3),1.);
          return;
        }
        // The leading lip curls up one side before the other; two smaller
        // sheets peel away. Clear islands open between them as the dome wets.
        float across=.31*q.x+.41*q.x*q.x+.21*sin(3.1*q.x+.4);
        float ragged=noise(q*8.+vec2(0.,age*3.))*.20+noise(q*23.)*.035;
        float delta=q.y-(age*7.1-1.29+across+ragged);
        float sheath=exp(-delta*delta*9.);
        float strand=sin(24.*q.x+8.*q.y+1.7*sin(8.*q.x));
        float sidewall=smoothstep(.25,.91,abs(q.x)+.18*strand);
        float tendril=exp(-pow((delta-.20-.11*strand)/.065,2.))*sidewall;
        float broken=smoothstep(.21,.69,noise(q*5.7+age));
        float lip=exp(-abs(delta)*45.)*broken;
        float darkLip=exp(-abs(delta-.018)*48.);
        vec2 warp=sheath*vec2(.023*sin(8.*q.x+6.*q.y+3.*ragged),.051+.024*strand)
          +tendril*vec2(.027*strand,-.033);
        // Sparse trapped air slips around the rim. Warp the cell domain before
        // selecting bubbles, so their centers follow eddies rather than rows.
        vec2 cell=mat2(.908,.419,-.419,.908)*q*vec2(3.6,4.2);
        cell+=vec2(noise(q*2.6),noise(q*3.1+7.))*.95+vec2(age*.6,-age*2.5);
        vec2 id=floor(cell),d=fract(cell)-.5;
        d-=.45*(vec2(hash(id),hash(id+7.))-.5);
        float r=.057+.16*hash(id+13.),l=length(d*vec2(1.,.85))/r;
        float bead=(1.-smoothstep(.79,1.07,l))*smoothstep(.65,.90,hash(id+23.));
        float trail=smoothstep(-.15,.08,-delta)*(1.-smoothstep(.24,.66,age))*(.32+.68*sidewall);
        float edge=bead*trail;
        warp+=d*edge*.23;
        float fade=smoothstep(0.,.026,age)*(1.-smoothstep(.44,.70,age));
        vec3 col=texture2D(source,clamp(st+warp*fade,.001,.999)).rgb;
        col*=1.-fade*(.24*darkLip+.26*edge);
        float reflected=lip*.48+.35*tendril*broken+edge*max(0.,-d.y/r);
        col+=vec3(.33,.44,.40)*reflected*fade*(.3+.7*day);
        gl_FragColor=vec4(col,1.);
      }`
  }));
  quad.frustumCulled=false;display.add(quad);
  let texture;
  return function render(renderer,breachAge) {
    if(impact.clock.value>=.70 && breachAge>=.94)return;
    u.breach.value=breachAge;
    renderer.getDrawingBufferSize(size);
    if(!texture||texture.image.width!==size.x||texture.image.height!==size.y){
      texture?.dispose();texture=new THREE.FramebufferTexture(size.x,size.y);
      texture.minFilter=texture.magFilter=THREE.LinearFilter;
      u.source.value=texture;
    }
    u.aspect.value=size.x/size.y;
    renderer.copyFramebufferToTexture(texture);
    const clear=renderer.autoClear;
    renderer.autoClear=false;renderer.render(display,quadCamera);renderer.autoClear=clear;
  };
}

export function createPondPort(field,contact) {
  const impact=createImpact(field), wetFilm=createWetFilm(impact);
  const leaves=entryLeaves(impact,contact);field.add(leaves);
  function update(t,day,wind,approach){
    impact.update(t,day);
    leaves.visible=approach;
    leaves.material.uniforms.elapsed.value=t;leaves.material.uniforms.wind.value=wind;
  }
  const air=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});
  const u={air:{value:air.texture},height:{value:0},axisY:{value:new THREE.Vector3()},
    lens:{value:new THREE.Vector2()},clock:{value:0},chop:{value:0},tilt:{value:0}};
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
    uniforms:u,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
    vertexShader:'varying vec2 st; void main(){st=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`varying vec2 st;uniform sampler2D air;uniform vec3 axisY;uniform vec2 lens;
      uniform float height,clock,chop,tilt;
      void main(){
        vec2 p=st*2.-1.;
        vec3 ray=normalize(vec3(p*lens,-1.));
        float wave=(sin(2.6*p.x+clock*1.16)+.22*sin(8.1*p.x-clock*.97))*(.0019+.004*chop)+p.x*tilt;
        float wet=height+.1016*dot(ray,axisY)-wave;
        float lip=1.-smoothstep(.00025,.0019,abs(wet));
        float k=smoothstep(-.00027,.00032,wet);
        vec2 bend=vec2(.0021*sin(p.x*9.+clock),-.027)*lip;
        vec3 sky=texture2D(air,clamp(st+bend,0.,1.)).rgb;
        vec3 glint=texture2D(air,clamp(st+vec2(.006,.034),0.,1.)).rgb;
        float ridge=exp(-pow((wet-.00038)/.00031,2.));
        vec3 film=mix(glint*.71,sky,k)*(1.-.32*lip)+ridge*(.06+.24*glint);
        gl_FragColor=vec4(film,k+lip*.57*(1.-k));
      }`
  })));
  function render(renderer,view,airScene,roomScene,reflection,t,wind) {
    const saved=view.position.y;
    const e=view.matrixWorld.elements;
    u.axisY.value.set(e[1],e[5],e[9]);
    const tan=Math.tan(THREE.MathUtils.degToRad(view.fov*.5));
    u.lens.value.set(tan*view.aspect,tan);
    u.height.value=saved;u.clock.value=t;u.chop.value=Math.min(wind/25,1);
    u.tilt.value=.0028*Math.sin(t*.55);
    view.position.y=Math.max(.055,saved);view.updateMatrixWorld();
    reflection();
    renderer.setRenderTarget(air); renderer.render(airScene,view);
    renderer.setRenderTarget(null);
    view.position.y=Math.min(-.045,saved);view.updateMatrixWorld();
    renderer.render(roomScene,view);
    view.position.y=saved;view.updateMatrixWorld();
    const clear=renderer.autoClear;
    renderer.autoClear=false;renderer.render(scene,camera);renderer.autoClear=clear;
  }
  function resize(width,height){air.setSize(Math.max(1,Math.round(width)),Math.max(1,Math.round(height)));}
  return {render,resize,impact,wetFilm,update};
}
