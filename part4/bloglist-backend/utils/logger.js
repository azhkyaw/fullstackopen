const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  console.error(...params);
};
const test = { info, error };
module.exports = test;
