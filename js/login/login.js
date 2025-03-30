import { db, auth } from "../firebase.js";

const databasename = "usersid";
const takeoffpage = "./content.html";
const landpage = "./test.html";
const groupone = "./test.html";
const grouptwo = "./test.html";
const groupyhree = "./test.html";
const groupfour = "./test.html";
const masterpage = "./result.html";

//window.onload = checkUserSession;
/****************************************************************************************************************/
document.getElementById("form-title").innerText = "تسجيل الدخول"; // Change title
/****************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("enter-btn").addEventListener("click", loginUser);
    document.getElementById("savebtn").addEventListener("click", savebtn);
});


async function checkUserQuizAttempt(userId) {
    if (!userId) throw new Error("User ID not found.");

    const quizResultRef = db.collection("post_test").doc(userId); // Ensure we're checking "post_test"

    try {
        const docSnapshot = await quizResultRef.get(); // Fetch document
        
        if (docSnapshot.exists) {
            const data = docSnapshot.data(); // Get document data

            // Ensure "quizResults" field exists and is not empty
            if (data?.quizResults) { 
                alert("لقد قمت بالإجابة على الاختبار مسبقاً ولا يمكنك المحاولة مرة أخرى."); // Replace displayQuizResult with alert()
                return { exists: true, userId, quizResultRef }; // Stop login process
            }
        }

        return { exists: false, quizResultRef, userId }; // User hasn't taken the quiz

    } catch (error) {  
        alert("حدث خطأ أثناء التحقق من المحاولة السابقة: " + error.message); // Replace displayQuizResult with alert()
        return { exists: true, userId, quizResultRef }; // Return reference in case of an error
    }
}

async function loginUser() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("يرجى إدخال اسم المستخدم وكلمة المرور");
        return;
    }

    try {
        const snapshot = await db.collection(databasename)
            .where("user", "==", username)
            .where("password", "==", password)
            .get();

        if (!snapshot.empty) {
            const userDoc = snapshot.docs[0]; // Get the first matching user
            const userId = userDoc.id;
            const userData = userDoc.data();
            const userName = userData.name; 

            console.log("✅ User ID retrieved:", userId, "| Name:", userName);

            // 🔹 Check if the user has already taken the quiz
            const quizCheck = await checkUserQuizAttempt(userId);
            if (quizCheck.exists) {
                return; // Stop execution if the user has taken the quiz
            }

            // Store user ID in sessionStorage for later use
            sessionStorage.setItem("loggedInUserId", userId);

            const usergroup = await db.collection(databasename).doc(userId).get();

            if (usergroup.exists) {
                const userg = usergroup.data();
                let userpage = Number(userg.group);

                console.log("📌 User group value:", userpage, typeof userpage);

                switch (userpage) {
                    case 118: window.location.href = masterpage; break;
                    case 1: window.location.href = groupone; break;
                    case 2: window.location.href = grouptwo; break;
                    case 3: window.location.href = groupyhree; break;
                    case 4: window.location.href = groupfour; break;
                    default: console.error("❌ Invalid group:", userpage); break;
                }
            }
        } else {
            alert("اسم المستخدم أو كلمة المرور غير صحيحة");
        }

    } catch (error) {
        console.error("🔥 Error logging in:", error);
    }
}
/****************************************************************************************************************/

function savebtn() {
  saveUser() ;
}

async function saveUser() {
    const name = document.getElementById("editUserName").value;
    const email = document.getElementById("editUserEmail").value;
    const user = document.getElementById("editUserUsername").value;
    const group = document.getElementById("editUserGroup").value;
    const password = document.getElementById("editUserPassword").value;

    if (!name || !email || !user || !group || !password) {
        alert("يرجى إدخال جميع البيانات المطلوبة!");
        return;
    }

    try {
        // Check if username or email already exists in Firestore
        const existingUsers = await db.collection(databasename).where("user", "==", user).get();
        const existingEmails = await db.collection(databasename).where("email", "==", email).get();

        if (!existingUsers.empty || !existingEmails.empty) {
            alert("اسم المستخدم أو البريد الإلكتروني مسجل بالفعل!");
            return;
        }

        // Close the modal if open
        let modalElement = document.getElementById("editUserModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide(); 

        setTimeout(async () => {
            // Add new user to Firestore
            const newUserRef = await db.collection(databasename).add({
                name,
                email,
                user,
                group,
                password,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            const userId = newUserRef.id; // Get the new user's ID
            console.log("✅ User added successfully with ID:", userId);

            // Store the user ID in sessionStorage
            sessionStorage.setItem("loggedInUserId", userId);

            console.log("🔹 New user session stored. Redirecting...");

            // Retrieve the user group and redirect accordingly
            const usergroup = await db.collection(databasename).doc(userId).get();
            if (usergroup.exists) {
                const userg = usergroup.data();
                let userpage = Number(userg.group); 

                console.log("📌 User group value:", userpage, typeof userpage);

                switch (userpage) {
                    case 118: window.location.href = masterpage; break;
                    case 1: window.location.href = groupone; break;
                    case 2: window.location.href = grouptwo; break;
                    case 3: window.location.href = groupyhree; break;
                    case 4: window.location.href = groupfour; break;
                    default: console.error("❌ Invalid group:", userpage); break;
                }
            }
        }, 300); // Allow modal to close before redirecting

    } catch (error) {
        console.error("❌ Error adding user:", error);
        alert("حدث خطأ أثناء إضافة المستخدم، يرجى المحاولة مرة أخرى!");
    }
}
