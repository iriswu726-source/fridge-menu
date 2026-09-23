(function(){
"use strict";

/* ---------- 資料 ---------- */
const D=window.FM_DATA;
const CATS=D.CATS,AVOID=D.AVOID;
const ING={};
D.INGREDIENTS.forEach(r=>{ING[r[0]]={key:r[0],n:r[1],cat:r[2],u:r[3],gpu:r[4],k:r[5],p:r[6],f:r[7],c:r[8],fb:r[9],ca:r[10],fe:r[11],vc:r[12],a:r[13]||"",life:r[14]||7,cup:r[15]||0}});
const RECIPES=D.RECIPES.map(r=>Object.assign({main:r.items[0][0]},r));
// 自訂食材只能是可替換的類別，營養素用類別平均值
const CUSTOM_BASE={leafy:[20,1.5,.2,3.5,2,80,1.2,25],veg:[30,1.2,.2,6,2,25,.4,20],mush:[30,3,.3,6,3,3,.8,0],fruit:[55,.6,.2,14,2,10,.2,30]};
const CUSTOM_LIFE={leafy:4,veg:7,mush:5,fruit:7};
const SLOT_DEFAULT={leafy:"bokchoy",veg:"carrot",mush:"mushroom",fruit:"banana"};
const STAPLES=["rice","brownrice","noodles","oats"];
const VEG_CATS=["leafy","veg","mush"];
const MEALS=[["B","早餐",.24],["L","午餐",.32],["D","晚餐",.28]]; // 其餘約 16% 由加餐補足
const NK=["k","p","f","c","fb","ca","fe","vc"];

/* ---------- 三種目標模式 ---------- */
const GOALS={
  cut:{n:"減脂",sub:"熱量赤字約 20%",kf:.8,pk:1.6,fat:[20,30],carb:[40,55],oil:.6,scale:[.5,1.4],
    tips:["熱量約為維持量的 80%，一週約減 0.3–0.5 公斤","蛋白質 1.6 g/kg，保住肌肉量","少油烹調（用油量 ×0.6），蔬菜份量不縮減","優先推薦雞胸、魚、蝦、豆腐等高蛋白低脂菜色"]},
  keep:{n:"維持",sub:"均衡飲食",kf:1,pk:1.1,fat:[20,30],carb:[50,60],oil:1,scale:[.7,1.5],
    tips:["熱量等於每日維持量","蛋白質 1.1 g/kg（國人膳食營養素參考攝取量）","脂肪占熱量 20–30%、醣類 50–60%","菜色輪替，六大類食物均衡攝取"]},
  gain:{n:"增肌",sub:"熱量盈餘約 10%",kf:1.1,pk:1.8,fat:[20,30],carb:[50,60],oil:1,scale:[.8,1.7],
    tips:["熱量約為維持量的 110%，請搭配阻力訓練","蛋白質 1.8 g/kg，分散在三餐與加餐","主食充足，醣類占熱量 50–60%","加餐自動加入豆漿、優格、蛋等蛋白質"]}
};

/* ---------- 日期 ---------- */
const DAY=864e5;
function today0(){const t=new Date();t.setHours(0,0,0,0);return t}
const pad=n=>String(n).padStart(2,"0");
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function parseISO(s){if(!s||typeof s!=="string")return null;const [y,m,d]=s.split("-").map(Number);return y&&m&&d?new Date(y,m-1,d):null}
function daysLeft(s){const d=parseISO(s);return d?Math.round((d-today0())/DAY):null}
function addDays(n){const t=today0();t.setDate(t.getDate()+n);return iso(t)}
function dayDate(n){const t=today0();t.setDate(t.getDate()+n);return t}
const md=d=>(d.getMonth()+1)+"/"+d.getDate();

/* ---------- 狀態 ---------- */
const SKEY="fridge-week-menu-v2",OLD_KEY="fridge-week-menu-v1";
function sample(){
  const list=[["egg",12,10],["chicken",500,30],["chicken_thigh",300,30],["pork_mince",300,30],["salmon",240,30],["tofu",400,3],["dried_tofu",200,5],["edamame",200,4],
    ["milk",1900,6],["yogurt",500,9],["toast",10,4],["sweetpotato",600,12],["potato",300,14],["cabbage",900,9],["bokchoy",400,2],["spinach",300,3],
    ["broccoli",500,5],["carrot",300,14],["tomato",500,3],["onion",300,25],["mushroom",150,4],["woodear",150,5],["banana",6,4],["guava",3,6],["kiwi",4,10],
    ["nuts",200,60],["sesame",100,60]];
  return {goal:"keep",sex:"f",weight:55,act:30,people:1,staples:true,grains:false,diet:"all",avoid:[],batch:true,seed:7,locks:{},custom:[],sample:true,
    inv:list.map(([key,qty,e])=>({key,qty,exp:addDays(e)}))};
}
function load(){
  let j=null;
  try{j=JSON.parse(localStorage.getItem(SKEY))}catch(e){}
  if(!j){ // 從第一版資料搬過來：「優先」視為兩天內到期
    try{const o=JSON.parse(localStorage.getItem(OLD_KEY));if(o&&Array.isArray(o.inv)){j=o;j.inv=o.inv.map(i=>({key:i.key,qty:i.qty,exp:i.prio?addDays(2):null}))}}catch(e){}
  }
  if(!j||!Array.isArray(j.inv))return sample();
  const s=Object.assign(sample(),j);
  delete s.over;
  if(s.sample)s.inv=sample().inv; // 範例食材的到期日跟著今天走
  if(!s.locks||typeof s.locks!=="object")s.locks={};
  if(!Array.isArray(s.avoid))s.avoid=[];
  return s;
}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(e){}}
let S=load();
if(!GOALS[S.goal])S.goal="keep";
function registerCustom(c){
  const b=CUSTOM_BASE[c.cat];if(!b)return;
  ING[c.key]={key:c.key,n:c.n,cat:c.cat,u:"g",gpu:1,k:b[0],p:b[1],f:b[2],c:b[3],fb:b[4],ca:b[5],fe:b[6],vc:b[7],a:"",life:CUSTOM_LIFE[c.cat],cup:0,custom:true};
}
S.custom.forEach(registerCustom);
S.inv=S.inv.filter(i=>ING[i.key]);

/* ---------- 工具 ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const Z=()=>({k:0,p:0,f:0,c:0,fb:0,ca:0,fe:0,vc:0,veg:0,fruit:0,dairy:0});
function nut(key,g){
  const i=ING[key],o=Z();
  for(const n of NK)o[n]=i[n]*g/100;
  if(VEG_CATS.includes(i.cat))o.veg=g/100;
  if(i.cat==="fruit")o.fruit=g/120;
  if(i.cup)o.dairy=g/i.cup;
  return o;
}
function add(a,b){for(const n in a)a[n]+=b[n];return a}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const isPantry=k=>k==="oil"||(S.staples&&STAPLES.includes(k));
function allowed(key){
  const i=ING[key];if(!i)return false;
  if(i.a&&S.avoid.includes(i.a))return false;
  if(S.diet==="veg"&&(i.cat==="meat"||i.cat==="sea"))return false;
  return true;
}
const mapKey=k=>(k==="rice"&&S.grains)?"brownrice":k;
const recipeAllowed=r=>r.items.every(([k])=>k[0]==="@"||allowed(mapKey(k)));
function roundAmt(key,g,step){
  const i=ING[key];step=step||5;
  if(i.u==="g"||i.u==="ml")return Math.max(step,Math.round(g/step)*step);
  const us=i.cat==="fruit"?.5:1;
  return Math.max(us,Math.round(g/i.gpu/us)*us)*i.gpu;
}
function amtNum(key,g){
  const i=ING[key];
  if(i.u==="g"||i.u==="ml")return Math.round(g);
  const n=Math.round(g/i.gpu*2)/2;return n%1?n.toFixed(1):n;
}
const fmtAmt=(key,g)=>`<span class="n">${amtNum(key,g)}</span> ${ING[key].u}`;
const fmtPlain=(key,g)=>amtNum(key,g)+" "+ING[key].u;
function buyQty(key,g){const i=ING[key];return (i.u==="g"||i.u==="ml")?Math.ceil(g/50)*50:Math.ceil(g/i.gpu-0.01)}
const fmtBuy=(key,g)=>buyQty(key,g)+" "+ING[key].u;
function cookNote(key,g){
  if(key==="rice"||key==="brownrice"){const b=Math.round(g/80*4)/4;return `約 ${b} 碗飯`}
  if(key==="noodles")return `約 ${Math.round(g/80*4)/4} 份麵`;
  return "";
}
function maintK(){return Math.round(S.weight*S.act/10)*10}
function targets(goal){
  const G=GOALS[goal||S.goal];
  let k=Math.round(maintK()*G.kf/10)*10;
  if(G===GOALS.cut)k=Math.max(k,S.sex==="f"?1200:1500);
  return {k,p:Math.round(S.weight*G.pk),fb:Math.max(G===GOALS.cut?25:0,Math.round(k*14/1000)),ca:1000,fe:S.sex==="f"?15:10,vc:100,veg:3,fruit:2,dairy:1.5,fatR:G.fat,carbR:G.carb};
}
function recipeTags(base){
  const pd=base.p*4/base.k,ff=base.f*9/base.k,t=[];
  if(pd>=.3)t.push("高蛋白");
  if(ff<=.25)t.push("低脂");
  if(base.veg>=2)t.push("蔬菜多");
  if(base.fe>=4)t.push("補鐵");
  if(base.ca>=250)t.push("補鈣");
  if(base.c*4/base.k>=.5&&base.k>=520)t.push("主食足");
  return t.slice(0,3);
}
// 模式偏好：減脂偏高蛋白低脂多蔬菜；增肌偏高蛋白、熱量與主食足
function goalScore(base){
  const pd=base.p*4/base.k,ff=base.f*9/base.k,cf=base.c*4/base.k;
  if(S.goal==="cut")return 90*(pd-.25)-60*Math.max(0,ff-.28)+12*Math.min(1,base.veg/2);
  if(S.goal==="gain")return 60*(pd-.2)+15*Math.min(1,base.k/650)+10*Math.min(1,cf/.5);
  return -20*Math.max(0,ff-.35);
}

/* ---------- 排菜單 ---------- */
function makePlan(){
  const G=GOALS[S.goal],T=targets(),P=Math.max(1,Math.round(S.people)||1);
  const stock={},expDay={};
  S.inv.forEach(it=>{
    stock[it.key]=(stock[it.key]||0)+Math.max(0,+it.qty||0)*ING[it.key].gpu;
    const dl=daysLeft(it.exp);
    if(dl!=null)expDay[it.key]=Math.min(expDay[it.key]==null?Infinity:expDay[it.key],dl);
  });
  const start=Object.assign({},stock);
  const buy={},buyDay={},waste={},hist=[],days=[];
  let fromFridge=0,needTotal=0,curDay=0;
  const urg=k=>expDay[k]==null?99:expDay[k]-curDay; // 距離到期還有幾天（以排到的那天為準）

  function take(key,g){
    if(isPantry(key))return "pantry";
    const need=g*P,have=Math.min(stock[key]||0,need);
    if(have>0)stock[key]-=have;
    needTotal+=need;fromFridge+=have;
    if(need-have>0.5){buy[key]=(buy[key]||0)+need-have;if(buyDay[key]==null)buyDay[key]=curDay}
    return have>=need-0.5?"ok":have>0?"part":"miss";
  }
  function pickSlot(cat,exclude){
    const c=Object.keys(stock).filter(x=>ING[x].cat===cat&&stock[x]>1&&!exclude.has(x)&&allowed(x));
    c.sort((a,b)=>(urg(a)-urg(b))||(stock[b]-stock[a]));
    return c[0]||SLOT_DEFAULT[cat];
  }
  function resolve(r){
    const ex=new Set(r.items.map(x=>mapKey(x[0])));
    return r.items.map(([k,g])=>{
      if(k[0]!=="@")return {key:mapKey(k),g};
      const cat=k.slice(1),key=pickSlot(cat,ex);ex.add(key);
      return {key,g,slot:cat};
    });
  }
  function evalBase(items){const b=Z();for(const it of items)add(b,nut(it.key,it.key==="oil"?it.g*G.oil:it.g));return b}
  function availOf(items){
    let av=0,n=0;
    for(const it of items){if(isPantry(it.key))continue;n++;av+=Math.min(1,(stock[it.key]||0)/(it.g*P))}
    return n?av/n:1;
  }

  const pool=RECIPES.filter(recipeAllowed);
  // 此模式的推薦菜色（依目前冰箱）
  const recs=pool.map(r=>{const items=resolve(r),base=evalBase(items),avail=availOf(items);
    return {r,avail,score:goalScore(base)+avail*60}}).sort((a,b)=>b.score-a.score).slice(0,8);

  for(let d=0;d<7;d++){
    curDay=d;
    // 到期沒用完的食材：從庫存移除，記在「會過期」
    for(const k in expDay)if(expDay[k]<d&&stock[k]>0.5){if(stock[k]>=Math.max(50,ING[k].gpu))waste[k]={g:stock[k],day:expDay[k]};stock[k]=0}
    const day={date:dayDate(d),meals:[],snacks:[],tot:Z(),prep:[]};
    MEALS.forEach(([m,label,share],mi)=>{
      const key=d+m;
      const cands=pool.filter(r=>r.m.includes(m));
      if(!cands.length){day.meals.push({m,label,key,r:null,items:[],tot:Z(),tags:[],alts:[]});return}
      const rnd=rng(S.seed*1009+d*31+mi*7);
      const scored=cands.map(r=>{
        const items=resolve(r),base=evalBase(items),avail=availOf(items);
        let ub=0;
        for(const it of items){
          if(isPantry(it.key)||!(stock[it.key]>0))continue;
          const u=urg(it.key),w=u<=1?30:u<=3?16:u<=5?5:0;ub+=w*Math.min(2,Math.max(.5,stock[it.key]/(it.g*P*2)));
        }
        let v=0;
        for(const h of hist)if(h.id===r.id)v-=(d-h.d<=2?70:25);
        const prev=day.meals[day.meals.length-1];
        if(prev&&prev.r&&prev.main===r.main)v-=20;
        const t=day.tot,gap=(k,w)=>Math.min(base[k],Math.max(0,T[k]-t[k]))/T[k]*w;
        const nb=gap("p",S.goal==="keep"?30:40)+gap("veg",20)+gap("fb",16)+gap("ca",14)+gap("fe",18)+gap("vc",6);
        return {r,items,avail,base,score:avail*100+ub+nb+v+goalScore(base)+rnd()*10};
      }).sort((a,b)=>b.score-a.score);

      const lk=S.locks[key];
      let pick=lk&&scored.find(x=>x.r.id===lk),batch=false;
      if(!pick&&S.batch&&m==="L"&&d>0){ // 昨晚多煮一份的便當
        const pd=days[d-1].meals.find(x=>x.m==="D");
        if(pd&&pd.r&&!pd.r.nb){pick=scored.find(x=>x.r.id===pd.r.id);batch=!!pick}
      }
      pick=pick||scored[0];
      const s=Math.min(G.scale[1],Math.max(G.scale[0],T.k*share*(S.goal==="cut"?.9:1)/pick.base.k));
      const tot=Z();
      const items=pick.items.map(it=>{
        let f=s;
        if(it.key==="oil")f=s*G.oil;
        else if(S.goal==="cut"&&VEG_CATS.includes(ING[it.key].cat))f=Math.max(1,s); // 減脂：蔬菜不縮減
        const g=roundAmt(it.key,it.g*f);
        const urgent=!isPantry(it.key)&&stock[it.key]>0&&urg(it.key)<=3;
        const st=take(it.key,g);
        add(tot,nut(it.key,g));
        return Object.assign({},it,{g,st,urgent});
      });
      add(day.tot,tot);
      day.meals.push({m,label,key,r:pick.r,main:pick.r.main,items,tot,batch,tags:recipeTags(pick.base),locked:!!(lk&&pick.r.id===lk),
        alts:scored.filter(x=>x.r.id!==pick.r.id).slice(0,6).map(x=>({id:x.r.id,n:x.r.n,avail:x.avail,tags:recipeTags(x.base)}))});
      hist.push({d,id:pick.r.id});
    });

    // 加餐：水果、蛋白質、乳品、熱量
    const t=day.tot,used=new Set();
    const snack=(key,g,why)=>{used.add(key);const urgent=stock[key]>0&&urg(key)<=3;const st=take(key,g);add(day.tot,nut(key,g));day.snacks.push({key,g,st,why,urgent})};

    // 清冰箱：今天到期、還剩不少的蔬菜加進晚餐，吐司和水果當加餐
    const dinner=day.meals.find(x=>x.m==="D"&&x.r);
    let extras=0;
    for(const k of Object.keys(stock)){
      if(urg(k)!==0||!allowed(k)||isPantry(k))continue;
      const left=stock[k]/P,i=ING[k];
      if(VEG_CATS.includes(i.cat)&&left>=50&&dinner&&extras<2){
        const g=roundAmt(k,Math.min(left,150));take(k,g);const nt=nut(k,g);add(dinner.tot,nt);add(day.tot,nt);
        dinner.items.push({key:k,g,st:"ok",urgent:true,extra:true});extras++;
      }else if(i.cat==="fruit"&&left>=i.gpu*.5){snack(k,roundAmt(k,Math.min(left,i.gpu*2)),"快到期")}
      else if(k==="toast"&&left>=35&&t.k<T.k*1.05){snack(k,roundAmt(k,Math.min(left,70)),"快到期")}
    }
    const has=(k,min)=>allowed(k)&&(stock[k]||0)>=min;
    if(t.fruit<1.8){
      const k=pickSlot("fruit",new Set());
      snack(k,roundAmt(k,Math.min(S.goal==="cut"?160:200,Math.max(100,(2-t.fruit)*120)),10),"水果");
    }
    const pGap=T.p-t.p;
    if(pGap>T.p*(S.goal==="keep"?.2:.08)&&(S.goal!=="cut"||t.k<T.k)){
      const opt=[["egg",55],["soymilk",300],["edamame",60],["dried_tofu",60],["yogurt",150],["milk",240]].filter(([k])=>allowed(k)&&!used.has(k));
      if(opt.length){
        const [k,g]=opt.find(([k,g])=>has(k,g*P))||opt[0];
        snack(k,k==="egg"&&pGap>15&&S.goal==="gain"?110:g,"蛋白質");
      }
    }
    const room=()=>S.goal!=="cut"||t.k<T.k*1.01;
    if(t.dairy<1.3&&room()){
      let list=(S.goal==="cut"?["yogurt","milk"]:["milk","yogurt"]).filter(k=>allowed(k)&&!used.has(k));
      if(!list.length&&allowed("soymilk")&&!used.has("soymilk"))list=["soymilk"];
      if(list.length){
        const k=list.find(x=>has(x,100))||list[0],cup=ING[k].cup||240;
        snack(k,roundAmt(k,Math.min(S.goal==="cut"?150:300,Math.max(120,(1.5-t.dairy)*cup)),10),"乳品");
      }
    }
    const filler=()=>allowed("nuts")?"nuts":"sweetpotato";
    if(S.goal==="gain"){
      if(t.k<T.k*.95){const k=filler();snack(k,k==="nuts"?roundAmt(k,Math.min(40,Math.max(15,(T.k-t.k)/6)),5):150,"熱量")}
      if(t.k<T.k*.92){const k=allowed("toast")&&has("toast",70)?"toast":"sweetpotato";if(!used.has(k))snack(k,k==="toast"?70:150,"熱量")}
    }else if(t.k<T.k*(S.goal==="cut"?.85:.92)){
      const k=filler();snack(k,k==="nuts"?roundAmt(k,Math.min(30,Math.max(10,(T.k-t.k)/6)),5):120,"熱量");
    }
    days.push(day);
  }

  // 備餐提醒
  const thaw=meals=>[...new Set(meals.filter(m=>m.r&&!m.batch).flatMap(m=>m.items)
    .filter(it=>(ING[it.key].cat==="meat"||ING[it.key].cat==="sea")&&it.key!=="smallfish"&&it.st!=="miss").map(it=>ING[it.key].n))];
  days.forEach((day,d)=>{
    const next=days[d+1];
    for(const k in waste){const w=waste[k];
      if(w.day<0&&d===0)day.prep.push({warn:true,t:`${ING[k].n}已經過期，請確認是否還能吃`});
      else if(w.day===d)day.prep.push({warn:true,t:`${ING[k].n}今天到期，還剩 ${fmtPlain(k,w.g)} 沒排到，記得先處理`});
    }
    if(d===0){const t=thaw(day.meals.filter(m=>m.m!=="B"));if(t.length)day.prep.push({t:`冷凍的${t.join("、")}：早上先移到冷藏退冰`})}
    if(next){
      const t=thaw(next.meals);if(t.length)day.prep.push({t:`冷凍的${t.join("、")}：今晚移到冷藏退冰`});
      const b=next.meals.find(m=>m.batch);if(b)day.prep.push({t:`晚餐「${b.r.n}」多煮一份，裝便當冷藏`});
      if(S.grains&&next.meals.some(m=>m.items.some(it=>it.key==="brownrice")))day.prep.push({t:"糙米先洗好泡水，或設定電鍋預約"});
    }
  });

  const left=Object.keys(stock).filter(k=>stock[k]>0.5).map(k=>({key:k,g:stock[k],unused:Math.abs(stock[k]-start[k])<0.5,exp:expDay[k]}));
  return {T,P,days,buy,buyDay,waste,left,recs,self:needTotal?fromFridge/needTotal:1,expDay};
}

/* ---------- 顯示 ---------- */
const WD="日一二三四五六";
const ROWS=[
  ["k","熱量","kcal"],["p","蛋白質","g"],["fatp","脂肪","占熱量"],["carbp","醣類","占熱量"],
  ["fb","膳食纖維","g"],["ca","鈣","mg"],["fe","鐵","mg"],["vc","維生素 C","mg"],
  ["veg","蔬菜","份"],["fruit","水果","份"],["dairy","乳品","杯"]
];
function pctE(t){const e=t.p*4+t.f*9+t.c*4||1;return {p:t.p*4/e*100,f:t.f*9/e*100,c:t.c*4/e*100}}
function rangeStat(v,[lo,hi]){return v>=lo&&v<=hi?"good":v>=lo-5&&v<=hi+5?"ok":v>hi?"high":"low"}
function cell(key,t,T){
  if(key==="fatp"){const v=pctE(t).f;return {txt:Math.round(v)+"%",s:rangeStat(v,T.fatR)}}
  if(key==="carbp"){const v=pctE(t).c;return {txt:Math.round(v)+"%",s:rangeStat(v,T.carbR)}}
  const r=t[key]/T[key];
  if(key==="k")return {txt:Math.round(r*100)+"%",s:r<.85?"low":r<.93?"ok":r>1.15?"high":r>1.08?"ok":"good"};
  return {txt:Math.round(r*100)+"%",s:r>=1?"good":r>=.8?"ok":"low"};
}
function tgtText(key,T){
  if(key==="fatp")return T.fatR.join("–")+"%";
  if(key==="carbp")return T.carbR.join("–")+"%";
  if(key==="dairy")return "1.5–2 杯";
  const unit={k:"kcal",p:"g",fb:"g",ca:"mg",fe:"mg",vc:"mg",veg:"份",fruit:"份"}[key];
  return (key==="veg"||key==="fruit"?"≥ ":"")+T[key].toLocaleString()+" "+unit;
}
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const w=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-w);const y0=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y0)/DAY+1)/7)}
function dlBadge(dl){
  if(dl==null)return "";
  if(dl<0)return `<span class="dl hot">已過期</span>`;
  if(dl===0)return `<span class="dl hot">今天到期</span>`;
  return `<span class="dl ${dl<=2?"hot":dl<=5?"warm":"cool"}">剩 ${dl} 天</span>`;
}

