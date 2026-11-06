// Section 7.3.
export const timeline = [
  { time: "03:12", text: "A stablecoin starts to lose its peg." },
  { time: "03:14", text: "The operator on call exits with one signature, and the funds return to the chest." },
  { time: "03:40", text: "Anything new waits for three approvals." },
];

export const thresholdComparison = [
  { setup: "A classic 2-of-3 multisig", exit: 2, enter: 2 },
  { setup: "Baradd's example policy", exit: 1, enter: 3 },
];
