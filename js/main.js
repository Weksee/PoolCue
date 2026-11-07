/* Pool&Cue — общий скрипт: меню, подвал, модальные окна, формы, карточки */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>n.toLocaleString('ru-RU')+' ₽';
const NAV=[['index.html','Главная'],['catalog.html','Каталог'],['tournaments.html','Турниры'],['about.html','О клубе']];
const ICON={table:'<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M6 17v3M18 17v3"/>',bar:'<path d="M5 4h14l-6 8v6h3M11 18H8M12 12 5 4"/>',cup:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M12 13v4M9 20h6"/>',cue:'<path d="m4 20 14-14M16 4l4 4M3 21l2-2"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

/* шапка и подвал */
let cur=location.pathname.split('/').pop()||'index.html';if(['table.html','sports.html','menu.html'].includes(cur))cur='catalog.html';
$('#site-header').innerHTML=`<header class="header" id="header"><div class="container flex items-center justify-between gap-4 h-[76px]"><a href="index.html" class="logo" aria-label="Pool&Cue — на главную"><span class="logo__ball">8</span><span class="logo__text">Pool<span class="logo__amp">&amp;</span>Cue</span></a><nav class="nav" id="nav" aria-label="Основное меню">${NAV.map(([h,t])=>`<a class="nav__link${cur===h?' nav__link--active':''}" href="${h}">${t}</a>`).join('')}<a class="btn btn--primary btn--sm nav__cta" href="catalog.html">Забронировать стол</a></nav><button class="burger" id="burger" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span><span></span></button></div></header>`;
const fi=p=>`<svg class="footer__ic" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={pin:'<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'};
$('#site-footer').innerHTML=`<footer class="footer"><div class="container footer__grid"><div class="footer__brand"><a href="index.html" class="logo"><span class="logo__ball">8</span><span class="logo__text">Pool<span class="logo__amp">&amp;</span>Cue</span></a><p>Бильярдный клуб с профессиональными столами, баром и турнирами. Бронируйте стол онлайн и приходите играть.</p></div><div class="footer__col footer__col--center"><h4 class="footer__h">Разделы</h4><ul class="footer__list">${NAV.map(([h,t])=>`<li><a href="${h}">${t}</a></li>`).join('')}</ul></div><div class="footer__col"><h4 class="footer__h">Контакты</h4><ul class="footer__contacts"><li>${fi(IC.pin)}<span>г. Москва, ул. Рабочая, 14</span></li><li>${fi(IC.phone)}<a href="tel:+74950000000">+7 (495) 000-00-00</a></li><li>${fi(IC.clock)}<span>Пн–Чт: 12:00–02:00<br>Пт–Сб: 12:00–04:00<br>Вс: 12:00–01:00</span></li><li>${fi(IC.mail)}<a href="mailto:hello@poolandcue.ru">hello@poolandcue.ru</a></li></ul></div></div><div class="footer__bottom">© 2026 Pool&amp;Cue. Все права защищены.</div></footer><button class="to-top" id="toTop" aria-label="Наверх"><span class="to-top__dot">↑</span></button>`;
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