let PLAN=null,openSlot=null;
const bought=new Set();

function renderModes(){
  $("modes").innerHTML=Object.entries(GOALS).map(([k,G])=>{const T=targets(k);return `
    <button type="button" class="mode" role="tab" data-goal="${k}" id="tab-${k}" aria-selected="${S.goal===k}" aria-controls="memo">
      <span class="mn">${G.n}</span><span class="ms">${G.sub}</span><span class="mk">${T.k.toLocaleString()} kcal・蛋白 ${T.p} g</span>
    </button>`}).join("");
  document.documentElement.style.setProperty("--tab-c",{cut:"var(--tape-b)",keep:"var(--tape-g)",gain:"var(--tape-p)"}[S.goal]);
  $("memo").setAttribute("aria-labelledby","tab-"+S.goal);
}
function renderMemo(){
  const G=GOALS[S.goal];
  $("memo").innerHTML=`
    <div><h3>${G.n}模式怎麼排</h3><ul>${G.tips.map(t=>`<li>${t}</li>`).join("")}</ul></div>
    <div><h3>用你的冰箱，${G.n}推薦這幾道</h3>
      <div class="recs">${PLAN.recs.map(x=>`<span class="rec">${esc(x.r.n)}<span class="n">${Math.round(x.avail*100)}%</span></span>`).join("")||`<span class="hint">沒有符合忌口條件的菜色</span>`}</div>
      <p class="hint" style="margin:6px 0 0">百分比＝冰箱食材齊全度。菜單會優先從這些菜挑，再依當天缺的營養和快到期的食材調整。</p></div>`;
}

