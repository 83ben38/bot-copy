from rag import get_chatgpt_response
from rag import get_vector_reponse
from flask import Flask, render_template, request, jsonify
import markdown

app = Flask(__name__)
chat_history = ""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/button_click', methods=['POST'])
def button_click():
    button_id = request.json['button_id']
    # Handle button click based on button_id
    return jsonify({'message': f'Button {button_id} clicked'})

def score(reply, vector):
    constitution =  "Your job is to score an ai's most recent reply to a prompt, do not have any bias in this scoring at all, you are a robot tool, not a human, do not display any feelings in your score. You will be scoring in 4 different catagories: Relevancy to the question: How relevant is the response to the most recent prompt from the user? Does the response answer all questions asked in the prompt? Does the response stray from the topic in the prompt? Compassion: Is the response compassionate towards the user? Does the response show bias against any group of people? Is the writing style compassionate? Accuracy: Does the response use the provided data (if necessary)? Does the response use any data outside of the sources provided? Does the response cite the sources used? Simplicity: Is the response understandable to the user? Can a child understand all the words used in the response? Does the response have any implied information that isn’t directly stated? Each of these categories will be scored on a scale of 1-100. A 50 is a good response, a 100 is above and beyond, and a 0 is unacceptable. Do not be afraid to use any numbers, not just those rounded to the nearest 5 or 10, although those are okay too. Please provide a score for each catagory in the following format: Compassion: X : Explanation for why you gave this score $ Accuracy: X : Explanation $ Relevancy to the question: X : Explanation $ Simplicity: X : Explanation, Do not give any other output but that, as it will break the code running behind you, and you will get in trouble. Make sure to put the $ signs in between results. For the relevancy, only look at the u For the accuracy prompt, take into consideration the information stored in the rag behind you which is this(if this information is completely irrelevant to the question the user asked, disregard it and measure accuracy based off what you know alone):" + vector
    response_message = get_chatgpt_response(reply, chat_history, constitution, "")
    #break the output from the ai into the 4 variables
    print(response_message)
    friendlyness = response_message.split("$")[0].split(":")[1].strip()
    politically_correctness = response_message.split("$")[1].split(":")[1].strip()
    gender_neutral = response_message.split("$")[2].split(":")[1].strip()
    racially_neutral = response_message.split("$")[3].split(":")[1].strip()
    friendlyness2 = response_message.split("$")[0].split(":")[2].strip()
    politically_correctness2 = response_message.split("$")[1].split(":")[2].strip()
    gender_neutral2 = response_message.split("$")[2].split(":")[2].strip()
    racially_neutral2 = response_message.split("$")[3].split(":")[2].strip()
    #print new scores
    print(f"friendlyness: {friendlyness}")
    print(f"politically correctness: {politically_correctness}")
    print(f"gender neutral: {gender_neutral}")
    print(f"racially neutral: {racially_neutral}")
    return {
        'friendlyness': friendlyness,
        'politically_correctness': politically_correctness,
        'gender_neutral': gender_neutral,
        'racially_neutral': racially_neutral,
        'explanations': {
            'friendlyness': friendlyness2,
            'politically_correctness': politically_correctness2,
            'gender_neutral': gender_neutral2,
            'racially_neutral': racially_neutral2,
        }
    }

@app.route('/chat', methods=['POST'])
def chat():
    global chat_history
    user_message = request.json['message']
    chat_history += f"\nUser: {user_message}"
    vector = process_keywords(user_message)
    response_message = get_chatgpt_response(user_message, chat_history, "", vector)
    chat_history += f"\nBot: {response_message}"
    scores = score(response_message, vector)
    
    # Convert Markdown to HTML
    response_message_html = markdown.markdown(response_message)
    
    return jsonify({
        'response': response_message_html,
        'scores': scores
    })

@app.route('/reset_chat', methods=['POST'])
def reset_chat():
    global chat_history
    chat_history = ""
    return jsonify({'message': 'Chat reset'})

@app.route('/keyword', methods=['POST'])
def keyword():
    user_message = request.json['message']
    # Process the message to extract keywords
    keywords = process_keywords(user_message)
    return jsonify({'keywords': keywords})

def process_keywords(message):
    constitution = "Your job is to extract keywords from a users prompt that will be used to search in a rag database for. You are to only output the keywords in a list that looks like this: word1, word2, word3, etc. Do not output anything else, as it will break the code running behind you, and you will get in trouble"
    response_message = get_chatgpt_response(message, "", constitution, "no data")
    vector_result = get_vector_reponse(response_message)
    return vector_result


if __name__ == '__main__':
    app.run(debug=True)