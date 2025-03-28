import { db } from "../js/firebase.js";
import { test_base, getUserId } from "./test_names.js";

async function loadProgress() {
    try {
        const userId = await getUserId(); // Get user ID
        if (!userId) throw new Error("User ID not found.");

        const quizResultRef = db.collection(test_base.databasename).doc(userId); // Reference to user document
        const doc = await quizResultRef.get();

        if (!doc.exists) {
            console.log("No saved progress found.");
            return null;
        }

        const data = doc.data();
        const quizProgress = data.quizProgress || [];

        // Initialize stored values
        let loadanswers = {}; 
        let loadanswersDuration = {}; 
        let durations = [];
        let index = [];
        let total = 0;

        quizProgress.forEach(item => {
            if (item.index !== undefined) {
                loadanswers[item.index] = item.answers;
                loadanswersDuration[item.index] = item.durations;
                durations.push(item.durations);
                index.push(item.index);
            }
            if (item.Totalquestions !== undefined) {
                total = item.Totalquestions;
            }
        });

        console.log("تم تحميل البيانات بنجاح!");

        // Return the extracted data
        return { loadanswers, loadanswersDuration, durations, index, total };

    } catch (error) {
        console.log("حدث خطأ أثناء تحميل التقدم: " + error.message);
        return null;
    }
}

// Export the function so other modules can use it
export async function getLoadedData() {
    const loadedData = await loadProgress();
    return loadedData; // Returns the loaded JSON data
}

// Optional: Auto-display data in the console when this module is loaded
/*
getLoadedData().then(data => {
    if (data) {
        console.log("Exported Loaded Data:", JSON.stringify(data, null, 2));
    }
});
*/
