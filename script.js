function addTask(){

const taskInput = document.getElementById("taskInput");
const taskText = taskInput.value;

if(taskText === ""){
alert("Please enter a task");
return;
}

const li = document.createElement("li");

li.innerHTML = `
${taskText}
<span class="delete" onclick="deleteTask(this)">❌</span>
`;

document.getElementById("taskList").appendChild(li);

taskInput.value = "";
}

function deleteTask(element){
element.parentElement.remove();
}