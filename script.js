// ── SCROLL EFFECTS ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── REVEAL ON SCROLL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── QUIZ ──
let qIndex = 0, scores = [];
const questions = document.querySelectorAll('.question-block');
const total = questions.length;

document.querySelectorAll('.q-option').forEach(btn => {
  btn.addEventListener('click', function () {
    this.closest('.q-options').querySelectorAll('.q-option').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    document.getElementById('nextBtn').disabled = false;
  });
});

function nextQuestion() {
  const current = document.querySelector('.question-block[data-q="' + qIndex + '"]');
  const selected = current.querySelector('.q-option.selected');
  if (!selected) return;
  scores.push(parseInt(selected.dataset.val));
  current.classList.remove('active');
  qIndex++;
  if (qIndex < total) {
    document.querySelector('.question-block[data-q="' + qIndex + '"]').classList.add('active');
    document.getElementById('questionCount').textContent = 'Question ' + (qIndex + 1) + ' of ' + total;
    document.getElementById('quizBar').style.width = ((qIndex / total) * 100) + '%';
    document.getElementById('nextBtn').textContent = qIndex === total - 1 ? 'See Results →' : 'Next →';
    document.getElementById('nextBtn').disabled = true;
  } else {
    document.getElementById('quizBar').style.width = '100%';
    showResult();
  }
}

function showResult() {
  document.getElementById('quizNav').style.display = 'none';
  const total_score = scores.reduce((a, b) => a + b, 0);
  const max = total * 3;
  const pct = Math.round((total_score / max) * 100);
  let label, desc, color, emoji;
  if (pct <= 25) { label = 'Doing Well'; desc = 'Your responses suggest you\'re managing quite well. Keep up your self-care routines and stay connected with people you trust.'; color = '#4a7c6f'; emoji = '🌱'; }
  else if (pct <= 50) { label = 'Mild Strain'; desc = 'You may be experiencing some stress or low mood. Consider small self-care steps — rest, movement, and talking to someone you trust.'; color = '#c9a96e'; emoji = '🌤️'; }
  else if (pct <= 75) { label = 'Moderate Distress'; desc = 'Your responses suggest you may be experiencing moderate stress or anxiety. Speaking with a mental health professional could be really helpful.'; color = '#c97b7b'; emoji = '🌧️'; }
  else { label = 'Significant Distress'; desc = 'Please consider reaching out to a mental health professional or crisis support line soon. You deserve care and support.'; color = '#9b4040'; emoji = '💙'; }
  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultScore').textContent = total_score + '/' + max;
  document.getElementById('resultFill').style.cssText = 'width:' + pct + '%;background:' + color;
  document.getElementById('resultLabel').textContent = label;
  document.getElementById('resultDesc').textContent = desc;
  document.getElementById('quizResult').style.display = 'block';
}

function resetQuiz() {
  qIndex = 0; scores = [];
  document.querySelectorAll('.question-block').forEach(b => b.classList.remove('active'));
  document.querySelector('.question-block[data-q="0"]').classList.add('active');
  document.querySelectorAll('.q-option').forEach(b => b.classList.remove('selected'));
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizNav').style.display = 'flex';
  document.getElementById('quizBar').style.width = '0%';
  document.getElementById('questionCount').textContent = 'Question 1 of 5';
  document.getElementById('nextBtn').textContent = 'Next →';
  document.getElementById('nextBtn').disabled = true;
}

// ── MOOD ──
const moodColors = { '😊': '#4a7c6f', '🙂': '#6aab9a', '😐': '#c9a96e', '😔': '#a0a0c0', '😢': '#7b9bc9', '😡': '#c97b7b' };

function saveMood(emoji, label) {
  const history = JSON.parse(localStorage.getItem('mc_moods') || '[]');
  history.push({ emoji, label, date: new Date().toLocaleDateString() });
  if (history.length > 14) history.shift();
  localStorage.setItem('mc_moods', JSON.stringify(history));
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('picked'));
  event.target.classList.add('picked');
  renderMoodChart();
}

function renderMoodChart() {
  const history = JSON.parse(localStorage.getItem('mc_moods') || '[]');
  const container = document.getElementById('moodChart');
  if (!history.length) { container.innerHTML = '<p class="mood-empty">No moods logged yet — tap an emoji above!</p>'; return; }
  const scoreMap = { '😊': 5, '🙂': 4, '😐': 3, '😔': 2, '😢': 1, '😡': 1 };
  const max = 5;
  container.innerHTML = '<div class="mood-bars">' +
    history.map(m => {
      const h = Math.max(12, Math.round((scoreMap[m.emoji] || 3) / max * 72));
      return `<div class="mood-bar-item" style="height:${h}px;background:${moodColors[m.emoji] || '#ccc'};border-radius:6px 6px 0 0;" data-emoji="${m.emoji}" title="${m.label} · ${m.date}"></div>`;
    }).join('') + '</div>' +
    '<p style="font-size:12px;color:var(--text-soft);margin-top:8px;">Last ' + history.length + ' entries</p>';
}
renderMoodChart();

// ── BREATHING LABEL ──
const breathLabels = ['Inhale…', 'Hold…', 'Exhale…', 'Hold…'];
let bStep = 0;
setInterval(() => {
  bStep = (bStep + 1) % 4;
  document.getElementById('breathLabel').textContent = breathLabels[bStep];
}, 2000);

// ── CHAT ──
let chatOpen = false;
let chatHistory = [];

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatWindow').classList.toggle('open', chatOpen);
  document.getElementById('chatFab').textContent = chatOpen ? '✕' : '💬';
  if (chatOpen && document.getElementById('chatMsgs').children.length === 0) {
    addMsg('ai', "Hello 🌿 I'm here to listen. How are you feeling right now?");
  }
}

function addMsg(role, text) {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  const typing = addMsg('ai', '…');
  typing.classList.add('typing');

  try {
    const res = await fetch('http://localhost:3000/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });
    const data = await res.json();
    const reply = data.reply || "I'm here with you. Could you tell me more?";
    typing.remove();
    addMsg('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (e) {
    typing.remove();
    addMsg('ai', 'I had trouble connecting. Make sure the server is running.');
  }
}

document.getElementById('chatInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendChat();
});