function renderSettings(){
  $("sex").value=S.sex;$("weight").value=S.weight;$("act").value=String(S.act);$("people").value=S.people;
  $("staples").checked=!!S.staples;$("diet").value=S.diet;$("grains").value=S.grains?"1":"0";$("batch").checked=!!S.batch;
  $("avoidList").innerHTML=Object.entries(AVOID).map(([k,n])=>`<label class="pill"><input type="checkbox" id="av-${k}" data-avoid="${k}" ${S.avoid.includes(k)?"checked":""}><span>${n}</span></label>`).join("");
  const T=targets(),G=GOALS[S.goal];
  $("targets").innerHTML=`維持熱量 <b>${maintK().toLocaleString()}</b> kcal，${G.n}目標 <b>${T.k.toLocaleString()}</b> kcal<br>蛋白質 <b>${T.p}</b> g・纖維 <b>${T.fb}</b> g・鈣 <b>1000</b> mg・鐵 <b>${T.fe}</b> mg・維C <b>100</b> mg<br>三餐熱量約 24%／32%／28%，其餘由加餐補足${S.people>1?`；份量顯示為每人，扣庫存時乘上 ${S.people} 人`:""}。`;
  const d0=today0(),d6=dayDate(6);
  $("stamp").innerHTML=`<small>WEEK</small><b>${isoWeek(d0)}</b><small>${md(d0)}–${md(d6)}</small>`;
  $("foot").textContent=`營養目標依衛福部《國人膳食營養素參考攝取量》第八版與《每日飲食指南》：維持熱量＝體重 × 活動係數（25／30／35／40 kcal/kg），減脂取 80%（女性不低於 1200、男性不低於 1500 kcal），增肌取 110%；蛋白質 維持 1.1、減脂 1.6、增肌 1.8 g/kg；膳食纖維 14 g／1000 kcal（減脂至少 25 g）；鈣 1000 mg；鐵 女 15／男 10 mg；維生素 C 100 mg；蔬菜 ≥ 3 份（1 份約 100 g 生重）、水果 ≥ 2 份、乳品 1.5–2 杯。食材營養素為參考台灣食品營養成分資料庫的近似值，保存天數為冷藏參考值；油、鹽、醬油、蔥薑蒜等調味料視為家中常備。此工具僅供日常飲食規劃參考，有慢性病、懷孕或特殊飲食需求請諮詢營養師。`;
}

