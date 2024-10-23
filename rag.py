from openai import OpenAI
import json
from qdrant_client import QdrantClient  # Import QdrantClient

# Set your OpenAI API key
client = OpenAI(
    api_key=''  # Ensure your API key is set in the environment
)

# Initialize QdrantClient
qdrant_client = QdrantClient(url="", api_key="")

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
    




