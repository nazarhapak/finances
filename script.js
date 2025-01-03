const fetchExchangeRates = async () => {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/067894e1e27364f287083edc/latest/UAH`);
  const data = await res.json();
  const rateUSD = Number(data.conversion_rates.USD);
  const rateEUR = Number(data.conversion_rates.EUR);
  return { rateUSD, rateEUR };
};

const resizeInput = (input) => {
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.position = "absolute";
  span.style.whiteSpace = "nowrap";
  span.style.font = window.getComputedStyle(input).font;
  span.textContent = input.value || input.placeholder || "0";

  document.body.appendChild(span);
  const width = input.classList.contains("spend") ? Math.max(60, span.offsetWidth + 20) : Math.max(100, span.offsetWidth + 20);
  input.style.width = `${width}px`;
  document.body.removeChild(span);
};

const getDate = (weeks) => {
  const today = new Date();
  const daysToAdd = weeks * 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);

  return targetDate.toISOString().split("T")[0];
};

const getWeeklySpendings = (targetDateStr, totalMoney) => {
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  const msDifference = targetDate - today;
  const weeksDifference = msDifference / (7 * 24 * 60 * 60 * 1000);

  if (weeksDifference <= 0) {
    return 0;
  }

  const moneyPerWeek = totalMoney / weeksDifference;
  return moneyPerWeek.toFixed(2);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch exchange rates
  const { rateUSD, rateEUR } = await fetchExchangeRates();

  // Function that applies to all inputs when they change
  const hadleInput = (input) => {
    const value = input.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    input.value = value;
    resizeInput(input);
    return value;
  };

  // Update total
  const totalEl = document.getElementById("total");
  const updateTotal = () => {
    totalEl.innerHTML = `${formatNumber(uah + usd + eur)} UAH`;
  };

  // Update date
  const updateDate = () => {
    if (spend === 0) {
      date.value = "";
    } else {
      date.value = getDate(Number(uah + usd + eur) / spend);
    }
  };

  // UAH Input
  let uah = Number(localStorage.getItem("uah")) || 0;
  const inputUAH = document.getElementById("uah-amount");
  inputUAH.addEventListener("input", () => {
    const value = hadleInput(inputUAH);
    uah = Number(value);
    localStorage.setItem("uah", uah);
    updateTotal();
    updateDate();
  });

  // USD Input
  let initialUSD = Number(localStorage.getItem("usd")) || 0;
  let usd = Number((initialUSD / rateUSD).toFixed(2)) || 0;
  const inputUSD = document.getElementById("usd-amount");
  const convertedUSD = document.getElementById("usd-converted");
  inputUSD.addEventListener("input", () => {
    const value = hadleInput(inputUSD);
    usd = Number((Number(value) / rateUSD).toFixed(2));
    convertedUSD.innerHTML = `${formatNumber(usd)} UAH`;
    localStorage.setItem("usd", Number(value));
    updateTotal();
    updateDate();
  });

  // EUR Input
  let initialEUR = Number(localStorage.getItem("eur")) || 0;
  let eur = Number((initialEUR / rateEUR).toFixed(2)) || 0;
  const inputEUR = document.getElementById("eur-amount");
  const convertedEUR = document.getElementById("eur-converted");
  inputEUR.addEventListener("input", () => {
    const value = hadleInput(inputEUR);
    eur = Number((Number(value) / rateEUR).toFixed(2));
    convertedEUR.innerHTML = `${formatNumber(eur)} UAH`;
    localStorage.setItem("eur", Number(value));
    updateTotal();
    updateDate();
  });

  // Spend Input
  let spend = Number(localStorage.getItem("spend")) || 0;
  const inputSpend = document.getElementById("spend-amount");
  inputSpend.addEventListener("input", () => {
    const value = hadleInput(inputSpend);
    spend = Number(value);
    localStorage.setItem("spend", spend);
    updateDate();
  });

  // Date input
  const date = document.getElementById("date");
  date.addEventListener("input", () => {
    spend = getWeeklySpendings(date.value, Number(uah + usd + eur));
    inputSpend.value = spend;
    resizeInput(inputSpend);
    localStorage.setItem("spend", spend);
  });

  // Initially set resize all inputs
  inputUAH.value = uah;
  inputUSD.value = initialUSD;
  inputEUR.value = initialEUR;
  inputSpend.value = spend;
  convertedUSD.innerHTML = `${formatNumber(usd)} UAH`;
  convertedEUR.innerHTML = `${formatNumber(eur)} UAH`;
  totalEl.innerHTML = `${formatNumber(uah + usd + eur)} UAH`;

  updateDate();

  const inputsList = document.querySelectorAll(".amount");
  inputsList.forEach((input) => resizeInput(input));
});
