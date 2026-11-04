import React,{useState,useRef,useEffect} from 'react';
import {MessageCircle,X,Send,Sparkles,ArrowUpRight} from 'lucide-react';

const quick=['Fragrance for a night out','Suggest a fresh fragrance','Something for a date night','Prices and sizes'];
const welcome="Hello! Welcome to GARA PARFUM. ✨ I can help you browse our fragrances, prices, sizes, and website features. What would you like to know?";
const normalize=s=>s.toLowerCase().trim();
const scentFamilies={
 fresh:['bergamot','lemon','lime','orange','mandarin','grapefruit','yuzu','mint','aquatic','marine','sea','ozonic','green tea','neroli','petitgrain','verbena','eucalyptus','apple','pineapple','lavender'],
 citrus:['bergamot','lemon','lime','orange','mandarin','grapefruit','yuzu','citron','pomelo','neroli','petitgrain'],
 sweet:['vanilla','caramel','honey','tonka','praline','marshmallow','chocolate','cacao','cotton candy','sugar','peach','pear','cherry','coconut'],
 woody:['cedar','sandalwood','oud','agarwood','vetiver','patchouli','guaiac','rosewood','teak','cashmere wood','oakmoss'],
 floral:['rose','jasmine','lavender','peony','iris','violet','lily','tuberose','gardenia','magnolia','freesia','ylang','geranium','orange blossom'],
 spicy:['pepper','cardamom','ginger','cinnamon','clove','nutmeg','saffron','cumin','coriander'],
 musky:['musk','ambroxan','ambergris','ambrette','amber','cashmeran'],
 fruity:['apple','pear','peach','pineapple','mango','berry','cherry','melon','fig','lychee','plum','orange','lemon'],
 aquatic:['sea','marine','aquatic','rain','ozonic','water','salt','mineral']
};
const scentIntents=[['fresh',/fresh|refresh|clean|citrusy/],['citrus',/citrus|lemon|lime|orange|bergamot/],['sweet',/sweet|matamis|vanilla|gourmand|dessert/],['woody',/woody|wood|kahoy|oud|sandal/],['floral',/floral|flower|bulaklak|rose|jasmine/],['spicy',/spicy|spice|pepper|maanghang/],['musky',/musk|amber|skin scent/],['fruity',/fruity|fruit|prutas/],['aquatic',/aquatic|ocean|marine|sea|water|dagat/]];
const parseIngredientList=v=>Array.isArray(v)?v:typeof v==='string'?v.split(/[,;|]+/).map(x=>x.trim()).filter(Boolean):[];
function recommendScents(query,products,fragranceNotes){
 const intent=scentIntents.find(([,rx])=>rx.test(query))?.[0];if(!intent)return null;
 const catalog=products.map(p=>{const info=fragranceNotes.find(x=>String(x.code)===String(p.code));const notes=[...parseIngredientList(info?.topNotes),...parseIngredientList(info?.middleNotes),...parseIngredientList(info?.baseNotes)];const matches=notes.filter(n=>scentFamilies[intent].some(word=>n.toLowerCase().includes(word)));return {product:p,notes,matches,score:matches.length}});
 const ranked=catalog.filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
 return {intent,ranked,hasNotes:catalog.some(x=>x.notes.length>0)};
}


