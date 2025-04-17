document.addEventListener("DOMContentLoaded", function () {
  // 1. Навигация по странице
  const menuLinks = document.querySelectorAll(".top-menu a, .aside-menu a");
  const sections = document.querySelectorAll(".content-section");
  const lastSectionId = localStorage.getItem("lastSectionId");

  function hideAllSections() {
      sections.forEach(section => {
          section.style.display = "none";
      });
  }

  function showSection(id) {
      const section = document.getElementById(id);
      if (section) {
          hideAllSections();
          section.style.display = "block";

          // Скрыть/показать форму обратной связи
          const feedbackContainer = document.getElementById("feedback-form-container");
          if (feedbackContainer) {
              feedbackContainer.style.display = (id === "contacts") ? "block" : "none";
          }

          localStorage.setItem("lastSectionId", id);
          updateActiveMenu(id);
      }
  }

  function updateActiveMenu(sectionId) {
      // Обновляем основное меню
      document.querySelectorAll(".top-menu li").forEach(item => {
          item.classList.remove("active");
          const link = item.querySelector("a");
          if (link && (link.getAttribute("href") === `#${sectionId}` || link.getAttribute("data-section") === sectionId)) {
              item.classList.add("active");
          }
      });

      // Обновляем боковое меню
      document.querySelectorAll(".aside-menu li").forEach(item => {
          item.classList.remove("active");
          const link = item.querySelector("a");
          if (link && link.getAttribute("href") === `#${sectionId}`) {
              item.classList.add("active");
          }
      });
  }

  // Инициализация
  const defaultSection = document.getElementById("main") ? "main" : (sections[0]?.id || "plants");
  showSection(lastSectionId || defaultSection);

  // Обработчики кликов для переходов по меню
  menuLinks.forEach(link => {
      link.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          if (href && !href.startsWith("#")) {
              return;
          }

          e.preventDefault();
          const sectionId = this.getAttribute("data-section") || this.getAttribute("href").substring(1);
          showSection(sectionId);
      });
  });

  // 2. Выпадающие блоки
  function setupCollapsibles() {
      const headers = document.querySelectorAll("h3.collapsible");

      headers.forEach(header => {
          const content = header.nextElementSibling;
          if (content && content.classList.contains("content")) {
              content.style.maxHeight = null;

              header.addEventListener("click", function () {
                  this.classList.toggle("active");
                  if (content.style.maxHeight) {
                      content.style.maxHeight = null;
                  } else {
                      content.style.maxHeight = content.scrollHeight + "px";
                  }
              });
          }
      });
  }
  setupCollapsibles();

  

  // 3. Форма обратной связи
