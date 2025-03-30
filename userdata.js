import { db, auth } from "./js/firebase.js";
import { storeUserSession} from "./js/persistent.js";

const databasename = "usersid";
const takeoffpage = "./content.html";
const landpage = "./login.html";

const usersnumber =151;
//window.onload = checkUserSession;
//******************************************************************************************************/
// Function to load users and display them in a table
function learneradmin() {
  const learnerdata = document.getElementById("learnerdata");

  db.collection(databasename).orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        learnerdata.innerHTML = "<p class='text-center'>لا توجد نتائج للمقال لعرضها.</p>";
        return;
      }

      let tableHTML = `
        <table class="table table-bordered table-striped">
          <thead class="table-light">
            <tr>
              <th>العدد</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>اسم المستخدم</th>
              <th>المجموعة</th>  
              <th>كلمة المرور</th>
              <th>التاريخ والوقت</th>
              <th>إجراء</th>  
            </tr>
          </thead>
          <tbody>
      `;

      let index = 1;

      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleString("ar-EG") : "غير متاح";

        // Encode data to prevent JavaScript errors
        const name = encodeURIComponent(data.name || "غير متوفر");
        const email = encodeURIComponent(data.email || "غير متوفر");
        const user = encodeURIComponent(data.user || "غير متوفر");
        const group = encodeURIComponent(data.group || "غير متوفر"); // Added Group
        const password = encodeURIComponent(data.password || "");

        tableHTML += `
        <tr id="row-${docId}">
          <td>${index}</td>  
          <td>${data.name || "غير متوفر"}</td>
          <td>${data.email || "غير متوفر"}</td>
          <td>${data.user || "غير متوفر"}</td>
          <td>${data.group || "غير متوفر"}</td>  
          <td>${data.password || "غير متوفر"}</td>
          <td>${createdAt}</td>
          <td class="d-flex flex-column gap-2"> 
            <button class="btn btn-warning btn-sm w-100" 
              onclick="openEditUserModal('${docId}', decodeURIComponent('${name}'), decodeURIComponent('${email}'), decodeURIComponent('${user}'), decodeURIComponent('${group}'), decodeURIComponent('${password}'))">
              <i class="bi bi-pencil-square"></i> تعديل
            </button>
            <button class="btn btn-danger btn-sm w-100" onclick="deleteUser('${docId}')">
              <i class="bi bi-trash"></i> حذف
            </button>
          </td>
        </tr>
      `;
              index++;
      });

      tableHTML += "</tbody></table>";
      learnerdata.innerHTML = tableHTML;
    })
    .catch(error => {
      learnerdata.innerHTML = `<p class="text-danger text-center">حدث خطأ أثناء تحميل النتائج: ${error.message}</p>`;
    });
}


document.getElementById("searchBtn").addEventListener("click", searchUser);
// Function to search for a user and highlight rows
function searchUser() {
    const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
    const searchWarning = document.getElementById("searchWarning");
    const table = document.querySelector("#learnerdata table");

    // If no table is found
    if (!table) {
      console.warn("No table found in #learnerdata");
      searchWarning.classList.remove("d-none"); // Show warning
      searchWarning.textContent = "لا توجد بيانات للبحث.";
      return;
    }
    const rows = table.querySelectorAll("tbody tr");
    const columnCount = table.querySelector("thead tr").children.length;
    let matchFound = false;
    rows.forEach(row => {
      const nameCell = row.cells[1];
      const nameText = nameCell.textContent.trim().toLowerCase();

      if (nameText.includes(searchValue) && searchValue !== "") {
        matchFound = true;
        for (let i = 0; i < columnCount; i++) {
          row.cells[i].style.backgroundColor = "yellow";
        }
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        for (let i = 0; i < columnCount; i++) {
          row.cells[i].style.backgroundColor = "";
        }
      }
    });

    // Show or hide the warning message
    if (!matchFound) {
      searchWarning.classList.remove("d-none");
    } else {
      searchWarning.classList.add("d-none");
    }
}


// Function to add or edit user data in Firestore
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

// Function to delete a user
function deleteUser(docId) {
  setTimeout(() => { //Delay confirm dialog to prevent modal conflict
    if (confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) {
      db.collection(databasename).doc(docId)
        .delete()
        .then(() => {
          setTimeout(() => alert("تم حذف المستخدم بنجاح!"), 300); //Delay alert
          document.getElementById(`row-${docId}`).remove();
        })
        .catch(error => {
          setTimeout(() => alert("حدث خطأ أثناء الحذف: " + error.message), 300); //Delay alert
        });
    }
  }, 300); //Prevent multiple modals from opening at once
}


// Function to open edit modal and fill user data
function openEditUserModal(docId, name, email, user, group, password) {
  document.getElementById("editUserId").value = docId;
  document.getElementById("editUserName").value = name;
  document.getElementById("editUserEmail").value = email;
  document.getElementById("editUserUsername").value = user;
  document.getElementById("editUserGroup").value = group;
  document.getElementById("editUserPassword").value = password;

  let editUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));
  editUserModal.show();
}


document.getElementById("openAddUserBtn").addEventListener("click", function () {
  db.collection(databasename).get().then(snapshot => {
    if (snapshot.size >= usersnumber) {
      alert("تم الوصول إلى الحد الأقصى لعدد المستخدمين، لا يمكن إضافة المزيد.");
      return;
    }
    let addUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));
    addUserModal.show();
    }).catch(error => {
    alert("حدث خطأ أثناء التحقق من عدد المستخدمين: " + error.message);
  });
});


document.getElementById("savebtn").addEventListener("click", savebtn);
function savebtn() {
  saveUser() ;
}

window.openEditUserModal = openEditUserModal;
window.deleteUser = deleteUser;
//Load users when the page loads
window.onload = learneradmin;
