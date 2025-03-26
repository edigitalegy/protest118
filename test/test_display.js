import { saveUserAnswer } from "./test_save.js";
import {pre_fun,nxt_fun } from "./test_init.js";
import { getLoadedData } from "./test_load.js";

let modalbuutons = []; 
let question_item = [];
let loadedData; // Declare loadedData globally
let currentQuestionIndex = 0; // Initialize with default value
let userAnswers = {}; // Store user answers
let stateAnswers = {}; 
let userAnswersDuration = {}; // Store answer durations
let counttry = {}; 
let currentAudio = null; // Store currently playing audio

async function initializeQuiz() {
    const { test_base } = await import("./test_names.js"); // Import dynamically
    question_item = [...test_base.test_questions]; // Copy the test questions array
    // Now it's safe to run these functions
    loadedData = await getLoadedData(); // Wait for data to load
    currentQuestionIndex = loadedData?.total || 0; // Assign safely
    userAnswers=loadedData?.loadanswers || {};
    userAnswersDuration=loadedData?.loadanswersDuration || {};
    stateAnswers.correct = 0;
    stateAnswers.wrong = 0;
    createQuestionButtons();
    displayQuestion(currentQuestionIndex);
    updateQuestionButtonStyle(currentQuestionIndex);
}
initializeQuiz();
/**************************************************displayQuestion********************************************************/
let modaltest="";
let questionStartTime = null; // Track when the question is displayed

function displayQuestion(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
        currentAudio = null; // Clear the stored audio
    }

    currentQuestionIndex = index; // Update the global index
    saveUserAnswer(index);
    questionStartTime = Date.now(); // Start tracking time
    const quizContainer = document.getElementById('quiz-container'); 
    quizContainer.innerHTML = ''; // Clear previous question

    const item = question_item[currentQuestionIndex]; // Use updated index
    if (!item) return; // Prevent errors if index is out of bounds

    const questionCard = document.createElement('div');
    questionCard.classList.add('mb-3');

    // Handle modal content display (image, video, audio, text)
    if (["img", "vid", "vol", "text"].includes(item.modalType)) {
        modaltest = item.modalType;
        const infoButton = document.createElement("button");
        infoButton.type = "button";
        infoButton.classList.add("btn", "btn-info", "btn-sm", "mb-2");
        infoButton.textContent = "عرض المحتوى";
        infoButton.onclick = () => showQuestionInfo(item.modal);
        questionCard.appendChild(infoButton);
    }

    // Display question header if available
    if (item.header) {
        const headerElem = document.createElement('img');
        headerElem.classList.add('img-fluid'); // Bootstrap class for responsiveness
        headerElem.style.maxWidth = '40%'; // Ensures the image does not overflow
        headerElem.style.display = 'block'; // Prevents inline spacing issues
        headerElem.style.margin = '10px auto'; // Centers the image horizontally
        headerElem.src = item.header; // Assuming item.header contains the image URL
        headerElem.alt = 'Header Image'; // Alternative text for accessibility
        questionCard.appendChild(headerElem);
    }

    // Display the question
    const questionTitle = document.createElement('h5');
    questionTitle.textContent = `س${currentQuestionIndex + 1}: ${item.question}`;
    questionCard.appendChild(questionTitle);
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('d-flex', 'flex-wrap', 'gap-3'); // Bootstrap styling
/***********article***************/
    // Display input field if no multiple-choice options exist
    if (item.optionstype === "article"){
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.classList.add('form-control');
        inputField.placeholder = 'اكتب إجابتك هنا...';
        inputField.id = 'answer-input';
            // Restore previous answer if available
            if (userAnswers[currentQuestionIndex]) {
                inputField.value = userAnswers[currentQuestionIndex];
            }
        inputField.addEventListener("input", () => saveUserAnswer(currentQuestionIndex));
        questionCard.appendChild(inputField);
    } 
