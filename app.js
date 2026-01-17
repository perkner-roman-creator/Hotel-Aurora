/* Aurora Hotel Booking – klient (localStorage)
  - Inventář pokojů dle typu
  - Kontrola překryvu termínů
  - Výpočet ceny + DPH
  - Uložení rezervace, zobrazení a storno
  - i18n (CZ/EN), Admin panel, export CSV
*/

const INVENTORY = {
  standard: { title: "Standard", price: 1890, capacity: 2, rooms: 60 },
  deluxe: { title: "Deluxe", price: 2890, capacity: 3, rooms: 40 },
  suite: { title: "Suite", price: 4490, capacity: 4, rooms: 20 },
};

const VAT_RATE = 0.12; // 12 %
const LS_KEY = "aurora_reservations";
const LS_LANG = "aurora_lang";
const LS_THEME = "aurora_theme";
const EUR_RATE = 25; // CZK per EUR for display

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// i18n
let CURRENT_LANG = localStorage.getItem(LS_LANG) || "cs";
const I18N = {
  cs: {
    banner: { offer: "🎆 Novoroční sleva! 25% na všechny pokoje do 31.1. | Kód: " },
    nav: { about: "O hotelu", rooms: "Pokoje", amenities: "Služby", gallery: "Galerie", location: "Lokalita", contact: "Kontakt", book: "Rezervovat" },
    hero: { title: "Hotel Aurora Praha", subtitle: "Moderní elegance v srdci Evropy. Prožijte výjimečný pobyt v našich luxusních pokojích s výhledem na Prahu.", cta: "Zarezervujte si svůj pobyt již dnes" },
    about: { title: "O hotelu", text: "Aurora je elegantní hotel v Praze spojující nadčasový design. Nabízíme wellness, špičkovou gastronomii a klidné zázemí pro váš odpočinek i práci.", li1:"Centrum Prahy, výborná dostupnost MHD", li2:"Wellness & fitness, 24/7 recepce", li3:"Konferenční prostory a pracovny", boxTitle:"Rychlá dostupnost", boxText:"5 min od Staroměstského náměstí, 20 min z letiště. Garance pozdního příjezdu.", rating:"Hodnocení hostů", rooms:"Pokojů", metro:"od metra" },
    rooms: { title:"Pokoje", standard:"Komfortní pokoj s king-size postelí, chytrou TV a pracovním koutem.", deluxe:"Více prostoru, káva na pokoji a výhled na město. Ideální pro delší pobyty.", suite:"Samostatný obývací prostor, vana a prémiové vybavení. Pro výjimečné chvíle.", capacity2:"Kapacita 2", capacity3:"Kapacita 3", capacity4:"Kapacita 4", book:"Rezervovat" },
    amenities: { title:"Služby a vybavení", wellness:"Spa & wellness", food:"Bar & terasa", conf:"Konferenční sály", transfer:"Letištní transfer", gym:"Fitness centrum", wifi:"WiFi v celém hotelu", parking:"Parkování", business:"Business centrum", accessible:"Bezbariérový přístup", roomservice:"Pokojová služba", nonsmoking:"Nekuřácké pokoje", evcharging:"Nabíjecí stanice EV" },
    trust: { asSeen:"Viděli jste nás v", award1:"Traveller's Choice 2025", award2:"Michelin Guide Stay" },
    faq: {
      title: "Časté dotazy",
      q1: "Jaký je čas check‑in a check‑out?",
      a1: "Check‑in od 14:00, check‑out do 11:00. Pozdní odjezd dle dostupnosti.",
      q2: "Nabízíte pozdní check‑out?",
      a2: "Ano, na vyžádání. Potvrzení závisí na obsazenosti, případně s malým příplatkem.",
      q3: "Je k dispozici parkování?",
      a3: "Spolupracujeme s nedalekým krytým parkovištěm. Doporučujeme rezervaci předem.",
      q4: "Je v ceně zahrnuta snídaně?",
      a4: "Snídaně formou bufetu je dostupná denně 7:00–10:30. Balíčky se snídaní zvýhodněně.",
      q5: "Jaké jsou storno podmínky?",
      a5: "Flex tarif lze zrušit zdarma do 24 h před příjezdem. U předplacených tarifů platí zvláštní podmínky.",
      q6: "Je možné mít na pokoji domácí zvířátko?",
      a6: "Ano, vybrané pokoje jsou pet‑friendly. Prosíme o nahlášení předem; účtujeme malý poplatek za úklid. Asistenční psi zdarma. Max. 1 domácí mazlíček na pokoj."
    },
    testimonials: { title:"Co říkají hosté", t1:"Nejlepší postel, ve které jsem spal a skvělé snídaně s výhledem na Pražský hrad.", t2:"Přijeli jsme s rodinou a každý z nás si zde našel, co hledal. Hotel se opravdu stará o své hosty.", t3:"Praha je kouzelná, ale bez tohoto hotelu si ji nedokážu představit. Vracím se sem pořád, protože tady se opravdu cítím jako doma." },
    gallery: { title:"Galerie", capLobby:"Lobby & lounge", capRoom:"Designové pokoje", capDining:"Autorská gastronomie", capSpa:"Spa & wellness", capBar:"Signature bar", capBreakfast:"Champagne snídaně" },
    booking: { title:"Online rezervace", checkin:"Příjezd", checkout:"Odjezd", roomType:"Typ pokoje", guests:"Počet osob", roomsCount:"Počet pokojů", name:"Jméno a příjmení", namePh:"Jan Novák", email:"E-mail", emailPh:"jan.novak@example.com", phone:"Telefon", phonePh:"+420 123 456 789", check:"Zkontrolovat dostupnost", submit:"Dokončit rezervaci" },
    progress: { dates:"Datum a pokoj", details:"Osobní údaje", confirm:"Potvrzení" },
    summary: { nights:"Noci", nightPrice:"Cena za noc", subtotal:"Mezisoučet", vat:"DPH 12 %", total:"Celkem" },
    manage: { title:"Správa rezervace", email:"E-mail", code:"Kód rezervace", codePh:"např. AUR-8F3D", show:"Zobrazit", cancel:"Zrušit rezervaci", notFound:"Rezervace nenalezena.", cancelled:"Rezervace byla zrušena.", confirm:"Opravdu zrušit rezervaci?" },
    admin: { title:"Admin", pass:"Admin kód", login:"Zobrazit rezervace", export:"Export CSV", seed:"Naplnit demo data", clear:"Smazat všechny", needAuth:"Zadejte platný admin kód.", empty:"Žádné rezervace.", table:{code:"Kód", type:"Typ", rooms:"Pokoje", guests:"Os.", term:"Termín", nights:"Nocí", total:"Celkem", email:"E-mail", created:"Vytvořeno", actions:"Akce", delete:"Smazat"}, cleared:"Všechny rezervace smazány.", seeded:"Demo data byla přidána.", theme:"Motiv" },
    location: { title:"Kde nás najdete", text:"Novotného lávka, 110 00 Staré Město. Historické památky, kavárny a galerie na dosah pár minut pěšky.", li1:"Staroměstské náměstí – 5 min", li2:"Karlův most – 10 min", li3:"Metro A/B (Můstek) – 3 min" },
    contact: { title:"Kontakt", reception:"Recepce 24/7", billing:"Fakturace", special:"Speciální přání", text:"Potřebujete dětskou postýlku, alergická jídla nebo pozdní check-out? Napište nám." },
    footer: { copy:"© 2026 Aurora Hotel Praha. Všechna práva vyhrazena.", made:"Design & rezervace: Aurora", support:"Podpora", company:"O společnosti", booking:"Správa rezervace", contact:"Kontaktujte nás", faq:"Časté otázky", about:"O hotelu", gallery:"Galerie", rooms:"Pokoje", amenities:"Služby", legal:"Právní informace", privacy:"Ochrana soukromí", terms:"Podmínky používání", cookies:"Nastavení cookies", compliance:"Soulad se zákony", follow:"Sledujte nás" },
    dialog: { title:"Rezervace potvrzena", done:"Hotovo", thanks:(name)=>`Děkujeme, ${name}!` , code:"Kód", total:"Celkem" },
    messages: { enterValidRange:"Zadejte platný rozsah dat.", availGreat:(n,t)=>`Skvělé! K dispozici ${n} pokojů (${t}).`, availLimited:(n)=>`Bohužel, volné pouze ${n} pokoj(e). Zkuste upravit termín nebo počet pokojů.`, invalidEmail:"Zadejte platný e‑mail.", notEnoughRooms:(free)=>`Není dostupných dostatek pokojů (${free} volných).`, capacity:(title,cap)=>`Max. kapacita pro ${title} je ${cap}.` },
    chatbot: { title: "Asistent hotelu", welcome: "Ahoj! 👋 Jak ti můžeme pomoci?", placeholder: "Napiš zprávu...", toggle: "Potřebuješ pomoct?", chip_checkin: "Check-in/out", chip_rooms: "Pokoje", chip_price: "Ceny", chip_parking: "Parkování", chip_booking: "Rezervace" }
  },
  en: {
    banner: { offer: "🎆 New Year Sale! 25% off all rooms until 31.1. | Code: " },
    nav: { about: "About", rooms: "Rooms", amenities: "Services", gallery: "Gallery", location: "Location", contact: "Contact", book: "Book" },
    hero: { title: "Hotel Aurora Prague", subtitle: "Modern elegance in the heart of Europe. Enjoy a remarkable stay in our luxury rooms with views of Prague.", cta: "Reserve your stay today" },
    about: { title: "About", text: "Aurora is an elegant hotel in Prague blending timeless design. We offer wellness, fine dining, and a calm base for rest and work.", li1:"City center, great public transport", li2:"Wellness & fitness, 24/7 reception", li3:"Conference rooms and workspaces", boxTitle:"Easy access", boxText:"5 min from Old Town Square, 20 min from airport. Late arrival guaranteed.", rating:"Guest rating", rooms:"Rooms", metro:"from metro" },
    rooms: { title:"Rooms", standard:"Comfortable room with king-size bed, smart TV and work nook.", deluxe:"More space, in-room coffee and city view. Great for longer stays.", suite:"Separate living room, bathtub and premium amenities. For special moments.", capacity2:"Capacity 2", capacity3:"Capacity 3", capacity4:"Capacity 4", book:"Book" },
    amenities: { title:"Amenities", wellness:"Spa & wellness", food:"Bar & terrace", conf:"Conference halls", transfer:"Airport transfer", gym:"Fitness center", wifi:"WiFi throughout", parking:"Parking", business:"Business center", accessible:"Wheelchair accessible", roomservice:"Room service", nonsmoking:"Non-smoking rooms", evcharging:"EV charging station" },
    trust: { asSeen:"As seen in", award1:"Traveller's Choice 2025", award2:"Michelin Guide Stay" },
    faq: {
      title: "Frequently Asked Questions",
      q1: "What are check‑in and check‑out times?",
      a1: "Check‑in from 14:00, check‑out by 11:00. Late departure subject to availability.",
      q2: "Do you offer late check‑out?",
      a2: "Yes, on request. Confirmation depends on occupancy, a small fee may apply.",
      q3: "Is parking available?",
      a3: "We cooperate with a nearby covered garage. Advance reservation recommended.",
      q4: "Is breakfast included?",
      a4: "Buffet breakfast is available daily 7:00–10:30. Discounted packages with breakfast offered.",
      q5: "What is your cancellation policy?",
      a5: "Flex rate can be cancelled free up to 24h before arrival. Prepaid rates have special terms.",
      q6: "Is it possible to have a pet in the room?",
      a6: "Yes, selected rooms are pet‑friendly. Please notify us in advance; a small cleaning fee applies. Assistance dogs stay free. Max. 1 pet per room."
    },
    testimonials: { title:"What guests say", t1:"The best bed I've slept in and breakfast with a castle view.", t2:"We came with our family and each of us found what we were looking for. The hotel truly cares for its guests.", t3:"Quiet coworking, great coffee, and staff who remember your name." },
    gallery: { title:"Gallery", capLobby:"Lobby & lounge", capRoom:"Designer rooms", capDining:"Signature dining", capSpa:"Spa & wellness", capBar:"Signature bar", capBreakfast:"Champagne breakfast" },
    booking: { title:"Online booking", checkin:"Check-in", checkout:"Check-out", roomType:"Room type", guests:"Guests", roomsCount:"Rooms count", name:"Full name", namePh:"John Doe", email:"Email", emailPh:"john.doe@example.com", phone:"Phone", phonePh:"+1 202 555 0142", check:"Check availability", submit:"Complete booking" },
    progress: { dates:"Date & room", details:"Personal details", confirm:"Confirmation" },
    summary: { nights:"Nights", nightPrice:"Price per night", subtotal:"Subtotal", vat:"VAT 12%", total:"Total" },
    manage: { title:"Manage booking", email:"Email", code:"Booking code", codePh:"e.g. AUR-8F3D", show:"Show", cancel:"Cancel booking", notFound:"Booking not found.", cancelled:"Booking cancelled.", confirm:"Really cancel booking?" },
    admin: { title:"Admin", pass:"Admin code", login:"Show reservations", export:"Export CSV", seed:"Seed demo data", clear:"Delete all", needAuth:"Enter a valid admin code.", empty:"No reservations.", table:{code:"Code", type:"Type", rooms:"Rooms", guests:"Guests", term:"Term", nights:"Nights", total:"Total", email:"Email", created:"Created", actions:"Actions", delete:"Delete"}, cleared:"All reservations deleted.", seeded:"Demo data added.", theme:"Theme" },
    location: { title:"Where to find us", text:"Novotného lávka, 110 00 Old Town, Prague. Historic sights, cafes and galleries just minutes away.", li1:"Old Town Square – 5 min", li2:"Charles Bridge – 10 min", li3:"Metro A/B (Můstek) – 3 min" },
    contact: { title:"Contact", reception:"Reception 24/7", billing:"Billing", special:"Special requests", text:"Need a baby cot, allergy-friendly meals or late check-out? Write to us." },
    footer: { copy:"© 2026 Aurora Hotel Praha. All rights reserved.", made:"Design & booking: Aurora", support:"Support", company:"About", booking:"Manage booking", contact:"Contact us", faq:"FAQ", about:"About hotel", gallery:"Gallery", rooms:"Rooms", amenities:"Services", legal:"Legal", privacy:"Privacy Policy", terms:"Terms of Use", cookies:"Cookie Settings", compliance:"Compliance", follow:"Follow us" },
    dialog: { title:"Booking confirmed", done:"Done", thanks:(name)=>`Thank you, ${name}!` , code:"Code", total:"Total" },
    messages: { enterValidRange:"Enter a valid date range.", availGreat:(n,t)=>`Great! ${n} rooms available (${t}).`, availLimited:(n)=>`Sorry, only ${n} room(s) free. Adjust dates or rooms.`, invalidEmail:"Enter a valid email.", notEnoughRooms:(free)=>`Not enough rooms available (${free} free).`, capacity:(title,cap)=>`Max capacity for ${title} is ${cap}.` },
    chatbot: { title: "Hotel Assistant", welcome: "Hi! 👋 How can we help?", placeholder: "Write a message...", toggle: "Need help?", chip_checkin: "Check-in/out", chip_rooms: "Rooms", chip_price: "Prices", chip_parking: "Parking", chip_booking: "Booking" }
  }
};

