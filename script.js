const pinyinToggle = document.querySelector('#pinyin-toggle');
const memoryToggle = document.querySelector('#memory-toggle');
const poem = document.querySelector('.poem-text');

pinyinToggle.addEventListener('click', () => {
  const visible = poem.classList.toggle('pinyin-on');
  pinyinToggle.classList.toggle('active', visible);
  pinyinToggle.setAttribute('aria-pressed', String(visible));
  pinyinToggle.textContent = visible ? '隐藏拼音' : '显示拼音';
});

memoryToggle.addEventListener('click', () => {
  const active = poem.classList.toggle('memory');
  memoryToggle.classList.toggle('active', active);
  memoryToggle.setAttribute('aria-pressed', String(active));
});

document.querySelectorAll('[data-reveal]').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = document.getElementById(button.dataset.reveal);
    answer.classList.toggle('show');
    button.textContent = answer.classList.contains('show') ? '把答案收起来' : '看看古人的答案';
  });
});
