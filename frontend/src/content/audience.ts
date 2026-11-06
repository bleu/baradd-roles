// These are example uses, not customer or adoption claims.
export interface AudienceCard {
  title: string;
  situation: string;
  rule: string;
}

export const audienceCards: AudienceCard[] = [
  {
    title: "Asset managers",
    situation: "You run positions across several Stellar DeFi protocols for a fund or a client treasury.",
    rule: "One operator can pull out of a losing position immediately; adding a new position needs the rest of the desk to sign off.",
  },
  {
    title: "DAO treasuries",
    situation: "Your treasury holds tokens deployed into lending or liquidity protocols, decided by governance.",
    rule: "A delegate on call can retreat from a protocol in trouble with one key; entering a new protocol still needs the multisig the DAO already trusts.",
  },
  {
    title: "RWA issuers",
    situation: "You manage on-chain reserves backing a tokenized asset and need to move fast if a counterpart protocol is compromised.",
    rule: "Reserve funds can exit to the issuer's own treasury with one signature; nothing new can be approved without the full signer set.",
  },
];