function renderInv(){
  $("ingList").innerHTML=Object.values(ING).filter(i=>i.cat!=="fat"&&!i.custom).map(i=>`<option value="${esc(i.n)}"></option>`).join("");
  $("inv-count").textContent=S.inv.length+" 項";
  $("sampleNote").innerHTML=S.sample?`<p class="note">目前是<b>範例食材</b>，改成你冰箱裡的東西就會重新排。</p>`:"";
  if(!S.inv.length){$("inv").innerHTML=`<p class="empty">冰箱是空的。從上方加入食材，或載入範例看看效果。</p>`;return}
  const groups={};
  S.inv.forEach((it,idx)=>{const c=ING[it.key].cat;(groups[c]=groups[c]||[]).push([it,idx])});
  $("inv").innerHTML=Object.keys(CATS).filter(c=>groups[c]).map(c=>`
    <div class="inv-cat"><span class="label">${CATS[c]}</span>
    ${groups[c].sort((a,b)=>(daysLeft(a[0].exp)??999)-(daysLeft(b[0].exp)??999)).map(([it,idx])=>{const i=ING[it.key];const pantry=isPantry(it.key);const bad=!allowed(it.key);return `
      <div class="inv-row">
        <span class="nmwrap"><span class="nm">${esc(i.n)}${pantry?` <span class="u">（常備）</span>`:""}</span>${bad?`<span class="dl cool">不吃，不會排入</span>`:dlBadge(daysLeft(it.exp))}</span>
        <input class="qty" id="q-${idx}" data-q="${idx}" type="number" min="0" step="any" value="${it.qty}" aria-label="${esc(i.n)} 數量" inputmode="decimal">
        <span class="u">${i.u}</span>
        <input class="exp-in" id="e-${idx}" data-e="${idx}" type="date" value="${it.exp||""}" aria-label="${esc(i.n)} 到期日">
        <button type="button" class="icon-btn" data-del="${idx}" aria-label="移除 ${esc(i.n)}">✕</button>
      </div>`}).join("")}
    </div>`).join("");
}

