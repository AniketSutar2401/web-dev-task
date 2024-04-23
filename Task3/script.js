let parentTasks = [];

// Function to open the popup form
function openPopupForm(formId) {
    const popupForm = document.getElementById(formId);
    popupForm.style.display = "block";

    // Function to close the popup form when clicking outside
    function closePopupFormOnClickOutside(event) {
        if (!popupForm.contains(event.target)) {
            // Clicked outside the popup form, so close it
            popupForm.style.display = "none";

            // Remove the click event listener
            document.removeEventListener("click", closePopupFormOnClickOutside);
        }
    }

    document.addEventListener("click", closePopupFormOnClickOutside);

    popupForm.addEventListener("click", function(event) {
        event.stopPropagation();
    });
}

document
    .getElementById("openParentTaskForm")
    .addEventListener("click", function(event) {
        event.stopPropagation();
        openPopupForm("parentTaskForm");
    });

document
    .getElementById("openSubtaskForm")
    .addEventListener("click", function(event) {
        event.stopPropagation();
        openPopupForm("subtaskForm");
        populateParentTaskSelect();
    });

document
    .getElementById("submitParentTask")
    .addEventListener("click", function() {
        const parentTaskId = document.getElementById("parentTaskId").value;
        const taskName = document.getElementById("taskName").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const status = document.getElementById("status").value;

        if (isParentTaskIdUnique(parentTaskId)) {
            clearErrorMessage("parentTaskIdError");

            const parentTask = {
                parentId: parentTaskId,
                taskName: taskName,
                startDate: startDate,
                endDate: endDate,
                status: status,
                subtasks: [],
            };

            parentTasks.push(parentTask);
            console.log(parentTasks);
            document.getElementById("parentTaskForm").style.display = "none";
            clearParentTaskFormFields();
            displayTasks();
        } else {
            displayErrorMessage(
                "parentTaskIdError",
                "Please enter a unique Parent Task ID."
            );
        }
    });

document.getElementById("parentTaskId").addEventListener("input", function() {
    const parentTaskId = this.value; 

    if (!isParentTaskIdUnique(parentTaskId)) {
        displayErrorMessage("parentTaskIdError", "ID is already exists");
    } else {
        clearErrorMessage("parentTaskIdError");
    }
});

document.getElementById("taskName").addEventListener("input", function() {
    const taskName = this.value; 

    if (!/^[a-zA-Z ]*$/.test(taskName)) {
        displayErrorMessage("taskNameError", "Name should be alphabets");
    } else {
        clearErrorMessage("taskNameError");
    }
});

document.getElementById("subtaskName").addEventListener("input", function() {
    const taskName = this.value; 

    if (!/^[a-zA-Z ]*$/.test(taskName)) {
        displayErrorMessage("subtaskNameError", "Name should be alphabets");
    } else {
        clearErrorMessage("subtaskNameError");
    }
});

document.getElementById("editTaskName").addEventListener("input", function() {
    const taskName = this.value; 

    if (!/^[a-zA-Z ]*$/.test(taskName)) {
        displayErrorMessage("editTaskNameError", "Name should be alphabets");
    } else {
        clearErrorMessage("editTaskNameError");
    }
});



function isParentTaskIdUnique(id) {
    return !parentTasks.some((task) => task.parentId === id);
}

function displayErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = "block"; 
}

function clearErrorMessage(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = "";
    errorElement.style.display = "none"; 
}

