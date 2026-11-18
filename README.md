# 🧠 Desafío Matemático Diario

Aplicación web desarrollada en **HTML5 puro**, **JavaScript Vanilla (sin frameworks)** y estilizada con **Bootstrap** y **Bootstrap Icons**.

---

## 🚀 Características Principales

1. **Operaciones Diarias Aleatorias (12 en total):**
   - ➕ **3 Sumas:** Números entre `1.000` y `9.999.999`.
   - ➖ **3 Restas:** Números entre `1.000` y `9.999.999`. Minuendo mayor al sustraendo para garantizar siempre **resultados positivos** ($\ge 0$).
   - ✖️ **3 Multiplicaciones:** Multiplicando entre `1.000` y `999.999`, y multiplicador entre `9` y `999`.
   - ➗ **3 Divisiones:** Dividendo menor a `10.000` y divisor menor a `100`, generadas con cociente entero exacto para una práctica matemática limpia.

2. **Persistencia durante todo el día (LocalStorage & Cookies):**
   - Las operaciones se generan automáticamente al inicio de cada día (hora local).
   - Si se recarga o se vuelve a abrir la página en el mismo dispositivo durante el día:
     - Mantiene exactamente las mismas operaciones del día.
     - Conserva las respuestas que el usuario haya escrito.
     - Mantiene el estado de verificación (si ya fue revisado o no).
   - Al cambiar de fecha a medianoche, se genera un set nuevo de manera transparente.

3. **Botón "Verificar":**
   - Comprueba cada resultado introducido.
   - Resalta en **verde** las operaciones correctas y en **rojo** las incorrectas.
   - Muestra un panel de estadísticas con aciertos, porcentaje y mensajes motivadores.

4. **Soluciones Protegidas por Contraseña:**
   - Botón **"Soluciones"** que solicita una clave de seguridad mediante una ventana modal interactiva.
   - **Contraseña por defecto:** `1234`.
   - Una vez autenticado, muestra en cada tarjeta la solución exacta y permite alternar su visibilidad.

5. **Utilidades Adicionales:**
   - 🌓 **Modo Claro / Modo Oscuro** integrado con Bootstrap.
   - ⌨️ Navegación fluida: presionar `Enter` en cualquier campo avanza automáticamente al siguiente ejercicio, o verifica al llegar al último.
   - 🖨️ Formato de impresión limpio para resolver en papel.
   - 🔄 Botón para reiniciar solo las respuestas o para forzar la generación de un set nuevo de prueba.

---

## 📂 Estructura de Archivos

```
C:\Users\drago\.gemini\antigravity\scratch\matematicas-diarias\
├── index.html     # Estructura principal y maquetado con Bootstrap
├── styles.css     # Estilos y animaciones personalizadas
├── app.js         # Lógica matemática, persistencia y control de seguridad
└── README.md      # Documentación del proyecto
```

## 🌐 Cómo Abrir la Página

Puedes abrir el archivo directamente en cualquier navegador web moderno (Google Chrome, Edge, Firefox, Brave, etc.):

- **Doble clic** sobre el archivo `index.html`.
- O arrastrar el archivo `index.html` a una pestaña abierta de tu navegador.
- O bien accediendo a la ruta:
  ```
  file:///C:/Users/drago/.gemini/antigravity/scratch/matematicas-diarias/index.html
  ```
