const firebaseConfig = {
  apiKey: "AIzaSyB7_D2VBx2_ozgshYN1BAbojH_9Aog5cC8",
  authDomain: "pro118-d8c9b.firebaseapp.com",
  projectId: "pro118-d8c9b",
  storageBucket: "pro118-d8c9b.firebasestorage.app",
  messagingSenderId: "89940755315",
  appId: "1:89940755315:web:548b46f1f81b7cd6a8bb06"
};
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
const auth = firebase.auth();
// Function to redirect to the home page
function goHome() {
  window.location.href = "./test.html"; // Adjust this path if needed
}
// Function to load and display all documents from the "quizResults" collection
// Initialize Firestore (Ensure Firebase is properly configured in your project)

// Initialize Firestore (Ensure Firebase is properly configured in your project)

// Initialize Firestore (Ensure Firebase is properly configured in your project)
const db = firebase.firestore();

async function loadQuizResults() {
    try {
        const postTestCollection = await db.collection("post_test").get();
        
        let table = document.createElement("table");
        table.border = "1";
        table.style.width = "100%";
        table.style.textAlign = "center";

        let thead = document.createElement("thead");
        let headerRow = document.createElement("tr");
        let headers = ["Name", "Total Time", "Total Tries", "Details"];

        headers.forEach(headerText => {
            let th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        let tbody = document.createElement("tbody");
        let quizResultsArray = []; // Store results for CSV export

        postTestCollection.forEach(doc => {
            let data = doc.data();
            if (data.quizResults) {
                let result = data.quizResults;

                // Calculate total time and total tries
                let totalTime = 0;
                let totalTries = 0;
                
                if (result.responses) {
                    result.responses.forEach(response => {
                        totalTime += response.duration || 0;
                        totalTries += response.tries || 0;
                    });
                }

                let row = document.createElement("tr");

                let nameCell = document.createElement("td");
                nameCell.textContent = result.name || "غير متوفر";

                let totalTimeCell = document.createElement("td");
                totalTimeCell.textContent = `${totalTime} sec`;

                let totalTriesCell = document.createElement("td");
                totalTriesCell.textContent = totalTries;

                let detailsCell = document.createElement("td");
                let button = document.createElement("button");
                button.textContent = "View";
                button.onclick = () => viewResponses(result, totalTime, totalTries);
                detailsCell.appendChild(button);

                row.appendChild(nameCell);
                row.appendChild(totalTimeCell);
                row.appendChild(totalTriesCell);
                row.appendChild(detailsCell);

                tbody.appendChild(row);

                // Store data for CSV export (only Name, Total Time, Total Tries)
                quizResultsArray.push({
                    name: result.name || "غير متوفر",
                    totalTime: totalTime,
                    totalTries: totalTries
                });
            }
        });

        table.appendChild(tbody);

        let container = document.getElementById("tableContainer");
        container.innerHTML = "";
        container.appendChild(table);

        // Add Export Button (ALL Users)
        let exportBtn = document.createElement("button");
        exportBtn.textContent = "Export All Users to CSV";
        exportBtn.onclick = () => exportAllUsersToCSV(quizResultsArray);
        container.appendChild(exportBtn);

    } catch (error) {
        console.error("Error loading quiz results:", error);
    }
}

// Function to show responses in a modal instead of alert
function viewResponses(result, totalTime, totalTries) {
    let modalContent = document.getElementById("modalContent");
    if (!modalContent) {
        console.error("Error: modalContent not found in the DOM!");
        return;
    }
    modalContent.innerHTML = "";

    let responseDetails = `<p><strong>Total Time:</strong> ${totalTime} sec</p>
                           <p><strong>Total Tries:</strong> ${totalTries}</p><hr>`;

    responseDetails += result.responses.map((res, index) => 
        `<p><strong>Q${index + 1}:</strong> ${res.question}</p>
         <p>Tries: ${res.tries}</p>
         <p>Time: ${res.duration} sec</p>
         <hr>`
    ).join("");

    modalContent.innerHTML = responseDetails;

    // Show the modal
    let modal = document.getElementById("responseModal");
    modal.style.display = "block";

    // Add export button inside modal (ONLY for this user)
    let exportModalBtn = document.createElement("button");
    exportModalBtn.textContent = "Export This User to CSV";
    exportModalBtn.onclick = () => exportSingleUserToCSV(result);
    modalContent.appendChild(exportModalBtn);
}

// Function to close the modal
function closeModal() {
    document.getElementById("responseModal").style.display = "none";
}

// Function to Export ALL Users to CSV (Only Name, Total Time, Total Tries)
function exportAllUsersToCSV(data) {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    csvContent += "Name,Total Time,Total Tries\n";

    // Add rows
    data.forEach(row => {
        csvContent += `"${row.name}","${row.totalTime} sec","${row.totalTries}"\n`;
    });

    // Create a download link
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "all_users_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
}

// Function to Export a Single User's Quiz Data to CSV (Only that user)
function exportSingleUserToCSV(result) {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    csvContent += "Name,Question,Tries,Time Spent\n";

    // Add rows
    result.responses.forEach((response, index) => {
        csvContent += `"${result.name}","Q${index + 1}: ${response.question}","${response.tries}","${response.duration} sec"\n`;
    });

    // Create a download link
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quiz_result_${result.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
}

// Load quiz results when the page loads
document.addEventListener("DOMContentLoaded", loadQuizResults);
