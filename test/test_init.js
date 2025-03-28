import { test_base} from "./test_names.js";
import { displayQuestion,stateAnswers} from "./test_display.js";
import { getLoadedData } from "./test_load.js";
import { reviewQuiz,showResults,storeQuizCheck,saveProgress } from "./test_save.js";
import { logoutUser } from "../js/persistent.js";

/**********************************************************************************************************************/
const nextButton = document.getElementById("next-btn");
const submitButton = document.getElementById("submit-btn");
const prevButton = document.getElementById("prev-btn");
const reviewButton = document.getElementById("review-btn");
const homeButton = document.getElementById("home-btn");
const saveButton = document.getElementById("save-btn");
const modal_question = document.getElementById('open-questions-modal');

const outbutton = document.getElementById("out-btn");

modal_question.classList.add("hidden");
prevButton.classList.add("hidden");
homeButton.classList.add("hidden");
saveButton.classList.add("hidden");
reviewButton.classList.add("hidden");
/**********************************************************************************************************************/
const backpage = "./cont1.html";
let array_questions = [...test_base.test_questions];
let QuestionIndex = array_questions.length;
const loadedData = await getLoadedData();
const num_question = loadedData?.total || 0;
let currentQuestionIndex = num_question;




// Event listeners
outbutton.addEventListener("click", logoutUser);

nextButton.addEventListener("click", nextQuestion);
prevButton.addEventListener("click", previousQuestion);
reviewButton.addEventListener('click', reviewQuiz);
saveButton.addEventListener('click', saveProgress);

homeButton.addEventListener("click", () => {
  window.location.href = backpage; // Redirect to home
});

/**********************************************************************************************************************/
function previousQuestion() {pre_fun(currentQuestionIndex,"") };
function nextQuestion() {nxt_fun(currentQuestionIndex,"") };

function pre_fun(index,txt)
{
  if(txt === "")
  {  if (index > 0) { index--;
    displayQuestion(index);
    updateQuestionCounter(index);
    currentQuestionIndex = index;
  }}
  else if (txt === "out"){
    displayQuestion(index);
    updateQuestionCounter(index);
    currentQuestionIndex = index;
  }

  nextButton.disabled = false;
  submitButton.classList.add("hidden");
  reviewButton.classList.add("hidden");
}

/***&&&&&&&&&&&&&&&&&&&&&&&&&&****/
function nxt_fun(index,txt){
  console.log(currentQuestionIndex,stateAnswers.correct);
  if(txt === "" && currentQuestionIndex+1 === stateAnswers.correct)
  {
    // Save user input before moving forward
    if (index < QuestionIndex - 1) {
      index++;
      updateQuestionCounter(index);
      displayQuestion(index);
      currentQuestionIndex = index
    }
    // Disable next button on the last question
    nextButton.disabled = index === QuestionIndex - 1;
    // Show submit button only on the last question
    if (index === QuestionIndex - 1) {
      submitButton.classList.remove("hidden");
    }
  }

    else if (txt === "out")
    { 
      updateQuestionCounter(index);
      displayQuestion(index);
      currentQuestionIndex = index
    // Disable next button on the last question
    nextButton.disabled = index === QuestionIndex - 1;
    // Show submit button only on the last question
    if (index === QuestionIndex - 1) {
      submitButton.classList.remove("hidden");
      }
    }
}

/***&&&&&&&&&&&&&&&&&&&&&&&&&&****/
// Submit button event listener
submitButton.addEventListener("click", () => {
  nextButton.classList.add("hidden");
  prevButton.classList.add("hidden");
  submitButton.classList.add("hidden");
  showResults();
});

/**********************************************************************************************************************/
// Update the question counter display
function updateQuestionCounter(currentIndex) {
  const questionCounter = document.getElementById('question-counter');
  questionCounter.textContent = `السؤال ${currentIndex + 1} من ${QuestionIndex}`;
}
/**********************************************************************************************************************/
function initializeNewQuiz() {
  displayQuestion(currentQuestionIndex);
  updateQuestionCounter(currentQuestionIndex);
}

initializeNewQuiz();

export{pre_fun,nxt_fun};