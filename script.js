let isWaiting = false;

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function newChat() {
  document.getElementById('messages').innerHTML = '';
  document.getElementById('welcome').style.display = 'block';
}

function sendSuggestion(text) {
  document.getElementById('userInput').value = text;
  sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  
  if (!message || isWaiting) return;
  
  isWaiting = true;
  input.value = '';
  document.getElementById('sendBtn').disabled = true;
  
  // Sembunyikan welcome
  document.getElementById('welcome').style.display = 'none';
  
  // Tampilkan pesan user
  addMessage('user', message);
  
  // Tampilkan typing indicator
  const typingId = showTyping();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    removeTyping(typingId);
    addMessage('ai', data.reply);
    
  } catch (error) {
    removeTyping(typingId);
    addMessage('ai', 'Waduh, koneksi error nih Bang. Coba lagi ya. 🥲');
  }
  
  isWaiting = false;
  document.getElementById('sendBtn').disabled = false;
  input.focus();
}

function addMessage(role, text) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  
  const avatar = role === 'ai' ? '🤖' : '👤';
  
  div.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">${formatMessage(text)}</div>
  `;
  
  messages.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
}

function formatMessage(text) {
  // Format code blocks
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function showTyping() {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message ai';
  div.id = 'typing-' + Date.now();
  div.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messages.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
  return div.id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Auto-resize textarea
document.getElementById('userInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});