document.getElementById("submitSubtask").addEventListener("click", function() {
    const parentTaskSelect = document.getElementById("parentTaskSelect");
    const selectedParentTaskId =
        parentTaskSelect.options[parentTaskSelect.selectedIndex].value;
    const subtaskName = document.getElementById("subtaskName").value;
    const subtaskStartDate = document.getElementById("subtaskStartDate").value;
    const subtaskEndDate = document.getElementById("subtaskEndDate").value;
    const subtaskStatus = document.getElementById("subtaskStatus").value;

    const subtask = {
        subtaskId: generateSubtaskId(selectedParentTaskId),
        subtaskName: subtaskName,
        subtaskStartDate: subtaskStartDate,
        subtaskEndDate: subtaskEndDate,
        subtaskStatus: subtaskStatus,
    };

    const parentTask = parentTasks.find(
        (task) => task.parentId === selectedParentTaskId
    );
    if (parentTask) {
        parentTask.subtasks.push(subtask);
    }

    updateParentTaskStatus(parentTask);

    document.getElementById("subtaskForm").style.display = "none";
    clearSubtaskFormFields();
    displayTasks();
});

function updateParentTaskStatus(parentTask) {
    const hasInProgressSubtasks = parentTask.subtasks.some(
        (subtask) => subtask.subtaskStatus === "In Progress"
    );

    const hasPendingSubtasks = parentTask.subtasks.some(
        (subtask) => subtask.subtaskStatus === "Pending"
    );

    if (hasInProgressSubtasks) {
        parentTask.status = "In Progress";
    } else if (hasPendingSubtasks) {
        parentTask.status = "Pending";
    } else {
        parentTask.status = "Completed";
    }
}


function closePopupForm(formId) {
    const popupForm = document.getElementById(formId);
    popupForm.style.display = "none";
}

function performSearch() {
    const searchField = document.getElementById("searchField");
    const searchTerm = searchField.value.trim().toLowerCase();

    const parentResults = parentTasks.filter((task) => {
        const taskId = task.parentId.toLowerCase();
        const taskName = task.taskName.toLowerCase();
        const status = task.status.toLowerCase();
        return (
            taskId.includes(searchTerm) ||
            taskName.includes(searchTerm) ||
            status.includes(searchTerm)
        );
    });

    const subtaskResults = [];
    parentTasks.forEach((parentTask) => {
        subtaskResults.push(
            ...parentTask.subtasks.filter((subtask) => {
                const subtaskId = subtask.subtaskId.toLowerCase();
                const subtaskName = subtask.subtaskName.toLowerCase();
                const subtaskStatus = subtask.subtaskStatus.toLowerCase();
                return (
                    subtaskId.includes(searchTerm) ||
                    subtaskName.includes(searchTerm) ||
                    subtaskStatus.includes(searchTerm)
                );
            })
        );
    });

    const combinedResults = [...parentResults, ...subtaskResults];
    displaySearchResults(combinedResults);

    if (searchTerm === "") {
        displayTasks();
    }
}

function displaySearchResults(results) {
    const tableBody = document.querySelector("#taskTable tbody");
    tableBody.innerHTML = "";

    results.forEach((result) => {
        const row = document.createElement("tr");
        if ("parentId" in result) {
            row.innerHTML = `
        <td>${result.parentId}</td>
        <td>${result.taskName}</td>
        <td>${result.startDate}</td>
        <td>${result.endDate}</td>
        <td class="status-${getStatusColor(result.status)}">${result.status}</td>
        <td>
            <button class="edit-button" data-task-id="${result.parentId}" style="background:transparent;border:none;"><img src="edit.png" alt="edit" border="0" width="16px" height="16px"/></button>
            <button class="delete-button" data-task-id="${result.parentId}" style="background:transparent;border:none;"><img src="delete.png" alt="delete" border="0" width="16px" height="16px"/></button>
        </td>
      `;
        } else {
            row.innerHTML = `
        <td>${result.subtaskId}</td>
        <td>${result.subtaskName}</td>
        <td>${result.subtaskStartDate}</td>
        <td>${result.subtaskEndDate}</td>
        <td class="status-${getStatusColor(result.subtaskStatus)}">${result.subtaskStatus}</td>
        <td>
              <button class="edit-button subtask-edit" data-task-id="${result.subtaskId}" style="background:transparent;border:none;"><img src="edit.png" alt="edit" border="0" width="16px" height="16px"/></button>
              <button class="delete-button subtask-delete" data-task-id="${result.subtaskId}" style="background:transparent;border:none;"><img src="delete.png" alt="delete" border="0" width="16px" height="16px"/></button>
          </td>
      `;
        }
        tableBody.appendChild(row);
    });
}

