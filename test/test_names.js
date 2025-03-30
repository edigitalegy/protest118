import { db } from "../js/firebase.js";
import { quizData } from "./data_questions.js";

/**********************************************************************************************************************/
// Step 1: Store quizData in a separate array
let test_array = [];
console.log(window.name); // This should output "name"

const test_base = {
    test_questions: [],
    databasename: "post_test"
};

const pageName = window.name;
switch (pageName) {
    case "post_test": test_base.databasename = pageName; test_array = [...quizData]; break;
    case "pre_test": test_base.databasename = pageName; test_array = [...quizData]; break;
}

/**********************************************************************************************************************/
// Step 2: Get userId from Firestore
async function getUserId() {
    try {
        const userId = sessionStorage.getItem("loggedInUserId"); // Retrieve from sessionStorage
        if (!userId) throw new Error("User ID not found in sessionStorage.");

        const userDoc = await db.collection("usersid").doc(userId).get();
        if (!userDoc.exists) throw new Error("User document not found.");

        const userData = userDoc.data();
        const userName = userData.name || "Unknown";

        console.log("✅ User ID retrieved from sessionStorage:", userId, "| Name:", userName);
        return userId;
    } catch (error) {
        console.error("❌ Error getting user ID:", error);
        return null;
    }
}

/**********************************************************************************************************************/
// Step 3: Shuffle answers within each question
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
// Step 4: Shuffle the questions
function shuffleQuestions() {
    test_base.test_questions.sort(() => Math.random() - 0.5);
}

/**********************************************************************************************************************/
// Step 5: Store shuffled questions in Firestore
async function storeShuffledQuestions(userId) {
    try {
        const userTestRef = db.collection(test_base.databasename).doc(userId);
        await userTestRef.set({ questions: test_base.test_questions });
        console.log("✅ Questions successfully stored in Firestore!");
    } catch (error) {
        console.error("❌ Error storing questions:", error);
    }
}

/**********************************************************************************************************************/
// Step 6: Check if questions exist in Firestore; if not, shuffle and store them
async function initializeTestQuestions() {
    try {
        const userId = await getUserId();
        if (!userId) throw new Error("User ID not found.");

        const userTestRef = db.collection(test_base.databasename).doc(userId);
        const doc = await userTestRef.get();

        if (doc.exists) {
            test_base.test_questions = [...quizData]; // Load from Firestore (if needed)
            console.log("✅ Loaded questions from Firestore.");
        } else {
            test_base.test_questions = [...quizData];
            // shuffleQuestionAnswers();
            // shuffleQuestions();
            await storeShuffledQuestions(userId);
        }

        return { userId, testQuestions: test_base.test_questions };
    } catch (error) {
        console.error("❌ Error initializing questions:", error);
        return null;
    }
}

/**********************************************************************************************************************/
// Run initialization
await initializeTestQuestions();

/**********************************************************************************************************************/
// Export processed test_questions
export { test_base, getUserId };
