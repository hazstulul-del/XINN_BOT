document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const closeSide = document.getElementById("closeSide");
  const menuBtn = document.getElementById("menuBtn");
  const chatArea = document.getElementById("chatArea");
  const historyList = document.getElementById("historyList");
  const searchHistory = document.getElementById("searchHistory");
  const newChat = document.getElementById("newChat");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const welcome = document.getElementById("welcomeScreen");
  const messages = document.getElementById("messages");

  const plusBtn = document.getElementById("plusBtn");
  const uploadMenu = document.getElementById("uploadMenu");
  const photoInput = document.getElementById("photoInput");
  const cameraInput = document.getElementById("cameraInput");
  const docInput = document.getElementById("docInput");

  const themeBtn = document.getElementById("themeBtn");

  let activeChatId = 1;
  let isWaiting = false;
  
  let chats = [{ id: 1, title: "Chat Baru", messages: [] }];

  function getChat() { return chats.find(c => c.id === activeChatId); }

  function renderHistory() {
    const keyword = searchHistory.value.toLowerCase();
    historyList.innerHTML = "";
    chats.filter(c => c.title.toLowerCase().includes(keyword)).forEach(chat => {
      const item = document.createElement("div");
      item.className = "history-item" + (chat.id === activeChatId ? " active" : "");
      item.innerHTML = `<span>${chat.title}</span>`;
      item.addEventListener("click", () => { activeChatId = chat.id; sidebar.classList.remove("show"); renderAll(); });
      historyList.appendChild(item);
    });
  }

  function renderMessages() {
    const chat = getChat();
    messages.innerHTML = "";
    if (!chat.messages.length) { welcome.style.display = "block"; return; }
    welcome.style.display = "none";
    chat.messages.forEach(msg => {
      const row = document.createElement("div");
      row.className = "message " + msg.role;
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = msg.text.replace(/```(\w*)\n([\s\S]*?)```/g, (m,l,c) => `<pre><div class="copy-btn" onclick="copyCode(this)">Copy</div><code>${c.trimEnd()}</code></pre>`).replace(/\n/g, '<br>');
      row.appendChild(bubble);
      messages.appendChild(row);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function addMessage(role, text) { getChat().messages.push({ role, text }); renderMessages(); }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "message ai typing";
    div.id = "typing";
    div.innerHTML = '<div class="bubble typing"><span></span><span></span><span></span></div>';
    messages.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function removeTyping() { const t = document.getElementById("typing"); if (t) t.remove(); }

  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isWaiting) return;
    isWaiting = true;
    messageInput.value = "";
    messageInput.style.height = "46px";
    welcome.style.display = "none";
    addMessage("user", text);
    const chat = getChat();
    if (chat.title === "Chat Baru") { chat.title = text.slice(0, 35); renderHistory(); }
    showTyping();
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      removeTyping();
      addMessage("ai", data.reply || "Waduh error, Bang.");
    } catch (e) {
      removeTyping();
      addMessage("ai", "Koneksi error, Bang. Coba lagi.");
    }
    isWaiting = false;
  }

  function copyCode(btn) { const code = btn.parentElement.querySelector("code").innerText; navigator.clipboard.writeText(code).then(() => { btn.innerText = "Copied!"; setTimeout(() => btn.innerText = "Copy", 1500); }); }

  function quickAsk(text) { messageInput.value = text; sendMessage(); }
  window.quickAsk = quickAsk;

  function createNewChat() { const id = Date.now(); chats.unshift({ id, title: "Chat Baru", messages: [] }); activeChatId = id; renderAll(); }
  function renderAll() { renderHistory(); renderMessages(); }

  sendBtn.addEventListener("click", sendMessage);
  newChat.addEventListener("click", createNewChat);
  searchHistory.addEventListener("input", renderHistory);
  menuBtn.addEventListener("click", () => sidebar.classList.add("show"));
  closeSide.addEventListener("click", () => sidebar.classList.remove("show"));
  themeBtn.addEventListener("click", () => { document.body.classList.toggle("light"); themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙"; });

  plusBtn.addEventListener("click", (e) => { e.stopPropagation(); uploadMenu.classList.toggle("show"); });
  document.addEventListener("click", () => uploadMenu.classList.remove("show"));
  document.getElementById("photoBtn").addEventListener("click", () => { uploadMenu.classList.remove("show"); photoInput.click(); });
  document.getElementById("cameraBtn").addEventListener("click", () => { uploadMenu.classList.remove("show"); cameraInput.click(); });
  document.getElementById("docBtn").addEventListener("click", () => { uploadMenu.classList.remove("show"); docInput.click(); });

  messageInput.addEventListener("input", function () { this.style.height = "46px"; this.style.height = this.scrollHeight + "px"; });
  messageInput.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  renderAll();
});