function renderTiles(){
  const {T,days,buy,self,waste}=PLAN;
  const avgK=days.reduce((s,d)=>s+d.tot.k,0)/7,avgP=days.reduce((s,d)=>s+d.tot.p,0)/7;
  const nLocks=days.reduce((s,d)=>s+d.meals.filter(m=>m.locked).length,0);
  const nWaste=Object.keys(waste).length;
  $("tiles").innerHTML=`
    <div class="tile"><span class="l">每日平均熱量</span><span class="v">${Math.round(avgK).toLocaleString()}<small> / ${T.k.toLocaleString()}</small></span></div>
    <div class="tile"><span class="l">每日平均蛋白質</span><span class="v">${Math.round(avgP)}<small> / ${T.p} g</small></span></div>
    <div class="tile"><span class="l">食材來自冰箱</span><span class="v">${Math.round(self*100)}<small>%</small></span></div>
    <div class="tile"><span class="l">${nWaste?"會過期沒用完":"需要補買"}</span><span class="v">${nWaste||Object.keys(buy).length}<small> 項</small></span></div>`;
  $("board-note").innerHTML=(nLocks?`已鎖定 ${nLocks} 餐（<button type="button" class="linkbtn" data-unlock>全部解除</button>）・`:"")+"點菜名可以換一道，換過的會自動鎖定";
}