const occasionProfiles=[
 {name:'hot weather and sweating',pattern:/sweat|sweaty|perspir|pawisin|body\s*odor|humid|commut|outdoor|gym|workout|exercise|heat|hot\s*weather|tropical/,families:['fresh','citrus','aquatic'],intro:'If you tend to sweat a lot or spend time in hot weather, you may enjoy fresh, citrus or aquatic fragrances. These can feel lighter and more refreshing, though perfume does not prevent sweating or replace deodorant. Here are some options based on their listed fragrance notes.'},
 {name:'night out',pattern:/night\s*out|nightlife|clubbing|party|evening|going out|night time|nighttime/,families:['woody','spicy','musky','sweet'],intro:'For a night out, you might enjoy a warmer, richer fragrance. Here are options whose listed notes lean woody, spicy, musky or sweet.'},
 {name:'date night',pattern:/date\s*night|romantic|dinner date|dating|dinner/,families:['sweet','floral','musky','woody'],intro:'For a date night, these fragrances have notes that may suit a warm, inviting scent profile.'},
 {name:'office',pattern:/office|workplace|work\s*day|professional|school|class/,families:['fresh','citrus','aquatic','floral'],intro:'For work or school, these fragrances feature fresh, citrus, aquatic or soft floral notes.'},
 {name:'summer',pattern:/summer|hot\s*weather|beach|humid|daytime|day\s*time/,families:['fresh','citrus','aquatic','fruity'],intro:'For warm days, these options feature fresh, citrus, aquatic or fruity notes.'},
 {name:'everyday',pattern:/everyday|daily\s*wear|casual|all\s*day|day\s*to\s*day/,families:['fresh','citrus','floral','musky'],intro:'For everyday wear, here are fragrances with versatile fresh, citrus, floral or musky notes.'}
];
function productSuggestions(items){return items.map(x=>({code:x.product.code,name:x.product.name,image:x.product.image,price:x.product.price,size:x.product.size,category:x.product.category,matched:x.matches.slice(0,4)}));}
function recommendOccasion(query,products,fragranceNotes){
 const occasion=occasionProfiles.find(o=>o.pattern.test(query));if(!occasion)return null;
 const scored=products.map(p=>{const info=fragranceNotes.find(x=>String(x.code)===String(p.code));const notes=[...parseIngredientList(info?.topNotes),...parseIngredientList(info?.middleNotes),...parseIngredientList(info?.baseNotes)];const matches=notes.filter(n=>occasion.families.some(f=>scentFamilies[f].some(word=>n.toLowerCase().includes(word))));return {product:p,matches,score:matches.length};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
 return scored.length?{text:occasion.intro+' Recommendations are based on the notes in our catalog, and personal preferences may vary. Select a fragrance below to explore it.',suggestions:productSuggestions(scored)}:{text:'I would be happy to help you find a fragrance for '+occasion.name+'. However, we do not have enough matching ingredient notes in the current catalog to make a reliable recommendation. You can explore our fragrances or tell me whether you prefer fresh, sweet, woody or floral scents.',action:'Explore fragrances'};
}

function answer(input,products,fragranceNotes){
 const occasionMatch=recommendOccasion(normalize(input),products,fragranceNotes);if(occasionMatch)return occasionMatch;
 const q=normalize(input);
 const recommendations=recommendScents(q,products,fragranceNotes);
 if(recommendations){if(recommendations.ranked.length){const {intent,ranked}=recommendations;return {text:'Based on the '+intent+' notes recorded in our fragrance catalog, here '+(ranked.length===1?'is a match':'are some matches')+' you might enjoy. These are note-based suggestions, not guaranteed scent impressions.',suggestions:productSuggestions(ranked)};}return {text:recommendations.hasNotes?'I couldn’t find a verified '+recommendations.intent+' note match in the current GARA catalog. Try another scent family, or browse all fragrances.':'We don’t have enough fragrance notes saved in the catalog yet to make a reliable recommendation. Once the admin adds Top, Heart and Base Notes, I can match perfumes to your preference.',action:'Browse fragrances'};}
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
export default function GaraChat({products,fragranceNotes=[],onShop,onProduct}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState('');
 const [messages,setMessages]=useState([{from:'bot',text:welcome}]);
 const bottom=useRef(null);
 useEffect(()=>{if(open)bottom.current?.scrollIntoView({behavior:'smooth',block:'nearest'})},[open,messages]);
 const send=value=>{const v=value.trim();if(!v)return;setMessages(m=>[...m,{from:'user',text:v},{from:'bot',...answer(v,products,fragranceNotes)}]);setDraft('')};
 const act=m=>{if(m.code){const p=products.find(x=>x.code===m.code);if(p)onProduct(p)}else onShop(m.category||'All');setOpen(false)};
 return <div className="gara-chat-root">
  {open&&<section className="gara-chat-panel" aria-label="GARA fragrance assistant">
   <header className="gara-chat-head"><span className="gara-chat-mark"><Sparkles size={18}/></span><div><strong>GARA ASSISTANT</strong><small>Fragrance & shopping help</small></div><button onClick={()=>setOpen(false)} aria-label="Close chat"><X size={20}/></button></header>
   <div className="gara-chat-messages" role="log" aria-live="polite">
    {messages.map((m,i)=><div key={i} className={'gara-chat-bubble '+(m.from==='user'?'is-user':'is-bot')}><p>{m.text}</p>{m.suggestions&&<div className="gara-chat-suggestions">{m.suggestions.map(p=><button key={p.code} className="gara-chat-suggestion" onClick={()=>act({code:p.code})}><span className="gara-chat-suggestion-image"><img src={p.image} alt={p.name}/></span><span className="gara-chat-suggestion-copy"><strong>{p.name}</strong><small>{p.matched.join(' · ')}</small><em>₱{p.price} · {p.size}</em></span><ArrowUpRight size={15}/></button>)}</div>}{m.action&&<button onClick={()=>act(m)}>{m.action} <ArrowUpRight size={14}/></button>}</div>)}
    {messages.length===1&&<div className="gara-chat-quick">{quick.map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}</div>}
    <div ref={bottom}/>
   </div>
   <form className="gara-chat-compose" onSubmit={e=>{e.preventDefault();send(draft)}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask about GARA PARFUM…" aria-label="Message GARA assistant" maxLength={400}/><button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={18}/></button></form>
   <div className="gara-chat-disclaimer">Catalog assistant · Not live customer support</div>
  </section>}
  <button className="gara-chat-toggle" onClick={()=>setOpen(o=>!o)} aria-label={open?'Close fragrance assistant':'Open fragrance assistant'}>{open?<X size={23}/>:<MessageCircle size={23}/>}<span>{open?'Close':'Ask GARA'}</span></button>
 </div>
}