const balances = require("../Data/data");

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getBalance(address) {
  return balances[address] || 0;
}

function send(sender, recipient, amount) {
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    throw new Error("Not enough funds!");
  }

  balances[sender] -= amount;
  balances[recipient] += amount;

  return balances[sender];
}

module.exports = { getBalance, send };
