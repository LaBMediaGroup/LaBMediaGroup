import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../home-refresh.js',import.meta.url),'utf8');
function harness({scroll=0,dialog=false,input=false}={}){
 const listeners={},timers=[];let reloads=0;
 class Element{constructor(){this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false}};this.scrollTop=0;this.scrollHeight=this.clientHeight=10;}closest(){return input?this:null}matches(){return false}setAttribute(){}contains(){return true}addEventListener(type,fn){this[type]=fn}querySelector(){return label}}
 const root=new Element(),main=new Element(),brand=new Element(),target=new Element(),label={textContent:''},body=new Element();target.parentElement=main;body.append=()=>{};
 const ctx={Element,document:{documentElement:root,body,activeElement:body,querySelector(s){if(s==='main')return main;if(s==='.nav .brand')return brand;if(s==='#refresh-page')return null;return dialog?{}:null},createElement(){return new Element()}},matchMedia(q){return{matches:q.includes('pointer: coarse')}},scrollY:scroll,getComputedStyle(){return{overflowY:'visible'}},addEventListener(t,f){listeners[t]=f},setTimeout(f){timers.push(f)},sessionStorage:{setItem(){},getItem(){return null},removeItem(){}},location:{reload(){reloads++}}};
 vm.runInNewContext(source,ctx);
 const fire=(name,x=10,y=10,count=1)=>listeners[name]({target,touches:Array.from({length:count},()=>({clientX:x,clientY:y})),cancelable:true,preventDefault(){}});
 return{fire,finish(){timers.forEach(f=>f());return reloads},label};
}
test('short pull settles without a reload',()=>{const h=harness();h.fire('touchstart');h.fire('touchmove',10,50);h.fire('touchend');assert.equal(h.finish(),0)});
test('armed pull refreshes once after release',()=>{const h=harness();h.fire('touchstart');h.fire('touchmove',10,190);assert.equal(h.label.textContent,'Release to refresh');h.fire('touchend');h.fire('touchend');assert.equal(h.finish(),1)});
test('canceled armed pull does not refresh',()=>{const h=harness();h.fire('touchstart');h.fire('touchmove',10,190);h.fire('touchcancel');assert.equal(h.finish(),0)});
test('horizontal swipe does not become refresh',()=>{const h=harness();h.fire('touchstart');h.fire('touchmove',190,30);h.fire('touchmove',190,240);h.fire('touchend');assert.equal(h.finish(),0)});
test('dialogs, form controls, and scrolled pages block refresh',()=>{for(const options of [{dialog:true},{input:true},{scroll:100}]){const h=harness(options);h.fire('touchstart');h.fire('touchmove',10,190);h.fire('touchend');assert.equal(h.finish(),0)}});
test('multi-touch cancels a pull',()=>{const h=harness();h.fire('touchstart');h.fire('touchmove',10,190,2);h.fire('touchend');assert.equal(h.finish(),0)});