function t(key, params){
  const parts = key.split(".");
  let obj = I18N[CURRENT_LANG];
  for(const p of parts){ obj = obj?.[p]; }
  if(typeof obj === 'function') return obj(...(Array.isArray(params)?params:[params]));
  return obj ?? key;
}

function applyI18n(){
  document.documentElement.lang = CURRENT_LANG;
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if(text) el.textContent = text;
  });
  $$("[data-i18n-attr]").forEach(el => {
    const attr = el.getAttribute('data-i18n-attr');
    const key = el.getAttribute(`data-i18n-${attr}`);
    const val = t(key);
    if(val) el.setAttribute(attr, val);
  });
  // toggle buttons pressed state
  $$(".lang__btn").forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.lang===CURRENT_LANG)));

  updatePriceBadges();
  updateSummary();
}

// theme
let CURRENT_THEME = localStorage.getItem(LS_THEME) || 'light';
function applyTheme(){
  document.documentElement.setAttribute('data-theme', CURRENT_THEME);
  // Bootstrap dark mode support
  document.documentElement.setAttribute('data-bs-theme', CURRENT_THEME);
  const btn = $('#themeToggle');
  if(btn){
    btn.setAttribute('aria-pressed', String(CURRENT_THEME === 'dark'));
    // Toggle emoji between sun and moon
    const themeLight = btn.querySelector('.theme-light');
    const themeDark = btn.querySelector('.theme-dark');
    if(themeLight && themeDark){
      // V tmavém režimu zobrazit sluníčko (theme-dark = 🔆), v světlém měsíc (theme-light = 🌙)
      themeLight.style.display = CURRENT_THEME === 'dark' ? 'none' : 'inline';
      themeDark.style.display = CURRENT_THEME === 'dark' ? 'inline' : 'none';
    }
    btn.setAttribute('aria-label', CURRENT_THEME === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', CURRENT_THEME === 'dark' ? '#0f172a' : '#ffffff');
}

function toggleTheme(){
  CURRENT_THEME = CURRENT_THEME === 'dark' ? 'light' : 'dark';
  localStorage.setItem(LS_THEME, CURRENT_THEME);
  applyTheme();
}

function todayISO(offsetDays = 0){
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate()+offsetDays);
  return d.toISOString().slice(0,10);
}

function parseISO(s){
  const d = new Date(s);
  d.setHours(0,0,0,0);
  return d;
}

function diffNights(ci, co){
  const ms = parseISO(co) - parseISO(ci);
  return Math.max(0, Math.round(ms / (1000*60*60*24)));
}

function fmtCurrency(czk){
  if(CURRENT_LANG === 'en'){
    return new Intl.NumberFormat('en-US', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(czk / EUR_RATE);
  }
  return new Intl.NumberFormat('cs-CZ', { style:'currency', currency:'CZK', maximumFractionDigits:0 }).format(czk);
}

function loadReservations(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function saveReservations(list){
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function overlaps(aStart, aEnd, bStart, bEnd){
  // interval [start, end) překrývá, pokud start < druhý_end a end > druhý_start
  return (parseISO(aStart) < parseISO(bEnd)) && (parseISO(aEnd) > parseISO(bStart));
}

function availableRooms(type, checkin, checkout){
  const all = loadReservations();
  const booked = all.filter(r => r.type === type && overlaps(r.checkin, r.checkout, checkin, checkout))
                    .reduce((sum, r) => sum + (r.roomsCount || 1), 0);
  const total = INVENTORY[type].rooms;
  return Math.max(0, total - booked);
}

function computePrice(type, nights, roomsCount=1){
  const base = INVENTORY[type].price;
  const subtotal = base * nights * roomsCount;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  return { base, subtotal, vat, total };
}

function genCode(){
  const pool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "AUR-";
  for(let i=0;i<4;i++) s += pool[Math.floor(Math.random()*pool.length)];
  return s;
}

function updateSummary(){
  const ci = $('#checkin').value;
  const co = $('#checkout').value;
  const type = $('#roomType').value;
  const roomsCount = Number($('#roomsCount').value || 1);

  const nights = diffNights(ci, co);
  $('#sumNights').textContent = nights;

  if(!ci || !co || nights<=0){
    $('#sumNightPrice').textContent = '–';
    $('#sumSubtotal').textContent = '–';
    $('#sumVat').textContent = '–';
    $('#sumTotal').textContent = '–';
    return;
  }

  const { base, subtotal, vat, total } = computePrice(type, nights, roomsCount);
  $('#sumNightPrice').textContent = fmtCurrency(base);
  $('#sumSubtotal').textContent = fmtCurrency(subtotal);
  $('#sumVat').textContent = fmtCurrency(vat);
  $('#sumTotal').textContent = fmtCurrency(total);
}

function validateForm(){
  const ci = $('#checkin').value;
  const co = $('#checkout').value;
  const type = $('#roomType').value;
  const guests = Number($('#guests').value);
  const roomsCount = Number($('#roomsCount').value || 1);
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();

  const nights = diffNights(ci, co);
  if(nights<=0) return { ok:false, msg: t('messages.enterValidRange') };
  if(!INVENTORY[type]) return { ok:false, msg:'Invalid room type.' };
  if(guests<1 || guests>4) return { ok:false, msg: CURRENT_LANG==='cs' ? 'Počet osob musí být 1–4.' : 'Guests must be 1–4.' };
  if(roomsCount<1) return { ok:false, msg: CURRENT_LANG==='cs' ? 'Počet pokojů musí být alespoň 1.' : 'Rooms count must be at least 1.' };
  if(!name) return { ok:false, msg: CURRENT_LANG==='cs' ? 'Zadejte jméno a příjmení.' : 'Enter full name.' };
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok:false, msg: t('messages.invalidEmail') };
  if(guests > INVENTORY[type].capacity) return { ok:false, msg: t('messages.capacity', [INVENTORY[type].title, INVENTORY[type].capacity]) };

  const free = availableRooms(type, ci, co);
  if(free < roomsCount) return { ok:false, msg: t('messages.notEnoughRooms', free) };

  return { ok:true };
}

function showAvailability(){
  const ci = $('#checkin').value;
  const co = $('#checkout').value;
  const type = $('#roomType').value;
  const roomsCount = Number($('#roomsCount').value || 1);

  const nights = diffNights(ci, co);
  if(nights<=0){
    $('#availabilityMsg').textContent = t('messages.enterValidRange');
    return;
  }
  const free = availableRooms(type, ci, co);
  if(free >= roomsCount){
    $('#availabilityMsg').textContent = t('messages.availGreat', [free, INVENTORY[type].title]);
    updateProgress();
  } else {
    $('#availabilityMsg').textContent = t('messages.availLimited', free);
  }
}

function updateProgress(){
  const ci = $('#checkin').value;
  const co = $('#checkout').value;
  const type = $('#roomType').value;
  const guests = Number($('#guests').value);
  const roomsCount = Number($('#roomsCount').value || 1);
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const phone = $('#phone').value.trim();

  const steps = document.querySelectorAll('.progress-step');
  if(!steps.length) return;

  // Step 1: Dates and room selection
  const step1Complete = ci && co && type && guests && roomsCount && diffNights(ci, co) > 0;
  
  // Step 2: Personal details
  const step2Complete = name && email && phone && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  
  // Step 3: Availability checked (look for success message)
  const availMsg = $('#availabilityMsg').textContent;
  const step3Complete = step2Complete && availMsg && !availMsg.includes(CURRENT_LANG==='cs' ? 'Bohužel' : 'Sorry');

  // Update step 1
  steps[0].classList.toggle('active', !step1Complete);
  steps[0].classList.toggle('completed', step1Complete);

  // Update step 2
  if(step1Complete){
    steps[1].classList.toggle('active', !step2Complete);
    steps[1].classList.toggle('completed', step2Complete);
  } else {
    steps[1].classList.remove('active', 'completed');
  }

  // Update step 3
  if(step2Complete){
    steps[2].classList.toggle('active', !step3Complete);
    steps[2].classList.toggle('completed', step3Complete);
  } else {
    steps[2].classList.remove('active', 'completed');
  }
}

function submitBooking(e){
  e.preventDefault();
  const v = validateForm();
  if(!v.ok){
    $('#availabilityMsg').textContent = v.msg;
    return;
  }

  const ci = $('#checkin').value;
  const co = $('#checkout').value;
  const type = $('#roomType').value;
  const guests = Number($('#guests').value);
  const roomsCount = Number($('#roomsCount').value || 1);
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const phone = $('#phone').value.trim();
  const nights = diffNights(ci, co);
  const { total } = computePrice(type, nights, roomsCount);

  const code = genCode();
  const record = { code, checkin:ci, checkout:co, type, guests, roomsCount, name, email, phone, createdAt: new Date().toISOString(), total };
  const list = loadReservations();
  list.push(record);
  saveReservations(list);

  const dlg = $('#confirmDialog');
  $('#confirmText').innerHTML = `${t('dialog.thanks', name)}<br>${CURRENT_LANG==='cs' ? 'Vaše rezervace je potvrzena.' : 'Your booking is confirmed.'}<br><strong>${t('dialog.code')}: ${code}</strong><br>${t('dialog.total')}: <strong>${fmtCurrency(total)}</strong>`;
  if(typeof dlg.showModal === 'function') dlg.showModal();
  else alert(`Rezervace potvrzena. Kód: ${code}`);

  $('#manageEmail').value = email;
  $('#manageCode').value = code;
}

function manageLookup(e){
  e.preventDefault();
  const email = $('#manageEmail').value.trim();
  const code = $('#manageCode').value.trim().toUpperCase();
  const list = loadReservations();
  const r = list.find(x => x.email.toLowerCase()===email.toLowerCase() && x.code.toUpperCase()===code);
  const el = $('#manageResult');
  if(!r){ el.textContent = t('manage.notFound'); return; }
  el.innerHTML = `
    <div class="card p-16">
      <div><strong>${INVENTORY[r.type].title}</strong>, ${r.roomsCount}× pokoj, ${r.guests} os.</div>
      <div>Termín: ${r.checkin} → ${r.checkout} (${diffNights(r.checkin,r.checkout)} nocí)</div>
      <div>Celkem: <strong>${fmtCZK(r.total)}</strong></div>
      <div>Kód: <strong>${r.code}</strong></div>
    </div>`;
}

function cancelBooking(){
  const email = $('#manageEmail').value.trim();
  const code = $('#manageCode').value.trim().toUpperCase();
  const list = loadReservations();
  const idx = list.findIndex(x => x.email.toLowerCase()===email.toLowerCase() && x.code.toUpperCase()===code);
  if(idx === -1){ $('#manageResult').textContent = t('manage.notFound'); return; }
  if(!confirm(t('manage.confirm'))) return;
  list.splice(idx,1);
  saveReservations(list);
  $('#manageResult').textContent = t('manage.cancelled');
}

function initDates(){
  const checkin = $('#checkin');
  const checkout = $('#checkout');
  const t = todayISO();
  checkin.min = t;
  checkout.min = todayISO(1);
  checkin.value = t;
  checkout.value = todayISO(1);
}

function bindUI(){
  // menu toggle mobile
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.menu');
  toggle?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    menu.style.display = expanded ? 'none' : 'flex';
  });

  // language switch
  $$(".lang__btn").forEach(btn => btn.addEventListener('click', () => {
    CURRENT_LANG = btn.dataset.lang;
    localStorage.setItem(LS_LANG, CURRENT_LANG);
    applyI18n();
  }));

  // theme toggle
  $('#themeToggle')?.addEventListener('click', toggleTheme);

  // ripple on buttons
  setupRipples();

  // form interactions
  ['#checkin','#checkout','#roomType','#guests','#roomsCount'].forEach(sel => {
    $(sel).addEventListener('change', () => { updateSummary(); $('#availabilityMsg').textContent=''; updateProgress(); });
    $(sel).addEventListener('input', () => { updateSummary(); updateProgress(); });
  });
  ['#name','#email','#phone'].forEach(sel => {
    $(sel).addEventListener('input', updateProgress);
    $(sel).addEventListener('blur', updateProgress);
  });
  $('#checkBtn').addEventListener('click', showAvailability);
  $('#bookingForm').addEventListener('submit', submitBooking);

  $('#manageForm').addEventListener('submit', manageLookup);
  $('#cancelBtn').addEventListener('click', cancelBooking);

  // admin
  $('#adminForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const pass = $('#adminPass').value.trim();
    if(pass.toUpperCase() !== 'AURORA'){ $('#adminList').textContent = t('admin.needAuth'); return; }
    renderAdminList();
  });
  $('#exportCsv').addEventListener('click', exportCSV);
  $('#seedDemo').addEventListener('click', ()=>{
    const pass = $('#adminPass').value.trim();
    if(pass.toUpperCase() !== 'AURORA'){ $('#adminList').textContent = t('admin.needAuth'); return; }
    seedDemoData();
    $('#adminList').textContent = t('admin.seeded');
  });
  $('#adminClear').addEventListener('click', ()=>{
    const pass = $('#adminPass').value.trim();
    if(pass.toUpperCase() !== 'AURORA'){ $('#adminList').textContent = t('admin.needAuth'); return; }
    if(!confirm(CURRENT_LANG==='cs' ? 'Smazat všechny rezervace?' : 'Delete all reservations?')) return;
    saveReservations([]);
    $('#adminList').textContent = t('admin.cleared');
  });

  updateSummary();
  updatePriceBadges();
}