function renderHeat(){
  const {T,days}=PLAN;
  const avg=Z();days.forEach(d=>add(avg,d.tot));for(const k in avg)avg[k]/=7;
  let h=`<thead><tr><th scope="col" style="text-align:left">營養素</th><th scope="col">目標</th>${days.map(d=>`<th scope="col"><span class="n">${md(d.date)}</span> ${WD[d.date.getDay()]}</th>`).join("")}<th scope="col">週平均</th></tr></thead><tbody>`;
  for(const [k,n,u] of ROWS){
    h+=`<tr><th scope="row">${n}<small>${u}</small></th><td class="tg">${tgtText(k,T)}</td>`;
    for(const d of days){const c=cell(k,d.tot,T);h+=`<td class="c"><span class="hl s-${c.s}">${c.txt}</span></td>`}
    const c=cell(k,avg,T);h+=`<td class="c avg"><span class="hl s-${c.s}">${c.txt}</span></td></tr>`;
  }
  $("heat").innerHTML=h+"</tbody>";
}

function chip(it){
  const i=ING[it.key];
  const cls=it.st==="pantry"?"pantry":it.st==="miss"?"miss":it.st==="part"?"part":it.urgent?"prio":"";
  const tag=it.st==="miss"?`<span class="x">缺</span>`:it.st==="part"?`<span class="x">少</span>`:"";
  const title=it.st==="pantry"?"常備食材":it.st==="miss"?"冰箱沒有，列入購物清單":it.st==="part"?"冰箱存量不足，差額列入購物清單":it.urgent?"快到期，優先用掉":"冰箱有";
  const cook=cookNote(it.key,it.g);
  return `<span class="chip ${cls}" title="${it.extra?"快到期，加一道清炒／燙青菜用掉":title}">${it.extra?"加菜：":""}${esc(i.n)} ${fmtAmt(it.key,it.g)}${cook?` <span class="cook">（${cook}）</span>`:""}${tag}</span>`;
}

function mealHTML(m){
  if(!m.r)return `<div class="meal" data-m="${m.m}"><div class="meal-top"><span class="mtag">${m.label}</span></div><p class="meal-empty">沒有符合忌口條件的菜色，請調整「不吃的食材」。</p></div>`;
  const open=openSlot===m.key;
  const tags=(m.batch?[`<span class="tag bento">昨晚多煮的便當</span>`]:[]).concat(m.tags.map(t=>`<span class="tag">${t}</span>`));
  return `<div class="meal${m.locked?" locked":""}" data-m="${m.m}">
    <div class="meal-top"><span class="mtag">${m.label}</span>
      <button type="button" class="lock" data-lock="${m.key}" aria-pressed="${m.locked}" title="${m.locked?"解除鎖定":"鎖定這餐，重新排菜單時不會換掉"}">${m.locked?"已鎖定":"鎖定"}</button></div>
    <button type="button" class="dish" data-alt="${m.key}" aria-expanded="${open}">${esc(m.r.n)}<span class="caret">${open?"收起":"換一道"}</span></button>
    <div class="parts">${esc(m.r.d)}<br><span class="kc">${Math.round(m.tot.k)} kcal・蛋白質 ${Math.round(m.tot.p)} g</span></div>
    ${tags.length?`<div class="tags">${tags.join("")}</div>`:""}
    <div class="chips">${m.items.map(chip).join("")}</div>
    ${open?`<div class="alts"><span class="t">其他選擇（冰箱食材齊全度）</span>${m.alts.map(a=>`<button type="button" class="alt" data-pick="${m.key}" data-id="${a.id}"><span>${esc(a.n)}${a.tags.length?`<span class="tg2">${a.tags.join("・")}</span>`:""}</span><span class="pct">${Math.round(a.avail*100)}%</span></button>`).join("")}</div>`:""}
  </div>`;
}

