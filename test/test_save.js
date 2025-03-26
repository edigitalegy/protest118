import { db } from "../js/firebase.js";

import { test_base,getUserId} from "./test_names.js";
import { updateQuestionButtonStyle,userAnswers,userAnswersDuration,questionStartTime,stateAnswers,counttry} from "./test_display.js";

/**************************************************************************************************/
let answeredQuestions = new Set();
let currentQuestionIndex = 0; 
answeredQuestions.add(currentQuestionIndex);  // Mark as answered
/*********************************/
let array_answers = [...test_base.test_questions];
let answersCount = array_answers.length;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;
const nextButton = document.getElementById("next-btn");
const reviewButton = document.getElementById("review-btn");
const homeButton = document.getElementById("home-btn");
const submitButton = document.querySelector("#submit-btn");

/****************************************showMessage*********************************************************/
function showMessage(message, type = "info") {
    // Find or create the alert container at the center of the page
    let alertContainer = document.getElementById("alert-container");
    
    if (!alertContainer) {
        alertContainer = document.createElement("div");
        alertContainer.id = "alert-container";
        alertContainer.style.position = "fixed";
        alertContainer.style.top = "50%"; // Center vertically
        alertContainer.style.left = "50%"; // Center horizontally
        alertContainer.style.transform = "translate(-50%, -50%)"; // Perfect centering
        alertContainer.style.zIndex = "1050"; // Ensure it's above other elements
        alertContainer.style.width = "90%";
        alertContainer.style.maxWidth = "400px"; // Limit the width
        document.body.appendChild(alertContainer);
    }

    // Create the alert
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show text-center`;
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
    `;

    // Append alert to container
    alertContainer.appendChild(alert);

    // Auto-dismiss after 2 seconds (except for the "saving" message)
    if (type !== "primary") {
        setTimeout(() => {
            alert.classList.remove("show");
            alert.classList.add("fade");
            setTimeout(() => alert.remove(), 500);
        }, 2000);
    }
    // Return the alert element so it can be removed manually
    return alert;
}
/***********************************showResults***************************************************/
function showResults() {
    const resultContainer = document.getElementById('result');
    resultContainer.classList.remove('hidden');
    correctAnswersCount=stateAnswers.correct;
    // Generate recommendations based on the score
    let recommendations;
    if (correctAnswersCount === answersCount) {
      recommendations = "أحسنت! استمر في المذاكرة بشكل جيد.";
    } else if (correctAnswersCount >= answersCount / 2) {
      recommendations = "جيد، لكن يمكنك تحسين أدائك. حاول مراجعة المحتوى التي لم تجب عليها بشكل صحيح.";
    } else {
      recommendations = "يبدو أنك بحاجة إلى مزيد من الممارسة. حاول التركيز على الموضوعات التي لم تفهمها جيدًا.";
    }
    resultContainer.innerHTML = `
      <div class="text-center text-danger">
        <p>لقد أجبت بشكل صحيح على <strong>${correctAnswersCount}</strong> من <strong>${answersCount}</strong> أسئلة.</p>
        <p class="mt-3 text-dark">${recommendations}</p>
      </div>
    `;
    // Show the home button now that it's already in the HTML
    // homeButton.classList.remove('hidden');
    // Store the result and review data in Firestore
    storeQuizResults();
  }
