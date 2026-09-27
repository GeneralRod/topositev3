const state = {
  status: {},
};
for (let i = 0; i < 200; i++) {
  state.status[`city${i}`] = i % 2 === 0 ? 'unanswered' : 'answered';
}

console.time('baseline (Object.values().filter().length)');
for (let i = 0; i < 100000; i++) {
  const answeredCount = Object.values(state.status).filter((s) => s !== 'unanswered').length;
}
console.timeEnd('baseline (Object.values().filter().length)');

console.time('optimized (for...in loop)');
for (let i = 0; i < 100000; i++) {
  let answeredCount = 0;
  for (const key in state.status) {
    if (state.status[key] !== 'unanswered') answeredCount++;
  }
}
console.timeEnd('optimized (for...in loop)');
