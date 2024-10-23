document.addEventListener('DOMContentLoaded', function() {
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }
    var explanations;
    window.sendMessage = function() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value;
        if (message.trim() === '') return;

        const chatbox = document.getElementById('chatbox');
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.textContent = message;
        chatbox.appendChild(userMessageDiv);

        chatInput.value = '';
        chatbox.scrollTop = chatbox.scrollHeight;

        // Show typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'block';
        
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            typingIndicator.style.display = 'none';

            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot-message';
            chatbox.appendChild(botMessageDiv);

            // Simulate typing effect
            typeText(botMessageDiv, data.response, 1000);

            // Update score bubbles
            const scores = data.scores;
            explanations = scores.explanations;
            updateScoreBubble('chatbot-score1', scores.friendlyness);
            updateScoreBubble('chatbot-score2', scores.politically_correctness);
            updateScoreBubble('chatbot-score3', scores.gender_neutral);
            updateScoreBubble('chatbot-score4', scores.racially_neutral);
        })
        .catch(error => {
            console.error('Error:', error);
            // Hide typing indicator in case of error
            typingIndicator.style.display = 'none';
        });
    }

    window.buttonClick = function(buttonId) {
        if (buttonId == 1){
            window.resetChat();
        }
        fetch('/button_click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ button_id: buttonId })
        })
        .then(response => response.json())
        .then(data => {
            if (buttonId==1){
                var message = data.message;
                const chatbox = document.getElementById('chatbox');
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'message user-message';
                userMessageDiv.textContent = message;
                chatbox.appendChild(userMessageDiv);
                const typingIndicator = document.getElementById('typingIndicator');
                typingIndicator.style.display = 'block';
                fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                })
                .then(response => response.json())
                .then(data => {
                    // Hide typing indicator
                    typingIndicator.style.display = 'none';
        
                    const botMessageDiv = document.createElement('div');
                    botMessageDiv.className = 'message bot-message';
                    chatbox.appendChild(botMessageDiv);
        
                    // Simulate typing effect
                    typeText(botMessageDiv, data.response, 1000);
        
                    // Update score bubbles
                    const scores = data.scores;
                    explanations = scores.explanations;
                    updateScoreBubble('chatbot-score1', scores.friendlyness);
                    updateScoreBubble('chatbot-score2', scores.politically_correctness);
                    updateScoreBubble('chatbot-score3', scores.gender_neutral);
                    updateScoreBubble('chatbot-score4', scores.racially_neutral);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Hide typing indicator in case of error
                    typingIndicator.style.display = 'none';
                });
            }
            console.log(data.message);
        })
        .catch(error => console.error('Error:', error));
    }
    var isShown = -1;
    window.showDescription = function(buttonId){
        if (isShown == buttonId){
            document.getElementById("popup").hidden = true;
            document.getElementById("chatbot").hidden = false;
            isShown = -1;
        }
        else{
            document.getElementById("popup").hidden = false;
            document.getElementById("chatbot").hidden = true;
            isShown = true;
            const explanation = document.getElementById('explanation');
            if (buttonId == 0){
                explanation.textContent = explanations.friendlyness
            }
            if (buttonId == 1){
                explanation.textContent = explanations.politically_correctness
            }
            if (buttonId == 2){
                explanation.textContent = explanations.gender_neutral
            }
            if (buttonId == 3){
                explanation.textContent = explanations.racially_neutral
            }
            isShown = buttonId
        }
    }

    window.resetChat = function() {
        const chatbox = document.getElementById('chatbox');
        chatbox.innerHTML = '';
        fetch('/reset_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => console.error('Error:', error));
    }

    window.sendKeyword = function() {
        const keywordInput = document.getElementById('keywordInput');
        const message = keywordInput.value;
        if (message.trim() === '') return;

        const keywordChatbox = document.getElementById('keywordChatbox');
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.textContent = message;
        keywordChatbox.appendChild(userMessageDiv);

        keywordInput.value = '';
        keywordChatbox.scrollTop = keywordChatbox.scrollHeight;

        fetch('/keyword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            const keywordsDiv = document.createElement('div');
            keywordsDiv.className = 'message bot-message';
            keywordsDiv.innerHTML = 'Keywords: ' + data.keywords.join(', '); // Use innerHTML to insert HTML content
            keywordChatbox.appendChild(keywordsDiv);
            keywordChatbox.scrollTop = keywordChatbox.scrollHeight;
        })
        .catch(error => console.error('Error:', error));
    }
});

function interpolateColor(value) {
    const startColor = { r: 220, g: 20, b: 60 }; // Crimson Red
    const endColor = { r: 34, g: 139, b: 34 }; // Forest Green

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (value / 100));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (value / 100));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (value / 100));

    return `rgb(${r}, ${g}, ${b})`;
}

window.updateScoreBubble = function(bubbleId, newValue) {
    const scoreBubble = document.getElementById(bubbleId);
    if (scoreBubble) {
        const progressValue = scoreBubble.querySelector(".percentage");
        const innerCircle = scoreBubble.querySelector(".inner-circle");
        let startValue = parseInt(progressValue.textContent, 10);
        let endValue = Number(newValue);
        let speed = 10;

        const progress = setInterval(() => {
            if (startValue < endValue) {
                startValue++;
            } else if (startValue > endValue) {
                startValue--;
            }
            const progressColor = interpolateColor(startValue);
            progressValue.textContent = `${startValue}%`;
            progressValue.style.color = `${progressColor}`;

            innerCircle.style.backgroundColor = `lightgrey`;

            scoreBubble.style.background = `conic-gradient(${progressColor} ${startValue * 3.6}deg, gray 0deg)`;
            if (startValue === endValue) {
                clearInterval(progress);
            }
        }, speed);
    }
}

function typeText(element, html, baseSpeed) {
    let index = 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    const speed = baseSpeed / text.length; // Adjust speed based on text length

    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            element.innerHTML = html; // Set the full HTML content after typing is done
        }
    }
    type();
}