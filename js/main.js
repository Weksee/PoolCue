/* Pool&Cue — общий скрипт: меню, подвал, модальные окна, формы, карточки */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const NAV=[['index.html','Главная'],['catalog.html','Каталог'],['tournaments.html','Турниры'],['about.html','О клубе'],['contacts.html','Контакты']];
const ICON={table:'<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M6 17v3M18 17v3"/>',bar:'<path d="M5 4h14l-6 8v6h3M11 18H8M12 12 5 4"/>',cup:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M12 13v4M9 20h6"/>',cue:'<path d="m4 20 14-14M16 4l4 4M3 21l2-2"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
/* ===== хранилище, вход, занятость столов (без сервера: localStorage) ===== */
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const hash=s=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
const Auth={
 users:()=>LS.get('pc_users',[]),
 me(){const e=LS.get('pc_session',null);return this.users().find(u=>u.email===e)||null},
 register({name,email,phone,pass}){email=email.trim().toLowerCase();const us=this.users();if(us.some(u=>u.email===email))return 'Аккаунт с такой почтой уже существует';us.push({name:name.trim(),email,phone:phone.trim(),pass:hash(pass)});LS.set('pc_users',us);LS.set('pc_session',email);return ''},
 login(email,pass){email=email.trim().toLowerCase();const u=this.users().find(x=>x.email===email);if(!u||u.pass!==hash(pass))return 'Неверная почта или пароль';LS.set('pc_session',email);return ''},
 logout(){LS.set('pc_session',null)}};
const Store=(key,pre)=>({all:()=>LS.get(key,[]),
 mine(){const u=Auth.me();return u?this.all().filter(x=>x.user===u.email):[]},
 add(o){const r={id:pre+Math.floor(1000+Math.random()*9000),user:Auth.me().email,created:Date.now(),status:'active',...o};LS.set(key,[...this.all(),r]);return r},
 update(id,p){LS.set(key,this.all().map(x=>x.id===id?{...x,...p}:x))}});
const Bookings=Store('pc_bookings','PC-'),Orders=Store('pc_orders','BAR-'),Waitlist=Store('pc_waitlist','WL-');
/* занятость: часть вечерних слотов «занята» по умолчанию (демо) + реальные брони из браузера */
const Slots={
 pseudo:(id,d,h)=>h>=17&&hash(id+d+h).charCodeAt(0)%6===0,
 taken(id,d,h){return this.pseudo(id,d,h)||Bookings.all().some(b=>b.status==='active'&&b.tableId==id&&b.date===d&&h>=+b.time.slice(0,2)&&h<+b.time.slice(0,2)+b.hours)},
 busyHours(id,d,from,n){const r=[];for(let h=from;h<from+n;h++)if(this.taken(id,d,h%24))r.push(h%24);return r}};
let LANG=(()=>{try{return localStorage.getItem('pc_lang')||'ru'}catch(_){return 'ru'}})();

/* шапка и подвал */
let cur=location.pathname.split('/').pop()||'index.html';if(['table.html','sports.html','menu.html'].includes(cur))cur='catalog.html';
const me0=Auth.me();
const tools=`<div class="tools"><button class="tools__btn lang" id="langBtn" type="button" aria-label="Сменить язык"><span data-l="ru">RU</span>/<span data-l="en">EN</span></button><button class="tools__btn" id="themeBtn" type="button" aria-label="Сменить тему"><svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8z"/></svg><svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button><a class="tools__btn tools__acc" href="${me0?'account.html':'auth.html'}">${me0?esc(me0.name.split(' ')[0]):'Войти'}</a></div>`;
$('#site-header').innerHTML=`<header class="header" id="header"><div class="container flex items-center justify-between gap-4 h-[76px]"><a href="index.html" class="logo" aria-label="Pool&Cue — на главную"><span class="logo__ball">8</span><span class="logo__text">Pool<span class="logo__amp">&amp;</span>Cue</span></a><nav class="nav" id="nav" aria-label="Основное меню">${NAV.map(([h,t])=>`<a class="nav__link${cur===h?' nav__link--active':''}" href="${h}">${t}</a>`).join('')}<a class="btn btn--primary btn--sm nav__cta" href="catalog.html">Забронировать стол</a></nav>${tools}<button class="burger" id="burger" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span><span></span></button></div></header>`;
const fi=p=>`<svg class="footer__ic" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'};
$('#site-footer').innerHTML=`<footer class="footer"><div class="container footer__grid"><div class="footer__brand"><a href="index.html" class="logo"><span class="logo__ball">8</span><span class="logo__text">Pool<span class="logo__amp">&amp;</span>Cue</span></a><p>Бильярдный клуб с профессиональными столами, баром и турнирами. Бронируйте стол онлайн и приходите играть.</p></div><div class="footer__col footer__col--center"><h4 class="footer__h">Разделы</h4><ul class="footer__list">${[...NAV,['reviews.html','Отзывы']].map(([h,t])=>`<li><a href="${h}">${t}</a></li>`).join('')}</ul></div><div class="footer__col"><h4 class="footer__h">Контакты</h4><ul class="footer__contacts"><li>${fi(IC.pin)}<span>г. Москва, ул. Рабочая, 14</span></li><li>${fi(IC.phone)}<a href="tel:+74950000000">+7 (495) 000-00-00</a></li><li>${fi(IC.clock)}<span>Пн–Чт: 12:00–02:00<br>Пт–Сб: 12:00–04:00<br>Вс: 12:00–01:00</span></li><li>${fi(IC.mail)}<a href="mailto:hello@poolandcue.ru">hello@poolandcue.ru</a></li></ul></div></div><div class="footer__bottom">© 2026 Pool&amp;Cue. Все права защищены.</div></footer><button class="to-top" id="toTop" aria-label="Наверх"><span class="to-top__dot">↑</span></button>`;
const header=$('#header'),toTop=$('#toTop'),nav=$('#nav'),burger=$('#burger');
addEventListener('scroll',()=>{header.classList.toggle('header--scrolled',scrollY>10);toTop.classList.toggle('to-top--show',scrollY>500)},{passive:true});
toTop.onclick=()=>scrollTo({top:0,behavior:'smooth'});
burger.onclick=()=>{const o=nav.classList.toggle('nav--open');burger.setAttribute('aria-expanded',o)};

/* хлебные крошки: data-trail="Текущая страница" или crumbs([[текст,ссылка],[текст]]) */
function crumbs(list){const el=$('.crumbs');if(!el)return;const all=[['Главная','index.html'],...list];el.innerHTML=all.map(([t,h],i)=>h?`<a href="${h}">${t}</a><span class="crumbs__sep">/</span>`:`<span aria-current="page">${t}</span>`).join('')}
{const c=$('.crumbs');if(c&&c.dataset.trail)crumbs([[c.dataset.trail]])}

/* уведомления */
function toast(msg,err){const t=document.createElement('div');t.className='toast'+(err?' toast--error':'');t.setAttribute('role','status');t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),4200)}

/* модальное окно */
function openModal(html,wide){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="modal__box" role="dialog" aria-modal="true" style="${wide?'width:min(980px,100%)':''}"><button class="modal__close" aria-label="Закрыть">×</button>${html}</div>`;
const close=()=>{m.remove();document.body.style.overflow='';removeEventListener('keydown',esc)};const esc=e=>e.key==='Escape'&&close();
m.onclick=e=>{if(e.target===m||e.target.closest('.modal__close')||e.target.closest('[data-close]'))close()};addEventListener('keydown',esc);
document.body.append(m);document.body.style.overflow='hidden';$('.modal__close',m).focus();m.close=close;return m}

