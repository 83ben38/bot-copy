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


main_bot_constitution = "Your job is to respond to a person seeking help or information. If they ask for something which is not relevant to the provided data, respond with a blank answer. Please provide them with help sources including links and phone numbers from the data. If they are in immediate danger, make sure to tell them to call 911. "
def get_main_bot_constitution():
    return main_bot_constitution   


# Initialize QdrantClient
qdrant_client = QdrantClient(url=lines[1], api_key=lines[2])

def get_chatgpt_response(input, history, constitution, vector):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # You can update this to the model you want to use
        messages=[
            {"role": "system", "content": "Chat History: " + history + "This these are your restrictions (if empty, assume none required):" + constitution + "\n" + "Here is the relevant data to the users question (if none, rely on your own knowledge, if provided, primarily use the relevant data over your own knowledge): " + vector},  # System prompt)}, 
            {"role": "user", "content": input}  # User's content
        ],
        max_tokens=2048
    )
    # Handle the response using the new method
    api_response = completion.choices[0].message.content.strip()
    return api_response




def score_material(scoringmaterial, context):
    scores = {}
    for criterion, description  in SCORING_CRITERIA.items():
        score_response = get_chatgpt_response(scoringmaterial, "", "you are going to be scoring another ai's work, you are to return a number, 1-5, on how well it fits this criterion:" + description + "Give your number, and then after the number have a comma, then your reasoning for that score, e.g: 5, perfect reponse meets all the criteria, or, 2, not awful, but could be improved if the reply did ___, DO NOT GIVE ANY OTHER OUTPUT THAN THIS OR THE CODE RUNNING BEHIND YOU WILL BREAK AND YOU WILL GET IN TROUBLE", context)
        #split the scores into the number and the reasoning
        score_response = score_response.split(",")
        scores[criterion] = {
            'score': int(score_response[0]),
            'reasoning': score_response
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


score_material("This is a test", "This is a test")
    




