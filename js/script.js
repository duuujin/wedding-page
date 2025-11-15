document.addEventListener("DOMContentLoaded", function() {
  const cards = document.querySelectorAll(".card");

  // 스크롤 시 페이드 인
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.3 });
  cards.forEach(card => observer.observe(card));

  // 음악 ON/OFF 버튼
  // 수ㅡ정
  const musicBtn = document.getElementById("music-btn");
  const bgMusic = document.getElementById("bg-music");

  musicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.textContent = "BGM 🔊";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "BGM 🔇";
    }
  });
});


// === BGM 동의/자동재생 추가 (기존 구조 변경 없음) ===
(function(){
  const bgMusic = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  const enableBtn = document.getElementById('enable-bgm');
  const rememberChk = document.getElementById('remember-consent');
  const CONSENT_KEY = 'bgmConsent_v1';

  if (bgMusic) bgMusic.muted = true;

  function updateBtn(){
    if (!musicBtn || !bgMusic) return;
    musicBtn.textContent = (bgMusic.paused || bgMusic.muted) ? 'BGM 🔈' : 'BGM 🔊';
  }
  async function playUnmuted(){
    if (!bgMusic) return false;
    try { bgMusic.muted = false; await bgMusic.play(); }
    catch(e){ try { bgMusic.currentTime = 0; await bgMusic.play(); } catch(e2){ return false; } }
    return true;
  }
  function rememberConsentIfChecked(){
    if (rememberChk && rememberChk.checked) localStorage.setItem(CONSENT_KEY, 'true');
  }

  // 첫 방문 모달 안의 "배경음악 켜기" 버튼
  if (enableBtn){
    enableBtn.addEventListener('click', async function(){
      const ok = await playUnmuted();
      rememberConsentIfChecked();
      updateBtn();
    }, { once:false });
  }

  // 상단 토글 버튼(있다면 유지)
  if (musicBtn){
    musicBtn.addEventListener('click', async function(){
      if (!bgMusic) return;
      if (bgMusic.paused || bgMusic.muted){
        await playUnmuted();
      } else {
        bgMusic.pause();
        bgMusic.muted = true;
      }
      updateBtn();
    });
  }

  // 재방문 자동 시도
  document.addEventListener('DOMContentLoaded', async function(){
    updateBtn();
    if (localStorage.getItem(CONSENT_KEY) === 'true'){
      await playUnmuted(); // 실패해도 조용히 무시 -> 사용자가 버튼으로 켜면 됨
      updateBtn();
    }
  });
})();
// === BGM 동의/자동재생 추가 끝 ===



