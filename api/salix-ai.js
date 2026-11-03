// ہم اپنے پائتھون سرور سے بات کریں گے (اگر آپ نے رینڈر پر لگایا ہے تو وہ لنک یہاں ڈالیں)
const SERVER_URL = "http://127.0.0.1:5000/api/chat";

// 1. صفحہ تبدیل کرنے کا فنکشن
function openTool(toolName) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(toolName + '-page').classList.add('active');
    window.scrollTo(0, 0);
}
function goHome() {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById('home-page').classList.add('active');
    window.scrollTo(0, 0);
}

// 2. AI کے جواب کو خوبصورت بنانے کا فنکشن (ستارے اور ہیش ختم کرنے کے لیے)
function formatAIText(text) {
    if (!text) return "";
    let formatted = text;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;">$1</strong>');
    formatted = formatted.replace(/^### (.*$)/gim, '<br><strong style="color:#38bdf8; font-size:1.1em;">$1</strong><br>');
    formatted = formatted.replace(/^## (.*$)/gim, '<br><strong style="color:#38bdf8; font-size:1.2em;">$1</strong><br>');
    formatted = formatted.replace(/^# (.*$)/gim, '<br><strong style="color:#38bdf8; font-size:1.3em;">$1</strong><br>');
    formatted = formatted.replace(/^\s*[-*]\s+(.*$)/gim, '• $1');
    return formatted;
}

// 3. چیٹ بوٹ کا کوڈ
async function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const output = document.getElementById("chatOutput");
    const btn = document.getElementById("sendBtn");
    const status = document.getElementById("chatStatus");
    
    if (input.value.trim() === "") return;

    output.innerHTML += `<br><br><strong style="color:#38bdf8;">You:</strong> ${input.value}`;
    const msg = input.value;
    input.value = ""; 
    input.disabled = true; 
    btn.disabled = true; 
    status.innerText = "Thinking...";
    
    try {
        const res = await fetch(SERVER_URL, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: msg })
        });
        const data = await res.json();
        output.innerHTML += `<br><strong style="color:#10b981;">Salix AI:</strong><br>${formatAIText(data.text)}`;
        status.innerText = "Ready";
    } catch (e) { 
        output.innerHTML += "<br><strong style='color:red;'>Connection error. Is Python server running?</strong>"; 
        status.innerText = "Offline";
    }
    
    input.disabled = false; 
    btn.disabled = false; 
    input.focus();
    output.scrollTop = output.scrollHeight;
}

// 4. ڈاکومنٹ ریڈر کا کوڈ
let docBase64 = "", docMime = "";
document.getElementById('docUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        docMime = file.type;
        const reader = new FileReader();
        reader.onload = function(ev) { 
            document.getElementById('imagePreview').src = ev.target.result; 
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadBox').style.display = 'none';
            document.getElementById('explainBtn').style.display = 'block';
            docBase64 = ev.target.result.split(',')[1]; 
        }
        reader.readAsDataURL(file);
    }
});

async function explainDocument() {
    const resDiv = document.getElementById('docResult');
    const btn = document.getElementById('explainBtn');
    resDiv.style.display = 'block'; resDiv.innerHTML = "Reading the image... Please wait.";
    btn.disabled = true;
    
    try {
        const res = await fetch(SERVER_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: "Read and explain this document in English. Add a disclaimer if it is medical.", image: docBase64, mime: docMime })
        });
        const data = await res.json();
        resDiv.innerHTML = `<strong style="color:#10b981;">AI:</strong><br><br>${formatAIText(data.text)}`;
    } catch (e) { 
        resDiv.innerHTML = "Connection error."; 
    }
    btn.disabled = false;
}

// 5. کوڈنگ اسسٹنٹ کا کوڈ
async function generateCode() {
    const code = document.getElementById("codeInput").value;
    const prompt = document.getElementById("codePrompt").value;
    const resDiv = document.getElementById("codeResult");
    const btn = document.getElementById("codeBtn");
    if(!prompt) return alert("Please enter instructions for the AI.");

    resDiv.style.display = 'block'; resDiv.innerHTML = "Generating code...";
    btn.disabled = true;
    
    try {
        const res = await fetch(SERVER_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `You are an expert coder. Code: ${code}\nTask: ${prompt}` })
        });
        const data = await res.json();
        resDiv.innerHTML = `<strong style="color:#10b981;">AI:</strong><br><br>${formatAIText(data.text)}`;
    } catch (e) { 
        resDiv.innerHTML = "Connection error."; 
    }
    btn.disabled = false;
}

// 6. سٹوڈنٹ ٹولز کا کوڈ
let cvBase64 = "", cvMime = "";
document.getElementById('cvImageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        cvMime = file.type;
        const reader = new FileReader();
        reader.onload = function(ev) { 
            document.getElementById('cvImagePreview').src = ev.target.result; 
            document.getElementById('cvImagePreview').style.display = 'block'; 
            cvBase64 = ev.target.result.split(',')[1]; 
        }
        reader.readAsDataURL(file);
    }
});

async function generateStudentContent() {
    const type = document.getElementById("docType").value;
    const field = document.getElementById("studyField").value;
    const name = document.getElementById("stuName").value;
    const topic = document.getElementById("stuTopic").value;
    const details = document.getElementById("stuDetails").value;
    const resDiv = document.getElementById("stuResult");
    const btn = document.getElementById("stuBtn");

    if(!name || !topic) return alert("Please enter your Name and the Topic.");

    resDiv.style.display = 'block'; resDiv.innerHTML = "Generating...";
    btn.disabled = true;
    
    try {
        const res = await fetch(SERVER_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `Generate a highly professional ${type} for a ${field} student named ${name} on topic: ${topic}. Details: ${details}`, image: cvBase64, mime: cvMime })
        });
        const data = await res.json();
        resDiv.innerHTML = `<strong style="color:#10b981;">Result:</strong><br><br>${formatAIText(data.text)}`;
    } catch (e) { 
        resDiv.innerHTML = "Connection error."; 
    }
    btn.disabled = false;
}