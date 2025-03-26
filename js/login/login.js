import { db, auth } from "../firebase.js";
import { storeUserSession} from "../persistent.js";

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
document.getElementById("enter-btn").addEventListener("click", loginUser);

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
            console.log("Login successful for user:", userId);
            // Store the session in Firestore
            await storeUserSession(userId);
            console.log("Session stored. Redirecting...");
            const usergroup = await db.collection(databasename).doc(userId).get();

            if (usergroup.exists) {
                const userg = usergroup.data();
                let userpage = Number(userg.group); // Ensure it's a number
            
                console.log("User group value:", userpage, typeof userpage);
            
                switch (userpage) {
                    case 118: window.location.href = masterpage; break;
                    case 1: window.location.href = groupone; break;
                    case 2: window.location.href = grouptwo; break;
                    case 3: window.location.href = groupyhree; break;
                    case 4: window.location.href = groupfour; break;
                    default: console.error("Invalid group:", userpage); break;
                }
            }
        
        } else {
            alert("اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}
/****************************************************************************************************************/

document.getElementById("savebtn").addEventListener("click", savebtn);
function savebtn() {
  saveUser() ;
}

function saveUser() {
  const docId = document.getElementById("editUserId").value;
  const name = document.getElementById("editUserName").value;
  const email = document.getElementById("editUserEmail").value;
  const user = document.getElementById("editUserUsername").value;
  const group = document.getElementById("editUserGroup").value;
  const password = document.getElementById("editUserPassword").value;

  if (name && email && user && group) {
    let modalElement = document.getElementById("editUserModal");
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide(); //Close modal first

    setTimeout(() => { //Delay alert slightly to prevent conflicts
      if (docId) {
        db.collection(databasename).doc(docId).update({
          name,
          email,
          user,
          group,
          ...(password && { password }),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          alert("تم تحديث البيانات بنجاح!");
          learneradmin();
        });
      } else {
        db.collection(databasename).add({
          name,
          email,
          user,
          group,
          password,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          alert("تمت إضافة المستخدم بنجاح!");
          learneradmin();
        });
      }
    }, 300); //Delay the alert after modal hides
  } else {
    alert("يرجى إدخال جميع البيانات المطلوبة!");
  }
}
