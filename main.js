import expenses from "./data.js";

const itemPrototype = document.querySelector('.expense__item--prototype');
const expensesContainer = document.querySelector('.expense__container');
const paginationContainer = document.querySelector('.pagination');
const filterForm = document.querySelector('.expenses-form');
const totalElement = document.querySelector('.total-price');
const periodSummaryItems = document.querySelector('.summary-box_period');
const categorySummaryItems = document.querySelectorAll('.summary-box_category .sum_category__item');
const windowMedia = window.matchMedia("(min-width: 1700px)");

let pageSize;
let filteredExpenses = expenses.slice(); 
let currentPage = 1;

function windowMatches(win) {
  if (win.matches) {
    pageSize = 4;
  } else {
    pageSize = 3;
  }

  updatePagination();
  insertItem(currentPage);
  return pageSize;
}

function createItem(item) {
  const newExpenseItem = itemPrototype.cloneNode(true);
  newExpenseItem.classList.remove('expense__item--prototype');
  newExpenseItem.classList.add('expense__item--new');

  newExpenseItem.dataset.id = item.id;

  const name = newExpenseItem.querySelector('.expense__name');
  const price = newExpenseItem.querySelector('.price__amount');
  const icon = newExpenseItem.querySelector('.expense__icon');
  const category = newExpenseItem.querySelector('.expense__category');
  const date = newExpenseItem.querySelector('.expense__date');

  name.innerText = item.name;
  price.innerText = item.price;
  icon.src = item.icon;
  category.innerText = item.category;
  date.innerText = item.date;

  return newExpenseItem;
}

function insertItem(pageNumber) {
  expensesContainer.innerHTML = '';

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageExpenses = filteredExpenses.slice(startIndex, endIndex);

  currentPageExpenses.forEach(item => {
    const newExpenseItem = createItem(item);
    expensesContainer.appendChild(newExpenseItem);
  });
}

function handlePaginationClick(event) {
  const pageNumber = Number(event.target.dataset.page);
  currentPage = pageNumber;

  const paginationButtons = paginationContainer.querySelectorAll('button');
  paginationButtons.forEach(button => button.classList.remove('active'));

  event.target.classList.add('active');

  insertItem(currentPage);
}

function generatePaginationButtons() {
  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const paginationButton = document.createElement('button');
    paginationButton.innerText = i;
    paginationButton.dataset.page = i;
    paginationButton.addEventListener('click', handlePaginationClick);

    if (i === currentPage) {
      paginationButton.classList.add('active');
    }

    paginationContainer.appendChild(paginationButton);
  }
}

function updatePagination() {
  currentPage = 1;
  generatePaginationButtons();
}

function applyFilters() {
  const periodStartInput = filterForm.querySelector('.expenses-form__input--periodStart');
  const periodEndInput = filterForm.querySelector('.expenses-form__input--periodEnd');
  const categorySelect = filterForm.querySelector('.expenses-form__input--category');
  const nameInput = filterForm.querySelector('.expenses-form__input--name');

  const periodStart = periodStartInput.value;
  const periodEnd = periodEndInput.value;
  const category = categorySelect.value;
  const name = nameInput.value.toLowerCase();

  filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const isWithinPeriod = (
      (!periodStart || expense.date >= periodStart) &&
      (!periodEnd || expense.date <= periodEnd)
    );

    const matchesCategory = category && expense.category.toLowerCase().includes(category.toLowerCase());
    const matchesName = name && expense.name.toLowerCase().includes(name);

    return isWithinPeriod && (matchesCategory || matchesName);
  });

  updatePagination();
  insertItem(currentPage);
}

filterForm.addEventListener('submit', function (event) {
  event.preventDefault();
  applyFilters();
});

function calculateTotalPrice(expenses) {
  let totalPrice = 0;

  expenses.forEach(expense => {
    totalPrice += expense.price;
  });

  return totalPrice;
}

function calculateTotalPerPeriod(expenses) {
  const totalPerPeriod = {};

  expenses.forEach(expense => {
    const period = expense.date.slice(0, 7); 

    if (totalPerPeriod.hasOwnProperty(period)) {
      totalPerPeriod[period] += expense.price;
    } else {
      totalPerPeriod[period] = expense.price;
    }
  });

  return totalPerPeriod;
}

function calculateTotalPerCategory(expenses) {
  const totalPerCategory = {};

  expenses.forEach(expense => {
    const category = expense.category;

    if (totalPerCategory.hasOwnProperty(category)) {
      totalPerCategory[category] += expense.price;
    } else {
      totalPerCategory[category] = expense.price;
    }
  });

  return totalPerCategory;
}

const total = calculateTotalPrice(expenses);
const totalPerPeriod = calculateTotalPerPeriod(expenses);
const totalPerCategory = calculateTotalPerCategory(expenses);

totalElement.innerText = total;

for (const period in totalPerPeriod) {
  const amount = totalPerPeriod[period];
  const item = document.createElement('div');
  item.classList.add('sum_period__item');
  item.innerHTML = `
    <div class="date">${period}</div>
    <div class="amount">${amount}</div>
    <div class="currency">PLN</div>
  `;
  periodSummaryItems.appendChild(item);
}

categorySummaryItems.forEach(item => {
  const categoryElement = item.querySelector('.date');
  const amountElement = item.querySelector('.amount');
  const currencyElement = item.querySelector('.currency');

  const category = categoryElement.innerText;
  const amount = totalPerCategory[category];

  amountElement.innerText = amount;
});

windowMatches(windowMedia);
windowMedia.addListener(windowMatches);
window.addEventListener("DOMContentLoaded", function () {
  windowMatches(windowMedia);
});

generatePaginationButtons();
insertItem(currentPage);