let apiKey = "AIzaSyAuuQ5-BQaxqrgeMTPBapiuDxgSStR5es8";
let chatHistory = [];
let isProcessing = false;

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button');
const clearChatButton = document.getElementById('clear-chat-button');

const createChatMessage = (text, sender) => {
  const div = document.createElement('div');
  div.classList.add('chat-message', sender, 'rounded-2xl', 'p-3', 'drop-shadow-lg', 'message-container');
  div.innerHTML = `<p>${text}</p>`;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

const showLoading = () => {
  const div = document.createElement('div');
  div.id = 'loading-indicator';
  div.classList.add('chat-message', 'bot', 'rounded-2xl', 'p-3', 'message-container');
  div.innerHTML = `
    <div class="flex space-x-1">
      <div class="w-2 h-2 bg-purple-500 rounded-full loading-dot"></div>
      <div class="w-2 h-2 bg-purple-500 rounded-full loading-dot"></div>
      <div class="w-2 h-2 bg-purple-500 rounded-full loading-dot"></div>
    </div>`;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

const removeLoading = () => {
  const div = document.getElementById('loading-indicator');
  if (div) div.remove();
};

const sendMessage = async () => {
  const userText = userInput.value.trim();
  if (!userText || isProcessing) return;

  createChatMessage(userText, 'user');
  userInput.value = '';
  isProcessing = true;
  sendButton.disabled = true;
  showLoading();

  try {
    chatHistory.push({ role: "user", parts: [{ text: userText }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await response.json();
    removeLoading();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const botText = data.candidates[0].content.parts[0].text;
      createChatMessage(botText, 'bot');
      chatHistory.push({ role: "model", parts: [{ text: botText }] });
    } else {
      createChatMessage("No response. Try again.", 'bot');
    }

  } catch (err) {
    removeLoading();
    createChatMessage("Error: " + err.message, 'bot');
  } finally {
    isProcessing = false;
    sendButton.disabled = false;
  }
};

const startNewChat = () => {
  chatHistory = [];
  chatContainer.innerHTML = '';
  createChatMessage("Hello! I am a chatbot powered by Google's Gemini API.", 'bot');
};

newChatButton.addEventListener('click', startNewChat);
clearChatButton.addEventListener('click', startNewChat);
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => { if (e.key === "Enter") sendMessage(); });
