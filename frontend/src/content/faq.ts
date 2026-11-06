// Transcribed from the spec, section 6 ("Objections and answers").
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Why not a normal multisig?",
    answer:
      "Stellar's classic thresholds are set per operation category, so leaving and entering a position cost the same signatures.",
  },
  {
    question: "Why not a custody provider's policy engine?",
    answer:
      "Those engines run on the vendor's infrastructure and are mature operationally. Baradd's rules are enforced by your account's contract. Choose by what you want to trust.",
  },
  {
    question: "OpenZeppelin already has policies",
    answer:
      "Yes, and Baradd is built on them. Per its v0.7.0 audit, OpenZeppelin's context rules scope by contract address. Baradd adds function and argument conditions and the entry/exit structure. Libraries such as Perch and Mandate also exist, and Baradd is meant to sit alongside them.",
  },
  {
    question: "Is it audited?",
    answer:
      "No. An external audit is planned. The code is open and the page lists what is tested today.",
  },
  {
    question: "What if an operator key is stolen?",
    answer:
      "The key can only call listed exit functions and only send funds back to the chest. It cannot enter a position, approve a token, or change the rules. It can still force exits, which has a cost; caps and delays are on the roadmap.",
  },
  {
    question: "Which wallets can sign?",
    answer:
      "A Stellar account you already use can be a delegated signer; the Freighter extension is the first target. Client support for smart accounts is still maturing.",
  },
  {
    question: "Is it on mainnet?",
    answer: "No. A testnet demo is in progress.",
  },
  {
    question: "Which protocols are supported?",
    answer:
      "None yet. Presets are on the roadmap, and protocols will be named only once verified.",
  },
  {
    question: "What does it cost?",
    answer: "It is open source under the MIT license.",
  },
];
