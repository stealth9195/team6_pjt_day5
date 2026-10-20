/* ==========================================================
   home.js : 홈 화면 전용 동작
   - 클래스 종류와 예시 카드는 ../data/classes.js 의 데이터를 그대로 보여줘요 (직접 적지 않기)
   ========================================================== */

(function () {
  'use strict';

  var data = window.CLASS_DATA;
  if (!data) { return; }

  // 태그 하나를 만들어요. text 는 textContent 로 넣어서 안전해요
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  var categories = data.getCategories();

  /* ---------- 클래스 종류: 큰 글씨 줄 목록 ---------- */
  var types = document.getElementById('home-types');
  if (types) {
    categories.forEach(function (name) {
      var count = data.getClassesByCategory(name).length;
      var link = el('a', 'home-type');
      link.href = '../class/index.html';
      link.appendChild(el('span', 'home-type__name', name));
      link.appendChild(el('span', 'home-type__count', count + '개 클래스'));
      var item = el('li');
      item.appendChild(link);
      types.appendChild(item);
    });
  }

  /* ---------- 첫 화면 예시 카드: 카테고리마다 하나씩, 최대 3장 ---------- */
  var cards = document.getElementById('home-cards');
  if (cards) {
    categories.slice(0, 3).forEach(function (name) {
      var cls = data.getClassesByCategory(name)[0];
      var link = el('a', 'class-card home-card');
      link.href = '../class/index.html';

      link.appendChild(el('div', 'class-card__image', '이미지 자리'));

      var body = el('div');
      body.appendChild(el('p', 'class-card__title', cls.title));

      var meta = el('div', 'class-card__meta');
      meta.appendChild(el('div', '', cls.host + ' · ' + cls.location.region));
      meta.appendChild(el('div', '', cls.duration + '분 · ' + cls.price.toLocaleString('ko-KR') + '원'));
      body.appendChild(meta);

      link.appendChild(body);
      var item = el('li');
      item.appendChild(link);
      cards.appendChild(item);
    });
  }
})();
