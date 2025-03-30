
import { question_item } from "./data_questions.js";
import { displayQuestion,stateAnswers} from "./test_display.js";
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

if (outbutton) outbutton.addEventListener("click", logoutUser);
if (nextButton) nextButton.addEventListener("click", nextQuestion);
if (homeButton) {
  homeButton.addEventListener("click", () => {
    window.location.href = backpage;
  });
}


if (submitButton) {
  submitButton.addEventListener("click", () => {
    nextButton.classList.add("hidden");
    prevButton.classList.add("hidden");
    submitButton.classList.add("hidden");
    showResults();
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initializeNewQuiz();  // Initialize the quiz after DOM is fully loaded

  if (prevButton) prevButton.addEventListener("click", previousQuestion);
  if (reviewButton) reviewButton.addEventListener("click", reviewQuiz);
  if (saveButton) saveButton.addEventListener("click", saveProgress);
});

if (modal_question) modal_question.classList.add("hidden");
if (prevButton) prevButton.classList.add("hidden");
if (homeButton) homeButton.classList.add("hidden");
if (saveButton) saveButton.classList.add("hidden");
if (reviewButton) reviewButton.classList.add("hidden");

/**********************************************************************************************************************/
const backpage = "./cont1.html";
let QuestionIndex = question_item.length;
console.log(QuestionIndex);
let currentQuestionIndex = 0;
console.log(currentQuestionIndex);

// Event listeners

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
/**********************************************************************************************************************/
// Update the question counter display
function updateQuestionCounter(currentIndex) {
  const questionCounter = document.getElementById('question-counter');
  questionCounter.textContent = `السؤال ${currentIndex + 1} من ${QuestionIndex}`;
}
/**********************************************************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  initializeNewQuiz();
});
function initializeNewQuiz() {
  displayQuestion(currentQuestionIndex);
  updateQuestionCounter(currentQuestionIndex);
}


export{pre_fun,nxt_fun};