/***********************************reviewQuiz***************************************************/
function reviewQuiz() {
  const quizContainer = document.getElementById('quiz-container'); quizContainer.innerHTML = '';

  array_answers.forEach((item, index) => {
    const reviewCard = document.createElement('div'); reviewCard.classList.add('mb-3');

    const questionTitle = document.createElement('h5'); questionTitle.textContent = `س${index + 1}: ${item.question}`;
    reviewCard.appendChild(questionTitle);

    const userAnswer = userAnswers[index] || "لم يتم اختيار إجابة"; // Get user's answer
    const resultText = document.createElement('p');
    resultText.classList.add(userAnswer === item.answer ? 'correct-answer' : 'wrong-answer');
    resultText.innerHTML = `إجابتك: <strong>${userAnswer}</strong>`;
    reviewCard.appendChild(resultText);

    const correctText = document.createElement('p');
    correctText.innerHTML = `الإجابة الصحيحة: <strong>${item.answer}</strong>`;
    correctText.classList.add('correct-answer');
    reviewCard.appendChild(correctText);
    quizContainer.appendChild(reviewCard);
  });
  // Hide the review and next buttons after reviewing
  reviewButton.classList.add('hidden');
  nextButton.classList.add('hidden');
}
/***********************************store Quiz Check Function***************************************************/
async function storeQuizCheck() {
    const userId = await getUserId(); // Get user ID
    if (!userId) throw new Error("User ID not found.");

    const quizResultRef = db.collection(test_base.databasename).doc(userId);

    try {
        const docSnapshot = await quizResultRef.get(); // Fetch document once
        
        if (docSnapshot.exists) {
            const data = docSnapshot.data(); // Get document data

            // Check if "quizResults" field exists in the document
            if (data && data.quizResults) {
                displayQuizResult("لقد قمت بالإجابة على الاختبار مسبقاً ولا يمكنك المحاولة مرة أخرى.", true);
                return { exists: true, userId }; // Return userId as well
            }
        }

        return { exists: false, quizResultRef, userId }; // Return userId with quiz reference
    } catch (error) {  
        displayQuizResult("حدث خطأ أثناء التحقق من المحاولة السابقة: " + error.message, true);
        return { exists: true, userId }; // Return userId even if there's an error
    }
}
/***********************************Firestore Storage Function***************************************************/
async function storeQuizResults() {
    const resultCheck = await storeQuizCheck(); // Wait for check

    if (resultCheck.exists) {
        if (submitButton) {
            submitButton.disabled = true;
            homeButton.disabled = true;
        }
        return;
    }

    const { quizResultRef, userId } = resultCheck; // Get Firestore document reference & userId

    try {
        // Store full quiz details with timestamp & duration
        const userDoc = await db.collection("usersid").doc(userId).get();
        let userData = userDoc.exists ? userDoc.data() : {};

        let userName = userData.name || "غير متوفر";
        let userEmail = userData.email || "غير متوفر";

        let quizResponses = array_answers.map((item, index) => ({
            question: item.question,
            correctAnswer: item.answer,
            userAnswer: userAnswers[index] || "لم يتم اختيار إجابة",
            timestamp: new Date().toISOString(),  // When the answer was recorded
            tries:counttry[index] || 0,
            duration: userAnswersDuration[index] || 0 // Time spent answering (in seconds)
        }));

        const resultData = {
            uid: userId, // Use userId returned from storeQuizCheck()
            name: userName,  // ✅ Store fetched name
            email: userEmail, // ✅ Store fetched email
            score: correctAnswersCount,
            total: answersCount,
            responses: quizResponses, // Store full question details with timestamp
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Save quiz completion time
        };

        await quizResultRef.set({ quizResults: resultData }, { merge: true });

        displayQuizResult("تم حفظ إجاباتك بنجاح.");
        
        if (homeButton) { homeButton.disabled = false; }

    } catch (error) {
        displayQuizResult("حدث خطأ أثناء حفظ الإجابات: " + error.message, true);
    }
}
/***********************************displayQuizResult***************************************************/
function displayQuizResult(message, isError = false) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `<p>${message}</p>`;
  resultDiv.classList.remove('hidden', 'alert-success', 'alert-danger');
  resultDiv.classList.add(isError ? 'alert-danger' : 'alert-success');
  //Show the home button
  //homeButton.classList.remove('hidden');
}
/****************************************************saveUserAnswer**************************************************/
// Save user answers for text input questions
function saveUserAnswer(index) {
    const item = array_answers[index];
    if (item.options.length === 0) 
    {
        // Text input question
        const inputField = document.getElementById("answer-input");
        if (inputField) {
            userAnswers[index] = inputField.value.trim(); }
    }
    if (questionStartTime) {
        let questionEndTime = Date.now();
        userAnswersDuration[index] = Math.floor((questionEndTime - questionStartTime) / 1000); // Time in seconds
    }
    updateQuestionButtonStyle(index);
}
/****************************************************saveProgress**************************************************/
async function saveProgress() {
  try {
    const savingMessage = showMessage("جاري الحفظ", "primary");

      const userId = await getUserId(); // Get user ID
      if (!userId) throw new Error("User ID not found.");

      const quizResultRef = db.collection(test_base.databasename).doc(userId); // Reference to user document

      let quizProgress = [];

      // Loop through userAnswers and format the data
      Object.keys(userAnswers).forEach(index => {
          quizProgress.push({
              index: parseInt(index),
              question: array_answers[index]?.question || "Unknown Question",
              answers: userAnswers[index] || "",
              questionStartTime: questionStartTime || null,
              durations: userAnswersDuration[index] || 0
          });
      });

      // Add total questions count inside quizProgress
      quizProgress.push({
          Totalquestions: quizProgress.length
      });

      // Merge progress into Firebase
      await quizResultRef.set({ quizProgress }, { merge: true });
      if (savingMessage) savingMessage.remove();
      showMessage("تم الحفظ  بنجاح!", "success"); // Green success message
  } catch (error) {
    if (savingMessage) savingMessage.remove();

    showMessage("حدث خطأ أثناء الحفظ!", "danger"); // Red error message
}
}


// Export after all functions have run
export { reviewQuiz,showResults,storeQuizCheck,saveProgress,saveUserAnswer};
