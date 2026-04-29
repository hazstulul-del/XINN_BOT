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

  const plusBtn = document.getElementById("plusBtn");
  const uploadMenu = document.getElementById("uploadMenu");
  const photoBtn = document.getElementById("photoBtn");
  const cameraBtn = document.getElementById("cameraBtn");
  const docBtn = document.getElementById("docBtn");
  const photoInput = document.getElementById("photoInput");
  const cameraInput = document.getElementById("cameraInput");
  const docInput = document.getElementById("docInput");

  const themeBtn = document.getElementById("themeBtn");
  const thinkBtn = document.getElementById("thinkBtn");
  const searchBtn = document.getElementById("searchBtn");
  const panelBtn = document.getElementById("panelBtn");
  const rightPanel = document.getElementById("rightPanel");
  const closePanel = document.getElementById("closePanel");

  let activeChatId = 1;
  let deepThink = false;
  let webSearch = false;

  let chats = [
    {
      id: 1,
      title: "Contoh code block",
      messages: [
        {
          role: "user",
          text: "Buatkan contoh code block"
        },
        {
          role: "ai",
          text:
            "Siap, ini contoh code block:\n\n" +
            "```javascript\n" +
            "function xinnAI() {\n" +
            "  console.log('XINN AI aktif');\n" +
            "}\n\n" +
            "xinnAI();\n" +
            "```"
        }
      ]
    }
  ];

  function getChat() {
    return chats.find(function (c) {
      return c.id === activeChatId;
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function formatMessage(text) {
    if (text.indexOf("image:") === 0) {
      const raw = text.replace("image:", "");
      const parts = raw.split("|");
      return (
        '<div class="file-preview">' +
        '<img src="' + parts[0] + '">' +
        '<span>' + escapeHtml(parts[1] || "gambar") + '</span>' +
        '</div>'
      );
    }

    if (text.indexOf("file:") === 0) {
      const raw = text.replace("file:", "");
      const parts = raw.split("|");
      return (
        '<div class="doc-preview">' +
        '<div class="doc-icon">📄</div>' +
        '<div><strong>' + escapeHtml(parts[0]) + '</strong>' +
        '<small>' + escapeHtml(parts[1] || "") + '</small></div>' +
        '</div>'
      );
    }

    let safe = escapeHtml(text);

    safe = safe.replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, lang, code) {
      return "<pre><code>" + code + "</code></pre>";
    });

    return safe.replace(/\n/g, "<br>");
  }

  function renderHistory() {
    const keyword = searchHistory.value.toLowerCase();
    historyList.innerHTML = "";

    chats
      .filter(function (chat) {
        return chat.title.toLowerCase().includes(keyword);
      })
      .forEach(function (chat) {
        const item = document.createElement("div");
        item.className = "history-item" + (chat.id === activeChatId ? " active" : "");

        const title = document.createElement("span");
        title.textContent = chat.title;

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const rename = document.createElement("button");
        rename.textContent = "✎";

        const del = document.createElement("button");
        del.textContent = "×";

        actions.appendChild(rename);
        actions.appendChild(del);
        item.appendChild(title);
        item.appendChild(actions);

        item.addEventListener("click", function () {
          activeChatId = chat.id;
          sidebar.classList.remove("show");
          renderAll();
        });

        rename.addEventListener("click", function (e) {
          e.stopPropagation();
          const newTitle = prompt("Rename chat:", chat.title);
          if (newTitle) {
            chat.title = newTitle;
            renderHistory();
          }
        });

        del.addEventListener("click", function (e) {
          e.stopPropagation();
          chats = chats.filter(function (c) {
            return c.id !== chat.id;
          });

          if (chats.length === 0) {
            createNewChat();
            return;
          }

          activeChatId = chats[0].id;
          renderAll();
        });

        historyList.appendChild(item);
      });
  }

  function renderMessages() {
    const chat = getChat();
    chatArea.innerHTML = "";

    if (!chat.messages.length) {
      chatArea.innerHTML =
        '<div class="empty">' +
        '<div><h2>Apa yang bisa XINN bantu?</h2>' +
        '<p>Kirim chat, foto, kamera, dokumen, atau minta kode.</p></div>' +
        '</div>';
      return;
    }

    chat.messages.forEach(function (msg, index) {
      const row = document.createElement("div");
      row.className = "message " + msg.role;

      const content = document.createElement("div");

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = formatMessage(msg.text);

      content.appendChild(bubble);

      if (msg.role === "ai") {
        const tools = document.createElement("div");
        tools.className = "msg-tools";

        const copy = document.createElement("button");
        copy.textContent = "Copy";
        copy.addEventListener("click", function () {
          navigator.clipboard.writeText(msg.text);
          copy.textContent = "Copied";
        });

        const regen = document.createElement("button");
        regen.textContent = "Regenerate";
        regen.addEventListener("click", regenerate);

        const like = document.createElement("button");
        like.textContent = "👍";
        like.addEventListener("click", function () {
          like.textContent = "👍 Dipilih";
        });

        const dislike = document.createElement("button");
        dislike.textContent = "👎";
        dislike.addEventListener("click", function () {
          dislike.textContent = "👎 Dipilih";
        });

        tools.appendChild(copy);
        tools.appendChild(regen);
        tools.appendChild(like);
        tools.appendChild(dislike);
        content.appendChild(tools);
      }

      row.appendChild(content);
      chatArea.appendChild(row);
    });

    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function addMessage(role, text) {
    getChat().messages.push({ role: role, text: text });
    renderMessages();
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.id = "typing";
    typing.className = "message ai";
    typing.innerHTML =
      '<div><div class="bubble typing">' +
      '<span></span><span></span><span></span>' +
      '</div></div>';
    chatArea.appendChild(typing);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
  }

  function aiResponse(prompt) {
    let mode = "";
    if (deepThink) mode += "Mode Deep Think aktif.\n\n";
    if (webSearch) mode += "Mode Search aktif.\n\n";

    const p = prompt.toLowerCase();

    if (p.includes("code") || p.includes("kode") || p.includes("html") || p.includes("js")) {
      return (
        mode +
        "Ini contoh code block:\n\n" +
        "```javascript\n" +
        "function haloXinn() {\n" +
        "  console.log('Halo dari XINN AI');\n" +
        "}\n\n" +
        "haloXinn();\n" +
        "```"
      );
    }

    return mode + "Aku XINN AI. Ini respons simulasi demo seperti chatbot real-time.";
  }

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const chat = getChat();

    addMessage("user", text);

    if (chat.title === "Chat Baru") {
      chat.title = text.slice(0, 35);
      renderHistory();
    }

    messageInput.value = "";
    messageInput.style.height = "46px";

    showTyping();

    setTimeout(function () {
      removeTyping();
      addMessage("ai", aiResponse(text));
    }, 700);
  }

  function regenerate() {
    const messages = getChat().messages;
    const lastUser = [...messages].reverse().find(function (m) {
      return m.role === "user";
    });

    if (!lastUser) return;

    showTyping();

    setTimeout(function () {
      removeTyping();
      addMessage("ai", aiResponse(lastUser.text));
    }, 700);
  }

  function createNewChat() {
    const id = Date.now();

    chats.unshift({
      id: id,
      title: "Chat Baru",
      messages: []
    });

    activeChatId = id;
    renderAll();
  }

  function handleFiles(files) {
    const list = Array.from(files);
    if (!list.length) return;

    list.forEach(function (file) {
      const size = Math.max(1, Math.round(file.size / 1024)) + "KB";

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        addMessage("user", "image:" + url + "|" + file.name);
      } else {
        addMessage("user", "file:" + file.name + "|" + size);
      }
    });

    showTyping();

    setTimeout(function () {
      removeTyping();
      addMessage("ai", "File berhasil diterima. Di versi demo ini file tampil sebagai preview.");
    }, 700);
  }

  function renderAll() {
    renderHistory();
    renderMessages();
  }

  sendBtn.addEventListener("click", sendMessage);

  messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  messageInput.addEventListener("input", function () {
    messageInput.style.height = "46px";
    messageInput.style.height = messageInput.scrollHeight + "px";
  });

  newChat.addEventListener("click", createNewChat);

  searchHistory.addEventListener("input", renderHistory);

  menuBtn.addEventListener("click", function () {
    sidebar.classList.add("show");
  });

  closeSide.addEventListener("click", function () {
    sidebar.classList.remove("show");
  });

  themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });

  thinkBtn.addEventListener("click", function () {
    deepThink = !deepThink;
    thinkBtn.classList.toggle("active", deepThink);
  });

  searchBtn.addEventListener("click", function () {
    webSearch = !webSearch;
    searchBtn.classList.toggle("active", webSearch);
  });

  panelBtn.addEventListener("click", function () {
    rightPanel.classList.toggle("hide");
  });

  closePanel.addEventListener("click", function () {
    rightPanel.classList.add("hide");
  });

  plusBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    uploadMenu.classList.toggle("show");
  });

  photoBtn.addEventListener("click", function () {
    uploadMenu.classList.remove("show");
    photoInput.click();
  });

  cameraBtn.addEventListener("click", function () {
    uploadMenu.classList.remove("show");
    cameraInput.click();
  });

  docBtn.addEventListener("click", function () {
    uploadMenu.classList.remove("show");
    docInput.click();
  });

  photoInput.addEventListener("change", function () {
    handleFiles(photoInput.files);
    photoInput.value = "";
  });

  cameraInput.addEventListener("change", function () {
    handleFiles(cameraInput.files);
    cameraInput.value = "";
  });

  docInput.addEventListener("change", function () {
    handleFiles(docInput.files);
    docInput.value = "";
  });

  document.addEventListener("click", function (e) {
    if (!uploadMenu.contains(e.target) && e.target !== plusBtn) {
      uploadMenu.classList.remove("show");
    }
  });

  renderAll();
});