function renderBoard(){
  const {T,days}=PLAN;
  $("board").innerHTML=days.map((d,di)=>{
    const pe=pctE(d.tot);
    const low=[["p","蛋白質"],["fb","纖維"],["ca","鈣"],["fe","鐵"],["vc","維C"],["veg","蔬菜"]].filter(([k])=>d.tot[k]<T[k]*.8)
      .map(([k,n])=>`<span class="flag">${n} ${Math.round(d.tot[k]/T[k]*100)}%</span>`).join("");
    return `<article class="day taped" aria-label="${d.date.getMonth()+1}月${d.date.getDate()}日">
      <div class="dayhead"><div class="datecirc"><span class="mo">${d.date.getMonth()+1}月</span><span class="dd">${d.date.getDate()}</span></div>
        <span class="wd">週${WD[d.date.getDay()]}</span>${di===0?`<span class="today">今天</span>`:""}</div>
      ${d.meals.map(mealHTML).join("")}
      <div class="dayside">
        ${d.prep.length?`<div class="blk"><span class="label">備餐提醒</span><ul class="prep">${d.prep.map(p=>`<li${p.warn?' class="warn"':""}>${esc(p.t)}</li>`).join("")}</ul></div>`:""}
        <div class="blk"><span class="label">加餐</span>
          <div class="chips">${d.snacks.length?d.snacks.map(chip).join(""):`<span class="chip pantry">三餐已足夠</span>`}</div></div>
        <div class="blk"><span class="label">當日合計</span>
          <span class="tot">${Math.round(d.tot.k).toLocaleString()}<small> / ${T.k.toLocaleString()} kcal</small></span>
          <div class="macro" role="img" aria-label="蛋白質 ${Math.round(pe.p)}%、脂肪 ${Math.round(pe.f)}%、醣類 ${Math.round(pe.c)}%"><span class="mp" style="width:${pe.p}%"></span><span class="mf" style="width:${pe.f}%"></span><span class="mc" style="width:${pe.c}%"></span></div>
          <div class="mlegend"><span><i style="background:var(--tape-p)"></i>蛋白 ${Math.round(pe.p)}%</span><span><i style="background:var(--tape-y)"></i>脂肪 ${Math.round(pe.f)}%</span><span><i style="background:var(--tape-g)"></i>醣 ${Math.round(pe.c)}%</span></div>
        </div>
        <div class="flags">${low||`<span class="flag ok">主要營養素皆 ≥ 80%</span>`}</div>
      </div>
    </article>`}).join("");
}

function buyEntries(){
  const order=Object.keys(CATS);
  return Object.entries(PLAN.buy).sort((a,b)=>(PLAN.buyDay[a[0]]-PLAN.buyDay[b[0]])||(order.indexOf(ING[a[0]].cat)-order.indexOf(ING[b[0]].cat)));
}
function renderLists(){
  const b=buyEntries();
  for(const k of [...bought])if(!PLAN.buy[k])bought.delete(k);
  $("buy").innerHTML=b.length?`<ul class="list buy">${b.map(([k,g])=>{
      const bd=PLAN.buyDay[k],life=ING[k].life,short=bd>life;
      return `<li><label for="buy-${k}"><input type="checkbox" id="buy-${k}" data-buy="${k}" ${bought.has(k)?"checked":""}><span>${esc(ING[k].n)} <span class="when">${bd===0?"今天就要用":md(dayDate(bd))+" 起要用"}</span>${short?` <span class="short">冷藏約 ${life} 天，建議 ${md(dayDate(bd-1))} 再買或買冷凍的</span>`:""}</span></label><span class="amt">${fmtBuy(k,g)}</span></li>`}).join("")}</ul>
      <div class="buy-actions"><button type="button" class="btn small" id="addBought" ${bought.size?"":"disabled"}>把勾選的加入冰箱</button><span class="hint">買好後勾起來，會用建議量加進冰箱庫存</span></div>`
    :`<p class="empty">冰箱的食材就夠了，這週不用補買。</p>`;
  const L=PLAN.left.filter(l=>!isPantry(l.key));
  const W=Object.entries(PLAN.waste);
  $("left").innerHTML=(L.length?`<ul class="list check">${L.map(l=>`<li><span>${esc(ING[l.key].n)}${l.unused?`<span class="star" style="color:var(--muted)">未排入</span>`:""}${l.exp!=null&&l.exp<=9?`<span class="star">${md(dayDate(l.exp))} 到期</span>`:""}</span><span class="amt">${fmtAmt(l.key,l.g)}</span></li>`).join("")}</ul>`
    :`<p class="empty">一週下來冰箱食材剛好用完。</p>`)
    +(W.length?`<div class="waste"><h3>這週會過期、沒排到的</h3><ul class="list">${W.map(([k,w])=>`<li><span>${esc(ING[k].n)} <span class="when">${w.day<0?"已過期":md(dayDate(w.day))+" 到期"}</span></span><span class="amt">${fmtAmt(k,w.g)}</span></li>`).join("")}</ul><p class="hint" style="margin:6px 0 0">可以改到期日（例如已冷凍），或手動換成用到這些食材的菜。</p></div>`:"");
}

function renderPlan(){
  PLAN=makePlan();
  renderModes();renderMemo();renderTiles();renderHeat();renderBoard();renderLists();
}
function renderAll(){renderSettings();renderInv();renderPlan()}
function changed(inv){if(inv)S.sample=false;save();}

/* ---------- 庫存操作 ---------- */
function addToInv(key,qty,exp){
  const ex=S.inv.find(x=>x.key===key);
  if(ex){
    ex.qty=+(ex.qty+qty).toFixed(2);
    if(exp&&(!ex.exp||exp<ex.exp))ex.exp=exp; // 同一種食材以較早的到期日為準
  }else S.inv.push({key,qty,exp:exp||null});
}

/* ---------- 事件 ---------- */
function setGoal(g){S.goal=g;openSlot=null;save();renderSettings();renderPlan();$("tab-"+g).focus()}
$("modes").addEventListener("click",e=>{const b=e.target.closest("[data-goal]");if(b&&b.dataset.goal!==S.goal)setGoal(b.dataset.goal)});
$("modes").addEventListener("keydown",e=>{
  if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;
  const ks=Object.keys(GOALS),i=ks.indexOf(S.goal);
  setGoal(ks[(i+(e.key==="ArrowRight"?1:2))%3]);
});
["sex","weight","act","people","staples","diet","grains","batch"].forEach(id=>$(id).addEventListener("change",()=>{
  S.sex=$("sex").value;
  S.weight=Math.min(150,Math.max(30,+$("weight").value||55));
  S.act=+$("act").value;
  S.people=Math.min(10,Math.max(1,Math.round(+$("people").value)||1));
  S.staples=$("staples").checked;
  S.diet=$("diet").value;
  S.grains=$("grains").value==="1";
  S.batch=$("batch").checked;
  changed();renderAll();
}));
$("avoidList").addEventListener("change",e=>{
  const k=e.target.dataset.avoid;if(!k)return;
  S.avoid=e.target.checked?[...new Set(S.avoid.concat(k))]:S.avoid.filter(x=>x!==k);
  changed();renderInv();renderPlan();
});

