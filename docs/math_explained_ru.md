# Математика SAFE‑калькулятора

> Этот файл описывает формулы так, чтобы можно было вручную перепроверить любой шаг
> и при желании переписать скрипт на другом языке.

## 1. Делим депозит на ордера

Пусть **M₀** — депозит (маржа) одного бота, **N** — число лимит‑ордеров,
**g** % — «мартингейл», т.е. насколько % каждый следующий ордер крупнее предыдущего.

- Коэффициент прогрессии:
  `r = 1 + g / 100`
- Доля (вес) первого ордера:
  `w₁ = (1 − r) / (1 − rᴺ)`
- Доли всех ордеров:
  `wᵢ = w₁ · r⁽ᶦ − ¹⁾`,   `i = 1…N`
- Проверка: Σ wᵢ = 1.

## 2. Где ставим цены

Перекрытие цены — **C** % (0 ≤ C ≤ 100).
Коэффициент логарифмического шага **k** (≥ 1).

```
d₁  =  C · (k − 1) / (kᴺ − 1)      # относительный первый отступ
xi  =  1 − d₁ · (kⁱ − 1) / (k − 1)   # xi = Pi / P0
```

`xN = 1 − C` — последняя точка ровно на C % ниже входа.

## 3. Относительный объём и средняя цена

```
Qrel = Σ ( wᵢ / xᵢ )
ȳ    = 1 / Qrel                  # средняя цена / P0
```

## 4. Коэффициент просадки

```
f = Qrel · (ȳ − xN)              # 0 … 0.2 (обычно)
```

## 5. Абсолютные величины (USDT)

| Формула             | Что означает                                     |
| ------------------- | ------------------------------------------------ |
| `U = M₀ · L · f`    | будущий бумажный убыток, если цена коснётся xN   |
| `SAFE = M₀ + U`     | минимальная сумма, которую надо держать на счёте |
| `NOTIONAL = M₀ · L` | полный номинал позиции после заполнения сетки    |

## 6. Сколько ботов выдержит баланс

```
MaxBots = ⌊  FreeBalance / SAFE  ⌋
```

Так как все формулы используют **только относительные уровни xᵢ**,
стартовую цену P₀ можно не знать вовсе — она "сокращается" на каждом шаге.
