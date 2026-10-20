/*
 * 원데이 클래스 공통 목업 데이터
 * - 목록 페이지와 예약 상세 페이지가 함께 사용해요.
 * - 불러오기: <script src="../data/classes.js"></script>
 * - 사용하기: window.CLASS_DATA.classes / getClassById(id) / getCategories() / getClassesByCategory(category)
 * - 모든 업체명, 강사 닉네임, 주소, 후기는 가상 데이터예요.
 * - 수정이 필요하면 데이터 담당자에게 요청해 주세요.
 */
(function () {
  // style.css의 공통 색 변수 이름이에요.
  // 이미지의 tone 값이 이 배열의 번호를 가리켜요. 색을 바꿀 때는 이 배열만 고치면 돼요.
  const IMAGE_COLORS = ['--color-step-1', '--color-step-2', '--color-line', '--color-surface'];

  // 사진 위치: 페이지가 모두 한 단계 아래 폴더(예: class-detail/)에 있어서 ../data/images/ 기준이에요.
  // 사진 출처는 data/images/CREDITS.md에 있어요. 사진을 못 불러오면 color(대체 색)를 써 주세요.
  const IMAGE_BASE = '../data/images/';
  const IMAGE_SOURCE = 'Unsplash';

  /* ---------- 날짜 도우미 ---------- */

  // 오늘 0시 기준 n일 뒤 날짜
  function addDays(base, n) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  // 로컬 시간 기준 'YYYY-MM-DD' (toISOString은 시차 때문에 날짜가 하루 밀릴 수 있어요)
  function formatDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  /* ---------- 클래스 원본 데이터 ---------- */

  const rawClasses = [
    {
      id: 'c001',
      category: '공예',
      title: '물레로 빚는 나만의 머그컵',
      host: '흙손',
      price: 55000,
      originalPrice: 65000,
      location: { region: '서울 마포구', address: '망원동 골목 안 1층 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 120,
      level: '입문',
      maxPeople: 6,
      summary: '처음이어도 괜찮아요. 물레 위에서 나만의 머그컵을 빚어요.',
      images: [
        { tone: 0, src: 'c001-1.jpg', alt: '완성된 머그컵', credit: { author: 'cafeconcetto', url: 'https://unsplash.com/photos/4fXPCj0_828' } },
        { tone: 1, src: 'c001-2.jpg', alt: '물레 위에서 흙을 다듬는 손', credit: { author: 'Earl Wilcox', url: 'https://unsplash.com/photos/iUbsw_VOkbM' } },
        { tone: 2, src: 'c001-3.jpg', alt: '붓으로 유약을 칠하는 모습', credit: { author: 'Pew Nguyen', url: 'https://unsplash.com/photos/ZgO_ohK2V6A' } },
        { tone: 3, src: 'c001-4.jpg', alt: '유약을 담은 그릇들', credit: { author: 'Tuan Nguyen', url: 'https://unsplash.com/photos/tGK68eoSsbU' } },
        { tone: 1, src: 'c001-5.jpg', alt: '가마 앞에 놓인 컵들', credit: { author: 'Viviane Okubo', url: 'https://unsplash.com/photos/2ZnkIsutb4g' } }
      ],
      description: `안녕하세요, 망원동 작은 도자기 공방의 흙손이에요 :)
손끝으로 흙을 만지다 보면 마음이 몽글몽글 편안해지더라고요. 이 클래스에서는 물레를 직접 돌려서 매일 쓰고 싶은 나만의 머그컵을 만들어요.

이런 분께 추천해요
- 도자기는 처음이지만 한 번쯤 꼭 해 보고 싶었던 분
- 손으로 무언가를 만들며 쉬어 가고 싶은 분
- 소중한 사람에게 직접 만든 선물을 주고 싶은 분

커리큘럼
1. 흙 반죽하기와 물레 사용법 익히기
2. 물레 위에서 컵 모양 올리기
3. 손잡이 붙이고 모양 다듬기
4. 원하는 유약 색 고르기

준비물과 제공 사항
- 흙, 도구, 앞치마는 모두 준비해 두었어요.
- 흙이 묻어도 괜찮은 편한 옷을 입고 와 주세요.
- 완성품은 굽기를 마친 뒤 약 3~4주 후에 공방에서 찾아가실 수 있어요.

서툴러도 괜찮아요. 삐뚤빼뚤한 모양도 다 나만의 매력이 되니까요. 공방에서 따뜻하게 기다리고 있을게요!`,
      reviews: [
        { nickname: '주말공방러', rating: 5, date: '2026-09-28', text: '선생님이 정말 다정하게 알려 주셔서 처음인데도 컵 모양이 잘 나왔어요. 찾으러 가는 날이 기다려져요.' },
        { nickname: '망원산책', rating: 5, date: '2026-09-14', text: '두 시간이 금방 지나갔어요. 공방 분위기가 너무 아늑해요.' },
        { nickname: '초록머그', rating: 4, date: '2026-08-30', text: '물레가 생각보다 어려웠지만 옆에서 계속 도와주셔서 완성했어요.' },
        { nickname: '하루한잔', rating: 5, date: '2026-08-17', text: '친구랑 같이 예약했는데 둘 다 만족했어요. 다음엔 접시 클래스도 듣고 싶어요.' }
      ]
    },
    {
      id: 'c002',
      category: '공예',
      title: '한 땀 한 땀 가죽 카드지갑',
      host: '바늘땀',
      price: 48000,
      originalPrice: null,
      location: { region: '서울 성동구', address: '성수동 주택가 안쪽 2층 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 150,
      level: '초급',
      maxPeople: 4,
      summary: '손바느질로 오래 쓰는 가죽 카드지갑을 완성해요.',
      images: [
        { tone: 1, src: 'c002-1.jpg', alt: '완성된 가죽 카드지갑', credit: { author: 'Ethan Rougon', url: 'https://unsplash.com/photos/oIlix2slmsI' } },
        { tone: 0, src: 'c002-2.jpg', alt: '가죽 색상 견본', credit: { author: 'Kelly Sikkema', url: 'https://unsplash.com/photos/qATevUkntlo' } },
        { tone: 3, src: 'c002-3.jpg', alt: '가죽을 한 땀씩 꿰매는 손', credit: { author: 'Artem Maltsev', url: 'https://unsplash.com/photos/_ikF9TK2bTs' } },
        { tone: 2, src: 'c002-4.jpg', alt: '가죽 공예 도구', credit: { author: 'Jamie Hagan', url: 'https://unsplash.com/photos/HG2Ui3Dj7ag' } },
        { tone: 0, src: 'c002-5.jpg', alt: '정돈된 공방 작업대', credit: { author: 'Joel Lee', url: 'https://unsplash.com/photos/p2dpUK3AfCM' } }
      ],
      description: `안녕하세요. 성수동에서 가죽 공방을 운영하는 바늘땀입니다.
가죽은 쓰면 쓸수록 손때가 묻어 더 멋스러워지는 소재예요. 이 클래스에서는 재단부터 손바느질, 마감까지 직접 해 보며 카드지갑 하나를 완성합니다.

이런 분께 추천해요
- 차분하게 한 가지에 집중하는 시간을 좋아하는 분
- 오래 쓸 수 있는 물건을 직접 만들고 싶은 분
- 이니셜을 새긴 선물을 준비하고 싶은 분

커리큘럼
1. 가죽 색 고르기와 재단하기
2. 바느질 구멍 내기
3. 새들 스티치로 손바느질하기
4. 모서리 마감과 이니셜 각인

준비물과 제공 사항
- 가죽, 실, 바늘, 공구는 모두 공방에서 준비합니다.
- 바느질이 처음이어도 따라오실 수 있도록 천천히 진행합니다.
- 완성한 지갑은 당일 바로 가져가실 수 있습니다.

조용한 공방에서 한 땀씩 쌓아 가는 시간을 함께 보내셨으면 합니다. 기다리겠습니다.`,
      reviews: [
        { nickname: '성수동고양이', rating: 5, date: '2026-10-05', text: '설명이 차분하고 꼼꼼해서 처음인데도 바느질이 깔끔하게 나왔어요.' },
        { nickname: '가죽초보', rating: 4, date: '2026-09-19', text: '생각보다 손이 많이 가지만 그만큼 뿌듯해요. 손이 좀 아팠어요.' },
        { nickname: '이니셜J', rating: 4, date: '2026-09-02', text: '각인까지 해서 선물했는데 반응이 아주 좋았어요.' }
      ]
    },
    {
      id: 'c003',
      category: '요리·베이킹',
      title: '버터 향 가득 휘낭시에',
      host: '오븐곰',
      price: 42000,
      originalPrice: 50000,
      location: { region: '서울 용산구', address: '해방촌 언덕길 베이킹 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 120,
      level: '입문',
      maxPeople: 8,
      summary: '갈색 버터 향이 솔솔, 휘낭시에 두 가지 맛을 구워요.',
      images: [
        { tone: 2, src: 'c003-1.jpg', alt: '갓 구운 휘낭시에', credit: { author: 'Luna Hu', url: 'https://unsplash.com/photos/g6-zftnM7VM' } },
        { tone: 0, src: 'c003-2.jpg', alt: '달군 프라이팬', credit: { author: 'Cristian Guillen', url: 'https://unsplash.com/photos/CqgFTnrdDm0' } },
        { tone: 3, src: 'c003-3.jpg', alt: '반죽을 짜는 모습', credit: { author: 'Leonardo Cirimbelli', url: 'https://unsplash.com/photos/Mh2mOcRZvCQ' } },
        { tone: 1, src: 'c003-4.jpg', alt: '상자에 담은 마카롱', credit: { author: 'Haberdoedas', url: 'https://unsplash.com/photos/-IAZcga6uNk' } },
        { tone: 2, src: 'c003-5.jpg', alt: '오븐 옆 트레이 선반', credit: { author: 'Ambitious Studio* | Rick Barrett', url: 'https://unsplash.com/photos/eNXF-vU-F3w' } }
      ],
      description: `안녕하세요~ 해방촌 베이킹 공방의 오븐곰이에요!
공방 문을 열면 고소한 버터 향부터 반겨 드려요. 오늘은 겉은 바삭, 속은 촉촉한 휘낭시에를 플레인과 얼그레이 두 가지 맛으로 구워 볼 거예요.

이런 분께 추천해요
- 베이킹은 처음인데 실패 없이 맛있게 구워 보고 싶은 분
- 집에서도 따라 할 수 있는 레시피가 궁금한 분
- 직접 구운 디저트를 선물하고 싶은 분

커리큘럼
1. 갈색 버터 만들기
2. 두 가지 맛 반죽 섞기
3. 틀에 짜서 굽기
4. 식히는 동안 예쁘게 포장하기

준비물과 제공 사항
- 재료, 도구, 앞치마, 포장 상자 모두 준비돼 있어요.
- 집에서 다시 만들어 볼 수 있게 레시피 카드를 드려요.
- 구운 휘낭시에는 전부 가져가실 수 있어요.

맛있는 냄새 맡으면서 즐겁게 구워 봐요! 그날 만나요~`,
      reviews: [
        { nickname: '디저트요정', rating: 5, date: '2026-10-11', text: '버터 향이 진짜 미쳤어요. 집에 가져가니까 가족들이 다 먹어 버렸어요.' },
        { nickname: '빵순이', rating: 5, date: '2026-09-27', text: '선생님 텐션이 높아서 내내 웃으면서 만들었어요.' },
        { nickname: '얼그레이러버', rating: 4, date: '2026-09-13', text: '얼그레이 맛이 특히 맛있었어요. 사람이 많아서 조금 바빴어요.' },
        { nickname: '오늘도간식', rating: 5, date: '2026-08-29', text: '레시피 카드 덕분에 집에서도 한 번 더 구워 봤어요!' },
        { nickname: '해방촌주민', rating: 4, date: '2026-08-16', text: '가까워서 예약했는데 생각보다 훨씬 알찼어요.' }
      ]
    },
    {
      id: 'c004',
      category: '요리·베이킹',
      title: '제철 재료로 차리는 한 그릇 집밥',
      host: '소반',
      price: 58000,
      originalPrice: null,
      location: { region: '경기 성남시 분당구', address: '정자동 카페거리 근처 쿠킹 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 150,
      level: '초급',
      maxPeople: 6,
      summary: '그달의 제철 재료로 한 그릇 밥과 곁들이 반찬을 만들어요.',
      images: [
        { tone: 3, src: 'c004-1.jpg', alt: '정갈하게 담은 한 그릇 밥', credit: { author: 'Nikolay Smeh', url: 'https://unsplash.com/photos/gPpbFaEkl00' } },
        { tone: 1, src: 'c004-2.jpg', alt: '제철 채소', credit: { author: 'Anna Voss', url: 'https://unsplash.com/photos/1ZpWD3Ay9vU' } },
        { tone: 0, src: 'c004-3.jpg', alt: '냄비에서 끓는 국물', credit: { author: 'jurien huggins', url: 'https://unsplash.com/photos/StMkapA93O4' } },
        { tone: 2, src: 'c004-4.jpg', alt: '함께 차린 식탁', credit: { author: 'Jakub Kapusnak', url: 'https://unsplash.com/photos/4f4YZfDMLeU' } },
        { tone: 3, src: 'c004-5.jpg', alt: '곁들이 반찬이 가득한 상', credit: { author: 'Cecelia Chang', url: 'https://unsplash.com/photos/kCkv2HTm3Y8' } }
      ],
      description: `안녕하세요, 소반입니다.
거창한 요리보다 매일 먹는 밥 한 그릇을 잘 차리는 일이 더 어렵고 소중하다고 생각해요. 이 클래스에서는 그달에 가장 맛있는 재료로 한 그릇 밥과 반찬 두 가지를 만듭니다.

이런 분께 추천해요
- 자취를 시작해서 기본 집밥을 익히고 싶은 분
- 제철 재료를 어떻게 손질하는지 궁금한 분
- 직접 만든 음식을 천천히 먹으며 쉬고 싶은 분

커리큘럼
1. 오늘의 제철 재료 소개와 손질
2. 한 그릇 밥 짓기
3. 곁들이 반찬 두 가지 만들기
4. 함께 차려 먹기

준비물과 제공 사항
- 재료와 조리 도구, 앞치마를 준비해 둡니다.
- 만든 음식은 공방에서 함께 드시고, 남은 반찬은 포장해 드립니다.
- 알레르기가 있으시면 예약할 때 미리 알려 주세요.

따뜻한 밥 한 그릇 앞에서 천천히 이야기 나누면 좋겠습니다. 편하게 오세요.`,
      reviews: [
        { nickname: '자취3년차', rating: 5, date: '2026-10-08', text: '기본기를 제대로 배운 느낌이에요. 집에서도 바로 해 먹었어요.' },
        { nickname: '정자동이웃', rating: 4, date: '2026-09-21', text: '분위기가 조용하고 편안해요. 반찬 포장해 주셔서 좋았어요.' },
        { nickname: '요리는어려워', rating: 3, date: '2026-09-06', text: '맛은 좋았는데 저한테는 진도가 조금 빨랐어요.' },
        { nickname: '가을무', rating: 5, date: '2026-08-24', text: '제철 재료 이야기를 많이 들려주셔서 장 보는 눈이 생겼어요.' }
      ]
    },
    {
      id: 'c005',
      category: '드로잉',
      title: '펜과 수채로 그리는 동네 풍경',
      host: '산책화가',
      price: 38000,
      originalPrice: null,
      location: { region: '서울 종로구', address: '서촌 한옥 골목 안 드로잉 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 120,
      level: '입문',
      maxPeople: 8,
      summary: '펜 선 위에 수채 물감을 얹어 좋아하는 골목 풍경을 그려요.',
      images: [
        { tone: 1, src: 'c005-1.jpg', alt: '수채로 풍경을 그리는 모습', credit: { author: 'M. Ed.', url: 'https://unsplash.com/photos/a-man-sitting-down-while-painting-with-a-brush-9QGZ0_swUkw' } },
        { tone: 3, src: 'c005-2.jpg', alt: '펜으로 그린 밑그림', credit: { author: 'Kyoshi Reyes', url: 'https://unsplash.com/photos/wodjj9GqzSY' } },
        { tone: 2, src: 'c005-3.jpg', alt: '수채 팔레트와 붓', credit: { author: 'Callum Hill', url: 'https://unsplash.com/photos/Yt7orZ6v3vc' } },
        { tone: 0, src: 'c005-4.jpg', alt: '창가 작업 자리', credit: { author: 'Justin Sleight', url: 'https://unsplash.com/photos/uSyTtusi9ls' } },
        { tone: 1, src: 'c005-5.jpg', alt: '나란히 걸린 그림들', credit: { author: 'Blake Wisz', url: 'https://unsplash.com/photos/Sg4epwbykCU' } }
      ],
      description: `안녕하세요. 서촌에서 드로잉 공방을 운영하는 산책화가입니다.
매일 지나는 골목도 천천히 들여다보면 그릴 것이 참 많습니다. 이 클래스에서는 펜으로 선을 그리고 수채 물감으로 색을 얹어 엽서 크기의 풍경 한 장을 완성합니다.

이런 분께 추천해요
- 그림은 자신 없지만 한 번 그려 보고 싶었던 분
- 여행 사진을 그림으로 남기고 싶은 분
- 조용히 집중하는 시간이 필요한 분

커리큘럼
1. 사진에서 그릴 장면 고르기
2. 펜으로 큰 형태부터 선 그리기
3. 수채 물감으로 색 얹기
4. 그림자와 디테일 마무리

준비물과 제공 사항
- 펜, 물감, 붓, 수채 엽서 용지를 준비해 두었습니다.
- 그리고 싶은 풍경 사진이 있으면 휴대폰에 담아 오세요. 없으면 공방 예시 사진을 드립니다.
- 완성한 그림은 투명 봉투에 담아 가져가실 수 있습니다.

잘 그리는 것보다 오래 바라보는 시간이 더 중요하다고 생각합니다. 편안한 마음으로 오세요.`,
      reviews: [
        { nickname: '그림일기', rating: 5, date: '2026-10-12', text: '선 하나하나 천천히 그리는 법을 알려 주셔서 마음이 차분해졌어요.' },
        { nickname: '서촌여행자', rating: 5, date: '2026-09-25', text: '여행 사진으로 그렸는데 액자에 넣어 두었어요.' },
        { nickname: '곰손', rating: 4, date: '2026-09-10', text: '곰손인데도 그럴듯한 그림이 나와서 놀랐어요.' }
      ]
    },
    {
      id: 'c006',
      category: '드로잉',
      title: '처음 해 보는 아이패드 드로잉',
      host: '픽셀토끼',
      price: 45000,
      originalPrice: 52000,
      location: { region: '서울 강남구', address: '역삼동 오피스 거리 근처 디지털 드로잉 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 150,
      level: '초급',
      maxPeople: 6,
      summary: '아이패드로 귀여운 캐릭터 스티커를 그려 바로 써 봐요.',
      images: [
        { tone: 2, src: 'c006-1.jpg', alt: '캐릭터 스티커', credit: { author: 'Didhin Kurian', url: 'https://unsplash.com/photos/GupN8--SeRQ' } },
        { tone: 0, src: 'c006-2.jpg', alt: '아이패드 화면 속 드로잉', credit: { author: 'Tony Sebastian', url: 'https://unsplash.com/photos/7sWm1yRJZhg' } },
        { tone: 1, src: 'c006-3.jpg', alt: '펜슬로 그리는 손', credit: { author: 'Balázs Kétyi', url: 'https://unsplash.com/photos/byoBbHSlP5U' } },
        { tone: 3, src: 'c006-4.jpg', alt: '태블릿이 놓인 작업 책상', credit: { author: 'Salvador Rios', url: 'https://unsplash.com/photos/w3mSws0IAU4' } },
        { tone: 2, src: 'c006-5.jpg', alt: '빈 화면에서 시작하는 드로잉', credit: { author: 'Kelly Sikkema', url: 'https://unsplash.com/photos/eETLL__2DLo' } }
      ],
      description: `안녕하세요! 디지털 드로잉 공방의 픽셀토끼예요 🐰
아이패드는 있는데 그림은 어떻게 시작해야 할지 막막하셨죠? 저도 그랬어요! 이 클래스에서는 기본 기능부터 차근차근 익히고, 나만의 캐릭터 스티커를 그려서 바로 써 봐요.

이런 분께 추천해요
- 아이패드를 샀는데 그림 앱은 아직 낯선 분
- 내 캐릭터를 만들어 보고 싶은 분
- 다이어리 꾸미기나 메신저에 쓸 스티커가 필요한 분

커리큘럼
1. 그림 앱 기본 기능과 브러시 익히기
2. 레이어로 밑그림과 선 따기
3. 색 채우고 표정 바꿔 보기
4. 스티커 파일로 저장하기

준비물과 제공 사항
- 아이패드와 펜슬이 있으면 가져와 주세요. 없으시면 공방 기기를 빌려 드려요.
- 바로 쓸 수 있는 브러시 파일을 함께 드려요.
- 완성한 파일은 내 기기에 저장해서 가져가시면 돼요.

어렵게 생각하지 말고 낙서하듯 편하게 그려 봐요. 같이 재밌게 해요!`,
      reviews: [
        { nickname: '아이패드장식용', rating: 5, date: '2026-10-09', text: '드디어 아이패드를 그림 그리는 데 써 봤어요. 레이어 개념이 이제 이해돼요!' },
        { nickname: '토끼덕후', rating: 5, date: '2026-09-23', text: '선생님이 친근하게 알려 주셔서 질문하기 편했어요.' },
        { nickname: '다꾸러', rating: 4, date: '2026-09-07', text: '스티커 만들어서 다이어리에 잘 쓰고 있어요.' },
        { nickname: '퇴근후취미', rating: 3, date: '2026-08-22', text: '내용은 좋은데 기기를 빌려 쓰니 조금 불편했어요. 개인 기기 가져가시는 걸 추천해요.' }
      ]
    },
    {
      id: 'c007',
      category: '플라워',
      title: '계절 꽃으로 묶는 핸드타이드 꽃다발',
      host: '들꽃',
      price: 65000,
      originalPrice: null,
      location: { region: '서울 서초구', address: '방배동 카페골목 근처 플라워 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 90,
      level: '입문',
      maxPeople: 6,
      summary: '그 계절에 가장 예쁜 꽃으로 내 손으로 꽃다발을 묶어요.',
      images: [
        { tone: 0, src: 'c007-1.jpg', alt: '완성된 핸드타이드 꽃다발', credit: { author: 'Georg Eiermann', url: 'https://unsplash.com/photos/RUj802f-1ho' } },
        { tone: 2, src: 'c007-2.jpg', alt: '양동이에 담긴 계절 꽃', credit: { author: 'Hannah Olinger', url: 'https://unsplash.com/photos/CNgHaJwT5Pk' } },
        { tone: 3, src: 'c007-3.jpg', alt: '꽃을 손에 쥐고 다듬는 모습', credit: { author: 'Zoë Warmerdam', url: 'https://unsplash.com/photos/NYIQd71qBqM' } },
        { tone: 1, src: 'c007-4.jpg', alt: '포장지와 리본', credit: { author: 'Katie Goertzen', url: 'https://unsplash.com/photos/tViVueds3YI' } },
        { tone: 0, src: 'c007-5.jpg', alt: '꽃이 가득한 공방 안', credit: { author: 'Aurora Song', url: 'https://unsplash.com/photos/Qk5ZKKPJ5H8' } }
      ],
      description: `안녕하세요, 방배동 꽃 공방의 들꽃이에요.
꽃을 한 송이씩 골라 손에 쥐다 보면 어느새 마음까지 환해지는 것 같아요. 이 클래스에서는 그 계절에 가장 예쁜 꽃으로 핸드타이드 꽃다발을 직접 묶어 봐요.

이런 분께 추천해요
- 꽃을 좋아하지만 직접 만져 본 적은 없는 분
- 기념일에 특별한 꽃 선물을 준비하고 싶은 분
- 바쁜 일상 속에서 잠깐 쉬어 가고 싶은 분

커리큘럼
1. 오늘의 꽃 소개와 컨디셔닝
2. 꽃을 나선형으로 잡는 법 익히기
3. 나만의 꽃다발 묶기
4. 포장하고 리본으로 마무리

준비물과 제공 사항
- 꽃, 포장지, 리본, 가위를 모두 준비해 두었어요.
- 꽃을 오래 보는 관리 방법을 알려 드려요.
- 완성한 꽃다발은 바로 들고 가실 수 있어요.

예쁜 꽃 고르러 오는 마음으로 가볍게 오세요. 꽃 준비해 두고 기다릴게요.`,
      reviews: [
        { nickname: '꽃길만', rating: 5, date: '2026-10-14', text: '엄마 생신 선물로 만들었는데 정말 좋아하셨어요.' },
        { nickname: '방배동주민', rating: 5, date: '2026-09-30', text: '꽃이 싱싱하고 종류도 많아서 고르는 재미가 있었어요.' },
        { nickname: '리본묶기장인', rating: 4, date: '2026-09-16', text: '포장이 어려웠는데 끝까지 도와주셨어요.' },
        { nickname: '일요일오후', rating: 5, date: '2026-09-01', text: '한 시간 반이 짧게 느껴졌어요. 다음 계절에 또 올게요.' }
      ]
    },
    {
      id: 'c008',
      category: '플라워',
      title: '오래 두고 보는 드라이플라워 리스',
      host: '마른꽃',
      price: 52000,
      originalPrice: null,
      location: { region: '경기 고양시 일산동구', address: '정발산동 주택가 1층 플라워 공방 (상세 위치는 예약 후 안내해 드려요)' },
      duration: 120,
      level: '중급',
      maxPeople: 5,
      summary: '말린 꽃과 열매로 벽에 걸어 두는 리스를 만들어요.',
      images: [
        { tone: 3, src: 'c008-1.jpg', alt: '벽에 걸린 드라이플라워 리스', credit: { author: 'Annie Spratt', url: 'https://unsplash.com/photos/234X29Rt9wo' } },
        { tone: 1, src: 'c008-2.jpg', alt: '종류별로 정리한 드라이플라워', credit: { author: 'micheile henderson', url: 'https://unsplash.com/photos/XPCdZXncj64' } },
        { tone: 0, src: 'c008-3.jpg', alt: '리스 틀과 재료', credit: { author: 'Fabien TWB', url: 'https://unsplash.com/photos/8yE39sQU3cI' } },
        { tone: 2, src: 'c008-4.jpg', alt: '열매와 소재 디테일', credit: { author: 'pure julia', url: 'https://unsplash.com/photos/oTRsFRfdlJ0' } },
        { tone: 3, src: 'c008-5.jpg', alt: '창가에 놓인 드라이플라워', credit: { author: 'Martin Templeman', url: 'https://unsplash.com/photos/GKhwIBk_4cQ' } }
      ],
      description: `안녕하세요. 일산에서 드라이플라워 공방을 하고 있는 마른꽃입니다.
생화의 화려함과는 또 다른, 말린 꽃만의 차분한 색감을 좋아합니다. 이 클래스에서는 여러 종류의 드라이플라워와 열매로 오래 걸어 둘 수 있는 리스를 만듭니다.

이런 분께 추천해요
- 꽃 클래스를 한두 번 들어 보고 다음 단계가 궁금한 분
- 집 안에 오래 두고 볼 인테리어 소품이 필요한 분
- 색 조합을 고민하며 천천히 만드는 시간을 좋아하는 분

커리큘럼
1. 드라이플라워 종류와 색 조합 살펴보기
2. 리스 틀에 기본 소재 채우기
3. 메인 꽃과 열매로 포인트 주기
4. 균형 다듬고 걸이 달기

준비물과 제공 사항
- 리스 틀, 드라이플라워, 열매, 글루건 등 재료는 모두 준비해 둡니다.
- 마른 꽃잎이 떨어질 수 있으니 니트보다는 매끈한 옷을 추천합니다.
- 완성한 리스는 전용 상자에 담아 드립니다.

손이 많이 가는 만큼 오래 곁에 두실 수 있는 작품이 됩니다. 공방에서 뵙겠습니다.`,
      reviews: [
        { nickname: '거실꾸미기', rating: 5, date: '2026-10-03', text: '현관에 걸어 뒀는데 볼 때마다 기분이 좋아요.' },
        { nickname: '꽃클래스3회차', rating: 4, date: '2026-09-18', text: '난이도가 좀 있었지만 그만큼 완성도가 높아요.' },
        { nickname: '일산댁', rating: 4, date: '2026-09-04', text: '색 조합을 같이 고민해 주셔서 좋았어요. 글루건이 조금 무서웠어요.' }
      ]
    }
  ];

  /* ---------- 일정 설정 ---------- */
  // days: 오늘로부터 며칠 뒤에 수업이 있는지 (1~30)
  // times: 기본 시간대. 시간대가 2개 이상이면 3의 배수 날에는 마지막 시간대를 쉬어요.
  // full: 마감(남은 자리 0)으로 보여 줄 '며칠 뒤-시간' 목록 (클래스마다 모든 시간대가 마감인 날이 하루 이상 있게)
  const scheduleSeeds = {
    c001: { days: [2, 3, 7, 10, 11, 14, 17, 19, 22, 25, 28], times: ['11:00', '14:00'], full: ['2-11:00', '10-14:00', '3-11:00'] },
    c002: { days: [4, 5, 11, 12, 18, 19, 25, 26], times: ['14:00', '19:00'], full: ['4-14:00', '19-19:00', '12-14:00'] },
    c003: { days: [1, 2, 5, 8, 9, 13, 16, 20, 23, 26, 29, 30], times: ['11:00', '14:00', '19:00'], full: ['1-14:00', '8-19:00', '16-11:00', '9-11:00', '9-14:00'] },
    c004: { days: [4, 7, 11, 14, 18, 21, 25, 28], times: ['11:00'], full: ['7-11:00'] },
    c005: { days: [3, 5, 10, 12, 17, 19, 24, 26, 30], times: ['10:00', '14:00'], full: ['5-14:00', '17-10:00', '3-10:00'] },
    c006: { days: [1, 4, 8, 11, 15, 18, 22, 25, 29], times: ['19:00'], full: ['1-19:00', '11-19:00'] },
    c007: { days: [2, 5, 6, 9, 13, 16, 20, 23, 27, 30], times: ['11:00', '14:00', '16:00'], full: ['2-14:00', '13-11:00', '6-11:00', '6-14:00'] },
    c008: { days: [5, 7, 12, 14, 19, 21, 26, 28], times: ['13:00', '16:00'], full: ['7-13:00', '14-16:00', '12-13:00'] }
  };

  // 언제 열어도 같은 패턴이 나오도록 랜덤 대신 계산으로 남은 자리를 정해요.
  function buildSchedule(cls, seed, today) {
    const idNum = Number(cls.id.slice(1));
    return seed.days.map(function (offset) {
      const times = seed.times.length > 1 && offset % 3 === 0 ? seed.times.slice(0, -1) : seed.times;
      return {
        date: formatDate(addDays(today, offset)),
        slots: times.map(function (time, i) {
          const isFull = seed.full.indexOf(offset + '-' + time) !== -1;
          const remaining = isFull ? 0 : ((offset * 7 + i * 3 + idNum) % cls.maxPeople) + 1;
          return { time: time, remaining: remaining };
        })
      };
    });
  }

  /* ---------- 공개 함수 ---------- */

  // 후기 별점 평균 (소수 첫째 자리)
  function getAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce(function (acc, r) { return acc + r.rating; }, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  const today = new Date();
  const classes = rawClasses.map(function (cls) {
    return Object.assign({}, cls, {
      images: cls.images.map(function (img) {
        return {
          color: IMAGE_COLORS[img.tone],
          src: IMAGE_BASE + img.src,
          alt: img.alt,
          credit: { author: img.credit.author, url: img.credit.url, source: IMAGE_SOURCE }
        };
      }),
      rating: getAverageRating(cls.reviews),
      reviewCount: cls.reviews.length,
      schedule: buildSchedule(cls, scheduleSeeds[cls.id], today)
    });
  });

  function getClassById(id) {
    return classes.find(function (cls) { return cls.id === id; }) || null;
  }

  function getCategories() {
    const list = [];
    classes.forEach(function (cls) {
      if (list.indexOf(cls.category) === -1) list.push(cls.category);
    });
    return list;
  }

  function getClassesByCategory(category) {
    return classes.filter(function (cls) { return cls.category === category; });
  }

  window.CLASS_DATA = {
    classes: classes,
    getClassById: getClassById,
    getCategories: getCategories,
    getClassesByCategory: getClassesByCategory,
    getAverageRating: getAverageRating
  };
})();
