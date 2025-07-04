
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('toggle-theme');
  const body = document.body;

  const account = document.getElementById('account');
  const riskPercent = document.getElementById('riskPercent');
  const leverage = document.getElementById('leverage');
  const entryPrice = document.getElementById('entryPrice');
  const manualStop = document.getElementById('manualStop');
  const atrValue = document.getElementById('atrValue');
  const atrMultiplier = document.getElementById('atrMultiplier');
  const fixedStop = document.getElementById('fixedStop');
  const rrr = document.getElementById('rrr');
  const calculateBtn = document.getElementById('calculate');
  const resultsDiv = document.getElementById('results');
  const historyTable = document.getElementById('tradeHistory').querySelector('tbody');

  // THEME
  themeBtn.addEventListener('click', () => {
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);

  // CALCULATION
  calculateBtn.addEventListener('click', () => {
    const acc = parseFloat(account.value);
    const risk = parseFloat(riskPercent.value);
    const lev = parseFloat(leverage.value || 1);
    const entry = parseFloat(entryPrice.value);

    const stopFixed = parseFloat(fixedStop.value);
    const atr = parseFloat(atrValue.value);
    const atrMult = parseFloat(atrMultiplier.value);
    const manual = parseFloat(manualStop.value);
    const ratio = parseFloat(rrr.value);

    if (!acc || !risk || !entry || !lev) {
      resultsDiv.innerHTML = "<p>Please fill in all required fields.</p>";
      return;
    }

    const riskDollar = acc * (risk / 100);

    let stopDollar = 0;
    if (!isNaN(stopFixed)) {
      stopDollar = stopFixed;
    } else if (!isNaN(atr) && !isNaN(atrMult)) {
      stopDollar = atr * atrMult;
    } else if (!isNaN(manual)) {
      stopDollar = (manual / 100) * entry;
    } else {
      resultsDiv.innerHTML = "<p>Please enter a stop method (Manual %, ATR, or Fixed $).</p>";
      return;
    }

    const stopPct = (stopDollar / entry) * 100;
    const posSize = riskDollar / stopDollar;
    const posValue = posSize * entry;
    const margin = posValue / lev;
    const target = ratio ? riskDollar * ratio : null;

    resultsDiv.innerHTML = `
      <p><strong>Risk ($):</strong> $${riskDollar.toFixed(2)}</p>
      <p><strong>Stop:</strong> $${stopDollar.toFixed(2)} (${stopPct.toFixed(2)}%)</p>
      <p><strong>Position Size:</strong> ${posSize.toFixed(2)} units</p>
      <p><strong>Position Value:</strong> $${posValue.toFixed(2)}</p>
      <p><strong>Margin Required:</strong> $${margin.toFixed(2)}</p>
      ${target ? `<p><strong>Take Profit Target:</strong> $${target.toFixed(2)}</p>` : ''}
      <button id="logTrade">Log Trade</button>
    `;

    document.getElementById('logTrade').addEventListener('click', () => {
      const pl = prompt("Enter profit or loss ($):", "0");
      if (pl === null) return;
      const trade = {
        date: new Date().toLocaleString(),
        risk: riskDollar.toFixed(2),
        size: posValue.toFixed(2),
        result: parseFloat(pl).toFixed(2)
      };
      const history = JSON.parse(localStorage.getItem("jorank_history") || "[]");
      history.unshift(trade);
      localStorage.setItem("jorank_history", JSON.stringify(history));
      updateHistory();
    });
  });

  function updateHistory() {
    const history = JSON.parse(localStorage.getItem("jorank_history") || "[]");
    historyTable.innerHTML = "";
    history.forEach(t => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${t.date}</td><td>$${t.risk}</td><td>$${t.size}</td><td>$${t.result}</td>`;
      historyTable.appendChild(row);
    });
  }

  updateHistory();
});
