import test from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../contact-mailer/worker.mjs';
const env={RESEND_API_KEY:'test-only',CONTACT_TO:'owner@example.com',LIMIT:{limit:async()=>({success:true})}};
const request=(data,origin='https://labmedia.work')=>new Request('https://mailer.example/',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
test('contact mailer validates origin and fields before contacting Resend',async()=>{
 let calls=0;const send=async()=>{calls++;return new Response('{}');};
 assert.equal((await handle(request({name:'A',email:'a@example.com',message:'Hello'},'https://evil.example'),env,send)).status,403);
 assert.equal((await handle(request({name:'A',email:'bad',message:'Hello'}),env,send)).status,422);
 assert.equal((await handle(request({company:'bot'}),env,send)).status,200);
 assert.equal(calls,0);
});
test('contact mailer sends only to the configured inbox and reports provider failure',async()=>{
 const data={name:'Visitor',email:'visitor@example.com',message:'Hello',to:'attacker@example.com'};
 let payload;
 const res=await handle(request(data),env,async(url,options)=>{payload=JSON.parse(options.body);return new Response('{}');});
 assert.equal(res.status,200);assert.deepEqual(payload.to,['owner@example.com']);assert.equal(payload.reply_to,data.email);assert.match(payload.text,/Hello/);
 assert.equal((await handle(request(data),env,async()=>new Response('{}',{status:403}))).status,502);
 assert.equal((await handle(request(data),{...env,LIMIT:{limit:async()=>({success:false})}})).status,429);
});