document
    .getElementById("searchButton")
    .addEventListener("click", performSearch);

document.getElementById("searchField").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        performSearch();
    }
});

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

startDateInput.addEventListener("input", () => {
    const selectedStartDate = startDateInput.value;

    endDateInput.setAttribute("min", selectedStartDate);
});

endDateInput.addEventListener("input", () => {
    const selectedEndDate = endDateInput.value;

    startDateInput.setAttribute("max", selectedEndDate);
});

const editStartDateInput = document.getElementById("editStartDate");
const editEndDateInput = document.getElementById("editEndDate");

document
    .getElementById("parentTaskSelect")
    .addEventListener("change", function() {
        const selectedParentTaskId = this.value;
        updateSubtaskDateConstraints(selectedParentTaskId);
    });

editStartDateInput.addEventListener("input", () => {
    const selectedStartDate = editStartDateInput.value;

    editEndDateInput.setAttribute("min", selectedStartDate);
});

editEndDateInput.addEventListener("input", () => {
    const selectedEndDate = editEndDateInput.value;

    editStartDateInput.setAttribute("max", selectedEndDate);
});

const subtaskStartDateInput = document.getElementById("subtaskStartDate");
const subtaskEndDateInput = document.getElementById("subtaskEndDate");

function updateSubtaskDateConstraints(parentTaskId) {
    const parentTask = parentTasks.find((task) => task.parentId === parentTaskId);

    if (parentTask) {
        subtaskStartDateInput.setAttribute("min", parentTask.startDate);
        subtaskStartDateInput.setAttribute("max", parentTask.endDate);
        subtaskEndDateInput.setAttribute("min", parentTask.startDate);
        subtaskEndDateInput.setAttribute("max", parentTask.endDate);
    }
}

document
    .getElementById("parentTaskSelect")
    .addEventListener("change", function() {
        const selectedParentTaskId = this.value;
        updateSubtaskDateConstraints(selectedParentTaskId);
    });

subtaskStartDateInput.addEventListener("input", () => {
    const selectedSubtaskStartDate = subtaskStartDateInput.value;

    subtaskEndDateInput.setAttribute("min", selectedSubtaskStartDate);
});

subtaskEndDateInput.addEventListener("input", () => {
    const selectedSubtaskEndDate = subtaskEndDateInput.value;

    subtaskStartDateInput.setAttribute("max", selectedSubtaskEndDate);
});

function populateParentTaskSelect() {
    const parentTaskSelect = document.getElementById("parentTaskSelect");
    parentTaskSelect.innerHTML =
        "<option value='' disabled selected>Select Parent Task</option>";

    parentTasks.forEach((task) => {
        const option = document.createElement("option");
        option.value = task.parentId;
        option.textContent = task.parentId;
        parentTaskSelect.appendChild(option);
    });
}

function generateSubtaskId(parentTaskId) {
    const parentTask = parentTasks.find((task) => task.parentId === parentTaskId);
    if (parentTask) {
        const subtaskCount = parentTask.subtasks.length + 1;
        return `${parentTaskId}.${subtaskCount}`;
    }
    return "";
}

function clearParentTaskFormFields() {
    document.getElementById("parentTaskId").value = "";
    document.getElementById("taskName").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("status").value = "Pending";
}

function clearSubtaskFormFields() {
    document.getElementById("subtaskName").value = "";
    document.getElementById("subtaskStartDate").value = "";
    document.getElementById("subtaskEndDate").value = "";
    document.getElementById("subtaskStatus").value = "Pending";
}

