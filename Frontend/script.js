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
// also adds the version the user selected to the status bar
function getLanguage() {
    const select = document.getElementById('language');

    const languageResult = select.value;
    document.getElementById('language-status').innerText = languageResult;
    return languageResult;
}
// this function runs the code by calling the post method via fetch and displays the output
// also calls the editor pulse and spin animations 
async function runCode() {
    const btn = document.getElementById('run');
    document.querySelector('.editor').classList.add('editor-pulsing');
    btn.classList.add('loading');
    btn.disabled = true;
    
    document.getElementById('output-status').innerText = 'Running...';
    document.getElementById('output-dot').style.background = '#0070f3';
    
    const placeholder = document.getElementById('output-placeholder');
    const result = document.getElementById('output-result');
    const stdout = document.getElementById('stdout');
    const stderr = document.getElementById('stderr');

    try {
        const response = await fetch("http://localhost:8000/api/v1/evaluator/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: getCode(), language: getLanguage() })
        });
        const data = await response.json();
        placeholder.style.display = 'none';
        result.style.display = 'block';
        result.classList.remove('output-visible');
        result.offsetHeight;
        result.classList.add('output-visible');
        stdout.innerText = data.output || '';
        stderr.innerText = data.error ? 'Error: ' + data.error : '';
        document.getElementById('output-status').innerText = 'Done';
        document.getElementById('output-dot').style.background = '#c3e88d';
        await displayRuns();
    } catch (error) {
        placeholder.style.display = 'none';
        result.style.display = 'block';
        stdout.innerText = '';
        stderr.innerText = 'Error: Could not connect to server. Is FastAPI running?';
        document.getElementById('output-status').innerText = 'Error';
        document.getElementById('output-dot').style.background = '#f07178';
    } finally {
        btn.classList.remove('loading'); // ← always runs, success or error
        btn.disabled = false;
        document.querySelector('.editor').classList.remove('editor-pulsing');
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
// activiates the clearall button to clear the entire history 
async function clearHistory() {
    const runs = await getHistory();
    for (const run of runs) {
        await fetch(`http://localhost:8000/api/v1/evaluator/${run.id}`, {
            method: "DELETE"
        });
    }
    await displayRuns();
}
// displays all the runs in the history through innerHTML formatting and adds the update run
// label input favorite button and delete button 

async function displayRuns() {
    const runs = await getHistory();
    const container = document.getElementById("history"); // ← was "history"
    container.innerHTML = "";
    for (const run of runs) {
        const runDiv = document.createElement('div');
        runDiv.className = 'run-card';
        runDiv.innerHTML = `
            <div class="run-card-header">
                <span class="run-lang-badge">${run.language}</span>
                <div class="run-card-actions">
                    <button onclick="toggleFavorite('${run.id}', ${run.favorited})" class="icon-btn ${run.favorited ? 'star' : ''}" type="button">
                        ${run.favorited ? '⭐' : '☆'}
                    </button>
                    <button onclick="deleteRun('${run.id}')" class="icon-btn danger" type="button">✕</button>
                </div>
            </div>
            <div class="run-output-preview ${run.error ? 'error' : 'success'}"
                onclick="this.classList.toggle('expanded')">
                ${run.output || run.error || 'No output'}
            </div>
            <p style="font-size:11px; color:#444; margin-bottom:8px;">
                Label: ${run.label || 'No label'}
            </p>
            <div class="run-label-row">
                <input type="text" id="label-${run.id}" class="run-label-input" placeholder="Add label...">
                <button onclick="updateRun('${run.id}')" class="save-label-btn" type="button">Save</button>
            </div>
            <div class="run-id">${run.id}</div>
        `;
        container.appendChild(runDiv);
    }
}

window.addEventListener('load', () => {
    const editor = document.querySelector('.editor');
    setTimeout(() => {
        editor.classList.add('editor-pulsing');
        setTimeout(() => {
            editor.classList.remove('editor-pulsing');
        }, 1500); 
    }, 500); 
});

displayRuns();