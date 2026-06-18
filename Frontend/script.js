// this event listener allows the user to use the tab button

const textarea = document.getElementById('code-editor');

textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();

        const start = this.selectionStart;
        const end = this.selectionEnd; 

        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

        this.selectionStart = this.selectionEnd = start + 1; 
    }
}); 


// this gets the code the user submits in the input area
function getCode(){
    const textarea = document.getElementById('code-editor');

    const codeResult = textarea.value;
    return codeResult;
}
// this gets the language the user selects in the dropdown 
function getLanguage() {
    const select = document.getElementById('language');

    const languageResult = select.value;
    return languageResult;
}
// this function runs the code by calling the post method via fetch and displays the output
async function runCode() {
    document.getElementById('output').innerText = 'Running...';
    try {
        const response = await fetch("http://localhost:8000/api/v1/evaluator/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: getCode(), language: getLanguage() })
        });
        const data = await response.json();
        document.getElementById('output').innerText = 
            data.output + (data.error ? '\nError: ' + data.error : '');
        await displayRuns();
    } catch (error) {
        document.getElementById('output').innerText = 'Error: Could not connect to server. Is FastAPI running?';
    }
}
// this is the delete function which calls the delete endpoint via specific id via fetch 
async function deleteRun(id) {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/evaluator/${id}`, {
            method: "DELETE",
        });
        await displayRuns();
    } catch (error) {
        document.getElementById('output').innerText = "Error: Could not connect to server. Is FastAPI running?";
    }
    
}
// this updates the run and gives it a label via put endpoint through fetch 
async function updateRun(id) {
    const label = document.getElementById(`label-${id}`).value;
    try {
        const response = await fetch(`http://localhost:8000/api/v1/evaluator/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({label: label})
        });
        const data = await response.json();
        await displayRuns();
    } catch (error) {
        document.getElementById('output').innerText = "Error: Could not connect to server. Is FastAPI running?";
    }
}
// toggles the favorite button via put endpoint via fetch 
async function toggleFavorite(id, currentState) {
    try { 
        await fetch(`http://localhost:8000/api/v1/evaluator/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({favorited: !currentState }) 
        });
        await displayRuns();
    } catch (error) {
        document.getElementById('output').innerText="Error: could not connect to server. Is FastAPI running?";
    }

}
// uses the get method to get all the runs ever recorded
async function getHistory() {
    try {
        const response = await fetch("http://localhost:8000/api/v1/evaluator");
        const data = await response.json();
        console.log(data); // add this
        return data;
    } catch (error) {
        document.getElementById("output").innerText = "Error: could not connect to server. Is FastAPI running?";
    }
}
// displays all the runs in the history through innerHTML formatting and adds the update run
// label input favorite button and delete button 
async function displayRuns() {
    const runs = await getHistory();
    const container = document.getElementById("container");
    container.innerHTML = "";
    for (const run of runs) {
        const runDiv = document.createElement('div');
        runDiv.className = 'run-card';
        runDiv.innerHTML = `
            <p>ID: ${run.id}</p>
            <p>Language: ${run.language}</p>
            <p>Output: ${run.output}</p>
            <p>Label: ${run.label || 'No label'}</p>
            <input type="text" id="label-${run.id}" placeholder="Add label...">
            <button onclick="updateRun('${run.id}')" class="custom-button" type="button">Save Label</button>
            <button onclick="toggleFavorite('${run.id}', ${run.favorited})"class="custom-button" type="button">
                ${run.favorited ? '⭐' : '☆'} 
            </button>
            <button onclick="deleteRun('${run.id}')"class="custom-button" type="button">Delete</button>
        `;
        container.appendChild(runDiv);
    }
    
}


displayRuns();327 