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

# Initialize QdrantClient
qdrant_client = QdrantClient(url=lines[1], api_key=lines[2])

def get_chatgpt_response(input, history, constitution, vector):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # You can update this to the model you want to use
        messages=[
            {"role": "system", "content": "Chat History: " + history + "This is your constitution (if empty, assume none required):" + constitution + "\n" + "Here is the relevant data to the users question (if none, rely on your own knowledge, if provided, primarily use the relevant data over your own knowledge): " + vector},  # System prompt)}, 
            {"role": "user", "content": input}  # User's content
        ],
        max_tokens=2048
    )
    # Handle the response using the new method
    api_response = completion.choices[0].message.content.strip()
    return api_response



def score(message, context):
    # Build a list that holds the scores
    scores = []
    # Loop through the scoring criteria
    for criterion in SCORING_CRITERIA:
        # Get the weight for the criterion
        weight = SCORING_WEIGHTS.get(criterion, 1.0)
        # Get the score for the criterion
        score = get_score(message, context, criterion)
        # Append the weighted score to the scores list
        scores.append(score * weight)
        
        # Calculate the total score by summing the weighted scores
        total_score = sum(scores)
        
        # Normalize the total score to the scoring scale
        normalized_score = total_score / len(SCORING_CRITERIA) * SCORING_SCALE
        
        return normalized_score

def get_score(message, context, criterion):
    response = get_chatgpt_response(message, "", criterion, context)
    scores_dict = ast.literal_eval(response)
    return scores_dict



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
    




