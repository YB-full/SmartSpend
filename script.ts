//interfaces 
type TransactionCategory='Food' | 'Rent' | 'Utilities' | 'Entertainment';
type TransactionType='income' | 'expense'
interface Transaction {
    id: string;
    type: TransactionType;
    merchant: string;
    amount: number;
    category: TransactionCategory ;
    date: string;
}
let transactions: Transaction[] = [];

