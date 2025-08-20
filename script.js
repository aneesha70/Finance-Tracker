document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const categoryInput = document.getElementById('category');
    const addButton = document.getElementById('add-expense');
    const expensesList = document.getElementById('expenses-list');
    const totalIncomeElement = document.getElementById('total-income');
    const totalExpensesElement = document.getElementById('total-expenses');
    const balanceElement = document.getElementById('balance');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const chartContainer = document.getElementById('chart');
    
    // Store transactions
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Initialize the app
    function init() {
        renderTransactions();
        updateSummary();
        updateChart();
        
        // Add event listeners
        addButton.addEventListener('click', addTransaction);
        filterType.addEventListener('change', renderTransactions);
        filterCategory.addEventListener('change', renderTransactions);
    }
    
    // Add a new transaction
    function addTransaction() {
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;
        const category = categoryInput.value;
        const date = new Date().toLocaleDateString();
        
        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid description and amount');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date
        };
        
        transactions.push(transaction);
        saveTransactions();
        renderTransactions();
        updateSummary();
        updateChart();
        
        // Clear input fields
        descriptionInput.value = '';
        amountInput.value = '';
    }
    
    // Delete a transaction
    function deleteTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        renderTransactions();
        updateSummary();
        updateChart();
    }
    
    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    // Render transactions based on filters
    function renderTransactions() {
        const typeFilter = filterType.value;
        const categoryFilter = filterCategory.value;
        
        // Filter transactions
        let filteredTransactions = transactions;
        
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                transaction => transaction.type === typeFilter
            );
        }
        
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                transaction => transaction.category === categoryFilter
            );
        }
        
        // Clear the list
        expensesList.innerHTML = '';
        
        // Add transactions to the list
        if (filteredTransactions.length === 0) {
            expensesList.innerHTML = '<tr><td colspan="5" style="text-align: center;">No transactions found</td></tr>';
            return;
        }
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // Format amount based on type
            const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
            const amountPrefix = transaction.type === 'income' ? '+' : '-';
            
            // Create category badge with color
            const categoryColors = {
                food: '#e74c3c',
                transport: '#3498db',
                entertainment: '#9b59b6',
                utilities: '#2ecc71',
                shopping: '#f39c12',
                other: '#95a5a6'
            };
            
            const categoryStyle = `background-color: ${categoryColors[transaction.category]}; color: white;`;
            
            row.innerHTML = `
                <td>${transaction.description}</td>
                <td class="${amountClass}">${amountPrefix}$${transaction.amount.toFixed(2)}</td>
                <td><span class="category-badge" style="${categoryStyle}">${transaction.category}</span></td>
                <td>${transaction.date}</td>
                <td>
                    <button class="delete-btn" data-id="${transaction.id}">Delete</button>
                </td>
            `;
            
            expensesList.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteTransaction(id);
            });
        });
    }
    
    // Update summary
    function updateSummary() {
        const totalIncome = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        const totalExpenses = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        
        const balance = totalIncome - totalExpenses;
        
        totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
        balanceElement.textContent = `$${balance.toFixed(2)}`;
        
        // Change balance color based on value
        if (balance < 0) {
            balanceElement.style.color = '#e74c3c';
        } else {
            balanceElement.style.color = '#27ae60';
        }
    }
    
    // Update chart
    function updateChart() {
        const categories = {
            food: 0,
            transport: 0,
            entertainment: 0,
            utilities: 0,
            shopping: 0,
            other: 0
        };
        
        // Calculate total expenses per category
        transactions
            .filter(transaction => transaction.type === 'expense')
            .forEach(transaction => {
                categories[transaction.category] += transaction.amount;
            });
        
        // Clear previous chart
        chartContainer.innerHTML = '';
        
        // Create chart bars
        const maxAmount = Math.max(...Object.values(categories));
        
        for (const [category, amount] of Object.entries(categories)) {
            if (amount > 0) {
                const barContainer = document.createElement('div');
                barContainer.style.marginBottom = '10px';
                
                const categoryLabel = document.createElement('div');
                categoryLabel.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount.toFixed(2)}`;
                categoryLabel.style.display = 'flex';
                categoryLabel.style.justifyContent = 'space-between';
                categoryLabel.style.marginBottom = '5px';
                categoryLabel.style.fontSize = '14px';
                
                const bar = document.createElement('div');
                bar.style.height = '20px';
                bar.style.backgroundColor = '#4a69bd';
                bar.style.borderRadius = '4px';
                bar.style.width = `${(amount / maxAmount) * 100}%`;
                
                barContainer.appendChild(categoryLabel);
                barContainer.appendChild(bar);
                
                chartContainer.appendChild(barContainer);
            }
        }
        
        if (chartContainer.innerHTML === '') {
            chartContainer.innerHTML = '<p style="text-align: center;">No expense data to display</p>';
        }
    }
    
    // Initialize the application
    init();
});