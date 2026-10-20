/* ==========================================================
   detail.js : 클래스 예약 상세 페이지 동작 (담당: 조아라)
   - data/classes.js의 window.CLASS_DATA만 사용해요
   - 순서: 도우미 → 클래스 찾기 → 1) 슬라이드 2) 정보 3) 소개 4) 후기
           → 5) 하단 버튼 6) 예약 창 7) 완료 팝업
   ========================================================== */

(function () {
  'use strict';

  /* ---------- 도우미 ---------- */
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(selector) {
    return document.querySelector(selector);
  }

  // 요소 만들기: 글자는 textContent로만 넣어요
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    [].concat(children == null ? [] : children).forEach(function (child) {
      node.append(child);
    });
    return node;
  }

  function formatPrice(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  function parseDate(key) {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function toKey(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function formatDateLabel(key) {
    const d = parseDate(key);
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WEEKDAYS[d.getDay()] + ')';
  }

  function formatDuration(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return (h ? h + '시간' : '') + (h && m ? ' ' : '') + (m ? m + '분' : '');
  }

  // 별 모양 (스크린 리더에는 따로 "5점 만점에 n점"을 읽혀요)
  function stars(rating, extraClass) {
    const fill = el('span', { class: 'booking-stars__fill' }, '★★★★★');
    fill.style.width = (rating / 5) * 100 + '%';
    return el('span', { class: 'booking-stars ' + (extraClass || ''), 'aria-hidden': 'true' }, [fill, '☆☆☆☆☆']);
  }

  function srText(text) {
    return el('span', { class: 'booking-sr-only' }, text);
  }

  /* ---------- 클래스 찾기: ?id= 값, 없거나 잘못되면 첫 번째 클래스 ---------- */
  const data = window.CLASS_DATA;
  const params = new URLSearchParams(window.location.search);
  const cls = data.getClassById(params.get('id')) || data.classes[0];

  document.title = cls.title + ' | Freely';

  /* ==========================================================
     1) 이미지 슬라이드
     ========================================================== */
  const gallery = $('#booking-gallery');
  const track = $('#gallery-track');
  const thumbs = $('#gallery-thumbs');
  const counter = $('#gallery-counter');
  const total = cls.images.length;
  let current = 0;

  // 사진을 못 불러오면 사진을 지우고 색 블록 + 설명 문구를 보여 줘요
  function photo(img, alt, eager) {
    if (!img.src) { return null; }
    const pic = el('img', { src: img.src, alt: alt, loading: eager ? 'eager' : 'lazy', decoding: 'async' });
    pic.addEventListener('error', function () { pic.remove(); });
    return pic;
  }

  cls.images.forEach(function (img, i) {
    const box = el('div', { class: 'booking-gallery__image' }, el('span', { 'aria-hidden': 'true' }, img.alt));
    box.style.background = 'var(' + img.color + ')';
    const pic = photo(img, img.alt, i === 0);
    if (pic) { box.append(pic); }
    track.append(el('li', {
      class: 'booking-gallery__slide',
      role: 'group',
      'aria-roledescription': '슬라이드',
      'aria-label': (i + 1) + ' / ' + total + ', ' + img.alt
    }, box));

    const thumb = el('button', {
      type: 'button',
      class: 'booking-gallery__thumb',
      'aria-label': (i + 1) + '번째 이미지 보기: ' + img.alt
    });
    thumb.style.background = 'var(' + img.color + ')';
    const thumbPic = photo(img, '', false);
    if (thumbPic) { thumb.append(thumbPic); }
    thumb.addEventListener('click', function () { goTo(i); });
    thumbs.append(el('li', {}, thumb));
  });

  function setCurrent(i) {
    current = i;
    counter.textContent = (i + 1) + ' / ' + total;
    thumbs.querySelectorAll('button').forEach(function (btn, n) {
      btn.setAttribute('aria-current', n === i ? 'true' : 'false');
    });
    showCredit(cls.images[i].credit);
  }

  // 사진 출처: "사진: 작가 / Unsplash"
  function showCredit(credit) {
    const box = $('#gallery-credit');
    box.textContent = '';
    if (!credit) { return; }
    box.append('사진: ', el('a', { href: credit.url, target: '_blank', rel: 'noopener' }, credit.author), ' / ' + credit.source);
  }

  // 처음과 끝은 이어서 넘어가요 (버튼이 비활성되어 포커스를 잃지 않게)
  function goTo(i) {
    const next = (i + total) % total;
    track.scrollTo({ left: track.clientWidth * next, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    setCurrent(next);
  }

  // 손가락으로 밀어서 넘긴 경우 현재 위치를 맞춰요
  let scrollTicking = false;
  track.addEventListener('scroll', function () {
    if (scrollTicking) { return; }
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      scrollTicking = false;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current && i >= 0 && i < total) { setCurrent(i); }
    });
  });

  window.addEventListener('resize', function () {
    track.scrollLeft = track.clientWidth * current;
  });

  $('#gallery-prev').addEventListener('click', function () { goTo(current - 1); });
  $('#gallery-next').addEventListener('click', function () { goTo(current + 1); });

  gallery.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  setCurrent(0);

  /* ==========================================================
     2) 기본 정보 패널
     ========================================================== */
  $('#info-category').textContent = cls.category;
  $('#booking-title').textContent = cls.title;
  $('#info-host').textContent = '강사 · ' + cls.host;

  $('#info-rating').append(
    stars(cls.rating),
    el('span', { 'aria-hidden': 'true' }, cls.rating.toFixed(1)),
    srText('5점 만점에 ' + cls.rating.toFixed(1) + '점'),
    el('span', {}, '후기 ' + cls.reviewCount + '개'),
    el('span', { class: 'booking-sample' }, '예시')
  );

  const priceBox = $('#info-price');
  const nowPrice = el('p', { class: 'booking-price__now' });
  if (cls.originalPrice) {
    const rate = Math.round((1 - cls.price / cls.originalPrice) * 100);
    priceBox.append(el('p', { class: 'booking-price__original' }, [
      srText('할인 전 가격 '),
      el('s', {}, formatPrice(cls.originalPrice))
    ]));
    nowPrice.append(el('span', {}, [srText('할인율 '), rate + '%']));
  }
  nowPrice.append(
    el('span', {}, [srText(cls.originalPrice ? '할인가 ' : '가격 '), formatPrice(cls.price)]),
    el('span', { class: 'booking-price__unit' }, '/ 1인')
  );
  priceBox.append(nowPrice);

  $('#info-location').append(cls.location.region, el('br'), cls.location.address);
  $('#info-duration').textContent = formatDuration(cls.duration);
  $('#info-level').textContent = cls.level;
  $('#info-people').textContent = '최대 ' + cls.maxPeople + '명';

  /* ==========================================================
     3) 클래스 소개 : 줄 단위로 읽어서 소제목·목록·문단으로 나눠요
     ========================================================== */
  const SUBTITLES = ['이런 분께 추천해요', '커리큘럼', '준비물과 제공 사항'];
  const introBody = $('#intro-body');
  const introMore = $('#intro-more');
  let list = null;

  cls.description.split('\n').forEach(function (raw) {
    const line = raw.trim();
    let match;

    if (!line) { list = null; return; }

    if (SUBTITLES.indexOf(line) !== -1) {
      list = null;
      introBody.append(el('h3', { class: 'booking-intro__subtitle' }, line));
      return;
    }

    match = line.match(/^-\s+(.*)$/);
    if (match) {
      if (!list || list.tagName !== 'UL') {
        list = el('ul', { class: 'booking-intro__list' });
        introBody.append(list);
      }
      list.append(el('li', {}, match[1]));
      return;
    }

    match = line.match(/^\d+\.\s+(.*)$/);
    if (match) {
      if (!list || list.tagName !== 'OL') {
        list = el('ol', { class: 'booking-intro__list booking-intro__list--number' });
        introBody.append(list);
      }
      list.append(el('li', {}, match[1]));
      return;
    }

    list = null;
    introBody.append(el('p', {}, line));
  });

  // 접힌 높이보다 글이 길 때만 [더보기]를 보여 줘요
  if (introBody.scrollHeight > introBody.clientHeight + 1) {
    introMore.hidden = false;
  } else {
    introBody.classList.remove('is-collapsed');
  }

  introMore.addEventListener('click', function () {
    const expanded = introMore.getAttribute('aria-expanded') === 'true';
    introBody.classList.toggle('is-collapsed', expanded);
    introMore.setAttribute('aria-expanded', String(!expanded));
    introMore.textContent = expanded ? '더보기' : '접기';
  });

  /* ==========================================================
     4) 후기
     ========================================================== */
  $('#reviews-summary').append(
    el('p', { class: 'booking-rating__score', 'aria-hidden': 'true' }, cls.rating.toFixed(1)),
    stars(cls.rating, 'booking-rating__stars'),
    srText('5점 만점에 ' + cls.rating.toFixed(1) + '점'),
    el('p', { class: 'booking-rating__count' }, '후기 ' + cls.reviewCount + '개')
  );

  cls.reviews.forEach(function (review) {
    $('#reviews-list').append(el('li', { class: 'booking-review' }, [
      el('div', { class: 'booking-review__head' }, [
        el('span', { class: 'booking-review__name' }, review.nickname),
        stars(review.rating),
        srText('5점 만점에 ' + review.rating + '점'),
        el('time', { class: 'booking-review__date', datetime: review.date }, review.date.replace(/-/g, '.'))
      ]),
      el('p', { class: 'booking-review__text' }, review.text)
    ]));
  });

  /* ==========================================================
     5) 모바일 하단 고정 버튼
     ========================================================== */
  $('#bar-price').append(formatPrice(cls.price), el('small', {}, '1인 기준'));

  /* ==========================================================
     6) 예약 창 (바텀시트)
     ========================================================== */
  const sheet = $('#booking-sheet');
  const sheetPanel = $('#sheet-panel');
  const doneDialog = $('#done-dialog');
  const donePanel = $('#done-panel');
  const background = [$('#site-header'), $('#main'), $('#site-footer'), $('#booking-bar')];

  const calGrid = $('#cal-grid');
  const calMonth = $('#cal-month');
  const calPrev = $('#cal-prev');
  const calNext = $('#cal-next');
  const timeList = $('#time-list');
  const peopleMinus = $('#people-minus');
  const peoplePlus = $('#people-plus');
  const nameInput = $('#booker-name');
  const phoneInput = $('#booker-phone');
  const errorBox = $('#booker-error');
  const payButton = $('#pay-button');

  const scheduleMap = {};
  cls.schedule.forEach(function (day) { scheduleMap[day.date] = day; });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDate = cls.schedule.length ? parseDate(cls.schedule[cls.schedule.length - 1].date) : today;
  const lastMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

  const state = { date: null, time: null, people: 1 };
  let viewMonth = firstMonth;
  let opener = null;

  $('#sheet-sub').textContent = cls.title + ' · 1인 ' + formatPrice(cls.price);

  function findSlot() {
    if (!state.date || !state.time) { return null; }
    return scheduleMap[state.date].slots.find(function (s) { return s.time === state.time; }) || null;
  }

  /* ---------- 캘린더 ---------- */
  function renderCalendar() {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    calMonth.textContent = y + '년 ' + (m + 1) + '월';
    calPrev.disabled = viewMonth <= firstMonth;
    calNext.disabled = viewMonth >= lastMonth;
    calGrid.textContent = '';

    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) {
      calGrid.append(el('span', { 'aria-hidden': 'true' }));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const key = toKey(date);
      const day = scheduleMap[key];
      const isPast = date < today;
      const isFull = !!day && day.slots.every(function (s) { return s.remaining === 0; });
      const isAvailable = !!day && !isPast && !isFull;

      let status = '예약 불가';
      if (isPast) { status = '지난 날짜'; }
      else if (isFull) { status = '마감'; }
      else if (isAvailable) { status = '예약 가능'; }

      const isToday = date.getTime() === today.getTime();
      const button = el('button', {
        type: 'button',
        class: 'booking-calendar__day' + (isAvailable ? ' is-available' : '') + (isToday ? ' is-today' : ''),
        'aria-label': (m + 1) + '월 ' + d + '일' + (isToday ? ' 오늘' : '') + ', ' + status,
        'aria-pressed': String(key === state.date),
        'data-date': key
      }, el('span', { class: 'booking-calendar__num' }, String(d)));

      if (isFull && !isPast) {
        button.append(el('span', { class: 'booking-calendar__note' }, '마감'));
      }
      if (isAvailable) {
        button.addEventListener('click', function () { selectDate(key); });
      } else {
        button.disabled = true;
      }
      calGrid.append(button);
    }
  }

  function moveMonth(step) {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + step, 1);
    renderCalendar();
    // 끝 달에 닿아 버튼이 비활성되면 반대쪽 버튼으로 포커스를 옮겨요
    if (document.activeElement && document.activeElement.disabled) {
      (step > 0 ? calPrev : calNext).focus();
    }
  }

  calPrev.addEventListener('click', function () { moveMonth(-1); });
  calNext.addEventListener('click', function () { moveMonth(1); });

  // 날짜를 바꾸면 시간과 인원 선택을 초기화해요
  function selectDate(key) {
    state.date = key;
    state.time = null;
    state.people = 1;
    calGrid.querySelectorAll('button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-date') === key));
    });
    renderOptions();
  }

  /* ---------- 시간·인원 ---------- */
  function renderOptions() {
    const day = state.date ? scheduleMap[state.date] : null;

    $('#sheet-options').hidden = !day;
    $('#options-hint').hidden = !!day;
    timeList.textContent = '';

    if (day) {
      day.slots.forEach(function (slot) {
        const isFull = slot.remaining === 0;
        const button = el('button', {
          type: 'button',
          class: 'chip booking-time' + (isFull ? ' chip--placeholder' : ''),
          'aria-pressed': String(slot.time === state.time)
        }, [
          el('span', {}, slot.time),
          el('small', {}, isFull ? '마감' : slot.remaining + '자리 남음')
        ]);
        if (isFull) {
          button.disabled = true;
        } else {
          button.addEventListener('click', function () { selectTime(slot.time); });
        }
        timeList.append(button);
      });
    }
    updateCounter();
    updateSummary();
  }

  function selectTime(time) {
    state.time = time;
    state.people = 1;
    timeList.querySelectorAll('button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.firstChild.textContent === time));
    });
    updateCounter();
    updateSummary();
  }

  // 인원 버튼은 aria-disabled로 막아서, 끝에 닿아도 포커스를 잃지 않게 해요
  function updateCounter() {
    const slot = findSlot();
    const max = slot ? slot.remaining : 1;
    $('#people-value').textContent = state.people + '명';
    peopleMinus.setAttribute('aria-disabled', String(!slot || state.people <= 1));
    peoplePlus.setAttribute('aria-disabled', String(!slot || state.people >= max));
    $('#people-hint').textContent = slot
      ? '이 시간대는 최대 ' + max + '명까지 예약할 수 있어요.'
      : '시간을 먼저 골라 주세요.';
  }

  function changePeople(step) {
    const slot = findSlot();
    if (!slot) { return; }
    const next = state.people + step;
    if (next < 1 || next > slot.remaining) { return; }
    state.people = next;
    updateCounter();
    updateSummary();
  }

  peopleMinus.addEventListener('click', function () { changePeople(-1); });
  peoplePlus.addEventListener('click', function () { changePeople(1); });

  /* ---------- 선택 요약과 결제 금액 ---------- */
  let lastAmount = '';

  function updateSummary() {
    const amountBox = $('#sum-amount');
    const amount = formatPrice(cls.price * state.people);

    $('#sum-date').textContent = state.date ? formatDateLabel(state.date) : '선택 전';
    $('#sum-time').textContent = state.time || '선택 전';
    $('#sum-people').textContent = state.people + '명';
    payButton.disabled = !(state.date && state.time);

    // 금액이 바뀔 때만 다시 써서 aria-live가 한 번만 읽게 해요
    if (amount !== lastAmount) {
      lastAmount = amount;
      amountBox.textContent = '';
      amountBox.append(el('span', {}, '결제 금액'), el('strong', {}, amount));
    }
  }

  /* ---------- 예약자 정보 확인 ---------- */
  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.value.trim()) { input.removeAttribute('aria-invalid'); }
    });
  });

  function checkBooker() {
    const empty = [nameInput, phoneInput].filter(function (input) { return !input.value.trim(); });
    [nameInput, phoneInput].forEach(function (input) {
      if (empty.indexOf(input) !== -1) { input.setAttribute('aria-invalid', 'true'); }
      else { input.removeAttribute('aria-invalid'); }
    });
    if (empty.length) {
      errorBox.textContent = '이름과 연락처를 입력해 주세요.';
      empty[0].focus();
      return false;
    }
    errorBox.textContent = '';
    return true;
  }

  function resetBooking() {
    state.date = null;
    state.time = null;
    state.people = 1;
    viewMonth = firstMonth;
    nameInput.value = '';
    phoneInput.value = '';
    nameInput.removeAttribute('aria-invalid');
    phoneInput.removeAttribute('aria-invalid');
    errorBox.textContent = '';
    renderCalendar();
    renderOptions();
  }

  /* ---------- 창 열고 닫기 (포커스 가두기, 뒤 페이지 스크롤 막기) ---------- */
  function setBackgroundInert(on) {
    background.forEach(function (node) { if (node) { node.inert = on; } });
  }

  // 닫힘 애니메이션이 끝나면 hidden 처리 (움직임 줄이기면 바로 끝나요)
  function hideAfterTransition() {
    let finished = false;
    function finish(e) {
      if (finished || (e && e.target !== sheetPanel)) { return; }
      finished = true;
      sheetPanel.removeEventListener('transitionend', finish);
      if (!sheet.classList.contains('is-open')) { sheet.hidden = true; }
    }
    sheetPanel.addEventListener('transitionend', finish);
    window.setTimeout(finish, 600);
  }

  function openSheet(button) {
    opener = button;
    renderCalendar();
    renderOptions();
    sheet.hidden = false;
    void sheet.offsetWidth; // 다음 프레임에 올라오는 애니메이션이 보이게
    sheet.classList.add('is-open');
    document.documentElement.classList.add('booking-lock');
    setBackgroundInert(true);
    sheetPanel.focus();
  }

  function closeSheet() {
    sheet.classList.remove('is-open');
    document.documentElement.classList.remove('booking-lock');
    setBackgroundInert(false);
    hideAfterTransition();
    if (opener) { opener.focus(); }
  }

  document.querySelectorAll('[data-open-sheet]').forEach(function (button) {
    button.addEventListener('click', function () { openSheet(button); });
  });

  sheet.querySelectorAll('[data-close-sheet]').forEach(function (node) {
    node.addEventListener('click', closeSheet);
  });

  /* ==========================================================
     7) 결제와 예약 완료
     ========================================================== */
  payButton.addEventListener('click', function () {
    const slot = findSlot();
    if (!slot || !checkBooker()) { return; }

    // 화면에서만 남은 자리를 줄여요 (새로고침하면 원래대로)
    slot.remaining -= state.people;

    const summary = $('#done-summary');
    summary.textContent = '';
    [
      ['클래스', cls.title],
      ['날짜', formatDateLabel(state.date)],
      ['시간', state.time],
      ['인원', state.people + '명'],
      ['결제 금액', formatPrice(cls.price * state.people)]
    ].forEach(function (row) {
      summary.append(el('div', {}, [el('dt', {}, row[0]), el('dd', {}, row[1])]));
    });

    doneDialog.hidden = false;
    sheet.inert = true;
    donePanel.focus();
  });

  function confirmDone() {
    doneDialog.hidden = true;
    sheet.inert = false;
    resetBooking();
    closeSheet();
  }

  $('#done-confirm').addEventListener('click', confirmDone);

  /* ---------- 키보드: ESC로 닫기, Tab은 창 안에서만 ---------- */
  document.addEventListener('keydown', function (e) {
    let active = null;
    if (!doneDialog.hidden) { active = donePanel; }
    else if (sheet.classList.contains('is-open')) { active = sheetPanel; }
    if (!active) { return; }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (active === donePanel) { confirmDone(); } else { closeSheet(); }
      return;
    }

    if (e.key !== 'Tab') { return; }
    const focusables = Array.prototype.filter.call(
      active.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])'),
      function (node) { return !node.disabled && node.offsetParent !== null; }
    );
    if (!focusables.length) { return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const inside = active.contains(document.activeElement);

    if (e.shiftKey && (document.activeElement === first || document.activeElement === active || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  });
})();
