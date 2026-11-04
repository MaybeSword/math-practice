// Builds 4 unique answer choices: 1 correct + 3 believable wrong answers.

// Common-mistake candidates for each operation.
function mistakeCandidates(operation, a, b, answer) {
  switch (operation) {
    case 'addition':
      // Forgot to carry (+/-10), or off by one.
      return [answer - 10, answer + 10, answer + 1, answer - 1];
    case 'subtraction':
      // Borrow mistake (+/-10), added instead, off by one.
      return [answer + 10, answer - 10, answer + 1, answer - 1, a + b];
    case 'multiplication':
      // One factor off by one: (a+-1) x b, a x (b+-1).
      return [(a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1)];
    case 'division':
      return [answer + 1, answer - 1, answer + 2, answer - 2];
    default:
      return [];
  }
}

export function makeChoices(question, rng) {
  const { operation, a, b, answer } = question;
  const wrong = new Set();
  const ok = (n) => Number.isInteger(n) && n >= 0 && n !== answer && !wrong.has(n);

  for (const n of rng.shuffle(mistakeCandidates(operation, a, b, answer))) {
    if (wrong.size < 2 && ok(n)) wrong.add(n);
  }
  // Fill the rest with numbers close to the answer (+/- 1 to 10).
  let guard = 0;
  while (wrong.size < 3 && guard < 200) {
    const n = answer + rng.pick([-1, 1]) * rng.int(1, 10);
    if (ok(n)) wrong.add(n);
    guard++;
  }
  // Last-resort fill (only for tiny answers like 0 or 1).
  for (let n = answer + 1; wrong.size < 3; n++) if (ok(n)) wrong.add(n);

  return rng.shuffle([answer, ...wrong]);
}
