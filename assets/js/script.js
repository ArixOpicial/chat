const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
  const themeColor = localStorage.getItem("themeColor");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  const defaultText = `<div class="default-text">
  <h1>Zhizi AI</h1>
  <p><b>AI ini dikembangkan sepenuhnya dari awal tanpa memanfaatkan API dari proyek lain.</b><br><br>Mulailah percakapan dan jelajahi kekuatan AI.</p>
  </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv;
};

const showTypingAnimation = async () => {
  userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = "";
  chatInput.style.height = "45px";

  const html = `<div class="chat-content">
  <div class="chat-details">
  <img src="./assets/images/user.png" alt="user-img">
  <p>${userText}</p>
  </div>
  </div>`;

  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  // Animasi mengetik (AI sedang membalas)
  const typingHtml = `<div class="chat-content typing">
    <div class="chat-details">
      <img src="./assets/images/bot.png" alt="bot-img">
      <p><span class="dots"></span></p>
    </div>
  </div>`;

  const typingChatDiv = createChatElement(typingHtml, "incoming");
  chatContainer.appendChild(typingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  async function typeText(element, text, delay) {
    for (let i = 0; i < text.length; i++) {
      element.innerHTML += text.charAt(i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const style = document.createElement("style");
  style.innerHTML = `
    .dots::after {
      content: " .";
      animation: dots 1.5s steps(3, end) infinite;
      color: ${document.body.classList.contains("light-mode") ? "#000" : "#fff"};
    }
    @keyframes dots {
      0% { content: " ."; }
      33% { content: " .."; }
      66% { content: " ..."; }
      100% { content: " ."; }
    }

    /* Tambahan gaya untuk pesan error */
    .chat-content.error {
      background-color: ${document.body.classList.contains("light-mode") ? "#ffdddd" : "#440000"};
      color: ${document.body.classList.contains("light-mode") ? "#d8000c" : "#ffaaaa"};
      border-left: 5px solid ${document.body.classList.contains("light-mode") ? "#d8000c" : "#ffaaaa"};
    }
  `;
  document.head.appendChild(style);

  try {
    const response = await fetch(`https://api.arixoffc.com/api/ai/zhiziai?apikey=visualstrom&text=${encodeURIComponent(userText)}`);
    const data = await response.json();

    typingChatDiv.remove(); // Hapus animasi mengetik sebelum menampilkan respons

    if (data && data.status === 200 && data.data) {
      const answerText = data.data;
      const responseHtml = `<div class="chat-content">
      <div class="chat-details">
      <img src="./assets/images/bot.png" alt="bot-img">
      <p></p>
      </div>
      </div>`;

      const incomingChatDiv = createChatElement(responseHtml, "incoming");
      chatContainer.appendChild(incomingChatDiv);
      const paragraphElement = incomingChatDiv.querySelector("p");

      await typeText(paragraphElement, answerText, 50);
    } else {
      throw new Error("Error dalam API response");
    }
  } catch (error) {
    console.error(error);
    typingChatDiv.remove(); // Hapus animasi mengetik jika terjadi error

    // Tampilkan pesan error dengan warna merah
    const errorHtml = `<div class="chat-content error">
      <div class="chat-details">
        <img src="./assets/images/bot.png" alt="bot-img">
        <p>Error: Tidak dapat terhubung ke server!</p>
      </div>
    </div>`;

    const errorChatDiv = createChatElement(errorHtml, "incoming");
    chatContainer.appendChild(errorChatDiv);
  }

  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  // Update warna loading dots dan error message saat tema berubah
  const dots = document.querySelectorAll(".dots");
  dots.forEach(dot => {
    dot.style.color = document.body.classList.contains("light-mode") ? "#000" : "#fff";
  });

  const errors = document.querySelectorAll(".chat-content.error");
  errors.forEach(error => {
    error.style.backgroundColor = document.body.classList.contains("light-mode") ? "#ffdddd" : "#440000";
    error.style.color = document.body.classList.contains("light-mode") ? "#d8000c" : "#ffaaaa";
    error.style.borderLeftColor = document.body.classList.contains("light-mode") ? "#d8000c" : "#ffaaaa";
  });
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    showTypingAnimation();
  }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", showTypingAnimation);

function closeAds() {
  const adsContainer = document.querySelector(".ads-container");
  adsContainer.style.display = "none";
}