function attachEditAndDeleteEventListeners() {
    const editButtons = document.querySelectorAll(".edit-button");
    const deleteButtons = document.querySelectorAll(".delete-button");

    editButtons.forEach((editButton) => {
        editButton.addEventListener("click", function() {
            const taskId = editButton.dataset.taskId;
            const isSubtask = editButton.classList.contains("subtask-edit");

            if (isSubtask) {
                // Edit subtask
                editSubtask(taskId);
            } else {
                // Edit parent task
                editParentTask(taskId);
            }
        });
    });

    deleteButtons.forEach((deleteButton) => {
        deleteButton.addEventListener("click", function() {
            const taskId = deleteButton.dataset.taskId;
            const isSubtask = deleteButton.classList.contains("subtask-delete");

            if (isSubtask) {
                // Delete subtask only
                deleteSubtask(taskId);
            } else {
                showDeleteConfirmation(taskId);
            }
        });
    });
}

function displayTasks() {
    parentTasks.sort((a, b) => a.parentId.localeCompare(b.parentId));

    const tableBody = document.querySelector("#taskTable tbody");
    tableBody.innerHTML = "";

    parentTasks.forEach((parentTask) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${parentTask.parentId}</td>
            <td>${parentTask.taskName}</td>
            <td>${parentTask.startDate}</td>
            <td>${parentTask.endDate}</td>
            <td class="status-${getStatusColor(parentTask.status)}">${parentTask.status}</td>
            <td>
                <button class="edit-button" data-task-id="${parentTask.parentId}" style="background:transparent;border:none;"><img src="edit.png" alt="edit" border="0" width="16px" height="16px"/></button>
                <button class="delete-button" data-task-id="${parentTask.parentId}" style="background:transparent;border:none;"><img src="delete.png" alt="delete" border="0" width="16px" height="16px"/></button>
            </td>
        `;
        tableBody.appendChild(row);

        parentTask.subtasks.forEach((subtask) => {
            const subtaskRow = document.createElement("tr");
            subtaskRow.innerHTML = `
                <td>${subtask.subtaskId}</td>
                <td>${subtask.subtaskName}</td>
                <td>${subtask.subtaskStartDate}</td>
                <td>${subtask.subtaskEndDate}</td>
                <td class="status-${getStatusColor(subtask.subtaskStatus)}">${subtask.subtaskStatus}</td>
                <td>
                <button class="edit-button subtask-edit" data-task-id="${subtask.subtaskId}" style="background:transparent;border:none;"><img src="edit.png" alt="edit" border="0" width="16px" height="16px"/></button>
                <button class="delete-button subtask-delete" data-task-id="${subtask.subtaskId}" style="background:transparent;border:none;"><img src="delete.png" alt="delete" border="0" width="16px" height="16px"/></button>
                </td>
            `;
            tableBody.appendChild(subtaskRow);
        });
    });

    attachEditAndDeleteEventListeners();
}


function getStatusColor(status) {
    switch (status) {
        case "Completed":
            return "green";
        case "In Progress":
            return "grey";
        case "Pending":
            return "red";
        default:
            return "";
    }
}

function editParentTask(parentTaskId) {
    const parentTaskToEdit = parentTasks.find(
        (task) => task.parentId === parentTaskId
    );

    if (parentTaskToEdit) {
        document.getElementById("editParentTaskId").value =
            parentTaskToEdit.parentId;
        document.getElementById("editTaskName").value = parentTaskToEdit.taskName;
        document.getElementById("editStartDate").value = parentTaskToEdit.startDate;
        document.getElementById("editEndDate").value = parentTaskToEdit.endDate;
        document.getElementById("editStatus").value = parentTaskToEdit.status;

        document.getElementById("editTaskForm").style.display = "block";

        document
            .getElementById("submitEditTask")
            .addEventListener("click", function() {
                parentTaskToEdit.taskName =
                    document.getElementById("editTaskName").value;
                parentTaskToEdit.startDate =
                    document.getElementById("editStartDate").value;
                parentTaskToEdit.endDate = document.getElementById("editEndDate").value;
                parentTaskToEdit.status = document.getElementById("editStatus").value;

                document.getElementById("editTaskForm").style.display = "none";

                displayTasks();
            });
    }
}

function editSubtask(subtaskId) {
    for (const parentTask of parentTasks) {
        const subtaskToEdit = parentTask.subtasks.find(
            (subtask) => subtask.subtaskId === subtaskId
        );

        if (subtaskToEdit) {
            document.getElementById("editParentTaskId").value = parentTask.parentId;
            document.getElementById("editTaskName").value = subtaskToEdit.subtaskName;
            document.getElementById("editStartDate").value =
                subtaskToEdit.subtaskStartDate;
            document.getElementById("editEndDate").value =
                subtaskToEdit.subtaskEndDate;
            document.getElementById("editStatus").value = subtaskToEdit.subtaskStatus;

            const subtaskStartDateInput = document.getElementById("editStartDate");
            subtaskStartDateInput.setAttribute("min", parentTask.startDate);
            subtaskStartDateInput.setAttribute("max", parentTask.endDate);

            const subtaskEndDateInput = document.getElementById("editEndDate");
            subtaskEndDateInput.setAttribute("min", parentTask.startDate);
            subtaskEndDateInput.setAttribute("max", parentTask.endDate);

            document.getElementById("editTaskForm").style.display = "block";

            document
                .getElementById("submitEditTask")
                .addEventListener("click", function() {
                    subtaskToEdit.subtaskName =
                        document.getElementById("editTaskName").value;
                    subtaskToEdit.subtaskStartDate =
                        document.getElementById("editStartDate").value;
                    subtaskToEdit.subtaskEndDate =
                        document.getElementById("editEndDate").value;
                    subtaskToEdit.subtaskStatus =
                        document.getElementById("editStatus").value;

                    updateParentTaskStatus(parentTask);

                    document.getElementById("editTaskForm").style.display = "none";

                    displayTasks();
                });

            break;
        }
    }
}

function updateParentTaskStatus(parentTask) {
    const subtaskStatuses = parentTask.subtasks.map((subtask) => subtask.subtaskStatus);

    if (subtaskStatuses.includes("In Progress")) {
        parentTask.status = "In Progress";
    } else if (subtaskStatuses.includes("Pending")) {
        parentTask.status = "Pending";
    } else {
        parentTask.status = "Completed";
    }
}

function showDeleteConfirmation(taskId) {
    const deleteConfirmationForm = document.getElementById(
        "deleteConfirmationForm"
    );
    deleteConfirmationForm.style.display = "block";

    const confirmDeleteButton = document.getElementById("confirmDelete");
    const cancelDeleteButton = document.getElementById("cancelDelete");

    confirmDeleteButton.addEventListener("click", function() {
        deleteParentTaskAndSubtasks(taskId);
        deleteConfirmationForm.style.display = "none";
    });

    cancelDeleteButton.addEventListener("click", function() {
        deleteConfirmationForm.style.display = "none";
    });
}

function deleteParentTaskAndSubtasks(parentTaskId) {
    const parentTaskIndex = parentTasks.findIndex(
        (task) => task.parentId === parentTaskId
    );
    if (parentTaskIndex !== -1) {
        parentTasks.splice(parentTaskIndex, 1);
        displayTasks();
    }
}

function deleteSubtask(subtaskId) {
    for (const parentTask of parentTasks) {
        const subtaskIndex = parentTask.subtasks.findIndex(
            (subtask) => subtask.subtaskId === subtaskId
        );
        if (subtaskIndex !== -1) {
            parentTask.subtasks.splice(subtaskIndex, 1);
            displayTasks();
            return;
        }
    }
}

attachEditAndDeleteEventListeners();