/* валидация: data-rule="required phone email date minlen:2 agree" */
const RULES={required:v=>v.trim()?'':'Заполните это поле',agree:v=>v?'':'Нужно ваше согласие',
phone:v=>/^(\+7|8)[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}$/.test(v.trim())?'':'Введите телефон в формате +7 900 123-45-67',
email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?'':'Введите почту в формате name@mail.ru',
minlen:(v,n)=>v.trim().length>=+n?'':`Минимум символов: ${n}`,
date:v=>{if(!v)return 'Выберите дату';const t=new Date();t.setHours(0,0,0,0);return new Date(v+'T00:00')<t?'Дата не может быть раньше сегодняшней':''}};
function setError(el,msg){const box=el.closest('.field');box.classList.toggle('field--error',!!msg);let m=$('.field__msg',box);if(!m){m=document.createElement('p');m.className='field__msg';box.append(m)}m.textContent=msg||'';el.setAttribute('aria-invalid',!!msg)}
function validateForm(f){let ok=true,first;$$('[data-rule]',f).forEach(el=>{const v=el.type==='checkbox'?(el.checked?'1':''):el.value;let err='';for(const r of el.dataset.rule.split(' ')){const[n,a]=r.split(':');err=RULES[n](v,a);if(err)break}setError(el,err);if(err){ok=false;first=first||el}});if(first)first.focus();return ok}
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.rule&&e.target.closest('.field--error'))setError(e.target,'')});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.rule&&e.target.closest('.field--error'))setError(e.target,'')});

