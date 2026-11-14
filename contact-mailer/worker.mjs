const EMAIL=/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
export async function handle(request,env,send=fetch){
 const origin=request.headers.get('Origin')||'',allowed=(env.ALLOWED_ORIGINS||'https://labmedia.work,https://www.labmedia.work').split(',').includes(origin);
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{})};
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(!allowed)return reply({ok:false,error:'This form is available on labmedia.work.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='POST')return reply({ok:false,error:'POST required.'},405);
 if(!env.RESEND_API_KEY||!env.CONTACT_TO)return reply({ok:false,error:'Please use the email link for now.'},503);
 if(!env.LIMIT)return reply({ok:false,error:'Please use the email link for now.'},503);
 if(!(await env.LIMIT.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return reply({ok:false,error:'Please wait a minute before trying again.'},429);
 if(Number(request.headers.get('Content-Length'))>20000)return reply({ok:false,error:'Message is too long.'},413);
 let data;try{const raw=await request.text();if(raw.length>20000)return reply({ok:false,error:'Message is too long.'},413);data=JSON.parse(raw);}catch{return reply({ok:false,error:'Please check your message.'},400);}
 if(!data||typeof data!=='object')return reply({ok:false,error:'Please check your message.'},400);
 if(data.company)return reply({ok:true});
 const name=String(data.name||'').trim(),email=String(data.email||'').trim(),message=String(data.message||'').trim();
 if(!name||name.length>120||!EMAIL.test(email)||email.length>200||!message||message.length>5000)return reply({ok:false,error:'Add your name, a valid email, and a message under 5,000 characters.'},422);
 try{
 const result=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.FROM_EMAIL||'LaB Media <contact@labmedia.work>',to:[env.CONTACT_TO],reply_to:email,subject:'LaB Media website message',text:'From: '+name+' <'+email+'>\n\n'+message})});
 if(!result.ok)return reply({ok:false,error:'Your message could not be sent. Please try again or use the email link.'},502);
 return reply({ok:true});
 }catch{return reply({ok:false,error:'Your message could not be sent. Please try again or use the email link.'},502);}
}
export default{fetch(request,env){return handle(request,env);}};