// js.js
    async function setupFeedbackForm() {
      const feedbackForm = document.getElementById("feedback-form");
      
      if (!feedbackForm) return;

      feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation(); // Добавляем эту строку
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
          // Блокируем кнопку на время отправки
          submitButton.disabled = true;
          submitButton.textContent = 'Отправка...';
          
          const formData = new FormData(this);
          const response = await fetch(this.action, {
            method: this.method,
            body: formData, // Используем FormData вместо JSON
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Ошибка сети или сервера');
          }
          
          const data = await response.json();
          alert(data.message || "Сообщение успешно отправлено!");
          this.reset();
        } catch (error) {
          alert(error.message || "Произошла ошибка при отправке");
          console.error('Ошибка:', error);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    }


  setupFeedbackForm();


  // 4. Модальное окно авторизации
  function initAuthModal() {
      const authBtn = document.getElementById('auth-btn');
      const authModal = document.getElementById('auth-modal');
      const userMenu = document.querySelector('.user-menu');
      const userName = document.getElementById('user-name');
      const logoutBtn = document.getElementById('logout-btn');
      const showRegister = document.getElementById('show-register');
      const showLogin = document.getElementById('show-login');
      const registerForm = document.getElementById('register-form');
      const loginForm = document.getElementById('login-form');

      // Проверка авторизации при загрузке
      async function checkAuth() {
          try {
              const res = await fetch('/auth/check', { credentials: 'include',});
              
              if (!res.ok) throw new Error();
              const data = await res.json();
              
              if (authBtn) authBtn.style.display = 'none';
              if (userMenu) userMenu.style.display = 'inline-block';
              if (userName) userName.textContent = data.user.username;
          } catch {
              if (userMenu) userMenu.style.display = 'none';
              if (authBtn) authBtn.style.display = 'inline-block';
          }
      }


      // Открытие/закрытие модалки
      if (authBtn && authModal) {
          authBtn.addEventListener('click', async () => {
              checkAuth();
              authModal.style.display = 'block';
          });
      }

      document.querySelectorAll('.modal .close').forEach(el => {
          el.addEventListener('click', () => {
              el.closest('.modal').style.display = 'none';
          });
      });

      window.addEventListener('click', (event) => {
          if (event.target.classList.contains('modal')) {
              event.target.style.display = 'none';
          }
      });

      // Переключение между формами
      function switchForm(type) {
          if (type === 'register') {
              if (registerForm) registerForm.style.display = 'flex';
              if (loginForm) loginForm.style.display = 'none';
              if (showRegister) showRegister.classList.add('active');
              if (showLogin) showLogin.classList.remove('active');
          } else {
              if (registerForm) registerForm.style.display = 'none';
              if (loginForm) loginForm.style.display = 'flex';
              if (showLogin) showLogin.classList.add('active');
              if (showRegister) showRegister.classList.remove('active');
          }
      }

      if (showRegister) showRegister.addEventListener('click', () => switchForm('register'));
      if (showLogin) showLogin.addEventListener('click', () => switchForm('login'));

      // Выход
      if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
              e.preventDefault();
              fetch('/auth/logout', {
                  method: 'POST',
                  credentials: 'include'
              }).then(() => {
                  window.location.reload();
              });
          });
      }

      // Регистрация
      if (registerForm) {
          registerForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = {
                  username: registerForm.querySelector('#register-username').value,
                  email: registerForm.querySelector('#register-email').value,
                  password: registerForm.querySelector('#register-password').value
              };

              try {
                  const res = await fetch('/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(formData)
                  });
                  const data = await res.json();
                  
                  if (res.ok) {
                      window.location.reload();
                  } else {
                      alert(data.message || 'Ошибка регистрации');
                  }
              } catch (error) {
                  alert('Ошибка сети');
              }
          });
      }

      // Вход
      if (loginForm) {
          loginForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = {
                  username: loginForm.querySelector('#login-username').value,
                  password: loginForm.querySelector('#login-password').value
              };

              try {
                  const res = await fetch('/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(formData)
                  });
                  const data = await res.json();
                  
                  if (res.ok) {
                      window.location.reload();
                  } else {
                      alert(data.message || 'Ошибка входа');
                  }
              } catch (error) {
                  alert('Ошибка сети');
              }
          });
      }

      // Проверяем авторизацию при загрузке
      checkAuth();
      
  }
  
  initAuthModal();

  // 5. Таблицы с нумерацией и сортировкой
  function setupTables() {
      function updateRowNumbers(table) {
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach((row, index) => {
              let rowNumberCell = row.querySelector('.row-number');
              if (!rowNumberCell) {
                  rowNumberCell = document.createElement('td');
                  rowNumberCell.className = 'row-number';
                  row.insertBefore(rowNumberCell, row.firstChild);
              }
              rowNumberCell.textContent = index + 1;
          });
      }

      function addRowNumbers() {
          document.querySelectorAll('table').forEach(table => {
              if (!table.querySelector('th.row-number')) {
                  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
                  if (headerRow) {
                      const th = document.createElement('th');
                      th.className = 'row-number';
                      th.textContent = '#';
                      headerRow.insertBefore(th, headerRow.firstChild);
                  }
              }
              updateRowNumbers(table);
          });
      }

      function sortTable(table, header, index) {
          const tbody = table.querySelector('tbody') || table;
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const isAscending = !header.classList.contains('asc');
          
          table.querySelectorAll('th').forEach(th => th.classList.remove('asc', 'desc'));
          header.classList.add(isAscending ? 'asc' : 'desc');

          rows.sort((a, b) => {
              const aText = a.children[index].textContent.trim();
              const bText = b.children[index].textContent.trim();
              const aNum = parseFloat(aText);
              const bNum = parseFloat(bText);
              
              if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
                  return isAscending ? aNum - bNum : bNum - aNum;
              }
              return isAscending 
                  ? aText.localeCompare(bText) 
                  : bText.localeCompare(aText);
          });

          rows.forEach(row => tbody.appendChild(row));
          updateRowNumbers(table);
      }

      function initTables() {
          addRowNumbers();
          
          document.addEventListener('click', e => {
              if (e.target.tagName === 'TH') {
                  const th = e.target;
                  const table = th.closest('table');
                  const index = Array.from(th.parentNode.children).indexOf(th);
                  sortTable(table, th, index);
              }
          });
      }

      initTables();
  }
  checkAuth(); // вызывем повторно после initAuthModal()
  setupTables();
});