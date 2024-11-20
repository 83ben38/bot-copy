document.addEventListener('DOMContentLoaded', function() {
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }
    var explanations;
    var lastResponse;
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
            lastResponse = data.response;
            typeText(botMessageDiv, data.response, 1000);
            // Update score bubbles
            const scores = data.scores;
            explanations = scores;
            updateScoreBubble('chatbot-score1', scores.compassion.score);
            updateScoreBubble('chatbot-score2', scores.accuracy.score);
            updateScoreBubble('chatbot-score3', scores.relevancy.score);
            updateScoreBubble('chatbot-score4', scores.simplicity.score);
            updateScoreBubble('chatbot-score5', scores.safety.score);
            updateScoreBubble('chatbot-score6', scores.bias.score);
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
        if (buttonId==2){
            console.log(lastResponse);
            navigator.clipboard.writeText(lastResponse);
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
                    lastResponse = data.response;
                    typeText(botMessageDiv, data.response, 1000);
        
                    // Update score bubbles
                    const scores = data.scores;
                    explanations = scores;
                    updateScoreBubble('chatbot-score1', scores.compassion.score);
                    updateScoreBubble('chatbot-score2', scores.accuracy.score);
                    updateScoreBubble('chatbot-score3', scores.relevancy.score);
                    updateScoreBubble('chatbot-score4', scores.simplicity.score);
                    updateScoreBubble('chatbot-score5', scores.safety.score);
                    updateScoreBubble('chatbot-score6', scores.bias.score);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Hide typing indicator in case of error
                    typingIndicator.style.display = 'none';
                });
            }
            if (buttonId==3){
                window.showHistory(data.message);
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
            document.getElementById("history").hidden = true;
            const explanation = document.getElementById('explanation');
            if (buttonId == 0){
                explanation.textContent = explanations.compassion.reasoning
            }
            if (buttonId == 1){
                explanation.textContent = explanations.accuracy.reasoning
            }
            if (buttonId == 2){
                explanation.textContent = explanations.relevancy.reasoning
            }
            if (buttonId == 3){
                explanation.textContent = explanations.simplicity.reasoning
            }
            if (buttonId == 4){
                explanation.textContent = explanations.safety.reasoning
            }
            if (buttonId == 5){
                explanation.textContent = explanations.bias.reasoning
            }
            isShown = buttonId
        }
    }

    var historyOpen = false;
    var previousFilled = false;
    window.showHistory = function(history){
        console.log(history)
        if (historyOpen){
            document.getElementById("history").hidden = true;
            document.getElementById("chatbot").hidden = false;
            historyOpen = false;
        }
        else{
            document.getElementById("history").hidden = false;
            document.getElementById("chatbot").hidden = true;
            document.getElementById("popup").hidden = true;
            historyOpen = true;
            if (!previousFilled){            
                previousFilled = true;
                const chatbox = document.getElementById('historybox');
                k = 0;
                history.forEach(element => {
                    const j = k;
                    const userMessageDiv = document.createElement('button');
                    userMessageDiv.className = 'message user-message';
                    userMessageDiv.textContent = element.chat[0].question +" "+ element.date;
                    userMessageDiv.onclick = function(){window.showConversation(j);};
                    k=k+1;
                    chatbox.appendChild(userMessageDiv);
                });
            }
        }
    }

    window.showConversation = function(number){
        document.getElementById("history").hidden = true;
        document.getElementById("chatbot").hidden = false;
        historyOpen = false;
        window.resetChat();
        fetch('/update_chat_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ num: number })
        })
        .then(response => response.json())
        .then(data => {
            const chatbox = document.getElementById('chatbox');
            data.chat.forEach(element =>{
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'message user-message';
                userMessageDiv.textContent = element.question;
                chatbox.appendChild(userMessageDiv);
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message bot-message';
                botMessageDiv.innerHTML = element.response;
                chatbox.appendChild(botMessageDiv);
            });
            var numOn = 0
            data.scores.forEach(element =>{
                numOn++
                updateScoreBubble('chatbot-score'+numOn, element.score);
            })
        })
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

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (value / 5));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (value / 5));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (value / 5));

    return `rgb(${r}, ${g}, ${b})`;
}

window.updateScoreBubble = function(bubbleId, newValue) {
    const scoreBubble = document.getElementById(bubbleId);
    if (scoreBubble) {
        const progressValue = scoreBubble.querySelector(".percentage");
        const innerCircle = scoreBubble.querySelector(".inner-circle");
        let startValue = parseInt(progressValue.textContent, 10);
        let endValue = Number(newValue);
        let speed = 200;

        const progress = setInterval(() => {
            if (startValue < endValue) {
                startValue++;
            } else if (startValue > endValue) {
                startValue--;
            }
            const progressColor = interpolateColor(startValue);
            progressValue.textContent = `${startValue}/5`;
            progressValue.style.color = `${progressColor}`;

            innerCircle.style.backgroundColor = `lightgrey`;

            scoreBubble.style.background = `conic-gradient(${progressColor} ${startValue * 72}deg, gray 0deg)`;
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