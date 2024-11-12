from openpyxl import load_workbook
from rag import get_chatgpt_response, score, get_vector_reponse, get_main_bot_constitution
import threading
import markdown
from config.scoringconfig import SCORING_CRITERIA

wb = load_workbook('redteaming.xlsx')


##set workbook to the input file



ws = wb.active



def process_question(question_ID):
    question_ID += 1

    QuestionCellID = 'C' + str(question_ID)
    question = ws[QuestionCellID].value

    print("Pulling question from cell: " + QuestionCellID)

    ResponseCellID = 'E' + str(question_ID)



    vector = get_vector_reponse(question)
    
    # Take the question, and process it with 
    response_message = get_chatgpt_response(question, "", get_main_bot_constitution(), vector)
    if (len(response_message) < 5):
        response_message = "I'm sorry, but I can't help with that. I can provide guidance to those who need help with harassment and information about sexual exploitation or similar topics."

    # Save the response
    ws[ResponseCellID] = str(response_message)

    # Score the response
    scores_dict = score(response_message, question)
    
    z = 0
    for criterion in SCORING_CRITERIA.items():
        ScoreCellID = ('F' + (z*2))+str(question_ID)
        ReasoningCellID = ('G' + (z*2))+str(question_ID)
        z+=1
        ws[ScoreCellID] = scores_dict[criterion]['score']
        ws[ReasoningCellID] = scores_dict[criterion]['reasoning']
    # Save the scores
    

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
