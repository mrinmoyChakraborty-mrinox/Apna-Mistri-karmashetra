let activeConversation = null;

// DOM refs (adjust selectors if your HTML differs)
const sidebar = document.querySelector(".sidebar");
const chatBody = document.querySelector(".chat-body");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// -------------------------------
// On Page Load
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadConversations();

  // Auto open conversation if cid in URL
  const params = new URLSearchParams(window.location.search);
  const cid = params.get("cid");
  if (cid && window.conversations) {
    openChat(cid);
  }
});

// -------------------------------
// Load Sidebar Conversations
// -------------------------------
async function loadConversations() {

  const res = await fetch("/api/conversations");
  const chats = await res.json();

  renderSidebar(chats);

  // Auto open most recent if no cid in URL
  const params = new URLSearchParams(window.location.search);
  const cid = params.get("cid");

  if(!cid && chats.length){
    openChat(chats[0].id);
  }
}

function renderSidebar(conversations) {
  const sidebar = document.querySelector(".sidebar");
  sidebar.innerHTML = "";

  if (!conversations || conversations.length === 0) {
    sidebar.innerHTML = "<p style='padding:15px;'>No chats yet</p>";
    return;
  }
  window.conversations = conversations;
  conversations.forEach(c => {
    const card = document.createElement("div");
    card.className = "worker-card";

    const time = formatTime(c.updatedAt);

    card.innerHTML = `
      <div class="avatar" style="background-image: url('${c.photo || '/static/images/default-avatar.png'}');"></div>
      <div>
        <h4>${c.name || "Worker"}</h4>
        <p>${c.lastMessage || ""}</p>
        <span>${time}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".worker-card").forEach(el =>
        el.classList.remove("active")
      );

      card.classList.add("active");
      openChat(c.id);
    });

    sidebar.appendChild(card);
  });
}


function formatTime(ts) {
  if (!ts) return "";

  // Case 1: Firestore timestamp object
  if (ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Case 2: ISO string
  if (typeof ts === "string") {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return "";
}

// -------------------------------
// Open Chat
// -------------------------------
async function openChat(conversationId) {
  activeConversation = conversationId;

  const convo = window.conversations.find(c => c.id === conversationId);

  renderTopPanel(convo);
  fetchMessages();
}

async function fetchMessages() {
  if (!activeConversation) return;

  const res = await fetch(`/api/messages/${activeConversation}`);
  const messages = await res.json();

  renderMessages(messages);
}

setInterval(fetchMessages, 6000);

// -------------------------------
// Render Messages
// -------------------------------
function renderMessages(messages) {
  const chatBody = document.querySelector(".chat-body");
  chatBody.innerHTML = "";

  messages.forEach(m => {

    const isMine = m.senderId === window.currentUserId;

    // main wrapper
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(isMine ? "right" : "left");

    // bubble
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = m.text || "";

    // time
    const timeSpan = document.createElement("span");

    timeSpan.textContent = formatTime(m.createdAt);

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(timeSpan);

    chatBody.appendChild(msgDiv);
  });

  // auto scroll bottom
  chatBody.scrollTop = chatBody.scrollHeight;
}


// -------------------------------
// Send Message
// -------------------------------
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  if (!input.value || !activeConversation) return;

  const text = input.value;

  await fetch(`/api/send/${activeConversation}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  input.value = "";

  // Reload messages after send
  openChat(activeConversation);
}

function renderTopPanel(conversation) {
  const header = document.querySelector(".chat-header");

  if (!conversation) {
    header.innerHTML = "<p style='padding:15px;'>Select a chat</p>";
    return;
  }

  const isCustomer = window.currentUserRole === "customer";

  header.innerHTML = `
    <div class="chat-user">
        <div class="avatar" style="background-image: url('${conversation.photo || '/static/images/default-avatar.png'}');"></div>
        <div>
            <h3>${conversation.name || "User"}</h3>
            <p>${conversation.lastMessage ? "Active Chat" : "Start Conversation"}</p>
        </div>
    </div>

    ${
      isCustomer
        ? `<button class="book-btn" onclick="hireWorker('${conversation.workerId}')">
              Hire Now
           </button>`
        : ""
    }
  `;
}