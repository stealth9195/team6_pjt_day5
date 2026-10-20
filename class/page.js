/* ==========================================================
   class/page.js : 클래스(제품) 화면 전용 (담당: 윤정연)
   - 데이터는 data/classes.js의 window.CLASS_DATA만 사용 (복사·fetch 금지)
   - 카테고리는 하나만 선택('전체' 포함), 필터 칩은 여러 개 선택
   - 같은 필터 안에서는 하나라도 맞으면, 진행시간과 요일은 둘 다 맞아야 보여 줌
   ========================================================== */

(function () {
  'use strict';

  var data = window.CLASS_DATA;
  var ALL = '전체';
  var DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  var DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // 월요일부터 보여 줌

  var state = { category: ALL, durations: [], days: [] };

  var categoryList = document.getElementById('classes-categories');
  var durationGroup = document.getElementById('classes-duration');
  var dayGroup = document.getElementById('classes-day');
  var status = document.getElementById('classes-status');
  var list = document.getElementById('classes-list');

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function formatPrice(value) {
    return value.toLocaleString('ko-KR') + '원';
  }

  // 'YYYY-MM-DD'를 로컬 날짜로 읽어 요일 번호(0=일)를 돌려줌
  function dayOf(dateText) {
    var p = dateText.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getDay();
  }

  function classDays(cls) {
    var days = [];
    cls.schedule.forEach(function (item) {
      var d = dayOf(item.date);
      if (days.indexOf(d) === -1) { days.push(d); }
    });
    return days;
  }

  /* ---------- 카테고리 ---------- */
  function renderCategories() {
    var names = [ALL].concat(data.getCategories());
    categoryList.innerHTML = names.map(function (name) {
      var pressed = name === state.category ? 'true' : 'false';
      return '<li><button type="button" class="category" aria-pressed="' + pressed + '" data-category="' +
        escapeHtml(name) + '"><span class="category__icon" aria-hidden="true"></span>' +
        escapeHtml(name) + '</button></li>';
    }).join('');
  }

  categoryList.addEventListener('click', function (event) {
    var button = event.target.closest('.category');
    if (!button) { return; }
    state.category = button.getAttribute('data-category');
    Array.prototype.forEach.call(categoryList.querySelectorAll('.category'), function (b) {
      b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
    });
    renderList();
  });

  /* ---------- 필터 칩 ---------- */
  function renderChips(group, items) {
    group.innerHTML = items.map(function (item) {
      return '<button type="button" class="chip" aria-pressed="false" data-value="' + item.value + '">' +
        escapeHtml(item.label) + '</button>';
    }).join('');
  }

  function bindChips(group, key) {
    group.addEventListener('click', function (event) {
      var chip = event.target.closest('.chip');
      if (!chip) { return; }
      var value = Number(chip.getAttribute('data-value'));
      var pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      state[key] = pressed
        ? state[key].filter(function (v) { return v !== value; })
        : state[key].concat(value);
      renderList();
    });
  }

  var durations = [];
  data.classes.forEach(function (cls) {
    if (durations.indexOf(cls.duration) === -1) { durations.push(cls.duration); }
  });
  durations.sort(function (a, b) { return a - b; });

  /* ---------- 목록 ---------- */
  function matches(cls) {
    if (state.durations.length && state.durations.indexOf(cls.duration) === -1) { return false; }
    if (state.days.length) {
      var days = classDays(cls);
      var hit = state.days.some(function (d) { return days.indexOf(d) !== -1; });
      if (!hit) { return false; }
    }
    return true;
  }

  function cardHtml(cls) {
    var img = cls.images[0];
    var price = '<strong>' + formatPrice(cls.price) + '</strong>';
    if (cls.originalPrice !== null) {
      price += '<del>' + formatPrice(cls.originalPrice) + '</del>';
    }
    return '' +
      '<a class="class-card classes-card" href="../class-detail/index.html?id=' + encodeURIComponent(cls.id) + '">' +
        // 사진을 못 불러오면 사진을 지우고 대체 색(img.color)을 보여 줘요
        '<div class="class-card__image classes-card__image" style="background: var(' + img.color + ')">' +
          '<img src="' + escapeHtml(img.src) + '" alt="' + escapeHtml(img.alt) + '" loading="lazy" decoding="async" onerror="this.remove()">' +
        '</div>' +
        '<div>' +
          '<p class="classes-card__category">' + escapeHtml(cls.category) + '</p>' +
          '<p class="class-card__title">' + escapeHtml(cls.title) + '</p>' +
          '<p class="classes-card__host">' + escapeHtml(cls.host) + '</p>' +
          '<p class="classes-card__summary">' + escapeHtml(cls.summary) + '</p>' +
          '<dl class="class-card__meta">' +
            '<div><dt>지역</dt><dd>' + escapeHtml(cls.location.region) + '</dd></div>' +
            '<div><dt>진행시간</dt><dd>' + cls.duration + '분</dd></div>' +
            '<div><dt>난이도</dt><dd>' + escapeHtml(cls.level) + '</dd></div>' +
            '<div><dt>평점</dt><dd>★ ' + cls.rating + ' (후기 ' + cls.reviewCount + ')</dd></div>' +
          '</dl>' +
          '<p class="classes-card__price">' + price + '</p>' +
        '</div>' +
      '</a>';
  }

  function renderList() {
    var pool = state.category === ALL ? data.classes : data.getClassesByCategory(state.category);
    var shown = pool.filter(matches);

    list.innerHTML = shown.length
      ? shown.map(cardHtml).join('')
      : '<p class="classes-empty">조건에 맞는 클래스가 없어요. 필터를 줄여 보세요.</p>';

    var filters = state.durations.map(function (v) { return v + '분'; })
      .concat(state.days.map(function (d) { return DAYS[d] + '요일'; }));
    status.textContent = state.category + ' · 클래스 ' + shown.length + '개' +
      (filters.length ? ' · 선택한 필터: ' + filters.join(', ') : '');
  }

  /* ---------- 시작 ---------- */
  renderCategories();
  renderChips(durationGroup, durations.map(function (v) { return { value: v, label: v + '분' }; }));
  renderChips(dayGroup, DAY_ORDER.map(function (d) { return { value: d, label: DAYS[d] }; }));
  bindChips(durationGroup, 'durations');
  bindChips(dayGroup, 'days');
  renderList();
})();
