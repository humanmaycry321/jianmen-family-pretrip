const pinyinToggle = document.querySelector('#pinyin-toggle');
const memoryToggle = document.querySelector('#memory-toggle');
const poem = document.querySelector('.poem-text');

if (pinyinToggle && poem) {
  pinyinToggle.addEventListener('click', () => {
    const visible = poem.classList.toggle('pinyin-on');
    pinyinToggle.classList.toggle('active', visible);
    pinyinToggle.setAttribute('aria-pressed', String(visible));
    pinyinToggle.textContent = visible ? '隐藏拼音' : '显示拼音';
  });
}

if (memoryToggle && poem) {
  memoryToggle.addEventListener('click', () => {
    const active = poem.classList.toggle('memory');
    memoryToggle.classList.toggle('active', active);
    memoryToggle.setAttribute('aria-pressed', String(active));
  });
}

const audioToggle = document.querySelector('#poem-audio-toggle');
const audioStop = document.querySelector('#poem-audio-stop');
const speech = window.speechSynthesis;
let verseQueue = [];
let verseIndex = 0;
let reading = false;
let paused = false;
let currentUtterance = null;

const maleVoiceHints = [
  'yunxi', 'yunjian', 'yunyang', 'kangkang', 'qiang', 'danny',
  'male', 'man', '男', '云希', '云健', '云扬', '康康', '强'
];

function availableChineseVoices() {
  return speech.getVoices().filter((voice) => /^zh([_-]|$)/i.test(voice.lang));
}

function chooseChineseVoice() {
  const voices = availableChineseVoices();
  return voices.find((voice) => {
    const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return maleVoiceHints.some((hint) => label.includes(hint));
  }) || voices.find((voice) => /zh[-_]cn/i.test(voice.lang)) || voices[0] || null;
}

function updateAudioControl(state) {
  if (!audioToggle || !audioStop) return;
  const title = audioToggle.querySelector('b');
  const note = audioToggle.querySelector('small');
  audioToggle.classList.toggle('is-reading', state !== 'idle');
  audioToggle.setAttribute('aria-pressed', String(state !== 'idle'));
  audioStop.disabled = state === 'idle';

  if (state === 'playing') {
    title.textContent = 'Ⅱ 暂停朗读';
    note.textContent = `正在读第 ${verseIndex + 1} 句 · 0.8 倍速`;
  } else if (state === 'paused') {
    title.textContent = '▶ 继续朗读';
    note.textContent = `已停在第 ${verseIndex + 1} 句`;
  } else {
    title.textContent = '▶ 开始朗读《蜀道难》';
    note.textContent = '中文男声优先 · 0.8 倍速';
  }
}

function clearVerseHighlight() {
  document.querySelectorAll('.verse.is-speaking').forEach((line) => line.classList.remove('is-speaking'));
}

function stopReading() {
  speech.cancel();
  reading = false;
  paused = false;
  currentUtterance = null;
  verseIndex = 0;
  clearVerseHighlight();
  updateAudioControl('idle');
}

function speakNextVerse() {
  if (!reading || verseIndex >= verseQueue.length) {
    stopReading();
    return;
  }

  clearVerseHighlight();
  const line = verseQueue[verseIndex];
  line.classList.add('is-speaking');
  line.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const utterance = new SpeechSynthesisUtterance(line.textContent.trim());
  const selectedVoice = chooseChineseVoice();
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.lang = selectedVoice?.lang || 'zh-CN';
  utterance.rate = 0.8;
  utterance.pitch = selectedVoice && maleVoiceHints.some((hint) => `${selectedVoice.name} ${selectedVoice.voiceURI}`.toLowerCase().includes(hint)) ? 0.95 : 0.78;
  utterance.volume = 1;
  utterance.onend = () => {
    if (!reading) return;
    verseIndex += 1;
    speakNextVerse();
  };
  utterance.onerror = (event) => {
    if (event.error === 'canceled' || event.error === 'interrupted') return;
    stopReading();
  };
  currentUtterance = utterance;
  updateAudioControl('playing');
  speech.speak(utterance);
}

if (audioToggle && audioStop && poem && 'speechSynthesis' in window) {
  // Safari often supplies its voice list after the page has loaded.
  speech.getVoices();
  speech.addEventListener?.('voiceschanged', chooseChineseVoice, { once: true });

  audioToggle.addEventListener('click', () => {
    if (!reading) {
      speech.cancel();
      verseQueue = Array.from(poem.querySelectorAll('.verse'));
      verseIndex = 0;
      reading = true;
      paused = false;
      speakNextVerse();
      return;
    }

    if (paused) {
      speech.resume();
      paused = false;
      updateAudioControl('playing');
    } else {
      speech.pause();
      paused = true;
      updateAudioControl('paused');
    }
  });

  audioStop.addEventListener('click', stopReading);
  window.addEventListener('pagehide', () => speech.cancel());
} else if (audioToggle) {
  audioToggle.disabled = true;
  audioToggle.querySelector('b').textContent = '此浏览器不支持朗读';
  audioToggle.querySelector('small').textContent = '可换用 Safari、Chrome 或 Edge';
}

document.querySelectorAll('[data-reveal]').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = document.getElementById(button.dataset.reveal);
    answer.classList.toggle('show');
    button.textContent = answer.classList.contains('show') ? '把答案收起来' : '看看古人的答案';
  });
});
