const menuButton = document.querySelector('.nav-menu');
const chapterNav = document.querySelector('#chapter-nav');
if (menuButton && chapterNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    chapterNav.classList.toggle('open', !open);
  });
}

document.querySelectorAll('[data-speak]').forEach(button => {
  button.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(button.dataset.speak);
    line.lang = 'zh-CN'; line.rate = .72; line.pitch = .86;
    speechSynthesis.speak(line);
  });
});
