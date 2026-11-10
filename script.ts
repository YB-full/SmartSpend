// import { Chart, DoughnutController, ArcElement, Legend, Tooltip, Title } from 'chart.js';
// Chart.register(DoughnutController, ArcElement, Legend, Tooltip, Title);
// const canvas = document.querySelector("#myCircularChart") as HTMLCanvasElement | null;


//types
type TransactionCategory='Food' | 'Rent' | 'Utilities' | 'Entertainment';
type TransactionType='income' | 'expense'
//interface
interface Transaction {
    id: string;
    type: TransactionType;
    description: string;
    amount: number;
    category: TransactionCategory ;
    date: string;
}
let transactions: Transaction[] = [];

const transactionForm= document.querySelector("#transaction-form") as HTMLFormElement | null;
const addButton=document.querySelector("#btn-submit-form") as HTMLButtonElement |null;

const txIDInput = document.getElementById('tx-id') as HTMLInputElement | null;
const txDescriptionInput = document.getElementById('tx-description') as HTMLInputElement | null;
const txAmountInput = document.getElementById('tx-amount') as HTMLInputElement | null;
const txCurrencyInput = document.getElementById('tx-currency') as HTMLSelectElement | null;
const txCategoryInput = document.getElementById('tx-category') as HTMLSelectElement | null;
const txDateInput = document.getElementById('tx-date') as HTMLInputElement | null;

const txTypeInputs = document.querySelectorAll("input[name='tx-type']") as NodeListOf<HTMLInputElement>;

const BASE_API_URL = "https://open.er-api.com/v6/latest/ILS";

async function convertToShekel(amount: number, fromCurrency: string): Promise<number> {
    //if the currency is already ILS
    if (fromCurrency === 'ILS') return amount;

    try {
        
        const response = await fetch(BASE_API_URL);
        
       // respond invalid from server
        if (!response.ok) throw new Error(`API HTTP Error: ${response.status}`);

        //Extraction of JSON data
        const data = await response.json();
        
        //Extract the rate of currency compare to ILS 
        const rate = data.rates[fromCurrency] as number | undefined;
        if (!rate) throw new Error(`Currency ${fromCurrency} not supported by API`);

        
        const convertedAmount = amount / rate;
        return parseFloat(convertedAmount.toFixed(2));

    } catch (error) {
        console.error("Fetch API rate failed ,fallback activated:", error);
        
        //using approximatives rates 
        const offlineRates: Record<string, number> = { 'USD': 3.16, 'EUR': 3.54 }; 
        const fallbackRate = offlineRates[fromCurrency] || 1;
        
        return parseFloat((amount / fallbackRate).toFixed(2));
    }
}

if (transactionForm) {

    transactionForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        // we check if all the field are here, else we return
        if (!txDescriptionInput || !txAmountInput || !txCurrencyInput || !txCategoryInput || !txDateInput || !addButton || !txIDInput) return;
        let descriptionValue=txDescriptionInput.value;
        let amountValue=parseFloat(txAmountInput.value);
        let dateValue=txDateInput.value;
        let categoryValue=txCategoryInput.value as TransactionCategory;
        let selectedType: TransactionType = 'income';

        txTypeInputs.forEach(radio => {
            if (radio.checked) {
            selectedType = radio.value as TransactionType; 
        }
        });
       
        const currencyValue = txCurrencyInput.value;
        const finalAmountInShekel = await convertToShekel(amountValue, currencyValue);

        const existingId = txIDInput.value;
        const objectTransaction:Transaction ={
            id: existingId ? existingId :"tx_" + Date.now(),
            type: selectedType,
            description: descriptionValue,
            amount: finalAmountInShekel,
            category:categoryValue,
            date:dateValue
        }
        if (existingId) {
            
            transactions = transactions.map(tx => tx.id === existingId ? objectTransaction : tx);
            addButton.innerText = "Add Transaction";
        } else {
            transactions.push(objectTransaction);
        }


        localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));

        updateUI();

        transactionForm.reset();
        txDateInput.value = new Date().toISOString().split('T')[0];
        if (!existingId) addButton.innerText = "Add Transaction";
    
    })
}
function updateUI():void{
    const listContainer = document.querySelector("#transaction-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";
    let totalNet=0;
    let totalIncome=0;
    let totalExpense=0;

    
      
    transactions.forEach(tx => { 
        //calculating the balance
        if (tx.type === 'income') {
            totalIncome += tx.amount;
            totalNet += tx.amount;
        } else {
            totalExpense += tx.amount;
            totalNet -= tx.amount;
        }
        //creating the element for the transactions historic
        const rowTr = document.createElement("tr");
        rowTr.className = 'transaction-item'; 

        const dateTd=document.createElement("td");
        dateTd.className="tx-date";
        dateTd.innerText=tx.date;

        const descriptionTd = document.createElement("td");
        descriptionTd.className = "tx-description";
        descriptionTd.innerText = tx.description; 

        const amountTd=document.createElement("td");
        amountTd.className="tx-amount";
        amountTd.innerText= `${tx.amount.toFixed(2)}₪`;

        const categoryTd=document.createElement("td");
        categoryTd.className="tx-category";
        categoryTd.innerText= tx.category;

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
    const netDisplay=document.querySelector("#total-net-balance") as HTMLElement;
    const incomeDisplay=document.querySelector("#total-income") as HTMLElement;
    const expenseDisplay=document.querySelector("#total-expenses") as HTMLElement;
    if (netDisplay) netDisplay.innerText = `${totalNet.toFixed(2)} ₪`;
    if (incomeDisplay) incomeDisplay.innerText = `${totalIncome.toFixed(2)} ₪`;
    if (expenseDisplay) expenseDisplay.innerText = `${totalExpense.toFixed(2)} ₪`;
}

function editTransaction(id: string): (e: Event) => void {
    return (e: Event) => {
        e.preventDefault();
        const transactionToEdit = transactions.find(tx => tx.id === id);
        if (!transactionToEdit) return; 

        if (!txIDInput || !txDescriptionInput || !txAmountInput || !txCategoryInput || !txDateInput || !addButton) return;

        
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
    }
}


function deleteTransaction(id: string): (e: Event) => void {
    return (e: Event) => {
        e.preventDefault();
        transactions = transactions.filter(tx => tx.id !== id);
        localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));
        updateUI();
    }
}    