/* карточка стола и быстрый просмотр */
function cardHTML(t){return `<article class="card"><div class="card__media" data-quick="${t.id}" role="button" tabindex="0" aria-label="Быстрый просмотр: стол «${t.name}»"><img src="images/${t.img}" alt="Стол «${t.name}»: ${TYPES[t.type]}, ${t.hall}" loading="lazy"><div class="card__badges">${t.tags.map(g=>`<span class="badge badge--${TAGS[g]}">${g}</span>`).join('')}</div><span class="card__zoom" aria-hidden="true">+</span></div><div class="card__body"><p class="card__meta">${TYPES[t.type]}, ${t.size}, ${t.hall}</p><h3 class="card__title">${t.name}</h3><div class="card__foot"><p class="card__price">${money(t.price)} <small>/ час</small></p><a class="btn btn--ghost btn--sm" href="table.html?id=${t.id}">Забронировать</a></div></div></article>`}
function quickView(id){const t=TABLES.find(x=>x.id==id);openModal(`<div class="modal__grid"><div class="media"><img src="images/${t.img}" alt="Стол «${t.name}»"></div><div class="modal__body"><div class="flex flex-wrap gap-2">${t.tags.map(g=>`<span class="badge badge--${TAGS[g]}">${g}</span>`).join('')}</div><h3 class="text-3xl">${t.name}</h3><p class="text-[color:var(--muted)] text-sm">${TYPES[t.type]}, ${t.size}, ${t.hall}</p><p>${t.desc}</p><p class="card__price">${money(t.price)} <small>/ час</small></p><a class="btn btn--primary" href="table.html?id=${t.id}">Перейти к бронированию</a></div></div>`)}
document.addEventListener('click',e=>{const q=e.target.closest('[data-quick]');if(q)quickView(q.dataset.quick)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.card__media[data-quick]')){e.preventDefault();quickView(e.target.dataset.quick)}});

/* анимация чисел */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const n=+e.target.dataset.count,s=performance.now();(function f(t){const p=Math.min((t-s)/1400,1);e.target.textContent=Math.round(n*(1-Math.pow(1-p,3))).toLocaleString('ru-RU');if(p<1)requestAnimationFrame(f)})(s)}),{threshold:.5});
$$('[data-count]').forEach(el=>io.observe(el));

/* ===== общие функции: вход, лист ожидания, отмена, отзывы ===== */
const fmtDate=d=>new Date(d+'T00:00').toLocaleDateString(LANG==='en'?'en-GB':'ru-RU',{day:'numeric',month:'long'});
const overlap=(a,b)=>{const s=x=>+x.time.slice(0,2);return s(a)<s(b)+b.hours&&s(b)<s(a)+a.hours};
function needAuth(fn){if(Auth.me())return fn();const next=encodeURIComponent(location.pathname.split('/').pop()+location.search);
 openModal(`<div class="modal__body"><h3 class="text-2xl">Нужен вход</h3><p>Чтобы продолжить, войдите в аккаунт или создайте новый.</p><div class="flex flex-wrap gap-3"><a class="btn btn--primary" href="auth.html?next=${next}">Войти</a><a class="btn btn--ghost" href="auth.html?tab=register&next=${next}">Регистрация</a></div></div>`)}
function addWait(info){const dup=Waitlist.mine().some(w=>w.status==='waiting'&&w.tableId===info.tableId&&w.date===info.date&&overlap(w,info));if(dup){toast('Вы уже в листе ожидания на это время',true);return}Waitlist.add({...info,status:'waiting'});toast('Вы в листе ожидания. Статус виден в разделе «Мои брони»')}
function offerWait(info){const m=openModal(`<div class="modal__body"><h3 class="text-2xl">Стол занят</h3><p>Стол «${esc(info.table)}» на ${fmtDate(info.date)} в ${info.time} занят. Встаньте в лист ожидания: если время освободится, статус заявки изменится.</p><div class="flex flex-wrap gap-3"><button class="btn btn--primary" data-w type="button">Встать в лист ожидания</button><button class="btn btn--ghost" data-close type="button">Закрыть</button></div></div>`);
 $('[data-w]',m).onclick=()=>{m.close();needAuth(()=>addWait(info))}}