const findIng=name=>Object.values(ING).find(i=>i.n===name.trim()&&i.cat!=="fat");
function metaHint(html){$("addMeta").innerHTML=html}
$("addName").addEventListener("input",()=>{
  const name=$("addName").value.trim(),i=findIng(name);
  if(!name){metaHint(`<span class="hint">單位與到期日會依食材自動帶入</span>`);return}
  if(i){
    metaHint(`<span class="hint">單位：${i.u}${i.u!=="g"&&i.u!=="ml"?`（1 ${i.u} 約 ${i.gpu} g）`:""}・冷藏約 ${i.life} 天</span>`);
    $("addExp").value=addDays(i.life);return;
  }
  if(!$("addCat")){
    metaHint(`<select id="addCat" aria-label="自訂食材類別"><option value="leafy">葉菜類</option><option value="veg">其他蔬菜</option><option value="mush">菇藻類</option><option value="fruit">水果</option></select> <span class="hint">自訂食材（g）</span>`);
    $("addExp").value=addDays(CUSTOM_LIFE.leafy);
  }
});
$("addMeta").addEventListener("change",e=>{if(e.target.id==="addCat")$("addExp").value=addDays(CUSTOM_LIFE[e.target.value])});
$("addForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("addName").value.trim(),qty=+$("addQty").value,exp=$("addExp").value||null;
  if(!name||!(qty>0)){(name?$("addQty"):$("addName")).focus();return}
  let i=findIng(name);
  if(!i){
    const cat=$("addCat")?$("addCat").value:"veg";
    const c={key:"c_"+Date.now().toString(36),n:name.slice(0,20),cat};
    S.custom.push(c);registerCustom(c);i=ING[c.key];
  }
  addToInv(i.key,qty,exp);
  $("addName").value="";$("addQty").value="";$("addExp").value="";
  metaHint(`<span class="hint">已加入 ${esc(i.n)} ${qty} ${i.u}</span>`);
  changed(true);renderInv();renderPlan();$("addName").focus();
});
$("inv").addEventListener("change",e=>{
  const q=e.target.dataset.q,x=e.target.dataset.e;
  if(q!=null){S.inv[+q].qty=Math.max(0,+e.target.value||0);changed(true);renderPlan()}
  if(x!=null){S.inv[+x].exp=e.target.value||null;changed(true);renderInv();renderPlan()}
});
$("inv").addEventListener("click",e=>{
  const d=e.target.closest("[data-del]");if(!d)return;
  const it=S.inv.splice(+d.dataset.del,1)[0];
  if(ING[it.key].custom)S.custom=S.custom.filter(c=>c.key!==it.key);
  changed(true);renderInv();renderPlan();
});
$("loadSample").addEventListener("click",()=>{const s=sample();S.inv=s.inv;S.sample=true;S.locks={};save();renderAll()});
let clearArmed=false;
$("clearInv").addEventListener("click",()=>{
  if(!clearArmed){clearArmed=true;$("clearInv").textContent="再按一次確認清空";setTimeout(()=>{clearArmed=false;$("clearInv").textContent="清空冰箱"},3000);return}
  clearArmed=false;$("clearInv").textContent="清空冰箱";
  S.inv=[];S.custom=[];S.locks={};changed(true);renderAll();
});
$("reroll").addEventListener("click",()=>{S.seed=(S.seed*7+13)%100003;openSlot=null;save();renderPlan()});
$("board").addEventListener("click",e=>{
  const a=e.target.closest("[data-alt]"),p=e.target.closest("[data-pick]"),l=e.target.closest("[data-lock]");
  if(p){S.locks[p.dataset.pick]=p.dataset.id;openSlot=null;save();renderPlan();return}
  if(l){
    const k=l.dataset.lock,m=PLAN.days.flatMap(d=>d.meals).find(x=>x.key===k);
    if(m&&m.locked)delete S.locks[k];else if(m&&m.r)S.locks[k]=m.r.id;
    save();renderPlan();return;
  }
  if(a){openSlot=openSlot===a.dataset.alt?null:a.dataset.alt;renderBoard()}
});
$("board-note").addEventListener("click",e=>{if(e.target.closest("[data-unlock]")){S.locks={};save();renderPlan()}});
$("buy").addEventListener("change",e=>{
  const k=e.target.dataset.buy;if(!k)return;
  if(e.target.checked)bought.add(k);else bought.delete(k);
  $("addBought").disabled=!bought.size;
});
$("buy").addEventListener("click",e=>{
  if(e.target.id!=="addBought"||!bought.size)return;
  for(const k of bought){if(PLAN.buy[k])addToInv(k,buyQty(k,PLAN.buy[k]),addDays(ING[k].life))}
  const n=bought.size;bought.clear();
  changed(true);renderInv();renderPlan();
  const h=document.querySelector("#buy .hint");if(h)h.textContent=`已把 ${n} 項加進冰箱`;
});
$("copyBuy").addEventListener("click",()=>{
  const txt="購物清單\n"+buyEntries().map(([k,g])=>"□ "+ING[k].n+" "+fmtBuy(k,g)).join("\n");
  const btn=$("copyBuy");
  const fallback=()=>{
    let ta=document.querySelector("textarea.copybox");
    if(!ta){ta=document.createElement("textarea");ta.className="copybox";ta.readOnly=true;ta.id="copybox";$("buy").appendChild(ta)}
    ta.value=txt;ta.select();btn.textContent="請手動複製";
  };
  try{navigator.clipboard.writeText(txt).then(()=>{btn.textContent="已複製";setTimeout(()=>btn.textContent="複製清單",1800)},fallback)}catch(err){fallback()}
});

renderAll();
})();
