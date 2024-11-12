from openpyxl import load_workbook
from rag import get_chatgpt_response, score, get_vector_reponse, get_main_bot_constitution
import threading
import markdown

wb = load_workbook('redteaming.xlsx')


##set workbook to the input file



ws = wb.active



def process_question(question_ID):
    question_ID += 1

    QuestionCellID = 'C' + str(question_ID)
    question = ws[QuestionCellID].value

    print("Pulling question from cell: " + QuestionCellID)

    ResponseCellID = 'E' + str(question_ID)

    CompasstionCellID = 'F' + str(question_ID)
    AccuracyCellID = 'G' + str(question_ID)
    RelevancyCellID = 'H' + str(question_ID)
    SimplicityCellID = 'I' + str(question_ID)
    SafetyCellID = 'J' + str(question_ID)
    BiasCellID = 'K' + str(question_ID)
    AverageCellID = 'L' + str(question_ID)



    vector = get_vector_reponse(question)
    
    # Take the question, and process it with 
    response_message = get_chatgpt_response(question, "", get_main_bot_constitution(), vector)
    if (len(response_message) < 5):
        response_message = "I'm sorry, but I can't help with that. I can provide guidance to those who need help with harassment and information about sexual exploitation or similar topics."

    # Save the response
    ws[ResponseCellID] = str(response_message)

    # Score the response
    scores_dict = score(response_message, question)
    
    # Unpack the scores_dict into separate variables
    compassion_score = scores_dict.get('Compassion', 0)
    accuracy_score = scores_dict.get('Accuracy', 0)
    relevancy_score = scores_dict.get('Relevancy', 0)
    simplicity_score = scores_dict.get('Simplicity', 0)
    safety_score = scores_dict.get('Safety', 0)
    bias_score = scores_dict.get('Bias', 0)

    average_score = (compassion_score + accuracy_score + relevancy_score + simplicity_score + safety_score + bias_score) / 6

    # Save the scores
    ws[CompasstionCellID] = compassion_score
    ws[AccuracyCellID] = accuracy_score
    ws[RelevancyCellID] = relevancy_score
    ws[SimplicityCellID] = simplicity_score
    ws[SafetyCellID] = safety_score
    ws[BiasCellID] = bias_score
    ws[AverageCellID] = average_score

    # Save in history file
    response_message_html = markdown.markdown(response_message)
    response_message_without_enter = response_message_html.replace("\n",'`')
    fileName = "Question " + str(question_ID-1)
    newFile = open("./history/"+fileName.replace("\n","")+".txt",'w')
    newFile.write(fileName+"\n")
    newFile.write(question+"\n"+response_message_without_enter+"\n"+str(scores_dict)+"\n")
    newFile.close()

    return question_ID

start_ID = 1
end_ID = 3

def process_questions_in_range(start, end):
    for question_ID in range(start, end + 1):
        process_question(question_ID)
    wb.save("output.xlsx")

threads = []
num_threads = 5
questions_per_thread = (end_ID - start_ID + 1) // num_threads

for i in range(num_threads):
    thread_start_ID = start_ID + i * questions_per_thread
    thread_end_ID = thread_start_ID + questions_per_thread - 1
    if i == num_threads - 1:  # Make sure the last thread processes any remaining questions
        thread_end_ID = end_ID
    thread = threading.Thread(target=process_questions_in_range, args=(thread_start_ID, thread_end_ID))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()
