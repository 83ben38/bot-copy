document.addEventListener('DOMContentLoaded', function() {
    window.handleKeyPress = function(event,client) {
        if (event.key === 'Enter') {
            sendMessage(client);
        }
    }
    var explanations;
    var lastResponse;
    window.sendMessage = function(client) {
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
            body: JSON.stringify({ message: message, score: !client })
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
            typeText(botMessageDiv, data.response, 1000,chatbox, data.websites);
            // Update score bubbles
            if (!client){
            const scores = data.scores;
            explanations = scores;
            updateScoreBubble('chatbot-score1', scores.compassion.score);
            updateScoreBubble('chatbot-score2', scores.accuracy.score);
            updateScoreBubble('chatbot-score3', scores.relevancy.score);
            updateScoreBubble('chatbot-score4', scores.simplicity.score);
            updateScoreBubble('chatbot-score5', scores.safety.score);
            updateScoreBubble('chatbot-score6', scores.bias.score);
            }
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
                    typeText(botMessageDiv, data.response, 1000,chatbox, data.websites);
        
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
            if (buttonId==4){
                updateChartFromFile(scoreChart);
                updateLiveAverages();
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
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        chatbox.appendChild(botMessageDiv);
        lastResponse = "Hi there! How can I assist you today?";
        typeText(botMessageDiv, lastResponse, 1000,chatbox, []);
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

    window.updateLiveAverages = function() {
        fetch('/compute_live_average', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Live averages updated:', data.averageScores);
        })
        .catch(error => console.error('Error:', error));
    };
});

function interpolateColor(value) {
    const startColor = { r: 151, g: 75, b: 89 }; // Crimson Red
    const endColor = { r: 34, g: 139, b: 34 }; // Forest Green

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * (value / 5));
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * (value / 5));
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * (value / 5));

    return `rgb(${r}, ${g}, ${b})`;
}

window.updateScoreBubble = function(bubbleId, newValue) {
    updateChartFromFile(scoreChart);
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

function typeText(element, html, baseSpeed, insideDiv, sources) {
    let i = 0;
    const speed= (html.length/baseSpeed)+1;
    function type() {
        if (i < html.length) {
            element.innerHTML = marked.parse(html.substring(0, i + speed));
            i+=speed;
            insideDiv.scrollTop = insideDiv.scrollHeight
            setTimeout(type, 1);
        }
        else{
            element.innerHTML = marked.parse(html);
            if (sources.length > 0){
                const allSourceDiv = document.createElement('div');
                allSourceDiv.className = 'allSourceDiv';
                element.appendChild(allSourceDiv);
                for (let i = 0; i < sources.length; i++) {
                    const sourceDiv = document.createElement('button');
                    sourceDiv.onclick = function(){window.open(sources[i], "_blank");};
                    sourceDiv.className = 'sourceDiv';
                    const url = sources[i];
                
                    var displayText = url.substring(8,url.indexOf(".",8));
                    if (displayText == "www"){
                        displayText = url.substring(url.indexOf(".")+1,url.indexOf(".",url.indexOf(".")+1));
                    }
                    sourceDiv.innerHTML = displayText;
                    allSourceDiv.appendChild(sourceDiv);
                }
            }
        }
    }
    type();
    
}


// Define metric names
const metricNames = [
    "Compassion",    // Metric 1
    "Accuracy",   // Metric 2
    "Relevancy",     // Metric 3
    "Simplicity", // Metric 4
    "Safety",  // Metric 5
    "Bias" // Metric 6
];

// Function to fetch the score history and update the chart
async function updateChartFromFile(chart, filePath = "static/history/scorehistory.json") {
    try {
        // Fetch the JSON data
        const response = await fetch(filePath + `?t=${Date.now()}`); // Cache-busting query param
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Score history is empty or invalid format.");
        }

        // Process the fetched data
        const labels = data.map(entry => new Date(entry.timestamp).toLocaleTimeString());
        const datasets = metricNames.map((name, i) => ({
            label: name, // Use custom metric names
            data: data.map(entry => entry.scores[i]),
            borderColor: `hsl(${(i * 45) % 360}, 70%, 50%)`,
            borderWidth: 2,
            fill: false,
        }));

        // Update the chart data
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update();
    } catch (error) {
        console.error("Failed to fetch or process score history:", error);
    }
}

// Initialize the chart
const ctx = document.getElementById('scoreChart').getContext('2d');
const scoreChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Initially empty
        datasets: [] // Initially empty
    },
    options: {
        borderWidth: 20,
        animations: {
            tension: {
              duration: 1000,
              easing: 'easeInOutSine',
              from: .3,
              to: .2,
              loop: true
            }
          },
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Chatbot Score Trends' }
        },
        scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { title: { display: true, text: 'Scores' }, beginAtZero: true, max: 5 }
        }
    }
});

// Initial chart load
updateChartFromFile(scoreChart);


// Initialize chart variable
let radarChart;

// Function to fetch live data
async function fetchLiveData() {
    const response = await fetch('static/history/liveaverage.json');
    const data = await response.json();
    return data;
}

// Function to initialize or update the radar chart
function updateRadarChart(data, labelPrefix) {
    const ctx = document.getElementById('averageRadarChart').getContext('2d');
    // If chart already exists, destroy it to update
    if (radarChart) {
        radarChart.destroy();
    }

    // Prepare datasets
    const datasets = Array.isArray(data)
        ? data.map((entry, index) => ({
            label: `${labelPrefix} ${new Date(entry.timestamp).toLocaleDateString()}`,
            data: entry.averageScores,
            backgroundColor: `hsla(${index * 60}, 70%, 70%, 0.2)`,
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            borderWidth: 2
        }))
        : [{
            label: labelPrefix,
            data: data.averageScores,
            backgroundColor: 'hsla(0, 70%, 70%, 0.2)',
            borderColor: 'hsl(0, 70%, 50%)',
            borderWidth: 2
        }];

    // Create the radar chart
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [    "Compassion",    // Metric 1
                "Accuracy",   // Metric 2
                "Relevancy",     // Metric 3
                "Simplicity", // Metric 4
                "Safety",  // Metric 5
                "Bias" // Metric 6],
            ],
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Radar Chart' }
            },
            scales: {
                r: {
                    angleLines: { display: false },
                    suggestedMin: 0,
                    suggestedMax: 5
                }
            }
        }
    });
}

// Function to update the chart in live mode
async function updateChartInLiveMode() {
    const liveData = await fetchLiveData();
    updateRadarChart(liveData, 'Live Data');
}


// Function to fetch and update data
async function loadAndSwitchRadarChart(dataType) {
    const filePath = dataType === 'live'
        ? "static/history/scorehistory.json" // Live data file
        : "static/history/averagehistory.json"; // Testing data file

    try {
        const response = await fetch(filePath + `?t=${Date.now()}`); // Cache-busting query param
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        if (dataType === 'live') {
            // Live data is expected as an array of scores
            const liveScores = data.map(entry => entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length);
            updateRadarChart(liveScores, "Live Data");
            updateChartInLiveMode();
        } else {
            // Testing data is already structured
            updateRadarChart(data, "Testing Data");
        }
    } catch (error) {
        console.error("Failed to fetch or display data:", error);
    }
}

// Add event listeners to the buttons
document.getElementById('liveDataBtn').addEventListener('click', () => {
    loadAndSwitchRadarChart('live');
});

document.getElementById('testingDataBtn').addEventListener('click', () => {
    loadAndSwitchRadarChart('testing');
});

// Load the default chart on page load
loadAndSwitchRadarChart('testing'); // Default to testing data


