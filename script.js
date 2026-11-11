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
const txTypeInputs = document.querySelectorAll("input[name='tx-type']");
const BASE_API_URL = "https://open.er-api.com/v6/latest/ILS";
async function convertToShekel(amount, fromCurrency) {
    //if the currency is already ILS
    if (fromCurrency === 'ILS')
        return amount;
    try {
        const response = await fetch(BASE_API_URL);
        // respond invalid from server
        if (!response.ok)
            throw new Error(`API HTTP Error: ${response.status}`);
        //Extraction of JSON data
        const data = await response.json();
        //Extract the rate of currency compare to ILS 
        const rate = data.rates[fromCurrency];
        if (!rate)
            throw new Error(`Currency ${fromCurrency} not supported by API`);
        const convertedAmount = amount / rate;
        return parseFloat(convertedAmount.toFixed(2));
    }
    catch (error) {
        console.error("Fetch API rate failed ,fallback activated:", error);
        //using approximatives rates 
        const offlineRates = { 'USD': 3.16, 'EUR': 3.54 };
        const fallbackRate = offlineRates[fromCurrency] || 1;
        return parseFloat((amount / fallbackRate).toFixed(2));
    }
}
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // we check if all the field are here, else we return
        if (!txDescriptionInput || !txAmountInput || !txCurrencyInput || !txCategoryInput || !txDateInput || !addButton || !txIDInput)
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
        const currencyValue = txCurrencyInput.value;
        const finalAmountInShekel = await convertToShekel(amountValue, currencyValue);
        const existingId = txIDInput.value;
        const objectTransaction = {
            id: existingId ? existingId : "tx_" + Date.now(),
            type: selectedType,
            description: descriptionValue,
            amount: finalAmountInShekel,
            category: categoryValue,
            date: dateValue
        };
        if (existingId) {
            transactions = transactions.map(tx => tx.id === existingId ? objectTransaction : tx);
            addButton.innerText = "Add Transaction";
        }
        else {
            transactions.push(objectTransaction);
        }
        localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));
        updateUI();
        transactionForm.reset();
        txIDInput.value = "";
        txDateInput.value = new Date().toISOString().split('T')[0];
        if (!existingId) {
            addButton.innerText = "Add Transaction";
        }
        updateChart();
        updateBalance();
    });
}
function updateUI() {
    const listContainer = document.querySelector("#transaction-list-container");
    if (!listContainer)
        return;
    listContainer.innerHTML = "";
    transactions.forEach(tx => {
        //creating the element for the transactions historic
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
        //we add a sign either it's an income(+) or an expense(-)
        if (tx.type === "income") {
            amountTd.innerText = `+ ${tx.amount.toFixed(2)} ₪`;
            amountTd.classList.add("amount-income");
        }
        else {
            amountTd.innerText = `- ${tx.amount.toFixed(2)} ₪`;
            amountTd.classList.add("amount-expense");
        }
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
function updateBalance() {
    let totalNet = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    //calculating the balance
    transactions.forEach(tx => {
        if (tx.type === 'income') {
            totalIncome += tx.amount;
            totalNet += tx.amount;
        }
        else {
            totalExpense += tx.amount;
            totalNet -= tx.amount;
        }
    });
    const netDisplay = document.querySelector("#total-net-balance");
    const incomeDisplay = document.querySelector("#total-income");
    const expenseDisplay = document.querySelector("#total-expenses");
    if (netDisplay)
        netDisplay.innerText = `${totalNet.toFixed(2)} ₪`;
    if (incomeDisplay)
        incomeDisplay.innerText = `${totalIncome.toFixed(2)} ₪`;
    if (expenseDisplay)
        expenseDisplay.innerText = `${totalExpense.toFixed(2)} ₪`;
}
function editTransaction(id) {
    return (e) => {
        e.preventDefault();
        const transactionToEdit = transactions.find(tx => tx.id === id);
        if (!transactionToEdit)
            return;
        if (!txIDInput || !txDescriptionInput || !txAmountInput || !txCategoryInput || !txDateInput || !addButton)
            return;
        txDescriptionInput.value = transactionToEdit.description;
        txAmountInput.value = transactionToEdit.amount.toString();
        txCategoryInput.value = transactionToEdit.category;
        txDateInput.value = transactionToEdit.date;
        txIDInput.value = transactionToEdit.id;
        txTypeInputs.forEach(radio => {
            radio.checked = (radio.value === transactionToEdit.type);
        });
        addButton.innerText = "✏️ Update Transaction";
        txDescriptionInput.focus();
    };
}
function deleteTransaction(id) {
    return (e) => {
        e.preventDefault();
        transactions = transactions.filter(tx => tx.id !== id);
        localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));
        updateUI();
        updateBalance();
        updateChart();
    };
}
const canvas = document.querySelector("#myCircularChart");
let myChartInstance = null;
const CHART_COLORS = ['#ff7675', '#74b9ff', '#ffeaa7', '#a29bfe'];
function updateChart() {
    let myCategories = {
        Food: 0,
        Rent: 0,
        Utilities: 0,
        Entertainment: 0
    };
    transactions.forEach(tx => {
        if (tx.type === 'expense') {
            myCategories[tx.category] += tx.amount;
        }
    });
    if (!canvas)
        return;
    if (myChartInstance) {
        myChartInstance.destroy();
    }
    //creating the chart using the data provided
    myChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Rent', 'Utilities', 'Entertainment'],
            datasets: [{
                    data: [
                        //here chart will calculate the pourcent for us 
                        myCategories.Food,
                        myCategories.Rent,
                        myCategories.Utilities,
                        myCategories.Entertainment
                    ],
                    backgroundColor: CHART_COLORS,
                    borderWidth: 0
                }]
        },
        options: {
            maintainAspectRatio: false
        }
    });
}
const fakerButton = document.querySelector("#faker-trigger");
function generateFakeTransactions() {
    if (typeof faker === 'undefined') {
        alert("Faker is not charged !");
        return;
    }
    const categories = ['Food', 'Rent', 'Utilities', 'Entertainment'];
    for (let i = 0; i < 10; i++) {
        const randomType = Math.random() > 0.7 ? 'income' : 'expense';
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const fakeDescription = randomType === 'income'
            ? faker.company.name() + " Salary"
            : faker.commerce.productName();
        const fakeAmount = Number(faker.finance.amount({ min: 20, max: 500, dec: 2 }));
        const fakeDate = faker.date.recent({ days: 30 }).toISOString().split('T');
        const fakeTx = {
            id: "tx_" + Date.now() + "_" + i,
            type: randomType,
            description: fakeDescription,
            amount: fakeAmount,
            category: randomCategory,
            date: fakeDate
        };
        transactions.push(fakeTx);
    }
    updateUI();
    updateBalance();
    updateChart();
}
if (fakerButton) {
    fakerButton.addEventListener('click', generateFakeTransactions);
}