/**********img****************/
    if (item.optionstype === 'img' && item.optionssrc) {
            item.optionssrc.forEach((imageSrc) => {
                const imgOption = document.createElement('img');
                imgOption.src = imageSrc; // Use item.optionssrc instead of item.options
                imgOption.classList.add('option-image', 'img-thumbnail', 'p-2', 'd-block', 'mb-2');
                imgOption.style.maxWidth = '20%'; // Ensures the image does not overflow
                imgOption.style.cursor = 'pointer';
        
                if (userAnswers[currentQuestionIndex] === imageSrc) {
                    imgOption.classList.add('selected'); // Add highlight class if previously selected
                }
        
                // Click event to handle selection
                imgOption.onclick = (event) => {
                    // Remove 'selected' class from all images
                    document.querySelectorAll('.option-image').forEach(img => {
                        img.classList.remove('selected');
                    });
        
                    // Add 'selected' class to the clicked image
                    imgOption.classList.add('selected');
        
                    // Save the selected answer
                    handleAnswerSelection(imgOption, imageSrc, event);
                };
                optionsContainer.appendChild(imgOption);
            });

            questionCard.appendChild(optionsContainer);
        }
/***********vol***************/
    if (item.optionstype === 'vol' && item.optionssrc) 
        {
            item.optionssrc.forEach((audioSrc) => {
                const audioWrapper = document.createElement('div');
                audioWrapper.classList.add('audio-option', 'p-2', 'd-flex', 'align-items-center');
        
                const audioPlayer = document.createElement('audio');
                audioPlayer.controls = true;
                audioPlayer.src = audioSrc;
                audioPlayer.style.marginRight = "10px";
        
                // Stop the previous audio when a new one is played
                audioPlayer.addEventListener("play", () => {
                    if (currentAudio && currentAudio !== audioPlayer) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0; // Reset audio to start
                    }
                    currentAudio = audioPlayer;
                });
                const selectButton = document.createElement('button');
                selectButton.classList.add('btn', 'btn-primary', 'btn-sm');
                selectButton.textContent = "اختر";
        
                selectButton.onclick = (event) => handleAnswerSelection(selectButton, audioSrc, event);
        
                // Highlight if user already selected this option
                if (userAnswers[currentQuestionIndex] === audioSrc) {
                    selectButton.classList.add('selected');
                }
                audioWrapper.appendChild(audioPlayer);
                audioWrapper.appendChild(selectButton);
                optionsContainer.appendChild(audioWrapper);}
            );
            questionCard.appendChild(optionsContainer);
        }
