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
