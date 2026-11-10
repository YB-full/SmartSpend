"use strict";
let transactions = [];
const transactionForm = document.querySelector("#transaction-form");
const addButton = document.querySelector("#btn-submit-form");
const txIDInput = document.getElementById('tx-id');
const txDescriptionInput = document.getElementById('tx-description');
const txAmountInput = document.getElementById('tx-amount');
const txCurrencyInput = document.getElementById('tx-currency');
const txCategoryInput = document.getElementById('tx-category');
const txDateInput = document.getElementById('tx-date');
const txTypeInputs = document.querySelectorAll("#tx-type");
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // we check if all the field are here, else we return
        if (!txDescriptionInput || !txAmountInput || !txCurrencyInput || !txCategoryInput || !txDateInput || !addButton)
            return;
        let descriptionValue = txDescriptionInput.value;
        let amountValue = parseFloat(txAmountInput.value);
        let dateValue = txDateInput.value;
        let categoryValue = txCategoryInput.value;
        let selectedType = 'income';
        txTypeInputs.forEach(radio => {
            if (radio.checked) {
                selectedType = radio.value;
            }
        });
        const objectTransaction = {
            id: "tx_" + Date.now(),
            type: selectedType,
            description: descriptionValue,
            amount: amountValue,
            category: categoryValue,
            date: dateValue
        };
        transactions.push(objectTransaction);
        localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));
        updateUI();
    });
}
function updateUI() {
    const listContainer = document.querySelector("#transaction-list-container");
    if (!listContainer)
        return;
    listContainer.innerHTML = "";
    transactions.forEach(tx => {
        const rowTr = document.createElement("tr");
        rowTr.className = 'transaction-item';
        const dateTd = document.createElement("td");
        dateTd.className = "tx-date";
        dateTd.innerText = tx.date;
        const descriptionTd = document.createElement("td");
        descriptionTd.className = "tx-description";
        descriptionTd.innerText = tx.description;
        const amountTd = document.createElement("td");
        amountTd.className = "tx-amount";
        amountTd.innerText = `${tx.amount.toFixed(2)}₪`;
        const categoryTd = document.createElement("td");
        categoryTd.className = "tx-category";
        categoryTd.innerText = tx.category;
        const actionsTd = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = "edit-btn";
        editButton.innerText = "✏️ ";
        editButton.setAttribute('data-id', tx.id);
        editButton.addEventListener('click', editTransaction(tx.id));
        const deleteButton = document.createElement('button');
        deleteButton.className = "delete-btn";
        deleteButton.innerText = "🗑️";
        deleteButton.setAttribute('data-id', tx.id);
        deleteButton.addEventListener('click', deleteTransaction(tx.id));
        actionsTd.appendChild(editButton);
        actionsTd.appendChild(deleteButton);
        rowTr.appendChild(dateTd);
        rowTr.appendChild(descriptionTd);
        rowTr.appendChild(categoryTd);
        rowTr.appendChild(amountTd);
        rowTr.appendChild(actionsTd);
        listContainer.appendChild(rowTr);
    });
}

