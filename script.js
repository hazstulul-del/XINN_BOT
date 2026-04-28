// ===== SIDEBAR =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ===== ATTACHMENT MENU =====
function openAttachmentMenu() {
  document.getElementById('attachmentMenu').style.display = 'block';
}
function closeAttachmentMenu() {
  document.getElementById('attachmentMenu').style.display = 'none';
}

// ===== PAGE SWITCH =====
function switchPage(pageId) {
  ['chatContainer','docsPage','albumPage','fotoPage'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('inputArea').style.display = 'none';
  
  if (pageId === 'chatContainer') {
    document.getElementById('chatContainer').style.display = 'flex';
    document.getElementById('inputArea').style.display = 'block';
  } else {
    document.getElementById(pageId).style.display = 'block';
  }
}

// ===== CHAT =====
let isWaiting = false;

function newChat() {
  document.getElementById('messages').innerHTML = '';
  document.getElementById('welcome').style.display = 'flex';
  switchPage('chatContainer');
  closeSidebar();
}

function quickAsk(text) {
  switchPage('chatContainer');
  document.getElementById('userInput').value = text;
  sendMessage();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const msg = input.value.trim();
  if (!msg || isWaiting) return;
  
  isWaiting = true;
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('sendBtn').disabled = true;
  document.getElementById('welcome').style.display = 'none';
  
  addBubble('user', msg);
  const typingId = addTyping();
  
  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) });
    const data = await res.json();
    removeTyping(typingId);
    addBubble('ai', data.reply || 'Error, Bang.');
  } catch (e) {
    removeTyping(typingId);
    addBubble('ai', 'Server error, Bang. Coba lagi.');
  }
  
  isWaiting = false;
  document.getElementById('sendBtn').disabled = false;
  input.focus();
}

function addBubble(role, text) {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `bubble ${role}`;
  
  // Format code blocks dengan tombol copy
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const cleanCode = code.trimEnd();
      return `<pre><div class="copy-btn" onclick="copyCode(this)">Copy</div><code class="language-${lang}">${cleanCode}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
  
  div.innerHTML = html;
  msgs.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
}

function copyCode(btn) {
  const code = btn.parentElement.querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.innerText = 'Copied!';
    setTimeout(() => btn.innerText = 'Copy', 1500);
  });
}

function addTyping() {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'bubble ai typing';
  div.id = 'typing-' + Date.now();
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
  return div.id;
}

function removeTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }

document.getElementById('userInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});
