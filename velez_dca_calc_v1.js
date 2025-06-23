const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) =>
  new Promise((res) => rl.question(q, (v) => res(v.trim())));

(async () => {
  console.log(
    '\n🧮  Veles DCA · калькулятор безопасного количества ботов\n'
  );

  /* Ввод параметров бота */
  const deposit = +(await ask(
    'Депозит (маржа) на БОТА, USDT        : '
  ));
  const leverage = +(await ask(
    'Плечо (x)                              : '
  ));
  const N = +(await ask('Количество лимит‑ордеров               : '));
  const mgPct = +(await ask(
    '%‑мартингейла по сумме                 : '
  ));
  const coverPct = +(await ask(
    '%‑перекрытия цены                      : '
  ));
  const kInput = await ask(
    'Коэффициент геометр. шага k [1.4]      : '
  );
  const k = kInput === '' ? 1.4 : +kInput;

  /* Ввод баланса */
  const balance = +(await ask(
    '\nСвободный баланс на бирже, USDT        : '
  ));

  /* 1. Веса ордеров */
  const r = 1 + mgPct / 100;
  const w1 = (1 - r) / (1 - Math.pow(r, N));
  const wi = Array.from({ length: N }, (_, i) => w1 * Math.pow(r, i));

  /* 2. Относительные цены */
  const C = coverPct / 100;
  const d1 = (C * (k - 1)) / (Math.pow(k, N) - 1);
  let cum = 0;
  const xi = [];
  for (let i = 0; i < N; i++) {
    cum += d1 * Math.pow(k, i);
    xi.push(1 - cum);
  }

  /* 3. Коэффициент просадки */
  const Qrel = wi.reduce((s, w, i) => s + w / xi[i], 0);
  const xAvg = 1 / Qrel;
  const f = Qrel * (xAvg - xi[N - 1]);

  /* 4. SAFE на одного бота */
  const drawdown = deposit * leverage * f;
  const safePerBot = deposit + drawdown;

  /* 5. Сколько ботов влезет */
  const maxBots = Math.floor(balance / safePerBot);
  const totalSafe = maxBots * safePerBot;
  const totalNom = maxBots * deposit * leverage;
  const rest = balance - totalSafe;

  rl.close();

  /* Вывод */
  console.log('\n──────────────── РЕЗУЛЬТАТ ────────────────');
  console.log(
    `SAFE на одного бота (маржа + просадка) : $${safePerBot.toFixed(
      2
    )}`
  );
  console.log(
    '\nСовет: держите ещё 5‑10 % сверху подушку на случай проливов.\n'
  );

  console.log(
    `Ваш свободный баланс                   : $${balance.toFixed(2)}`
  );
  console.log(`Максимум БЕЗОПАСНЫХ ботов              : ${maxBots}`);
  console.log(
    `Всего потребуется SAFE                 : $${totalSafe.toFixed(
      2
    )}`
  );
  console.log(
    `Суммарный номинал позиций (≈)          : $${totalNom.toFixed(2)}`
  );
  console.log(
    `Остаток свободного баланса             : $${rest.toFixed(2)}`
  );
  console.log('────────────────────────────────────────\n');
})();
