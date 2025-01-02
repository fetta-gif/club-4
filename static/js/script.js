document.addEventListener('DOMContentLoaded', () => {
    // المتغيرات العامة
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggle = document.getElementById('theme-toggle');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');

    // تركيز تلقائي على حقل الإدخال عند تحميل الصفحة (للموبايل)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        userInput.focus();
    }

    // معالجة النقر على منطقة الدردشة (للموبايل)
    chatMessages.addEventListener('click', function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            userInput.focus();
        }
    });

    // التحكم في الوضع المظلم
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // إضافة رسالة جديدة
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // إظهار مؤشر الكتابة
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }

    // إرسال رسالة إلى الخادم
    async function sendMessage(message) {
        if (!message.trim()) return;

        // إضافة رسالة المستخدم
        addMessage(message, true);
        userInput.value = '';

        // إظهار مؤشر الكتابة
        const typingIndicator = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // إزالة مؤشر الكتابة وإضافة رد البوت
            typingIndicator.remove();
            if (data.error) {
                addMessage('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.');
                console.error('Error:', data.error);
            } else {
                addMessage(data.response);
            }
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.remove();
            addMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        }
    }

    // معالجة إرسال الرسالة
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            // إخفاء لوحة المفاتيح على الموبايل
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                userInput.blur();
            }

            // إضافة رسالة المستخدم
            addMessage(message, true);
            
            // إرسال الرسالة إلى الخادم
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                addMessage(data.response);
            })
            .catch(error => {
                console.error('Error:', error);
                addMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
            });

            // مسح حقل الإدخال
            userInput.value = '';
        }
    }

    // إرسال الرسالة عند النقر على زر الإرسال
    sendButton.addEventListener('click', sendUserMessage);

    // معالجة ضغط Enter (للحواسيب فقط)
    userInput.addEventListener('keypress', function(e) {
        if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && 
            e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
    });

    // معالجة أزرار الاقتراحات
    suggestionButtons.forEach(button => {
        button.addEventListener('click', function() {
            userInput.value = this.textContent;
            userInput.focus();
        });
    });

    // دالة إضافة رسالة المستخدم
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // دالة إضافة رسالة البوت
    function addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // معالجة الأحداث
    themeToggle.addEventListener('click', toggleTheme);

    // تكييف ارتفاع textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // رسالة ترحيب تلقائية
    setTimeout(() => {
        addMessage('مرحباً بك في Media AI! كيف يمكنني مساعدتك اليوم؟');
    }, 2000);
});