/***********choose***************/
    if (item.optionstype === "choose") 
            {
                console.log(1);
            // Display text answer links
            item.options.forEach((option) => {
                const optionLink = document.createElement('a');
                optionLink.href = "#"; // Prevents page navigation
                optionLink.classList.add('option-link', 'text-center', 'fw-bold', 'w-100', 'p-2', 'd-block', 'mb-2');
                optionLink.textContent = option;
                optionLink.onclick = (event) => handleAnswerSelection(optionLink, option, event);
            
                // Highlight if user already selected this option
                if (userAnswers[currentQuestionIndex] === option) {
                    optionLink.classList.add('selected');
                }
                optionsContainer.appendChild(optionLink);
            });            
        questionCard.appendChild(optionsContainer);
    }

    quizContainer.appendChild(questionCard);
}
/**********************************************************************************************************************/
// Handle answer selection and save the answer
function handleAnswerSelection(element, selectedOption, event) 
{
    if (event) event.preventDefault(); // Prevent default anchor behavior
    // Remove 'active' styling from all options
    document.querySelectorAll('#quiz-container a').forEach(a => {
        a.classList.remove('selected', 'correct-answer', 'wrong-answer');
        a.innerHTML = a.textContent; // Reset content to avoid duplicate icons
    });
    // Apply 'active' styling to the selected option
    element.classList.add('selected');
    // Store selected answer
    userAnswers[currentQuestionIndex] = selectedOption;

    if (questionStartTime) {
        let questionEndTime = Date.now();
        userAnswersDuration[currentQuestionIndex] = Math.floor((questionEndTime - questionStartTime) / 1000);
    }
    updateQuestionButtonStyle(currentQuestionIndex);
/*/////////////////// immadiitlay fedback////////////////////////*/
    const item = question_item[currentQuestionIndex];
    const feedbackContainer = document.createElement('div');
    feedbackContainer.classList.add('feedback', 'alert', 'mt-2');
    
    // Center the feedback message
    feedbackContainer.style.position = 'fixed';
    feedbackContainer.style.top = '50%';
    feedbackContainer.style.left = '50%';
    feedbackContainer.style.transform = 'translate(-50%, -50%)';
    feedbackContainer.style.zIndex = '1000'; // Ensure it appears above other elements
    feedbackContainer.style.padding = '15px';
    feedbackContainer.style.fontSize = '18px';
    feedbackContainer.style.textAlign = 'center';
    feedbackContainer.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    feedbackContainer.style.borderRadius = '8px';
    
    if (selectedOption === item.answer) {
        stateAnswers.correct++;
        element.classList.add('correct-answer');
        element.innerHTML += ' <span class="icon check-icon">✔</span>';
        feedbackContainer.textContent = "صحيح! ";
        feedbackContainer.classList.add('alert-success');
        counttry[currentQuestionIndex] = stateAnswers.wrong++;
        stateAnswers.wrong = 0;
    } else {
        stateAnswers.wrong++;
        element.classList.add('wrong-answer');
        element.innerHTML += ' <span class="icon cross-icon">✘</span>';
        feedbackContainer.textContent = "خطأ! " + item.feedback;
        feedbackContainer.classList.add('alert-danger');
    
        const correctOption = [...document.querySelectorAll('#quiz-container a')]
            .find(a => a.textContent.trim() === item.answer.trim());
        if (correctOption) {
            correctOption.classList.add('correct-answer');
            correctOption.innerHTML += ' <span class="icon check-icon">✔</span>';
        }
    }
    
    // Append to body to ensure proper positioning
    document.body.appendChild(feedbackContainer);
    
    // Remove feedback after 1 second
    setTimeout(() => {
        feedbackContainer.remove();
    }, 1000);
    
    // Append feedback below the selected answer
    element.parentElement.appendChild(feedbackContainer);
}
/**********************************************************************************************************************/
// Show modal content (Image, Video, Audio, Text)
function showQuestionInfo(infoUrl) {
    const modalBody = document.querySelector("#infoModal .modal-body");
    if (modaltest === "img") {
        modalBody.innerHTML = `<img id="modalImage" src="${infoUrl}" alt="صورة السؤال" class="img-fluid">`;
    } else if (modaltest === "vid") {
        modalBody.innerHTML = `
            <video id="modalVideo" controls class="w-100">
                <source src="${infoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
    } else if (modaltest === "vol") {
        modalBody.innerHTML = `
            <audio id="modalAudio" controls class="w-100">
                <source src="${infoUrl}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>`;
    } else if (modaltest === "text") {
        modalBody.innerHTML = `<p class="w-100">${infoUrl}</p>`;
    }

    const modal = new bootstrap.Modal(document.getElementById('infoModal'));
    modal.show();
}

  /**********************************************************************************************************************/
// Create question navigation buttons inside the modal
function createQuestionButtons() {
    const container = document.getElementById('question-buttons-container');
    container.innerHTML = '';
    for (let i = 0; i < question_item.length; i++) {
        const btn = document.createElement('button');
        btn.textContent = `س${i + 1}`;
        btn.classList.add('question-btn');
        modalbuutons.push(btn);
        btn.onclick = () => {
            currentQuestionIndex = i;
            pre_fun(currentQuestionIndex,"out");
            nxt_fun(currentQuestionIndex,"out");
            const modalElement = document.getElementById('questions-modal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get existing instance
            if (modalInstance) {
                modalInstance.hide();  // Hide the modal
            }
        };
        container.appendChild(btn);
    }
}
/**********************************************************************************************************************/
function updateQuestionButtonStyle(index) {
    for (let i = 0; i <= index; i++) { 
        if (modalbuutons[i] && userAnswers[i]) { // Check if the question has an answer
            modalbuutons[i].classList.add("answered"); // Mark as answered
        }
    }
}
/**********************************************************************************************************************/
// Handle modal opening and closing for questions
const modal_question = document.getElementById('open-questions-modal');
modal_question.addEventListener('click', openModal);
function openModal() {
    const modalElement = document.getElementById('questions-modal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error("Element with ID 'questions-modal' not found.");
    }
}
/**********************************************************************************************************************/
// Save user answers for text input questions
export { displayQuestion,updateQuestionButtonStyle,userAnswers,userAnswersDuration,questionStartTime,stateAnswers,counttry};


