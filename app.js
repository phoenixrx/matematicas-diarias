/**
 * ========================================================
 * DESAFÍO MATEMÁTICO DIARIO - LÓGICA PRINCIPAL (VANILLA JS)
 * ========================================================
 */

(function () {
  'use strict';

  // Configuración de almacenamiento
  const STORAGE_KEY = 'matematicas_diarias_state_v1';
  const COOKIE_KEY = 'matematicas_diarias_date';
  const DEFAULT_PASSWORD = '150';

  // Estado global de la aplicación
  let state = {
    date: '',
    password: DEFAULT_PASSWORD,
    solutionsUnlocked: false,
    verified: false,
    operations: []
  };

  /**
   * Helper para obtener número aleatorio entero en rango [min, max]
   */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Obtiene la fecha actual en formato local 'YYYY-MM-DD'
   */
  function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea la fecha para mostrar en español amigable
   */
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea un número con puntos de miles para legibilidad visual
   */
  function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  /**
   * Cookies Helpers
   */
  function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce((acc, current) => {
      const [key, val] = current.split('=');
      return key === encodeURIComponent(name) ? decodeURIComponent(val) : acc;
    }, null);
  }

  /**
   * Generación de las 12 operaciones matemáticas
   * según las reglas especificadas:
   */
  function generateDailyOperations() {
    const ops = [];

    // 1. TRES SUMAS: números entre 1.000 y 9.999.999
    for (let i = 1; i <= 3; i++) {
      const num1 = getRandomInt(1000, 9999999);
      const num2 = getRandomInt(1000, 9999999);
      ops.push({
        id: `suma-${i}`,
        category: 'sumas',
        label: `Suma #${i}`,
        num1: num1,
        num2: num2,
        operator: '+',
        solution: num1 + num2,
        userAnswer: '',
        isCorrect: null
      });
    }

    // 2. TRES RESTAS: números entre 1.000 y 9.999.999, resultado siempre positivo (> 0)
    for (let i = 1; i <= 3; i++) {
      let a = getRandomInt(1000, 9999999);
      let b = getRandomInt(1000, 9999999);
      if (a === b) {
        a += getRandomInt(10, 5000);
      }
      const num1 = Math.max(a, b);
      const num2 = Math.min(a, b);

      ops.push({
        id: `resta-${i}`,
        category: 'restas',
        label: `Resta #${i}`,
        num1: num1,
        num2: num2,
        operator: '−',
        solution: num1 - num2,
        userAnswer: '',
        isCorrect: null
      });
    }

    // 3. TRES MULTIPLICACIONES:
    // Multiplicando entre 1.000 y 999.999; Multiplicador entre 9 y 999
    for (let i = 1; i <= 3; i++) {
      const num1 = getRandomInt(1000, 999999);
      const num2 = getRandomInt(9, 999);
      ops.push({
        id: `mult-${i}`,
        category: 'multiplicaciones',
        label: `Multiplicación #${i}`,
        num1: num1,
        num2: num2,
        operator: '×',
        solution: num1 * num2,
        userAnswer: '',
        isCorrect: null
      });
    }

    // 4. TRES DIVISIONES:
    // Dividendo menor a 10.000; Divisor menor a 100
    // Se generan con cociente entero exacto para una práctica matemática limpia y sin ambigüedades decimales
    for (let i = 1; i <= 3; i++) {
      const divisor = getRandomInt(2, 99);
      const maxQuotient = Math.floor(9999 / divisor);
      const quotient = getRandomInt(2, Math.max(2, maxQuotient));
      const dividendo = divisor * quotient;

      ops.push({
        id: `div-${i}`,
        category: 'divisiones',
        label: `División #${i}`,
        num1: dividendo,
        num2: divisor,
        operator: '÷',
        solution: quotient,
        userAnswer: '',
        isCorrect: null
      });
    }

    return ops;
  }

  /**
   * Guarda el estado actual en LocalStorage y Cookies
   */
  function saveState() {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      // Guardamos la fecha en cookie para asegurar persistencia cruzada
      setCookie(COOKIE_KEY, state.date, 30);
    } catch (err) {
      console.warn('Error guardando en almacenamiento:', err);
    }
  }

  /**
   * Carga o inicializa el estado diario
   */
  function loadOrCreateDailyState(forceNew = false) {
    const today = getLocalDateString();
    let loadedState = null;

    if (!forceNew) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          loadedState = JSON.parse(raw);
        }
      } catch (e) {
        console.warn('Error leyendo LocalStorage:', e);
      }
    }

    // Si coincide el día y no estamos forzando nuevo set, usamos el guardado
    if (loadedState && loadedState.date === today && !forceNew) {
      state = loadedState;
      // Garantizar valores por defecto si faltan
      if (!state.password) state.password = DEFAULT_PASSWORD;
      if (typeof state.solutionsUnlocked !== 'boolean') state.solutionsUnlocked = false;
    } else {
      // Generar nuevo set de operaciones para hoy
      state = {
        date: today,
        password: (loadedState && loadedState.password) ? loadedState.password : DEFAULT_PASSWORD,
        solutionsUnlocked: false,
        verified: false,
        operations: generateDailyOperations()
      };
      saveState();
    }
  }

  /**
   * Renderizado de las tarjetas de operaciones en el DOM
   */
  function renderAllOperations() {
    const containers = {
      sumas: document.getElementById('sumasContainer'),
      restas: document.getElementById('restasContainer'),
      multiplicaciones: document.getElementById('multiplicacionesContainer'),
      divisiones: document.getElementById('divisionesContainer')
    };

    // Limpiar contenedores
    Object.values(containers).forEach(c => {
      if (c) c.innerHTML = '';
    });

    state.operations.forEach((op, index) => {
      const container = containers[op.category];
      if (!container) return;

      const card = document.createElement('div');
      card.className = 'op-card';
      card.id = `card-${op.id}`;

      // Aplicar clases de estado de verificación
      if (state.verified) {
        if (op.isCorrect === true) {
          card.classList.add('is-correct');
        } else if (op.isCorrect === false) {
          card.classList.add('is-incorrect');
        }
      }

      // Badge de estado individual
      let statusBadgeHtml = '';
      if (state.verified) {
        if (op.isCorrect === true) {
          statusBadgeHtml = `
            <span class="status-pill text-bg-success">
              <i class="bi bi-check-circle-fill"></i> ¡Correcto!
            </span>
          `;
        } else {
          statusBadgeHtml = `
            <span class="status-pill text-bg-danger">
              <i class="bi bi-x-circle-fill"></i> Incorrecto
            </span>
          `;
        }
      }

      // Caja de solución (si está desbloqueada)
      let solutionHtml = '';
      if (state.solutionsUnlocked) {
        solutionHtml = `
          <div class="solution-box bg-warning-subtle text-warning-emphasis border border-warning-subtle mt-2 d-flex align-items-center justify-content-between">
            <span><i class="bi bi-key-fill me-1"></i> Solución correcta:</span>
            <strong class="font-monospace fs-6">${formatNumber(op.solution)}</strong>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-semibold text-secondary small">${op.label}</span>
          <div id="status-${op.id}">${statusBadgeHtml}</div>
        </div>

        <div class="math-equation">
          <div class="equation-left user-select-all">
            <span class="math-number">${formatNumber(op.num1)}</span>
            <span class="math-operator">${op.operator}</span>
            <span class="math-number">${formatNumber(op.num2)}</span>
            <span class="text-secondary ms-2">=</span>
          </div>

          <div class="math-input-wrapper">
            <input 
              type="text" 
              inputmode="numeric" 
              class="form-control math-input" 
              id="input-${op.id}" 
              data-op-id="${op.id}" 
              placeholder="Tu respuesta" 
              value="${op.userAnswer || ''}"
              autocomplete="off"
            >
          </div>
        </div>

        <div id="solution-container-${op.id}">${solutionHtml}</div>
      `;

      container.appendChild(card);
    });

    // Añadir eventos a los inputs
    attachInputListeners();
    updateProgressAndScore();
  }

  /**
   * Asignar listeners a cada input para persistencia instantánea y navegación con Enter
   */
  function attachInputListeners() {
    const inputs = Array.from(document.querySelectorAll('.math-input'));

    inputs.forEach((input, idx) => {
      // Filtrar para permitir únicamente dígitos
      input.addEventListener('input', (e) => {
        const opId = input.getAttribute('data-op-id');
        const op = state.operations.find(o => o.id === opId);

        // Mantener solo números limpios
        const cleanVal = input.value.replace(/[^0-9]/g, '');
        if (input.value !== cleanVal) {
          input.value = cleanVal;
        }

        if (op) {
          op.userAnswer = cleanVal;
          // Si el usuario edita después de verificar, se reinicia la marca individual
          if (state.verified && op.isCorrect !== null) {
            op.isCorrect = null;
            const card = document.getElementById(`card-${op.id}`);
            const statusEl = document.getElementById(`status-${op.id}`);
            if (card) {
              card.classList.remove('is-correct', 'is-incorrect');
            }
            if (statusEl) {
              statusEl.innerHTML = '';
            }
          }
          saveState();
          updateProgressAndScore();
        }
      });

      // Navegación con Enter al siguiente campo
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (idx < inputs.length - 1) {
            inputs[idx + 1].focus();
            inputs[idx + 1].select();
          } else {
            // Último input: invocar verificación
            verifyAnswers();
          }
        }
      });
    });
  }

  /**
   * Actualiza la barra de progreso y el resumen de aciertos
   */
  function updateProgressAndScore() {
    const total = state.operations.length;
    const answeredCount = state.operations.filter(op => op.userAnswer && op.userAnswer.trim() !== '').length;
    const percent = Math.round((answeredCount / total) * 100);

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${answeredCount} / ${total}`;

    const scoreSummary = document.getElementById('scoreSummary');
    const scoreDetails = document.getElementById('scoreDetails');

    if (state.verified) {
      const correctCount = state.operations.filter(op => op.isCorrect === true).length;
      const incorrectCount = total - correctCount;
      const scorePct = Math.round((correctCount / total) * 100);

      if (scoreSummary) {
        scoreSummary.innerHTML = `Puntuación: <span class="${scorePct >= 70 ? 'text-success' : 'text-danger'}">${correctCount} / ${total}</span> (${scorePct}%)`;
      }
      if (scoreDetails) {
        scoreDetails.textContent = `${correctCount} correctas &bull; ${incorrectCount} incorrectas`;
      }
    } else {
      if (scoreSummary) scoreSummary.textContent = 'Sin verificar aún';
      if (scoreDetails) scoreDetails.textContent = `${answeredCount} de ${total} ejercicios respondidos`;
    }
  }

  /**
   * Función para verificar las respuestas del usuario
   */
  function verifyAnswers() {
    let correctCount = 0;
    const total = state.operations.length;

    state.operations.forEach(op => {
      const cleanInput = (op.userAnswer || '').trim();
      if (cleanInput === '') {
        op.isCorrect = false;
      } else {
        const userNum = parseInt(cleanInput, 10);
        op.isCorrect = (userNum === op.solution);
      }

      if (op.isCorrect) correctCount++;
    });

    state.verified = true;
    saveState();

    // Actualizar vista sin perder foco
    renderAllOperations();

    // Mostrar Alerta Superior con el resultado
    const resultAlert = document.getElementById('resultAlert');
    const resultAlertTitle = document.getElementById('resultAlertTitle');
    const resultAlertMessage = document.getElementById('resultAlertMessage');
    const resultAlertIcon = document.getElementById('resultAlertIcon');

    if (resultAlert && resultAlertTitle && resultAlertMessage && resultAlertIcon) {
      resultAlert.className = 'alert rounded-4 shadow-sm border-0 mb-4';

      if (correctCount === total) {
        resultAlert.classList.add('alert-success');
        resultAlertIcon.className = 'bi bi-trophy-fill text-success fs-1';
        resultAlertTitle.textContent = '¡Extraordinario! Puntuación perfecta 🌟';
        resultAlertMessage.textContent = `Has resuelto las ${total} operaciones correctamente. ¡Gran agilidad matemática!`;
      } else if (correctCount >= Math.ceil(total * 0.7)) {
        resultAlert.classList.add('alert-primary');
        resultAlertIcon.className = 'bi bi-check-circle-fill text-primary fs-1';
        resultAlertTitle.textContent = `¡Muy buen trabajo! ${correctCount} de ${total} correctas`;
        resultAlertMessage.textContent = 'Has conseguido la gran mayoría. Revisa las marcadas en rojo para corregir los detalles.';
      } else {
        resultAlert.classList.add('alert-warning');
        resultAlertIcon.className = 'bi bi-exclamation-diamond-fill text-warning fs-1';
        resultAlertTitle.textContent = `Completado: ${correctCount} de ${total} correctas`;
        resultAlertMessage.textContent = 'No te desanimes. Puedes revisar tus cálculos, reintentar las incorrectas y verificar de nuevo.';
      }

      resultAlert.classList.remove('d-none');
      resultAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Alternar visibilidad de la solución mediante contraseña
   */
  function toggleSolutions(passwordModalInstance) {
    if (state.solutionsUnlocked) {
      // Si ya estaban visibles, podemos volver a ocultarlas con un clic
      state.solutionsUnlocked = false;
      saveState();
      renderAllOperations();
      updateSolutionButtonText();
    } else {
      // Solicitar contraseña a través del modal
      const passwordInput = document.getElementById('passwordInput');
      const passwordError = document.getElementById('passwordError');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.classList.remove('is-invalid');
      }
      if (passwordError) {
        passwordError.classList.add('d-none');
      }
      passwordModalInstance.show();
      setTimeout(() => {
        if (passwordInput) passwordInput.focus();
      }, 400);
    }
  }

  /**
   * Valida la contraseña ingresada en el modal
   */
  function submitPassword(passwordModalInstance) {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const entered = (passwordInput ? passwordInput.value : '').trim();

    const expectedPassword = state.password || DEFAULT_PASSWORD;

    if (entered === expectedPassword) {
      state.solutionsUnlocked = true;
      saveState();
      passwordModalInstance.hide();
      renderAllOperations();
      updateSolutionButtonText();
    } else {
      if (passwordInput) passwordInput.classList.add('is-invalid');
      if (passwordError) passwordError.classList.remove('d-none');
    }
  }

  /**
   * Actualiza el texto del botón de soluciones según el estado
   */
  function updateSolutionButtonText() {
    const solutionBtnText = document.getElementById('solutionBtnText');
    const showSolutionsBtn = document.getElementById('showSolutionsBtn');
    if (!solutionBtnText || !showSolutionsBtn) return;

    if (state.solutionsUnlocked) {
      solutionBtnText.textContent = 'Ocultar Soluciones';
      showSolutionsBtn.classList.remove('btn-warning');
      showSolutionsBtn.classList.add('btn-secondary');
      showSolutionsBtn.querySelector('i').className = 'bi bi-eye-slash-fill fs-5';
    } else {
      solutionBtnText.textContent = 'Soluciones';
      showSolutionsBtn.classList.remove('btn-secondary');
      showSolutionsBtn.classList.add('btn-warning');
      showSolutionsBtn.querySelector('i').className = 'bi bi-shield-lock fs-5';
    }
  }

  /**
   * Inicialización global de la página
   */
  function init() {
    // 1. Cargar o generar estado del día
    loadOrCreateDailyState(false);

    // 2. Mostrar la fecha en el encabezado
    const currentDateBadge = document.getElementById('currentDateBadge');
    if (currentDateBadge) {
      const formatted = formatDisplayDate(state.date);
      // Capitalizar primera letra
      currentDateBadge.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    // 3. Modal de contraseña Bootstrap
    const modalEl = document.getElementById('passwordModal');
    const passwordModal = modalEl ? new bootstrap.Modal(modalEl) : null;

    // 4. Renderizar UI
    renderAllOperations();
    updateSolutionButtonText();

    // 5. Vincular botones
    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', verifyAnswers);
    }

    const showSolutionsBtn = document.getElementById('showSolutionsBtn');
    if (showSolutionsBtn && passwordModal) {
      showSolutionsBtn.addEventListener('click', () => toggleSolutions(passwordModal));
    }

    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    if (submitPasswordBtn && passwordModal) {
      submitPasswordBtn.addEventListener('click', () => submitPassword(passwordModal));
    }

    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput && passwordModal) {
      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitPassword(passwordModal);
        }
      });
    }

    // Toggle para ver contraseña en el modal
    const togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    if (togglePasswordVisibility && togglePasswordIcon && passwordInput) {
      togglePasswordVisibility.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          togglePasswordIcon.className = 'bi bi-eye-slash';
        } else {
          passwordInput.type = 'password';
          togglePasswordIcon.className = 'bi bi-eye';
        }
      });
    }

    // Cerrar alerta de resultado
    const closeResultAlertBtn = document.getElementById('closeResultAlertBtn');
    const resultAlert = document.getElementById('resultAlert');
    if (closeResultAlertBtn && resultAlert) {
      closeResultAlertBtn.addEventListener('click', () => {
        resultAlert.classList.add('d-none');
      });
    }

    // Botón borrar respuestas
    const clearInputsBtn = document.getElementById('clearInputsBtn');
    if (clearInputsBtn) {
      clearInputsBtn.addEventListener('click', () => {
        if (confirm('¿Deseas borrar tus respuestas actuales para volver a intentar? (Las operaciones de hoy se mantendrán)')) {
          state.operations.forEach(op => {
            op.userAnswer = '';
            op.isCorrect = null;
          });
          state.verified = false;
          saveState();
          if (resultAlert) resultAlert.classList.add('d-none');
          renderAllOperations();
        }
      });
    }

    // Botón forzar nuevo set (para pruebas o demostración)
    const forceNewDayBtn = document.getElementById('forceNewDayBtn');
    if (forceNewDayBtn) {
      forceNewDayBtn.addEventListener('click', () => {
        if (confirm('¿Generar un nuevo conjunto aleatorio de ejercicios ahora mismo para pruebas?')) {
          loadOrCreateDailyState(true);
          if (resultAlert) resultAlert.classList.add('d-none');
          renderAllOperations();
          updateSolutionButtonText();
        }
      });
    }

    // Botón imprimir
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Alternador de tema claro/oscuro
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme_preference') || 'light';
    htmlEl.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-bs-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme_preference', newTheme);
        updateThemeIcon(newTheme);
      });
    }

    function updateThemeIcon(theme) {
      if (!themeIcon) return;
      if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun';
      } else {
        themeIcon.className = 'bi bi-moon-stars';
      }
    }
  }

  // Inicializar al cargar el documento
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
