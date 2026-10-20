/* ==========================================================
   layout.js : 모든 페이지 공통 머리글·바닥글 + 공통 부품 동작 (원본: freely_co/freely.html)
   - 메뉴 이름이나 순서를 바꿀 때는 아래 pages 한 곳만 고치면 모든 페이지에 반영됨
   - 각 페이지의 <body data-page="..."> 값으로 '지금 보는 페이지'를 표시함
     (예약·상세처럼 메뉴에 없는 화면은 들어온 메뉴 값을 쓴다. 예: data-page="class")
   - 링크는 이 파일 위치(레포 루트)를 기준으로 만들어서, 페이지가 어느 폴더에 있어도 맞음
   ========================================================== */

(function () {
  'use strict';

  var pages = [
    { key: 'home',  href: 'index.html',       label: '홈' },
    { key: 'class', href: 'class/index.html', label: '클래스' },
    { key: 'about', href: 'about/index.html', label: '회사소개' }
  ];

  // 이 스크립트 주소에서 파일 이름을 떼면 레포 루트 주소가 됨
  var root = document.currentScript.src.replace(/layout\.js(\?.*)?$/, '');
  var current = document.body.getAttribute('data-page');

  var links = pages.map(function (page) {
    var aria = page.key === current ? ' aria-current="page"' : '';
    return '<li><a href="' + root + page.href + '"' + aria + '>' + page.label + '</a></li>';
  }).join('');

  var header = document.getElementById('site-header');
  if (header) {
    header.innerHTML =
      '<a class="skip-link" href="#main">본문으로 건너뛰기</a>' +
      '<div class="container site-header__inner">' +
        '<a class="wordmark" href="' + root + 'index.html">Freely</a>' +
        '<nav class="site-nav" aria-label="주요 메뉴"><ul>' + links + '</ul></nav>' +
      '</div>';
  }

  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML =
      '<div class="container">' +
        '<p>제작 중인 초안이에요. [확인 필요]로 표시한 곳과 예시 화면은 실제 정보가 아니에요.</p>' +
      '</div>';
  }
})();

/* ==========================================================
   공통 부품의 동작
   - 카테고리(.category)는 하나만, 필터 칩(button.chip)은 여러 개 선택
   - 선택 상태는 aria-pressed 값으로 표시 (CSS가 이 값을 보고 모양을 바꿈)
   - 필터 선택 안내 문구가 필요하면 페이지에 .filter-status 요소를 두면 됨
   ========================================================== */

(function () {
  'use strict';

  /* ---------- 카테고리: 하나만 선택 ---------- */
  var categories = Array.prototype.slice.call(document.querySelectorAll('.category'));

  categories.forEach(function (button) {
    button.addEventListener('click', function () {
      var wasPressed = button.getAttribute('aria-pressed') === 'true';
      categories.forEach(function (other) {
        other.setAttribute('aria-pressed', 'false');
      });
      button.setAttribute('aria-pressed', wasPressed ? 'false' : 'true');
    });
  });

  /* ---------- 필터: 여러 개 선택 + 선택 상태 안내 ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('button.chip'));

  function updateStatus() {
    var status = document.querySelector('.filter-status');
    if (!status) { return; }
    var selected = chips
      .filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.textContent.trim(); });

    status.textContent = selected.length
      ? '선택한 필터: ' + selected.join(', ')
      : '선택한 필터가 없어요.';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      updateStatus();
    });
  });
})();
