    const homeMovies = [
      { title: 'LOVE', year: '2015', runtime: '135min', seats: '25', image: 'images/love.jpg' },
      { title: 'Past Lives', year: '2023', runtime: '105min', seats: '17', image: 'images/past lives.jpg' },
      { title: 'Paris, Texas', year: '2015', runtime: '147min', seats: '30', image: 'images/paris, texas.jpg' },
      { title: "I'm a Cyborg, but That's OK", year: '2006', runtime: '105min', seats: '37', image: "images/i'm a cyborg.jpg" },
      { title: 'Mommy', year: '2014', runtime: '134min', seats: '38', image: 'images/mommy.jpg' }
    ];

    const home = document.querySelector('#home');
    const screeningIntro = document.querySelector('#screening-intro');
    const siteHeader = document.querySelector('#site-header');
    const carousel = document.querySelector('#movie-carousel');
    const carouselTrack = document.querySelector('#carousel-track');
    const carouselPagination = document.querySelector('#carousel-pagination');
    const movieName = document.querySelector('#movie-name');
    const movieYear = document.querySelector('#movie-year');
    const movieRuntime = document.querySelector('#movie-runtime');
    const movieSeats = document.querySelector('#movie-seats');

    const paginationDots = [];

    function updateMovieInformation(index) {
      const movie = homeMovies[index];
      movieName.textContent = movie.title;
      movieYear.textContent = movie.year;
      movieRuntime.textContent = movie.runtime;
      movieSeats.textContent = movie.seats;
      paginationDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', String(isActive));
      });
    }

    const carouselMovies = [homeMovies[homeMovies.length - 1], ...homeMovies, homeMovies[0]];
    const carouselSlides = [];
    carouselMovies.forEach((movie) => {
      const slide = document.createElement('article');
      slide.className = 'movie-slide';
      slide.innerHTML = `<img src="${movie.image}" alt="${movie.title} 영화 스틸">`;
      carouselTrack.appendChild(slide);
      carouselSlides.push(slide);
    });
    homeMovies.forEach((movie, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `${movie.title} 슬라이드로 이동`);
      dot.addEventListener('click', () => goToMovie(index));
      carouselPagination.appendChild(dot);
      paginationDots.push(dot);
    });
    updateMovieInformation(0);

    let autoplayTimer;
    let isHovering = false;
    let isInteracting = false;
    let isAnimating = false;
    let activeSlide = 1;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let didDrag = false;

    function currentSlideIndex() {
      return activeSlide;
    }

    function logicalMovieIndex() {
      return (activeSlide - 1 + homeMovies.length) % homeMovies.length;
    }

    function setTrackPosition(animate = false) {
      carouselTrack.style.transition = animate
        ? 'transform 1000ms cubic-bezier(.22, .61, .36, 1)'
        : 'none';
      carouselTrack.style.transform = `translate3d(${-activeSlide * carousel.clientWidth}px, 0, 0)`;
    }

    function normaliseLoopPosition() {
      if (activeSlide === 0) activeSlide = homeMovies.length;
      if (activeSlide === homeMovies.length + 1) activeSlide = 1;
      setTrackPosition(false);
    }

    function animateTo(targetSlide) {
      if (isAnimating) return;
      const outgoingSlide = carouselSlides[activeSlide];
      const incomingSlide = carouselSlides[targetSlide];
      const shouldFade = targetSlide !== activeSlide;
      if (shouldFade) {
        incomingSlide.classList.add('is-fade-start');
        void incomingSlide.offsetWidth;
        outgoingSlide.classList.add('is-fade-out');
      }
      activeSlide = targetSlide;
      isAnimating = true;
      carousel.classList.add('is-animating');
      updateMovieInformation(logicalMovieIndex());
      requestAnimationFrame(() => {
        if (shouldFade) {
          incomingSlide.classList.remove('is-fade-start');
          incomingSlide.classList.add('is-fade-in');
        }
        setTrackPosition(true);
      });
    }

    function goToNextMovie(force = false) {
      if ((!force && isHovering) || isInteracting || isAnimating || home.classList.contains('is-hidden')) return;
      animateTo(activeSlide + 1);
    }

    function goToPreviousMovie() {
      animateTo(activeSlide - 1);
      startAutoplay();
    }

    function goToMovie(index) {
      animateTo(index + 1);
      startAutoplay();
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = undefined;
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isHovering && !isInteracting && !home.classList.contains('is-hidden')) {
        autoplayTimer = setInterval(goToNextMovie, 8000);
      }
    }

    carousel.addEventListener('wheel', (event) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      stopAutoplay();
      if (delta > 0) goToNextMovie(true);
      else goToPreviousMovie();
      startAutoplay();
    }, { passive: false });

    carousel.addEventListener('pointerdown', (event) => {
      if (isAnimating) return;
      isInteracting = true;
      stopAutoplay();
      dragStartX = event.clientX;
      dragStartOffset = -activeSlide * carousel.clientWidth;
      didDrag = false;
      carousel.classList.add('is-dragging');
      carousel.setPointerCapture(event.pointerId);
    });
    carousel.addEventListener('pointermove', (event) => {
      if (!carousel.classList.contains('is-dragging')) return;
      if (Math.abs(event.clientX - dragStartX) > 8) didDrag = true;
      carouselTrack.style.transform = `translate3d(${dragStartOffset + event.clientX - dragStartX}px, 0, 0)`;
    });
    function stopDrag(event) {
      if (!isInteracting) return;
      carousel.classList.remove('is-dragging');
      isInteracting = false;
      const distance = event?.clientX - dragStartX || 0;
      if (event?.type === 'pointerup' && didDrag) {
        if (Math.abs(distance) > carousel.clientWidth * .12) animateTo(activeSlide + (distance > 0 ? -1 : 1));
        else animateTo(activeSlide);
      } else if (event?.type === 'pointerup') {
        if (event.clientX < carousel.getBoundingClientRect().left + carousel.clientWidth / 2) goToPreviousMovie();
        else goToNextMovie(true);
      } else {
        setTrackPosition(true);
      }
      if (!isHovering) startAutoplay();
    }
    carousel.addEventListener('pointerup', stopDrag);
    carousel.addEventListener('pointercancel', stopDrag);
    carousel.addEventListener('mouseenter', () => { isHovering = true; stopAutoplay(); });
    carousel.addEventListener('mouseleave', () => { isHovering = false; if (!isInteracting) startAutoplay(); });
    window.addEventListener('resize', () => {
      setTrackPosition(false);
    });
    carouselTrack.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'transform') return;
      isAnimating = false;
      carousel.classList.remove('is-animating');
      carouselSlides.forEach((slide) => slide.classList.remove('is-fade-start', 'is-fade-in', 'is-fade-out'));
      normaliseLoopPosition();
      if (!isHovering && !isInteracting) startAutoplay();
    });
    setTrackPosition(false);
    startAutoplay();

    const questions = {
      start: {
        question: '오늘 하루 어땠나요?',
        options: [
          { label: '조금 버거웠어요', next: 'needSupport' },
          { label: '조금 지루했어요', next: 'needChange' }
        ]
      },
      needSupport: {
        question: '오늘은 누군가에게 기대고 싶은가요?',
        options: [
          { label: '네, 따뜻한 위로를 받고 싶어요', next: 'comfortStory' },
          { label: '아니요, 오로지 혼자인 시간이 필요해요', next: 'aloneMovie' }
        ]
      },
      comfortStory: {
        question: '오늘은 어떤 이야기가 더 끌리나요?',
        options: [
          { label: '다시 힘내서 삶을 살아갈 용기', result: 'kidsReturn' },
          { label: '현실을 잠시 잊게 해주는 상상', result: 'brigsbyBear' },
          { label: '말보다 긴 여운이 남는 이야기', result: 'aGhostStory' }
        ]
      },
      aloneMovie: {
        question: '혼자 있는 시간에 어떤 영화가 좋을까요?',
        options: [
          { label: '감정을 천천히 들여다보는 영화', result: 'perks' },
          { label: '세상을 다르게 바라보는 영화', result: 'arrival' },
          { label: '삶을 깊게 생각해보는 영화', result: 'mrNobody' }
        ]
      },
      needChange: {
        question: '오늘은 어떤 변화가 필요할까요?',
        options: [
          { label: '상상도 못한 새로운 자극이 필요해요', next: 'newStimulus' },
          { label: '익숙한 것의 재발견이 필요해요', next: 'rediscovery' }
        ]
      },
      newStimulus: {
        question: '어떤 충격을 만나고 싶나요?',
        options: [
          { label: '한 번도 본 적 없는 세계관', result: 'mrNobody' },
          { label: '익숙한 현실을 뒤집는 이야기', result: 'beingJohnMalkovich' },
          { label: '끝나고도 계속 곱씹게 되는 여운', result: 'perfectSense' }
        ]
      },
      rediscovery: {
        question: '무엇을 다시 발견하고 싶나요?',
        options: [
          { label: '평범한 일상의 아름다움', result: '21Days' },
          { label: '사람과 관계의 새로운 모습', result: 'brigsbyBear' },
          { label: '내 안에 쌓여있던 감정', result: 'perks' }
        ]
      }
    };

    const movies = {
      kidsReturn: { title: '키즈 리턴', poster: 'public/posters/키즈리턴.jpeg', message: '다시 삶을 살아갈 용기가 필요할 때 추천하는 영화입니다.' },
      brigsbyBear: { title: '브릭스비 베어', poster: 'public/posters/브릭스비베어.jpg', message: '현실을 잠시 잊고 새로운 관계를 만나고 싶을 때 추천합니다.' },
      aGhostStory: { title: '고스트 스토리', poster: 'public/posters/고스트 스토리.webp', message: '말보다 긴 여운이 남는 이야기를 원할 때 추천합니다.' },
      perks: { title: '월플라워', poster: 'public/posters/월플라워.webp', message: '내 감정을 천천히 들여다보고 싶을 때 추천합니다.' },
      arrival: { title: '컨택트', poster: 'public/posters/컨택트.webp', message: '세상을 새로운 시선으로 바라보고 싶을 때 추천합니다.' },
      mrNobody: { title: '미스터 노바디', poster: 'public/posters/미스터 노바디.webp', message: '삶과 선택을 깊게 생각해보고 싶을 때 추천합니다.' },
      beingJohnMalkovich: { title: '존 말코비치 되기', poster: 'public/posters/존말코비치되기.webp', message: '익숙한 현실을 뒤집는 낯선 충격을 원할 때 추천합니다.' },
      perfectSense: { title: '퍼펙트 센스', poster: 'public/posters/퍼펙트 센스.jpg', message: '끝난 뒤에도 오래 곱씹을 여운을 원할 때 추천합니다.' },
      '21Days': { title: '세상의 끝까지 21일', poster: 'public/posters/세상의 끝까지 21일.jpg', message: '평범한 일상의 아름다움을 다시 발견하고 싶을 때 추천합니다.' }
    };

    const qrPhoneAsset = 'qrcode/qr_phone.png';
    const qrResultAssets = {
      kidsReturn: 'qrcode/kids_return_qr.svg',
      brigsbyBear: 'qrcode/brigby_bear_qr.svg',
      aGhostStory: 'qrcode/ghost_story_qr.svg',
      perks: 'qrcode/perks_qr.svg',
      arrival: 'qrcode/arrival_qr.svg',
      mrNobody: 'qrcode/mrnobody_qr.svg',
      beingJohnMalkovich: 'qrcode/being_john_malkovich_qr.svg',
      perfectSense: 'qrcode/perfect_sense_qr.svg',
      '21Days': 'qrcode/21days_qr.svg'
    };

    const app = document.querySelector('#app');
    const appBackButton = document.querySelector('[data-app-back]');
    let currentQuestion = 'start';
    let answers = [];
    let currentAnswerIndex = 0;
    let currentScreen = { type: 'home' };
    let introScrollToken = 0;
    const navigationStack = [];

    function copyState(state) {
      return {
        ...state,
        answers: state.answers ? [...state.answers] : undefined
      };
    }

    function updateBackButton() {
      appBackButton.classList.toggle('is-hidden', currentScreen.type === 'home');
    }

    function moveForward(nextState) {
      navigationStack.push(copyState(currentScreen));
      currentScreen = copyState(nextState);
      renderCurrentScreen();
    }

    function goBack() {
      if (!navigationStack.length) return;
      currentScreen = navigationStack.pop();
      renderCurrentScreen();
    }

    function showIntroSection(section, animate = false) {
      const scrollToken = ++introScrollToken;
      const targetSection = document.querySelector(`#screening-intro .screening-section:nth-of-type(${section})`);
      const targetY = section === 1
        ? 0
        : window.scrollY + targetSection.getBoundingClientRect().top - siteHeader.offsetHeight;

      if (!animate) {
        window.scrollTo(0, targetY);
        return;
      }

      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 900;
      const startedAt = performance.now();

      function scrollStep(now) {
        if (scrollToken !== introScrollToken) return;
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        window.scrollTo(0, startY + distance * eased);
        if (progress < 1) requestAnimationFrame(scrollStep);
      }

      requestAnimationFrame(scrollStep);
    }

    function renderHome() {
      window.scrollTo(0, 0);
      app.classList.add('is-hidden');
      app.classList.remove('quiz-screen');
      app.classList.remove('qr-result-screen');
      screeningIntro.classList.add('is-hidden');
      home.classList.remove('is-hidden');
      siteHeader.classList.remove('is-hidden');
      siteHeader.classList.remove('is-screening-intro');
      startAutoplay();
    }

    function renderScreeningIntro(section, animate = false) {
      stopAutoplay();
      home.classList.add('is-hidden');
      app.classList.add('is-hidden');
      screeningIntro.classList.remove('is-hidden');
      siteHeader.classList.remove('is-hidden');
      siteHeader.classList.add('is-screening-intro');
      requestAnimationFrame(() => showIntroSection(section, animate));
    }

    function renderQuestionState(state) {
      window.scrollTo(0, 0);
      currentQuestion = state.question;
      answers = [...state.answers];
      currentAnswerIndex = state.answerIndex;
      home.classList.add('is-hidden');
      screeningIntro.classList.add('is-hidden');
      siteHeader.classList.add('is-hidden');
      app.classList.remove('is-hidden');
      app.classList.remove('qr-result-screen');
      app.classList.add('quiz-screen');
      showQuestion();
    }

    function renderCurrentScreen() {
      updateBackButton();

      if (currentScreen.type === 'home') {
        renderHome();
      } else if (currentScreen.type === 'intro') {
        renderScreeningIntro(currentScreen.section, currentScreen.animate === true);
        currentScreen.animate = false;
      } else if (currentScreen.type === 'question') {
        renderQuestionState(currentScreen);
      } else if (currentScreen.type === 'result') {
        currentQuestion = currentScreen.question;
        answers = [...currentScreen.answers];
        currentAnswerIndex = currentScreen.answerIndex;
        showResult(currentScreen.resultId);
      }
    }

    function showStart() {
      navigationStack.length = 0;
      currentQuestion = 'start';
      answers = [];
      currentAnswerIndex = 0;
      currentScreen = { type: 'home' };
      renderCurrentScreen();
    }

    function showScreeningIntro() {
      moveForward({ type: 'intro', section: 1 });
    }

    function startQuiz() {
      currentQuestion = 'start';
      answers = [];
      currentAnswerIndex = 0;
      moveForward({
        type: 'question',
        question: currentQuestion,
        answers,
        answerIndex: currentAnswerIndex
      });
    }

    function showQuestion() {
      const current = questions[currentQuestion];
      app.innerHTML = `
        <div class="question-content">
          <h2>${current.question}</h2>
          <div id="options" class="question-options question-options--${current.options.length}"></div>
        </div>
      `;

      const options = document.querySelector('#options');
      current.options.forEach((option) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'option-button';
        const optionEmojis = {
          '조금 버거웠어요': '😩',
          '조금 지루했어요': '😪',
          '네, 따뜻한 위로를 받고 싶어요': '🥲',
          '아니요, 오로지 혼자인 시간이 필요해요': '🤔',
          '다시 힘내서 삶을 살아갈 용기': '👊',
          '현실을 잠시 잊게 해주는 상상': '✨',
          '말보다 긴 여운이 남는 이야기': '🎬',
          '감정을 천천히 들여다보는 영화': '🪞',
          '세상을 다르게 바라보는 영화': '🌏',
          '삶을 깊게 생각해보는 영화': '💭',
          '상상도 못한 새로운 자극이 필요해요': '⚡',
          '익숙한 것의 재발견이 필요해요': '🔎',
          '한 번도 본 적 없는 세계관': '🪐',
          '익숙한 현실을 뒤집는 이야기': '🔄',
          '끝나고도 계속 곱씹게 되는 여운': '🌙',
          '평범한 일상의 아름다움': '🌿',
          '사람과 관계의 새로운 모습': '🤝',
          '내 안에 쌓여있던 감정': '🌊'
        };
        button.textContent = `${option.label} ${optionEmojis[option.label] || ''}`.trim();
        button.addEventListener('click', () => selectOption(option));
        options.appendChild(button);
      });
    }

    function selectOption(option) {
      answers = answers.slice(0, currentAnswerIndex);
      answers.push(option.label);
      currentScreen.answers = [...answers];

      if (option.result) {
        moveForward({
          type: 'result',
          resultId: option.result,
          question: currentQuestion,
          answers,
          answerIndex: currentAnswerIndex
        });
        return;
      }

      currentQuestion = option.next;
      currentAnswerIndex += 1;
      moveForward({
        type: 'question',
        question: currentQuestion,
        answers,
        answerIndex: currentAnswerIndex
      });
    }

    function showResult(resultId) {
      const result = movies[resultId];
      const qrAssets = qrResultAssets[resultId];
      app.classList.remove('quiz-screen');

      if (qrAssets) {
        app.classList.add('qr-result-screen');
        app.innerHTML = `
          <section class="qr-result-layout" aria-label="${result.title} QR 코드">
            <div class="qr-result-copy" style="margin-left:100px;">
              <h2 style="font-weight:600; color:#FFFAEE;">Scan Me!</h2>
              <p> <span style="font-weight:200; color:#FFFAEE;">오늘의 당신을 위한 영화가 준비되었습니다.<br>지금 QR 코드를 스캔해 만나보세요!</p>
            </div>
            <div class="qr-phone">
              <img class="qr-code-image" src="${qrAssets}" alt="${result.title} QR 코드">
              <img class="qr-phone-frame" src="${qrPhoneAsset}" alt="휴대폰 화면">
            </div>
          </section>
          <button type="button" id="restart-button" class="qr-result-restart">다시 시작하기</button>
        `;
        document.querySelector('#restart-button').addEventListener('click', showStart);
        return;
      }

      app.classList.remove('qr-result-screen');
      app.innerHTML = `
        <h2>${result.title}</h2>
        <div id="poster"><img src="${result.poster}" alt="${result.title} 포스터"></div>
        <p>${result.message}</p>
        <button type="button" id="restart-button">다시 시작하기</button>
      `;
      document.querySelector('#restart-button').addEventListener('click', showStart);
    }

    document.querySelectorAll('[data-screening]').forEach((button) => {
      button.addEventListener('click', showScreeningIntro);
    });
    document.querySelector('[data-start-quiz]').addEventListener('click', startQuiz);
    appBackButton.addEventListener('click', goBack);
    document.querySelector('[data-scroll-next]').addEventListener('click', () => {
      moveForward({ type: 'intro', section: 2, animate: true });
    });

    showStart();
