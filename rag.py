from openai import OpenAI
import json
from qdrant_client import QdrantClient  # Import QdrantClient
from tenacity import retry, wait_exponential  # Import retry and wait_exponential
import os  # Import os module
data = open("/Users/CD14674/Documents/CAPS/NCOSE/Chatbot/chat-bot/key.txt",'r').read()


lines = []
length = len(data)
j = 0
for i in range(0,length):
    if (data[i] == '\n'):
        lines.append(data[j:i])
        j = i+1

os.environ["OPENAI_API_KEY"] = lines[0]
os.environ["QDRANT_URL"] = lines[1]
os.environ["QDRANT_API_KEY"] = lines[2]

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize QdrantClient
qdrant_client = QdrantClient(url=lines[1], api_key=lines[2])


# Function to get prompt messages
def get_prompt(row):
    return [
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": f"""Answer the following Question based on the Context only. Only answer from the Context. If you don't know the answer, say 'I don't know'.
    Question: {row.question}\n\n
    Context: {row.context}\n\n
    History: {row.history}\n\n
    Answer:\n""",
        },
    ]


# Function with tenacity for retries
@retry(wait=wait_exponential(multiplier=1, min=2, max=6))
def api_call(messages, model):
    return client.chat.completions.create(
        model=model,
        messages=messages,
        stop=["\n\n"],
        max_tokens=100,
        temperature=0.0,
    )


# Main function to answer question
def answer_question(row, prompt_func=get_prompt, model="gpt-3.5-turbo"):
    messages = prompt_func(row)
    response = api_call(messages, model)
    return response.choices[0].message.content





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
    






