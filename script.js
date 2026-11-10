import { faker } from '@faker-js/faker';
let transactions = [];
const fakerButton = document.querySelector("#faker-trigger");
if (fakerButton) {
    fakerButton.addEventListener("click", () => {
        const standardCategories = ['Food', 'Rent', 'Utilities', 'Entertainment'];
        //create 5 instances 
        for (let i = 0; i < 5; i++) {
            const isIncome = Math.random() > 0.75;
            //Creating the object with Faker.js
            const fakerObject = {
                id: 'faker_' + faker.string.alphanumeric(8),
                type: isIncome ? 'income' : 'expense',
                merchant: isIncome ? `${faker.company.name()} Virement` : faker.company.name(),
                amount: isIncome
                    ? parseFloat(faker.finance.amount({ min: 1000, max: 2500, dec: 2 }))
                    : parseFloat(faker.finance.amount({ min: 4, max: 120, dec: 2 })),
                category: isIncome ? 'Utilities' : standardCategories[Math.floor(Math.random() * standardCategories.length)],
                date: faker.date.recent({ days: 30 }).toISOString().split('T')[0] // Récupère juste YYYY-MM-DD
            };
            // On ajoute la fausse transaction dans notre tableau global
            transactions.push(fakerObject);
        }
    });
}
