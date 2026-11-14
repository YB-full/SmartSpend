# SmartSpend 

A clean, fast, and responsive Single Page Application (SPA) built with TypeScript, HTML, and CSS 
to track personal income and expenses—with automatic real-time currency conversion to Israeli New Shekels (ILS / ₪).



##  What It Is & What Problem It Solves

Managing personal finances can  become frustrating when dealing with purchases in different currencies (like shopping online in USD or EUR while budgeting in ILS). 

SmartSpend solves this problem by offering a lightweightexpense tracker. 
Users can log any expense or income in seconds, automatically convert foreign currencies into Shekels using live exchange rates, 
and immediately visualize their financial health without needing to create an account or connect a bank.



# Key Features

1-Real-Time Financial Overview:Instantly view your Net Balance, Total Income, and Total Expenses in Shekels (₪).
2-Automatic Currency Conversion:Log transactions in foreign currencies (e.g., USD, EUR) 
and let the app automatically fetch live exchange rates via an external REST API to convert everything into ILS.
3-Interactive Category Breakdown: A visual chart displaying the exact share of each spending category (e.g., Food, Rent, Shopping, Entertainment)
so you can easily see where your money goes.
4-Transaction History: A clean, chronological list of all past income and expense entries.
5-Offline Data Persistence: Uses the browser's localStorage to automatically save your data:
your transactions remain safe even after closing or refreshing the page.
6-Demo Data Simulator:Includes a Create testing data  button that instantly populates the app with realistic sample transactions
perfect for testing the dashboard and charts right away without manual data entry (using faker.js)
7-Clear All:Easily wipe the entire transaction history and reset localStorage with a single click whenever you want a fresh start.
8-Single Page Experience:Smooth, instant UI updates without page reloads.



# Tech Stack

Language: TypeScript
Markup & Styling:HTML5, CSS3
APIs & Storage:Exchange Rate REST API (fetch), Browser localStorage


# How to Run It Locally

Follow these steps to run SmartSpend on your own computer:

# Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your machine (to compile TypeScript).

# Installation & Setup

1. Clone the repository:
   git clone https://github.com/YB-Full/SmartSpend.git


2. Navigate to the project folder:
   cd SmartSpend
 

3. Install dependencies:
   npm install

4. Compile TypeScript (if not using a bundler like Vite):
   npx tsc
   *(Note: If you use Vite or a dev server configured in package.json, run npm run dev instead).

5. Launch the app:
   Open the SmartSpend.html file directly in your browser, or
   Use the Live Server extension in VS Code for the best experience.



## 💡 Future Improvements

* Add the ability to filter transactions by date or category.
* Export transaction history to a CSV file.
* Add a dark/light mode toggle.
