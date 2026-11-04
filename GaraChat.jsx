import React,{useState,useRef,useEffect} from 'react';
import {MessageCircle,X,Send,Sparkles,ArrowUpRight} from 'lucide-react';

const quick=['What perfumes do you have?','Prices and sizes','For Him / For All','How do I order?'];
const welcome="Hello! Welcome to GARA PARFUM. ✨ I can help you browse our fragrances, prices, sizes, and website features. What would you like to know?";
const normalize=s=>s.toLowerCase().trim();
function answer(input,products){
 const q=normalize(input);
 const match=products.find(p=>new RegExp('\\b'+p.code+'\\b').test(q)||q.includes(p.name.toLowerCase()));
 if(match)return {text:match.name+' is listed at ₱'+match.price+' for '+match.size+' ('+match.category+'). Fragrance notes, availability and exact variants still need confirmation from GARA PARFUM.',action:'View '+match.name,code:match.code};
 if(/price|cost|magkano|presyo|size|ml|how much/.test(q))return {text:'Our current catalog lists 30ml fragrances at ₱449 and 50ml fragrances at ₱499. These are preview prices and should be confirmed with GARA PARFUM. You can open Shop All to compare the products.',action:'Browse prices'};
 if(/order|checkout|buy|payment|shipping|delivery|cod|gcash|bili|paano/.test(q))return {text:'You can browse products and add them to your bag, but this website currently has a demo checkout only. Orders, payments, shipping fees and delivery options are not yet active or confirmed.',action:'Browse products'};
 if(/him|men|male|masculine|lalaki/.test(q))return {text:'For Him includes 301 Vibe, 308 Blue Spice, 302 A-Lister, 303 Trail, 305 Subzero and more. Want to browse the full For Him collection?',action:'Shop For Him',category:'For Him'};
 if(/her|women|female|babae/.test(q))return {text:'You can explore the For Her collection from the menu. Specific product availability for this category is not yet confirmed.',action:'Shop For Her',category:'For Her'};
 if(/unisex|for all|everyone|pareho/.test(q))return {text:'Our catalog currently lists 102 Poudre and 725 Opulent under For All. Both are shown as 50ml at ₱499, subject to seller confirmation.',action:'Shop For All',category:'For All'};
 if(/note|smell|scent|fresh|sweet|woody|long.last|longevity|recommend|suggest|best/.test(q))return {text:'I can help you narrow down the GARA collection by category, but verified scent notes and longevity details have not been provided yet. For All includes 102 Poudre and 725 Opulent; For Him includes 301 Vibe and 308 Blue Spice.',action:'Explore fragrances'};
 if(/hello|hi|hey|kumusta|good morning|good evening/.test(q))return {text:welcome};
 if(/product|catalog|perfume|fragrance|available|meron|list|shop/.test(q))return {text:'GARA PARFUM currently displays '+products.length+' inspired fragrances in its catalog, including 102 Poudre, 301 Vibe, 308 Blue Spice and 725 Opulent. Other products are also listed in Shop All.',action:'Shop All'};
 return {text:"I can help with GARA PARFUM's fragrance catalog, listed prices, sizes, categories and how this website works. For stock, fragrance notes, delivery or payment details, please confirm with the GARA PARFUM team.",action:'Shop All'};
}
export default function GaraChat({products,onShop,onProduct}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState('');
 const [messages,setMessages]=useState([{from:'bot',text:welcome}]);
 const bottom=useRef(null);
 useEffect(()=>{if(open)bottom.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[open,messages]);
 const send=value=>{const v=value.trim();if(!v)return;setMessages(m=>[...m,{from:'user',text:v},{from:'bot',...answer(v,products)}]);setDraft('')};
 const act=m=>{if(m.code){const p=products.find(x=>x.code===m.code);if(p)onProduct(p)}else onShop(m.category||'All');setOpen(false)};
 return <div className="gara-chat-root">
  {open&&<section className="gara-chat-panel" aria-label="GARA fragrance assistant">
   <header className="gara-chat-head"><span className="gara-chat-mark"><Sparkles size={18}/></span><div><strong>GARA ASSISTANT</strong><small>Fragrance & shopping help</small></div><button onClick={()=>setOpen(false)} aria-label="Close chat"><X size={20}/></button></header>
   <div className="gara-chat-messages" role="log" aria-live="polite">
    {messages.map((m,i)=><div key={i} className={'gara-chat-bubble '+(m.from==='user'?'is-user':'is-bot')}><p>{m.text}</p>{m.action&&<button onClick={()=>act(m)}>{m.action} <ArrowUpRight size={14}/></button>}</div>)}
    {messages.length===1&&<div className="gara-chat-quick">{quick.map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}</div>}
    <div ref={bottom}/>
   </div>
   <form className="gara-chat-compose" onSubmit={e=>{e.preventDefault();send(draft)}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask about GARA PARFUM…" aria-label="Message GARA assistant" maxLength={400}/><button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={18}/></button></form>
   <div className="gara-chat-disclaimer">Catalog assistant · Not live customer support</div>
  </section>}
  <button className="gara-chat-toggle" onClick={()=>setOpen(o=>!o)} aria-label={open?'Close fragrance assistant':'Open fragrance assistant'}>{open?<X size={23}/>:<MessageCircle size={23}/>}<span>{open?'Close':'Ask GARA'}</span></button>
 </div>
}