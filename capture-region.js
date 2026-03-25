// capture-region.js - Region capture functionality (standalone)
(() => {
  if (window.__regionCaptureActive) return;
  window.__regionCaptureActive = true;

  const dpr = window.devicePixelRatio || 1;

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.15)',
    cursor: 'crosshair',
    zIndex: 2147483647,
    userSelect: 'none',
  });

  const help = document.createElement('div');
  help.textContent = 'Kéo để chọn vùng • Esc để hủy';
  Object.assign(help.style, {
    position: 'fixed',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    borderRadius: '8px',
    zIndex: 2147483647,
    pointerEvents: 'none'
  });
  overlay.appendChild(help);

  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed',
    border: '2px dashed #fff',
    boxShadow: '0 0 0 100vmax rgba(0,0,0,0.25)',
    background: 'transparent',
    display: 'none',
    zIndex: 2147483647,
  });
  overlay.appendChild(box);

  document.documentElement.appendChild(overlay);

  let startX = 0, startY = 0, endX = 0, endY = 0, dragging = false;

  function getRect() {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(startX - endX);
    const h = Math.abs(startY - endY);
    return { x, y, width: w, height: h };
  }

  function updateBox() {
    const rect = getRect();
    Object.assign(box.style, {
      left: rect.x + 'px',
      top: rect.y + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px'
    });
  }

  function cleanup() {
    overlay.removeEventListener('mousedown', onMouseDown, true);
    overlay.removeEventListener('mousemove', onMouseMove, true);
    overlay.removeEventListener('mouseup', onMouseUp, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    window.__regionCaptureActive = false;
  }

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    endX = e.clientX;
    endY = e.clientY;
    box.style.display = 'block';
    updateBox();
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    endX = e.clientX;
    endY = e.clientY;
    updateBox();
  };

  const onMouseUp = async (e) => {
    if (!dragging) return;
    dragging = false;
    const rect = getRect();
    cleanup();
    if (rect.width < 4 || rect.height < 4) return;

    // Send capture request to background script
    const resp = await chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" });
    if (!resp?.ok) {
      alert("Chụp ảnh thất bại: " + (resp?.error || "unknown"));
      return;
    }
    
    const img = new Image();
    img.onload = async () => {
      const sx = Math.round(rect.x * dpr);
      const sy = Math.round(rect.y * dpr);
      const sw = Math.round(rect.width * dpr);
      const sh = Math.round(rect.height * dpr);

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const cropped = canvas.toDataURL('image/png');

      // Send cropped image back to popup
      await chrome.runtime.sendMessage({ type: "CAPTURE_RESULT", dataUrl: cropped });
    };
    img.onerror = () => alert("Không thể tải ảnh đã chụp");
    img.src = resp.dataUrl;
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') cleanup();
  };

  overlay.addEventListener('mousedown', onMouseDown, true);
  overlay.addEventListener('mousemove', onMouseMove, true);
  overlay.addEventListener('mouseup', onMouseUp, true);
  document.addEventListener('keydown', onKeyDown, true);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'START_SELECTION') {
      // no-op; already active
    }
  });
})();