// init
window.addEventListener('DOMContentLoaded', () => {
  initDates();
  bindUI();
  applyI18n();
  applyTheme();
  setupReveal();
  setupHeroParallax();
  setupHeroParticles();
  setupMouseTracking();
  setupCardTilt();
  setupNavScroll();
  setupSlider();
  setupRipples();
});

// Admin helpers
function renderAdminList(){
  const list = loadReservations();
  const wrapper = $('#adminList');
  if(!list.length){ wrapper.textContent = t('admin.empty'); return; }
  const rows = list.map(r => `
    <tr>
      <td>${r.code}</td>
      <td>${INVENTORY[r.type].title}</td>
      <td>${r.roomsCount}</td>
      <td>${r.guests}</td>
      <td>${r.checkin} → ${r.checkout}</td>
      <td>${diffNights(r.checkin,r.checkout)}</td>
      <td>${fmtCurrency(r.total)}</td>
      <td>${r.email}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td><button class="btn btn--danger" data-del="${r.code}">${t('admin.table.delete')}</button></td>
    </tr>
  `).join('');
  wrapper.innerHTML = `
    <div class="card">
      <div class="p-16">
        <div class="admin">
          <table>
            <thead>
              <tr>
                <th>${t('admin.table.code')}</th>
                <th>${t('admin.table.type')}</th>
                <th>${t('admin.table.rooms')}</th>
                <th>${t('admin.table.guests')}</th>
                <th>${t('admin.table.term')}</th>
                <th>${t('admin.table.nights')}</th>
                <th>${t('admin.table.total')}</th>
                <th>${t('admin.table.email')}</th>
                <th>${t('admin.table.created')}</th>
                <th>${t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  // bind deletes
  $$("[data-del]").forEach(btn => btn.addEventListener('click', () => {
    const code = btn.getAttribute('data-del');
    const list = loadReservations();
    const idx = list.findIndex(x=>x.code===code);
    if(idx!==-1){ list.splice(idx,1); saveReservations(list); }
    renderAdminList();
  }));
}

function exportCSV(){
  const list = loadReservations();
  if(!list.length){ alert(t('admin.empty')); return; }
  const headers = [
    'code','type','roomsCount','guests','checkin','checkout','nights','totalCZK','email','name','phone','createdAt'
  ];
  const lines = [headers.join(',')];
  for(const r of list){
    const nights = diffNights(r.checkin, r.checkout);
    const fields = [
      r.code, r.type, r.roomsCount, r.guests, r.checkin, r.checkout, nights, r.total, r.email, r.name, (r.phone||''), r.createdAt
    ].map(v => typeof v === 'string' ? '"'+v.replace(/"/g,'""')+'"' : String(v));
    lines.push(fields.join(','));
  }
  const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aurora-reservations.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// scroll reveal
function setupReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        // Skip animation for availability card
        if(!entry.target.classList.contains('card--elev')){
          entry.target.classList.add('is-visible');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  els.forEach(el => obs.observe(el));
}

function setupHeroParallax(){
  const hero = document.querySelector('.hero');
  const bg = document.querySelector('.hero__bg');
  if(!hero || !bg) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Enable GPU acceleration
  bg.style.willChange = 'transform';
  bg.style.backfaceVisibility = 'hidden';
  bg.style.perspective = '1000px';

  let ticking = false;
  let lastY = 0;

  const updateScroll = () => {
    const offset = Math.min(60, lastY * 0.15);
    bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;
    ticking = false;
  };

  const onScroll = () => {
    lastY = window.scrollY;
    if(!ticking){
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };

  let moveTicket = false;
  let lastMoveX = 0, lastMoveY = 0;

  const updateMove = () => {
    const rect = hero.getBoundingClientRect();
    const xNorm = ((lastMoveX - rect.left) / rect.width - 0.5) * 6;
    const yNorm = ((lastMoveY - rect.top) / rect.height - 0.5) * 6;
    bg.style.transform = `translate3d(${xNorm}px, ${yNorm + Math.min(60, lastY*0.15)}px, 0) scale(1.06)`;
    moveTicket = false;
  };

  const onMove = (e) => {
    lastMoveX = e.clientX;
    lastMoveY = e.clientY;
    if(!moveTicket){
      requestAnimationFrame(updateMove);
      moveTicket = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  hero.addEventListener('pointermove', onMove, { passive: true });

  return () => {
    bg.style.willChange = 'auto';
    window.removeEventListener('scroll', onScroll);
    hero.removeEventListener('pointermove', onMove);
  };
}

function setupHeroParticles(){
  const canvas = document.querySelector('.hero__particles');
  if(!canvas) return;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  const dpr = window.devicePixelRatio || 1;
  let width, height;
  let mouseX = 0, mouseY = 0;
  let mouseActive = false;

  const config = {
    density: 55,
    speed: 0.3,
    trail: 0.08,
    attraction: 0.0015,
    repulsion: 0.002
  };

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Enhanced color palette for professional look
  const colorPalettes = {
    light: [
      'rgba(31, 138, 117, 0.35)',
      'rgba(215, 181, 109, 0.28)',
      'rgba(99, 192, 165, 0.3)',
      'rgba(212, 175, 55, 0.25)'
    ],
    dark: [
      'rgba(99, 192, 165, 0.4)',
      'rgba(215, 181, 109, 0.32)',
      'rgba(106, 218, 170, 0.28)',
      'rgba(212, 175, 55, 0.3)'
    ]
  };
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const colors = isDark ? colorPalettes.dark : colorPalettes.light;
  
  const pick = () => colors[Math.floor(Math.random() * colors.length)];
  
  const particles = Array.from({ length: config.density }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1.2 + Math.random() * 2.5,
    vx: (Math.random() * config.speed - config.speed / 2) * 0.8,
    vy: (Math.random() * config.speed * 0.8 - config.speed * 0.4) * 0.8,
    color: pick(),
    jitter: Math.random() * 0.08,
    life: Math.random() * 0.5 + 0.5,
    decay: Math.random() * 0.001 + 0.0005
  }));

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  });

  canvas.addEventListener('pointerleave', () => {
    mouseActive = false;
  });

  let frame = 0;
  const tick = () => {
    frame++;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0, 0, 0, ${config.trail})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((p, i) => {
      // Decay life
      p.life -= p.decay;
      if (p.life < 0) p.life = 1;

      // Mouse interaction
      if (mouseActive) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * config.repulsion;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }
      }

      // Particle interaction (attraction/repulsion)
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80 && dist > 5) {
          const force = config.attraction;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          other.vx -= (dx / dist) * force;
          other.vy -= (dy / dist) * force;
        }
      }

      // Movement
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.vx += (Math.random() - 0.5) * p.jitter;
      p.vy += (Math.random() - 0.5) * p.jitter;

      // Wrap around
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5;
      if (p.y > height + 5) p.y = -5;

      // Draw particle with glow effect
      const opacity = p.life;
      ctx.beginPath();
      ctx.fillStyle = p.color.replace(/[\d.]+\)/, `${opacity})`);
      
      // Glow effect
      ctx.shadowBlur = 20 + p.r * 2;
      ctx.shadowColor = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(tick);
  };
  tick();
}

// Intersection Observer for scroll-triggered animations
function setupReveal(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('reveal');
        // Use backface-visibility for GPU acceleration
        entry.target.style.backfaceVisibility = 'hidden';
        entry.target.style.perspective = '1000px';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.section, .card, .room').forEach(el => {
    observer.observe(el);
  });
}

// Enhanced mouse tracking for professional effect
function setupMouseTracking(){
  const elements = document.querySelectorAll('.card, .room, .gallery__item');
  
  elements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      el.style.perspective = '1000px';
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'rotateX(0) rotateY(0) scale(1)';
    });
  });
}

function setupCardTilt(){
  const cards = document.querySelectorAll('.card:not(.form)');
  cards.forEach(card => {
    card.classList.add('tilted');
    let rafId;
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 6; // tilt left/right
      const rotX = (0.5 - y) * 6; // tilt up/down
      const tilt = () => {
        card.dataset.tilt = 'on';
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      };
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tilt);
    };
    const reset = () => {
      card.dataset.tilt = 'off';
      card.style.transform = 'translateY(-2px)';
    };
    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', reset);
  });

  // room images tilt-lite
  document.querySelectorAll('.rooms .room img').forEach(img => {
    img.classList.add('hover-tilt');
  });
}

function updatePriceBadges(){
  document.querySelectorAll('.badge[data-price]').forEach(el => {
    const price = Number(el.dataset.price);
    if(!price) return;
    if(CURRENT_LANG === 'en'){
      const eur = Math.round(price / EUR_RATE);
      el.textContent = `from €${eur} / night`;
    }else{
      el.textContent = `od ${price.toLocaleString('cs-CZ')} Kč / noc`;
    }
  });
}

function setupNavScroll(){
  const nav = document.querySelector('.nav');
  if(!nav) return;
  
  let ticking = false;
  let lastScrollY = 0;
  
  const updateNav = () => {
    nav.classList.toggle('nav--solid', lastScrollY > 12);
    ticking = false;
  };
  
  const onScroll = () => {
    lastScrollY = window.scrollY;
    if(!ticking){
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  };
  
  updateNav();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupRipples(){
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e)=>{
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      setTimeout(()=> ripple.remove(), 650);
    });
  });
}

function setupSlider(){
  const slider = document.querySelector('[data-slider]');
  if(!slider) return;
  const items = [...slider.querySelectorAll('[data-slider-item]')];
  const dotsWrap = slider.querySelector('.slider__dots');
  if(!items.length || !dotsWrap) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  items.forEach((_,i)=>{
    const b = document.createElement('button');
    if(i===0) b.classList.add('is-active');
    b.addEventListener('click', ()=>{ go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.querySelectorAll('button')];

  const go = (i) => {
    index = i;
    items.forEach((item,idx)=> item.classList.toggle('is-active', idx===index));
    dots.forEach((dot,idx)=> dot.classList.toggle('is-active', idx===index));
  };

  let timer;
  const restart = () => {
    clearInterval(timer);
    if(reduceMotion) return;
    timer = setInterval(()=> go((index+1)%items.length), 5200);
  };
  restart();
}

function seedDemoData(){
  const base = loadReservations();
  const now = new Date();
  const iso = (d)=>{ const x=new Date(d); x.setHours(0,0,0,0); return x.toISOString().slice(0,10); };
  const plus = (days)=>{ const d=new Date(now); d.setDate(d.getDate()+days); return d; };
  const seeds = [
    { type:'standard', guests:2, roomsCount:1, name:'Jan Novák', email:'jan.novak@example.com', phone:'+420 111 222 333', checkin: iso(plus(1)), checkout: iso(plus(3)) },
    { type:'deluxe', guests:2, roomsCount:1, name:'Eva Dvořáková', email:'eva@example.com', phone:'+420 222 333 444', checkin: iso(plus(5)), checkout: iso(plus(8)) },
    { type:'suite', guests:3, roomsCount:1, name:'John Doe', email:'john.doe@example.com', phone:'+1 202 555 0142', checkin: iso(plus(2)), checkout: iso(plus(5)) },
    { type:'standard', guests:2, roomsCount:2, name:'Petr Svoboda', email:'petr@example.com', phone:'+420 333 444 555', checkin: iso(plus(10)), checkout: iso(plus(12)) },
    { type:'deluxe', guests:3, roomsCount:1, name:'Anna Smith', email:'anna@example.com', phone:'+44 20 7946 0958', checkin: iso(plus(14)), checkout: iso(plus(17)) }
  ];
  for(const s of seeds){
    const nights = diffNights(s.checkin, s.checkout);
    const { total } = computePrice(s.type, nights, s.roomsCount);
    base.push({
      code: genCode(),
      checkin: s.checkin,
      checkout: s.checkout,
      type: s.type,
      guests: s.guests,
      roomsCount: s.roomsCount,
      name: s.name,
      email: s.email,
      phone: s.phone,
      createdAt: new Date().toISOString(),
      total
    });
  }
  saveReservations(base);
}

// Back to Top Button
document.addEventListener('DOMContentLoaded', () => {
  const backToTopBtn = document.querySelector('.back-to-top');
  
  if (!backToTopBtn) return;
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
  
  // Smooth scroll to top
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

/* ========== ENHANCED CHATBOT ASSISTANT ========== */
document.addEventListener('DOMContentLoaded', function() {
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotWidget = document.getElementById('chatbotWidget');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotChips = document.getElementById('chatbotChips');
  
  // State
  let lastSendTime = 0;
  const debounceDelay = 300;
  let wizardState = null;
  let conversationHistory = [];

  // Load conversation history from localStorage
  function loadHistory() {
    const saved = localStorage.getItem('chatbot_history');
    if (saved) {
      conversationHistory = JSON.parse(saved);
      conversationHistory.forEach(msg => {
        const messageDiv = createMessageElement(msg.text, msg.sender, msg.isHTML);
        chatbotMessages.appendChild(messageDiv);
      });
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  }

  // Save conversation to localStorage
  function saveHistory() {
    localStorage.setItem('chatbot_history', JSON.stringify(conversationHistory));
  }

  // Log metrics
  function logMetric(type, category) {
    const metrics = JSON.parse(localStorage.getItem('chatbot_metrics') || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (!metrics[today]) metrics[today] = {};
    metrics[today][category] = (metrics[today][category] || 0) + 1;
    localStorage.setItem('chatbot_metrics', JSON.stringify(metrics));
    console.log(`📊 [Chatbot] ${type}:`, category);
  }

  // Create message element
  function createMessageElement(text, sender, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    if (isHTML) {
      messageDiv.innerHTML = text;
    } else {
      const p = document.createElement('p');
      p.textContent = text;
      messageDiv.appendChild(p);
    }
    
    messageDiv.classList.add('first-message');
    return messageDiv;
  }

  // Add message to chat
  function addMessage(text, sender, isHTML = false) {
    const messageDiv = createMessageElement(text, sender, isHTML);
    chatbotMessages.appendChild(messageDiv);
    
    conversationHistory.push({ text, sender, isHTML });
    saveHistory();
    
    setTimeout(() => chatbotMessages.scrollTop = chatbotMessages.scrollHeight, 50);
  }

  // Show chips or hide
  function showChips(show = true) {
    if (chatbotChips) {
      chatbotChips.style.display = show ? 'flex' : 'none';
    }
  }

  // Get bot response with rich HTML support
  function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    const detectedLang = detectLanguage(msg);
    const lang = detectedLang || CURRENT_LANG || 'cs';
    
    logMetric('query', lang === 'en' ? 'english' : 'czech');

    if (lang === 'en') {
      return getEnglishResponse(msg);
    }
    return getCzechResponse(msg);
  }

  // Language detection
  function detectLanguage(text) {
    const engKeywords = ['check-in', 'check in', 'rooms', 'price', 'booking', 'help', 'breakfast', 'wifi', 'hello', 'hi', 'contact'];
    const hasEng = engKeywords.some(kw => text.includes(kw));
    if (hasEng && text.split(' ').length > 2) return 'en';
    return null;
  }

  // Czech responses with HTML actions
  function getCzechResponse(msg) {
    const isCheckin = ['check-in', 'přijezd', 'příjezd', 'kdy'].some(w => msg.includes(w));
    if (isCheckin) {
      logMetric('answer', 'checkin');
      return `
        <p>Check-in je od <strong>14:00</strong>. Check-out do 11:00.</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="booking"><i class="fas fa-calendar"></i> Otevřít rezervaci</button>
          <button class="chatbot-action-btn" data-action="contact"><i class="fas fa-phone"></i> Zavolat recepci</button>
        </div>
      `;
    }

    const isRooms = ['pokoj', 'pokoje', 'kategori', 'typ'].some(w => msg.includes(w));
    if (isRooms) {
      logMetric('answer', 'rooms');
      return `
        <p>Nabízíme 3 typy pokojů:</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="room-standard"><i class="fas fa-door-open"></i> Standard (1.890 Kč/noc)</button>
          <button class="chatbot-action-btn" data-action="room-deluxe"><i class="fas fa-crown"></i> Deluxe (2.890 Kč/noc)</button>
          <button class="chatbot-action-btn" data-action="room-suite"><i class="fas fa-gem"></i> Suite (4.490 Kč/noc)</button>
        </div>
      `;
    }

    const isPrice = ['cena', 'kolik', 'náklady', 'tarif'].some(w => msg.includes(w));
    if (isPrice) {
      logMetric('answer', 'price');
      return `
        <p>Ceny začínají od <strong>1.890 Kč</strong> za noc. Chceš spočítat orientační cenu?</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="wizard"><i class="fas fa-calculator"></i> Spočítat cenu</button>
        </div>
      `;
    }

    const isParking = ['parkování', 'auto', 'parkovací'].some(w => msg.includes(w));
    if (isParking) {
      logMetric('answer', 'parking');
      return `
        <p>Spolupracujeme s krytým parkovištěm v sousedství. Doporučujeme předem vyhradit místo.</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="contact"><i class="fas fa-envelope"></i> Napsat recepci</button>
        </div>
      `;
    }

    const isContact = ['kontakt', 'tel', 'email', 'telefon'].some(w => msg.includes(w));
    if (isContact) {
      logMetric('answer', 'contact');
      return `
        <p><strong>Recepce 24/7</strong></p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="phone"><i class="fas fa-phone"></i> +420 234 567 890</button>
          <button class="chatbot-action-btn" data-action="email"><i class="fas fa-envelope"></i> recepce@aurorahotel.cz</button>
        </div>
      `;
    }

    const isBooking = ['rezervace', 'zarezervovat', 'booking', 'objednat'].some(w => msg.includes(w));
    if (isBooking) {
      logMetric('answer', 'booking');
      return `
        <p>Rezervuj online nebo kontaktuj nás přímo!</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="booking"><i class="fas fa-check-circle"></i> Zarezervovat</button>
          <button class="chatbot-action-btn" data-action="contact"><i class="fas fa-phone"></i> Zavolat</button>
        </div>
      `;
    }

    const isBreakfast = ['snídaně', 'jídlo', 'restaurace'].some(w => msg.includes(w));
    if (isBreakfast) {
      logMetric('answer', 'breakfast');
      return `
        <p>Snídaně je k dispozici denně od <strong>7:00 do 10:30</strong>. Lze ji přidat k rezervaci.</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="booking"><i class="fas fa-utensils"></i> Přidat k rezervaci</button>
        </div>
      `;
    }

    logMetric('answer', 'default');
    return `
      <p>Zajímá tě něco konkrétního? Zkus se ptát na pokoje, ceny, rezervaci nebo kontakt!</p>
      <div class="chatbot-actions">
        <button class="chatbot-action-btn" data-action="rooms"><i class="fas fa-door-open"></i> Pokoje</button>
        <button class="chatbot-action-btn" data-action="price"><i class="fas fa-tag"></i> Ceny</button>
      </div>
    `;
  }

  // English responses
  function getEnglishResponse(msg) {
    const isCheckin = ['check-in', 'arrival', 'when'].some(w => msg.includes(w));
    if (isCheckin) {
      logMetric('answer', 'checkin_en');
      return `
        <p>Check-in from <strong>14:00</strong>. Check-out by 11:00.</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="booking"><i class="fas fa-calendar"></i> Make a booking</button>
        </div>
      `;
    }

    const isRooms = ['room', 'rooms', 'types'].some(w => msg.includes(w));
    if (isRooms) {
      logMetric('answer', 'rooms_en');
      return `
        <p>We offer 3 room types:</p>
        <div class="chatbot-actions">
          <button class="chatbot-action-btn" data-action="room-standard"><i class="fas fa-door-open"></i> Standard</button>
          <button class="chatbot-action-btn" data-action="room-deluxe"><i class="fas fa-crown"></i> Deluxe</button>
          <button class="chatbot-action-btn" data-action="room-suite"><i class="fas fa-gem"></i> Suite</button>
        </div>
      `;
    }

    logMetric('answer', 'default_en');
    return `
      <p>How can I help? Ask me about rooms, prices, booking, or contact us!</p>
      <div class="chatbot-actions">
        <button class="chatbot-action-btn" data-action="rooms"><i class="fas fa-door-open"></i> Rooms</button>
        <button class="chatbot-action-btn" data-action="contact"><i class="fas fa-phone"></i> Contact</button>
      </div>
    `;
  }

  // Send message with debounce
  function sendMessage() {
    const now = Date.now();
    if (now - lastSendTime < debounceDelay) return;
    lastSendTime = now;

    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, 'bot', true);
      setupActionButtons();
    }, 500);
  }

  // Setup action button handlers
  function setupActionButtons() {
    const buttons = chatbotMessages.querySelectorAll('.chatbot-action-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', handleAction);
    });
  }

  // Handle action buttons
  function handleAction(e) {
    const action = e.currentTarget.getAttribute('data-action');
    const label = e.currentTarget.textContent.trim();
    logMetric('action', action);

    addMessage(label, 'user');

    setTimeout(() => {
      switch(action) {
        case 'booking':
          window.scrollTo({ top: document.getElementById('booking').offsetTop - 80, behavior: 'smooth' });
          addMessage('Otevřuji formulář rezervace! 📅', 'bot');
          break;
        case 'contact':
          addMessage('Zavoláme ti! 📞 +420 234 567 890', 'bot');
          break;
        case 'phone':
          window.open('tel:+420234567890');
          addMessage('Otevírám telefonní linku...', 'bot');
          break;
        case 'email':
          window.open('mailto:recepce@aurorahotel.cz');
          addMessage('Otevírám email klienta...', 'bot');
          break;
        case 'wizard':
          startPriceWizard();
          break;
        default:
          addMessage('Děkuji za tvůj zájem! 😊', 'bot');
      }
    }, 400);
  }

  // Price wizard
  function startPriceWizard() {
    wizardState = 'waiting_date';
    addMessage('Jaký je tvůj plánovaný příjezd? (zadej datum, např. 15.1.2026)', 'bot');
  }

  // Chip buttons handler
  if (chatbotChips) {
    chatbotChips.querySelectorAll('.chatbot-chip').forEach(chip => {
      chip.addEventListener('click', function() {
        const chipType = this.getAttribute('data-chip');
        const queries = {
          'checkin': 'Check-in a check-out časy?',
          'rooms': 'Jaké pokoje máte?',
          'price': 'Jaké jsou ceny?',
          'parking': 'Parkování?',
          'booking': 'Chci si zarezervovat'
        };
        const query = queries[chipType];
        if (query) {
          chatbotInput.value = query;
          sendMessage();
        }
      });
    });
  }

  // Toggle chatbot
  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', function() {
      chatbotWidget.classList.add('active');
      chatbotToggle.classList.add('active');
      chatbotInput.focus();
      showChips(true);
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', function() {
      chatbotWidget.classList.remove('active');
      chatbotToggle.classList.remove('active');
      wizardState = null;
    });
  }

  // Keyboard events
  if (chatbotInput) {
    chatbotInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Escape to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && chatbotWidget.classList.contains('active')) {
        chatbotClose.click();
      }
    });
  }

  if (chatbotSend) {
    chatbotSend.addEventListener('click', sendMessage);
  }

  // Initialize
  loadHistory();
  setupActionButtons();
});

