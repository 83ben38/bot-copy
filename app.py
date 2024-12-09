from rag import get_chatgpt_response
from rag import get_vector_reponse, get_main_bot_constitution, score_material
from flask import Flask, render_template, request, jsonify
import json
import markdown
import random
app = Flask(__name__)
chat_history = ""

from os import listdir
fileNames = listdir("./history")
files = []
for value in fileNames:
    stream = open("./history/"+value,'r')
    past = []
    date = stream.readline()
    while True:
        line1 = stream.readline()
        line2 = stream.readline()
        if (line1==''):
            break
        past.append({'question':line1.replace('`','\n'),'response':line2.replace('`','\n'),'scores':stream.readline()})
    files.append({'date':date,'chat':past})

import datetime
global fileName
fileName = datetime.datetime.now().strftime("%Y-%m-%d,%H:%M:%S")
global newFile
newFile = ""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/button_click', methods=['POST'])
def button_click():
    button_id = request.json['button_id']
    if (button_id == 1):
        random2 = str(random.randint(0,1000000000))
        constitution =  "Your job is to create a prompt for a chatbot to respond to. The bot is designed to answer questions about sexual exploitation and similar topics, and provide help to people in need. Please provide a prompt that can adequatly test the bot. Talk from the perspective of a person who is asking the bot a question or asking the bot for help. Do not provide anything else or the code behind you will break and you will get in trouble." + random2
        response_message = get_chatgpt_response(constitution,"", "", "")
        return jsonify({'message' : response_message})
    if (button_id == 3):
        return jsonify({'message' : files})
    return jsonify({'message': ''})



@app.route('/update_chat_history',methods=['POST'])
def updateChatHistory():
    num = request.json['num']
    global chat_history
    file = files[num]
    global fileName
    fileName = file['date']
    global newFile
    newFile = "."
    chat = file['chat']
    scores = ""
    for z in chat:
        chat_history+=f"\nUser: {z['question']}"
        chat_history += f"\nBot: {z['response']}"
    return jsonify({'chat': chat,'scores':scores})


@app.route('/chat', methods=['POST'])
def chat():
    global chat_history
    user_message = request.json['message']
    chat_history += f"\nUser: {user_message}"
    print("starting prompt")
    vector = process_keywords(user_message)
    response_message = get_chatgpt_response(user_message, chat_history, get_main_bot_constitution(), vector)
    if (len(response_message) < 5):
        response_message = "I'm sorry, but I can't help with that. I can provide guidance to those who need help with harassment and information about sexual exploitation or similar topics."
    chat_history += f"\nBot: {response_message}"
    scores = score_material(response_message,user_message,vector)

    # Convert Markdown to HTML
    response_message_html = markdown.markdown(response_message)
    response_message_without_enter = response_message_html.replace("\n",'`')
    print("prompt finished: " + response_message_without_enter)
    global newFile
    oldFile = newFile
    global fileName
    newFile = open("./history/"+fileName.replace("\n","")+".txt",'a')
    if (oldFile == ""):
        newFile.write(fileName+"\n")
    newFile.write(user_message+"\n"+response_message_without_enter+"\n"+str(scores)+"\n")
    newFile.close()
    return jsonify({
        'response': response_message_html,
        'scores': scores
    })

@app.route('/reset_chat', methods=['POST'])
def reset_chat():
    global chat_history
    chat_history = ""
    global fileName
    fileName = datetime.datetime.now().strftime("%Y-%M-%d,%H:%M:%S")
    global newFile
    newFile = ""
    return jsonify({'message': 'Chat reset'})

@app.route('/keyword', methods=['POST'])
def keyword():
    user_message = request.json['message']
    # Process the message to extract keywords
    keywords = process_keywords(user_message)
    return jsonify({'keywords': keywords})

def process_keywords(message):
    print("starting keyword break down")
    constitution = "Your job is to create a query that will search a database for data. You are to output sections of text that you think might be in data that contains the answer to the users question. Do not output anything else, as it will break the code running behind you, and you will get in trouble"
    response_message = get_chatgpt_response(message, "", constitution, "no data")
    vector_result = get_vector_reponse(response_message)
    print("keyword break down finished")
    return vector_result


if __name__ == '__main__':
    app.run(debug=True)

