import { db, auth } from "./firebase.js";

const databasename = "sessions";
const takeoffpage = "./content.html";
const landpage = "./test.html";
/****************************************************************************************************************/
async function storeUserSession(userId) {
    try {
        if (!userId) {
            console.error("User ID is missing. Cannot store session.");
            return;
        }

        await db.collection("sessions").doc(userId).set({
            userId: userId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log("User session stored for:", userId);
    } catch (error) {
        console.error("Error storing user session:", error);
    }
}

/**************************************************************************************/
async function getUserSession() {
    try {
        const sessionDocs = await db.collection("sessions").get();
        if (sessionDocs.empty) {
            console.warn("No active user sessions found.");
            return null;
        }

        let userId = null;
        sessionDocs.forEach((doc) => {
            userId = doc.id; // Retrieve a user session
            console.log("Active user session found:", userId);
        });

        return userId; // Return the first found user session
    } catch (error) {
        console.error("Error retrieving user session:", error);
        return null;
    }
}
/**************************************************************************************/
async function checkIfUserLoggedIn() { 
    const userId = await getUserSession(); //

    if (userId) {
        console.log("User is logged in with ID:", userId);
        return userId;
    } else {
        console.log("No user session found. Redirecting to login...");
        //window.location.href = landpage; // Redirect to login page if no session
        return null;
    }
}
// Ensure function runs after page is fully loaded
/****************************************************************************************************************/
function logoutUser() {
    db.collection(databasename)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                const sessionDoc = snapshot.docs[0]; // Get the latest session
                console.log("Deleting session:", sessionDoc.id);

                sessionDoc.ref.delete().then(() => {
                    console.log("تم تسجيل الخروج بنجاح.");
                    // Delay to ensure Firestore sync before redirecting
                    setTimeout(() => {window.location.href = landpage;}, 500); });
            } else {
                console.warn("No active session found. Cannot log out.");
            }
        })
        .catch(error => {
            console.error("خطأ أثناء تسجيل الخروج:", error);
        });
}

export {logoutUser,storeUserSession,getUserSession,checkIfUserLoggedIn};

/****************************************************************************************************************/
/*
function storeLastVisitedPage(userId, pageUrl) {
    if (!userId) {
        console.error("User ID is missing. Cannot store last visited page.");
        return Promise.reject(new Error("User ID is missing."));
    }

    return db.collection(databasename).doc(userId).update({
        lastVisitedPage: pageUrl
    })
    .then(() => {
        console.log("Last visited page stored:", pageUrl);
    })
    .catch(error => {
        console.error("Error storing last visited page:", error);
        throw error;
    });
}
/****************************************************************************************************************/
/*
function redirectUser(userId) {
    if (!userId) {
        console.error("User ID is missing. Cannot redirect user.");
        return;
    }
    const userRef = db.collection(databasename).doc(userId);
    userRef.get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const lastVisitedPage = userData.lastVisitedPage || landpage; // Default if no last page

                console.log(`Redirecting user ${userId} to:`, lastVisitedPage);
              //  window.location.href = lastVisitedPage; // Redirect user
            } else {
                console.warn("User session not found. Redirecting to default page.");
                //window.location.href = landpage; // Fallback if user data is missing
            }
        })
        .catch((error) => {
            console.error("Error retrieving last visited page:", error);
            // window.location.href = landpage; // Fallback in case of an error
        });
}
/****************************************************************************************************************/
/*
  function showLoginUI() {
    //document.getElementById('auth-container').classList.remove('d-none');
   // document.getElementById('user-info-container').classList.add('d-none');
  }
  */
  
  // Run session check on page load

  