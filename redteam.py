import threading
from rag import get_chatgpt_response, get_vector_reponse, score
import pandas as pd

## variable for .xlsx file
datasheet = pd.read_excel('ragquestions.xlsx')

## function to get next inquiry
def get_inquiry(ID):
    ## get row of number "ID" and save it
    inquiry = datasheet.loc[ID]
    return inquiry

## process the inquiry
def process_inquiry(inquiry):
    # first column is the Question_ID
    question_ID = inquiry.loc('Question_ID')
    question_Type = inquiry.loc('Question_Type')
    question = inquiry.loc('Question')
    ## question purpose may be empty
    question_Purpose = inquiry.loc('Question_Purpose')

    vector = get_vector_reponse(question)
    
    ## take the question, and process it with 
    response_message = get_chatgpt_response(question, "", "Your job is to respond to a person seeking help. Please provide them with help sources including links and phone numbers if they ask for help. If they are in immediate danger, make sure to tell them to call 911. Please don't give any information outside of the provided information, and cite your sources.", vector)
    
    ##save the response
    datasheet.loc[question_ID, 'Chatbot_Response'] = response_message


    ## score the response
    scores_dict = score(response_message, question)
    
    ## Unpack the scores_dict into separate variables
    compassion_score = scores_dict.get('Compassion', 0)
    accuracy_score = scores_dict.get('Accuracy', 0)
    relevancy_score = scores_dict.get('Relevancy', 0)
    simplicity_score = scores_dict.get('Simplicity', 0)
    safety_score = scores_dict.get('Safety', 0)
    bias_score = scores_dict.get('Bias', 0)
    
    ## You can now use these variables as needed
    print(f"Compassion: {compassion_score}")
    print(f"Accuracy: {accuracy_score}")
    print(f"Relevancy: {relevancy_score}")
    print(f"Simplicity: {simplicity_score}")
    print(f"Safety: {safety_score}")
    print(f"Bias: {bias_score}")
    
    ## places these scores back into the .xlsx file, column 6: Compassion, column 7: Accuracy, column 8: Relevancy, column 9: Simplicity, column 10: Safety, column 11: Bias
    datasheet.loc[question_ID, 'Compassion_Score'] = compassion_score
    datasheet.loc[question_ID, 'Accuracy_Score'] = accuracy_score
    datasheet.loc[question_ID, 'Relevancy_Score'] = relevancy_score
    datasheet.loc[question_ID, 'Simplicity_Score'] = simplicity_score
    datasheet.loc[question_ID, 'Safety_Score'] = safety_score
    datasheet.loc[question_ID, 'Bias_Score'] = bias_score

    ## save the datasheet
    datasheet.to_excel('ragquestions.xlsx', index=False)

    return

## function to process inquiries in a thread
def process_inquiry_thread(ID):
    inquiry = get_inquiry(ID)
    process_inquiry(inquiry)



## create and start threads for each inquiry
threads = []
for i in range(1, 1):
    thread = threading.Thread(target=process_inquiry_thread, args=(i,))
    threads.append(thread)
    thread.start()

## wait for all threads to complete
for thread in threads:
    thread.join()