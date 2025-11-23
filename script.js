// Навігація через меню у верхньому хедері
(function () {
  const nav = document.getElementById('topNav');
  const frame = document.getElementById('pageFrame');
  const burger = document.querySelector('.burger');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const audio = document.getElementById('bgAudio');
  const visitorEl = document.getElementById('visitorCount');
  // overlay/closeBtn більше не потрібні, меню звичайне

  // Проста карта сторінок для пошуку
  const pagesIndex = [
    { page: 'home.html', title: 'Головна', keywords: 'головна старт git система контролю версій' },
    { page: 'about.html', title: 'Про Git', keywords: 'що таке git історія git локальний розподілений' },
    { page: 'git-github.html', title: 'Git + GitHub', keywords: 'git та github різниця хостинг репозиторії віддалений origin' },
    { page: 'repos.html', title: 'Гілки та репозиторії', keywords: 'репозиторії коміти гілки branch merge pull request' },
    { page: 'actions.html', title: 'Автоматизація (CI/CD)', keywords: 'github actions ci cd workflow автотести' },
    { page: 'opensource.html', title: 'Open Source', keywords: 'open source open-source внесок contribution' },
    { page: 'tutorial.html', title: 'Початок роботи', keywords: 'підручник інструкція git init clone push' },
    { page: 'quiz.html', title: 'Тест', keywords: 'тест опитування питання' },
    { page: 'login.html', title: 'Вхід', keywords: 'вхід логін авторизація пароль' },
    { page: 'register.html', title: 'Реєстрація', keywords: 'реєстрація форма логін email' },
    { page: 'images.html', title: 'Галерея', keywords: 'svg gif png jpeg картинки галерея' },
    { page: 'dashboard.html', title: 'Особистий кабінет', keywords: 'кабінет профіль особистий скачати git github' },
    { page: 'faq.html', title: 'FAQ/Контакти', keywords: 'контакти питання відповіді допомога' }
  ];

  // Клік/даблклік для керування музикою
  // 1 клік: play (якщо не було даблкліку)
  // 2 кліки (даблклік): pause, потім знову 1 клік може включити
  // Кліки по меню і формі пошуку ігноруємо, щоб вони не керували музикою
  let clickTimer = null;

  document.addEventListener('click', function (e) {
    // не реагуємо на кліки всередині меню та форми пошуку
    if (e.target.closest('.top-nav') || e.target.closest('#searchForm')) return;
    if (clickTimer) return;              // вже очікуємо даблклік
    clickTimer = setTimeout(async () => {
      clickTimer = null;
      try { await audio.play(); } catch (e) { /* ignore */ }
    }, 220);
  });

  document.addEventListener('dblclick', function (e) {
    // не реагуємо на даблклік всередині меню та форми пошуку
    if (e.target.closest('.top-nav') || e.target.closest('#searchForm')) return;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    audio.pause();
  });

  // Відвідувачі: не рахуємо оновлення (користуємось sessionStorage)
  function updateVisitorCounter() {
    const KEY_TOTAL = 'visitor_total';
    const KEY_SEEN = 'visitor_seen_session';
    if (!sessionStorage.getItem(KEY_SEEN)) {
      const total = parseInt(localStorage.getItem(KEY_TOTAL) || '0', 10) + 1;
      localStorage.setItem(KEY_TOTAL, String(total));
      sessionStorage.setItem(KEY_SEEN, '1');
    }
    const totalShown = localStorage.getItem(KEY_TOTAL) || '1';
    if (visitorEl) visitorEl.textContent = totalShown;
  }
  updateVisitorCounter();

  // Простий бургер для малих екранів: показує/ховає меню
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Перемикання сторінок: завантажуємо вміст у iframe, щоб аудіо не переривалось
  function navigateTo(page) {
    if (!page) return;
    if (!frame) return;
    // data-page вже містить повний шлях (наприклад, 'pages/about.html')
    frame.src = page;
  }

  // Пошук: переходимо на перший збіг
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = (searchInput?.value || '').trim().toLowerCase();
      if (!q) return;
      const item = pagesIndex.find(p => (p.title + ' ' + p.keywords).toLowerCase().includes(q));
      if (item) navigateTo(item.page);
      else alert('Нічого не знайдено. Спробуйте інший запит.');
    });
  }

  // Клік по пункту меню: завантажуємо в iframe відповідну сторінку
  if (nav) {
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-page]');
      if (!a) return;
      e.preventDefault();
      const page = a.getAttribute('data-page');
      if (page) navigateTo(page);
    });
  }

  // Обробка повідомлень від iframe (наприклад, перенаправлення з реєстрації)
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'navigate' && event.data.page) {
      navigateTo(event.data.page);
    }
  });

  // Перевіряємо, чи користувач авторизований, і оновлюємо меню
  function updateMenuForUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const dashboardLink = nav.querySelector('a[data-page="pages/dashboard.html"]');
    const loginLink = nav.querySelector('a[data-page="pages/login.html"]');
    const registerLink = nav.querySelector('a[data-page="pages/register.html"]');
    
    if (currentUser) {
      // Користувач авторизований
      if (!dashboardLink) {
        // Додаємо посилання на особистий кабінет
        const li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="pages/dashboard.html">🏠 Особистий кабінет</a>';
        const loginLi = loginLink.parentElement;
        loginLi.parentNode.insertBefore(li, loginLi);
      }
      
      // Приховуємо пункти "Вхід" та "Реєстрація"
      if (loginLink) loginLink.parentElement.style.display = 'none';
      if (registerLink) registerLink.parentElement.style.display = 'none';
      
    } else {
      // Користувач не авторизований
      if (dashboardLink) {
        dashboardLink.parentElement.remove();
      }
      
      // Показуємо пункти "Вхід" та "Реєстрація"
      if (loginLink) loginLink.parentElement.style.display = 'block';
      if (registerLink) registerLink.parentElement.style.display = 'block';
    }
  }
  
  // Оновлюємо меню при зміні localStorage
  window.addEventListener('storage', updateMenuForUser);
  
  // Оновлюємо меню при повідомленнях від iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'navigate' && event.data.page) {
      navigateTo(event.data.page);
    }
    if (event.data && event.data.type === 'updateMenu') {
      updateMenuForUser();
    }
  });
  
  updateMenuForUser();
  
  // Періодично оновлюємо меню (на випадок змін через інші вкладки)
  setInterval(updateMenuForUser, 1000);
})();
