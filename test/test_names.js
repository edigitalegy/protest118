import { db } from "../js/firebase.js";
import { checkIfUserLoggedIn } from "../js/persistent.js";
import { quizData } from "./data_questions.js";
/**********************************************************************************************************************/
// Step 1: Store quizData in a separate array
let test_array=[];
console.log(window.name); // This should output "name"

const test_base = {
    test_questions: [],
    databasename: ""
};

const pageName = window.name;
switch (pageName) {
    case "post_test": test_base.databasename=pageName;test_array=[...quizData]; break;
    case "pre_test": test_base.databasename=pageName; test_array=[...quizData]; break;
}
/**********************************************************************************************************************/
// Step 2: get userId
async function getUserId() {
    try {
        const userId = await checkIfUserLoggedIn(); // Get user ID
        if (!userId) throw new Error("User ID not found.");
        return userId;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}
/**********************************************************************************************************************/
// Step 3: Function to shuffle answers within each question
function shuffleQuestionAnswers() {
    test_base.test_questions = test_base.test_questions.map((question) => {
        if (question.options && question.options.length > 0) {
            const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
            return { ...question, options: shuffledOptions };
        }
        return question;
    });
}
/**********************************************************************************************************************/
// Step 4: Function to shuffle the questions
function shuffleQuestions() {
    test_base.test_questions.sort(() => Math.random() - 0.5);
}
/**********************************************************************************************************************/
// Step 5: Store shuffled questions in Firestore
async function storeShuffledQuestions(userId) {
    try {
        const userTestRef = db.collection(test_base.databasename).doc(userId);
        await userTestRef.set({ questions: test_base.test_questions });
        console.log("Questions successfully stored in Firestore!");
    } catch (error) {
        console.error("Error storing questions:", error);
    }
}
/**********************************************************************************************************************/
// Step 6: Check if questions exist in Firestore; if not, shuffle and store them
async function initializeTestQuestions() {
    try {
        const userId = await getUserId(); // Get user ID
        if (!userId) throw new Error("User ID not found.");

        const userTestRef = db.collection(test_base.databasename).doc(userId);
        const doc = await userTestRef.get();

        if (doc.exists) {
            // If data exists in Firestore, use it directly
            test_base.test_questions = doc.data().questions;
            console.log("Loaded questions from Firestore.");
        } else {
            // If no stored data, shuffle and store new questions
            test_base.test_questions = [...test_array]; // Copy quizData
          //  shuffleQuestionAnswers(); // Shuffle answers first
          //  shuffleQuestions(); // Then shuffle questions
            await storeShuffledQuestions(userId); // Store in Firestore
        }
        
        return userId; // Return user ID
    } catch (error) {
        console.error("Error initializing questions:", error);
        return null;
    }
}
/**********************************************************************************************************************/
// Run initialization
await initializeTestQuestions();
/**********************************************************************************************************************/
// Export processed test_questions after all functions have run
export { test_base, getUserId };
