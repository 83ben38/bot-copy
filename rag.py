from openai import OpenAI
from qdrant_client import QdrantClient  # Import QdrantClient
import ast
from config.scoringconfig import SCORING_WEIGHTS, SCORING_SCALE, SCORING_CRITERIA;

data = open("key.txt",'r').read()

lines = []
length = len(data)
j = 0
for i in range(0,length):
    if (data[i] == '\n'):
        lines.append(data[j:i])
        j = i+1

# Set your OpenAI API key
client = OpenAI(
    api_key=lines[0]  # Ensure your API key is set in the environment
)


main_bot_constitution = """Your role is to provide compassionate, understanding, and non-judgmental support to individuals seeking help or information. Please adhere strictly to the following guidelines:
Do not include any information from outside the given data. All responses must be based solely on the content provided.
When you provide information from the data, cite the specific source you used. Example: "According to the Safety Resources Guide, you can contact..." If available, include direct links to the source material or reference numbers.
Provide relevant help sources from the data, including links, phone numbers, and email addresses. Ensure that the resources are appropriate to the user's needs.
If the user indicates they are in immediate danger, kindly instruct them to call 911 immediately. Example: "If you are in immediate danger, please call 911 right away."
Be compassionate, understanding, and non-judgmental. Use empathetic language and validate the user's feelings.
Maintain the confidentiality of the user's information at all times.
Refrain from giving any medical or legal recommendations.
Direct the user to professional resources when necessary.
"""
def get_main_bot_constitution():
    return main_bot_constitution   


# Initialize QdrantClient
qdrant_client = QdrantClient(url=lines[1], api_key=lines[2])

def format_messages(history, constitution, vector, user_input):
    system_message = {
        "role": "system",
        "content": f"Chat History: {history} These are your restrictions (if empty, assume none required): {constitution}\nHere is the relevant data to the user's question (if none, rely on your own knowledge, if provided, primarily use the relevant data over your own knowledge): {vector}"
    }
    user_message = {"role": "user", "content": user_input}
    return [system_message, user_message]

def get_chatgpt_response(input, history, constitution, vector):
    messages = format_messages(history, constitution, vector, input)
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",  # You can update this to the model you want to use
            messages=messages,
            max_tokens=2048
        )
        api_response = completion.choices[0].message.content.strip()
        return api_response
    except Exception as e:
        print(f"Error: {e}")
        return "An error occurred while processing your request."



def score_material(scoringmaterial, context):
    scores = {}
    for criterion, description  in SCORING_CRITERIA.items():
        score_response = get_chatgpt_response(scoringmaterial, "", "you are going to be scoring another ai's work, you are to return a number, 1-5, on how well it fits this criterion (1 is a bad response and 5 is a good one):" + description + "Give your number, and then after the number have a star sign (*), then your reasoning for that score DO NOT GIVE ANY OTHER OUTPUT THAN THIS OR THE CODE RUNNING BEHIND YOU WILL BREAK AND YOU WILL GET IN TROUBLE", context)
        #split the scores into the number and the reasoning
        score_response = score_response.split("*")
        scores[criterion] = {
            'score': int(score_response[0]),
            'reasoning': score_response[1]
        }

        print(scores)
    return scores
    

def get_vector_reponse(input):
    query = client.embeddings.create(
        model="text-embedding-ada-002",
        input=input
    )

    vector = query.data.pop().embedding
    result = qdrant_client.search(
        collection_name="{data}",
        query_vector=vector,
        limit=5
    )

    
    return toString(result)

def toString(vector):
    string = ""
    for value in vector:
        print(value.payload)
        string += "Website: " + value.payload['website'] + " Data: " + value.payload['value'] + " "
        
    # Convert JSON to object

    return string