function cancelBooking(id){const b=Bookings.all().find(x=>x.id===id);if(!b)return false;
 if(new Date(b.date+'T'+b.time)-Date.now()<3*3600e3){toast('Отмена возможна не позднее чем за 3 часа до начала. Позвоните нам',true);return false}
 Bookings.update(id,{status:'cancelled'});
 Waitlist.all().forEach(w=>{if(w.status==='waiting'&&w.tableId===b.tableId&&w.date===b.date&&overlap(w,b))Waitlist.update(w.id,{status:'free'})});return true}
const stars=n=>'★'.repeat(n)+'<i>'+'★'.repeat(5-n)+'</i>';
const shortName=n=>{const p=n.trim().split(/\s+/);return p[0]+(p[1]?' '+p[1][0]+'.':'')};
const allReviews=()=>[...LS.get('pc_reviews',[]),...REVIEWS].sort((a,b)=>b.date.localeCompare(a.date)||String(b.id).localeCompare(String(a.id)));
const ratingStat=()=>{const l=allReviews(),n=l.length;return{n,avg:n?l.reduce((s,r)=>s+r.rating,0)/n:0,dist:[5,4,3,2,1].map(k=>l.filter(r=>r.rating===k).length)}};
const reviewHTML=r=>`<article class="review"><div class="review__head"><div><b>${esc(r.name)}</b><p class="rec__meta">${r.table?'Стол «'+esc(r.table)+'», ':''}${fmtDate(r.date)}</p></div><span class="stars" role="img" aria-label="Оценка ${r.rating} из 5">${stars(r.rating)}</span></div><p class="review__text">${esc(r.text)}</p></article>`;

/* ===== тема ===== */
$('#themeBtn').onclick=()=>{const t=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=t;try{localStorage.setItem('pc_theme',t)}catch(_){}};

/* ===== язык: словарь DICT_EN в data.js, переводятся тексты страницы и подсказки ===== */
const ATTRS=['placeholder','aria-label','title'];
const pat=t=>{for(const[r,f]of PATTERNS){const x=t.match(r);if(x)return f(x)}return null};
function tNode(n){
 if(n.__ru!==undefined&&n.nodeValue===n.__tr){if(LANG==='ru'){n.nodeValue=n.__ru;n.__ru=undefined}return}
 n.__ru=undefined;if(LANG!=='en')return;
 const t=n.nodeValue.trim(),e=DICT_EN[t]||pat(t);if(e){n.__ru=n.nodeValue;n.__tr=n.nodeValue.replace(t,e);n.nodeValue=n.__tr}}
function tAttr(el){for(const a of ATTRS){if(!el.hasAttribute(a))continue;const k='__ru_'+a,v=el.getAttribute(a);
 if(el[k]!==undefined&&v===el[k+'t']){if(LANG==='ru'){el.setAttribute(a,el[k]);el[k]=undefined}continue}
 el[k]=undefined;if(LANG!=='en')continue;const e=DICT_EN[v.trim()];if(e){el[k]=v;el[k+'t']=e;el.setAttribute(a,e)}}}
function walkT(root){if(root.nodeType===3)return tNode(root);if(root.nodeType!==1)return;
 const w=document.createTreeWalker(root,4);let n;while((n=w.nextNode()))tNode(n);
 [root,...root.querySelectorAll('[placeholder],[aria-label],[title]')].forEach(tAttr)}
const langObs=new MutationObserver(ms=>{langObs.disconnect();ms.forEach(m=>m.type==='characterData'?tNode(m.target):m.addedNodes.forEach(walkT));langOn()});
const langOn=()=>langObs.observe(document.body,{childList:true,subtree:true,characterData:true});
const syncLang=()=>{document.documentElement.lang=LANG;$$('#langBtn [data-l]').forEach(s=>s.classList.toggle('on',s.dataset.l===LANG))};
$('#langBtn').onclick=()=>{LANG=LANG==='ru'?'en':'ru';try{localStorage.setItem('pc_lang',LANG)}catch(_){}langObs.disconnect();walkT(document.body);langOn();syncLang()};
syncLang();walkT(document.body);langOn();