// === Santa Tracker 스타일: 멀티-ROW 스프라이트 시트 달리기 (scale 변수 적용) ===
(function () {
  // ★ 시트 설정
  const SPRITE_SRC   = 'images/santa-sheet.png';
  const SPRITE_COLS  = 6;
  const SPRITE_ROWS  = 5;
  const TOTAL_FRAMES = 30;
  const FPS          = 12;

  // 이동(화면 가로질러) 시간
  const BASE_MS = 1400;
  const EXTRA_MS_PER_VW = 3;

  // CSS 주입 (기존 스타일 있으면 교체)
  {
    const OLD = document.getElementById('runner-grid-style');
    if (OLD) OLD.remove();

    const style = document.createElement('style');
    style.id = 'runner-grid-style';
    style.textContent = `
#runner-flyby {
  position: fixed; left: -40vw; top: 62vh;
  width: var(--fw, 256px); height: var(--fh, 256px);
  background-image: url("${SPRITE_SRC}");
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: var(--sheet-w, 2560px) var(--sheet-h, 256px);
  pointer-events: none; z-index: 2147483647; opacity: 0;
  filter: drop-shadow(0 8px 18px rgba(0,0,0,.45));
  will-change: transform, opacity, background-position;
  --scale: 1; /* ← 크기 조절용 변수 */
}
/* 화면 가로질러 날아가기(대각선) — scale 동시 적용 */
@keyframes runnerFly {
  0%   { transform: translateX(-40vw) translateY(0)    rotate(0.5deg)  scale(var(--scale)); opacity: 0; }
  8%   { opacity: 1; }
  55%  { transform: translateX(55vw)  translateY(-6vh) rotate(0deg)    scale(var(--scale)); opacity: 1; }
  100% { transform: translateX(130vw) translateY(-12vh) rotate(-2deg)  scale(var(--scale)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce){
  #runner-flyby { animation: none !important; opacity: 0 !important; }
}
    `;
    document.head.appendChild(style);
  }

  // 엘리먼트 준비
  let el = document.getElementById('runner-flyby');
  if (!el) {
    el = document.createElement('div');
    el.id = 'runner-flyby';
    document.body.appendChild(el);
  }

  // 이미지 로드 → 프레임 크기 자동 계산
  const img = new Image();
  img.src = SPRITE_SRC;
  img.onload = () => {
    const sheetW = img.naturalWidth;
    const sheetH = img.naturalHeight;
    const frameW = Math.round(sheetW / SPRITE_COLS);
    const frameH = Math.round(sheetH / SPRITE_ROWS);

    el.style.setProperty('--sheet-w', sheetW + 'px');
    el.style.setProperty('--sheet-h', sheetH + 'px');
    el.style.setProperty('--fw', frameW + 'px');
    el.style.setProperty('--fh', frameH + 'px');

    // 트리거 연결
    document.getElementById('open-message')?.addEventListener('click', () => setTimeout(play, 80));
    const maybePlay = () => { if (location.hash === '#message') setTimeout(play, 60); };
    window.addEventListener('hashchange', maybePlay);
    window.addEventListener('popstate',  maybePlay);
    if (document.readyState === 'complete' || document.readyState === 'interactive') maybePlay();
    else document.addEventListener('DOMContentLoaded', maybePlay);

    // message-page 표시 감지 시에도
    const msg = document.getElementById('message-page');
    if (msg) {
      const mo = new MutationObserver(() => {
        if (!msg.classList.contains('d-none')) setTimeout(play, 60);
      });
      mo.observe(msg, { attributes: true, attributeFilter: ['class'] });
    }

    function play() {
      // 이동 시간
      const vw = Math.max(1, window.innerWidth);
      const flyDuration = BASE_MS + (vw / 100) * EXTRA_MS_PER_VW;

      // ✅ 반응형 크기 (크게 보이게 튜닝)
      //   - 더 크게: 분모 700 → 600/550 로 줄이거나 MIN/MAX 올리기
      const baseScale = Math.max(1.0, Math.min(2.4, vw / 700));
      const SIZE_MULT = 1.8; // ← 추가 배수 (1.4~2.0 권장). 더 크게 원하면 1.8~2.0
      const scale = baseScale * SIZE_MULT;
      el.style.setProperty('--scale', String(scale));

      // 애니메이션 시작
      el.style.opacity = '1';
      el.style.animation = `runnerFly ${flyDuration}ms cubic-bezier(.2,.9,.3,1) both`;

      // 프레임 루프
      startFrameLoop({ frameW, frameH, total: TOTAL_FRAMES, fps: FPS, cols: SPRITE_COLS, flyDuration });
    }

    function startFrameLoop({ frameW, frameH, total, fps, cols, flyDuration }) {
      let frame = 0;
      let rafId = 0;
      const stepMs = 1000 / fps;
      let last = performance.now();

      clearTimeout(el._stopTimer);
      el._stopTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        el.style.animation = 'none';
        el.style.opacity = '0';
      }, flyDuration + 60);

      function tick(now) {
        if (now - last >= stepMs) {
          last = now;
          const col = frame % cols;
          const row = Math.floor(frame / cols);
          el.style.backgroundPosition = `${-col * frameW}px ${-row * frameH}px`;
          frame = (frame + 1) % total;
        }
        rafId = requestAnimationFrame(tick);
      }
      el.style.backgroundPosition = '0 0';
      rafId = requestAnimationFrame(tick);
    }
  };
  img.onerror = () => console.warn('[runner] 스프라이트 이미지를 불러올 수 없어요:', SPRITE_SRC);
})();

