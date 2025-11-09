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
