document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    // N8N Webhook URL
    const WEBHOOK_URL = 'http://localhost:5678/webhook-test/d8c30cc0-399a-4ee5-8706-34a3078643e3';

    // Auto focus input
    userInput.focus();

    function formatTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        // Check if content contains HTML document structure
        if (content.includes('<!DOCTYPE html>') || content.includes('<html>')) {
            // Create a container for the iframe
            const iframeContainer = document.createElement('div');
            iframeContainer.className = 'html-document-container';

            // Create the iframe
            const iframe = document.createElement('iframe');
            iframe.srcdoc = content;
            iframe.style.width = '100%';
            iframe.style.height = '500px'; // Adjust as needed
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.style.marginBottom = '10px';

            iframeContainer.appendChild(iframe);

            // Create time div
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = formatTime();

            messageDiv.appendChild(iframeContainer);
            messageDiv.appendChild(timeDiv);
        } else {
            // Regular text/markdown content
            messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${formatTime()}</div>
        `;
        }

        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Disable input while processing
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        // Add user message
        addMessage(message, true);

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading-message';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <span class="typing-dots">Thinking...</span>
            </div>
        `;
        chatContainer.appendChild(loadingDiv);
        scrollToBottom();

        try {
            // Note: Since this is calling a local n8n instance from a browser,
            // we might run into CORS issues if n8n isn't configured to allow it.
            // Using a simple GET with query params for now as it's often easier for webhooks,
            // or POST if that's what's expected. Assuming GET/POST adaptability.

            // Constructing URL with query parameter for the message
            const url = new URL(WEBHOOK_URL);
            url.searchParams.append('query', message);

            const response = await fetch(url.toString(), {
                method: 'GET', // Or POST depending on n8n node config
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // Remove loading indicator
            chatContainer.removeChild(loadingDiv);

            // Try to parse JSON, fallback to text
            const contentType = response.headers.get("content-type");
            let botResponse;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                // Adjust this depending on your n8n output structure
                botResponse = data.output || data.text || data.message || JSON.stringify(data);
            } else {
                botResponse = await response.text();
            }

            addMessage(botResponse || "I received your message but got an empty response.");

        } catch (error) {
            console.error('Error:', error);
            if (chatContainer.contains(loadingDiv)) {
                chatContainer.removeChild(loadingDiv);
            }
            addMessage("Sorry, I couldn't connect to the server. Please make sure n8n is running.", false);
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleSendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
