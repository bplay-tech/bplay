export type SaftBlock =
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; text: string };

// Full BPLAY SAFT contract, transcribed from the source DOCX template.
// Placeholders ({{...}}) are substituted at generation time.
export const SAFT_BLOCKS: readonly SaftBlock[] = [
  { kind: "title", text: "BPLAY" },
  { kind: "subtitle", text: "Simple Agreement for Future Tokens (SAFT)" },

  {
    kind: "paragraph",
    text: 'This SIMPLE AGREEMENT FOR FUTURE TOKENS (this "Agreement") is made on {{AGREEMENT_DATE}} between:',
  },
  {
    kind: "paragraph",
    text: '(1) {{RECIPIENT_NAME}}, a national of {{RECIPIENT_NATIONALITY}}, residing at {{RECIPIENT_ADDRESS}}, date of birth: {{RECIPIENT_DATE_OF_BIRTH}}, identification number: {{RECIPIENT_ID_NUMBER}}, email: {{RECIPIENT_EMAIL}} (the "Purchaser"); and',
  },
  {
    kind: "paragraph",
    text: '(2) 3-102-961375, Sociedad de Responsabilidad Limitada, a company incorporated under the laws of the Republic of Costa Rica, with corporate ID number 3-102-961375 (the "Company"),',
  },
  { kind: "paragraph", text: 'each a "Party" and together the "Parties".' },

  { kind: "heading", text: "1. BACKGROUND" },
  {
    kind: "paragraph",
    text: '1.1 The Company is developing a prediction-market project (the "Project"), described at the Project’s information page bplay.tech, and intends to procure the issuance of a utility token (the "Token") to function within the Project.',
  },
  {
    kind: "paragraph",
    text: "1.2 The Company is conducting an early-stage private placement, on a strictly by-invitation basis, of rights to receive Tokens upon a Token Generation Event (defined below). The placement is offered only to a limited number of persons individually identified and approached by the Company on a non-public basis. The Company has not, and will not, advertise or promote the placement to the public in any jurisdiction.",
  },
  {
    kind: "paragraph",
    text: "1.3 The Purchaser has been directly and personally invited by the Company to participate in the placement on a private and non-public basis, and wishes to acquire rights to the Tokens on the terms of this Agreement.",
  },
  {
    kind: "paragraph",
    text: "1.4 This Agreement records the terms of that acquisition. It may be executed by countersignature or by qualified electronic signature.",
  },

  { kind: "heading", text: "2. DEFINITIONS" },
  { kind: "paragraph", text: "In this Agreement, the following terms have the meanings set out below:" },
  {
    kind: "paragraph",
    text: '"Affiliate" means in relation to a person, any entity directly or indirectly controlling, controlled by, or under common control with that person.',
  },
  {
    kind: "paragraph",
    text: '"Business Day" means any day other than a Saturday, Sunday or public holiday in the Republic of Costa Rica.',
  },
  {
    kind: "paragraph",
    text: '"Deadline Date" means the date falling eighteen (18) months after the date of this Agreement, as may be extended in accordance with clause 6.',
  },
  {
    kind: "paragraph",
    text: '"Issuer" means the Company or such other entity (including any Affiliate or designated token-issuance vehicle) as the Company may designate to issue the Tokens.',
  },
  {
    kind: "paragraph",
    text: '"Purchase Price" means {{PURCHASE_AMOUNT}}, being the amount paid by the Purchaser in consideration for the Token Allocation.',
  },
  {
    kind: "paragraph",
    text: '"Restricted Jurisdiction" means any jurisdiction in which the offer, sale, holding or use of the rights under this Agreement or of the Tokens would constitute a violation of applicable law by the Company, including any jurisdiction subject to comprehensive sanctions administered by the United Nations, the European Union, the United Kingdom or the United States, and any jurisdiction notified by the Company to the Purchaser in writing.',
  },
  {
    kind: "paragraph",
    text: '"Token" means the digital token to be issued by the Issuer in connection with the Project, with such technical specifications, network, name, symbol and tokenomics as the Company may determine in accordance with clause 3.2.',
  },
  {
    kind: "paragraph",
    text: '"Token Allocation" means {{TOKEN_AMOUNT}} Tokens, being the number of Tokens to which the Purchaser is entitled under this Agreement (subject to any adjustment under clause 3.2).',
  },
  {
    kind: "paragraph",
    text: '"Token Generation Event" or "TGE" means the date on which the Tokens are first generated and made available for delivery and use as contemplated under the Project’s token economy.',
  },
  {
    kind: "paragraph",
    text: '"Wallet" means a self-custodial blockchain wallet on the relevant Token network, the address of which is notified by the Purchaser to the Company in accordance with clause 5.',
  },

  { kind: "heading", text: "3. PURCHASE OF FUTURE TOKENS" },
  {
    kind: "paragraph",
    text: "3.1 Subject to and conditional upon (i) receipt by the Company of the Purchase Price in cleared funds and (ii) the Purchaser’s compliance with clauses 9 and 10, the Issuer shall deliver the Token Allocation to the Purchaser at, or as soon as reasonably practicable after, the Token Generation Event.",
  },
  {
    kind: "paragraph",
    text: "3.2 The Token Allocation has been calculated by reference to a price of {{PRICE_PER_TOKEN}} per Token. Prior to the Token Generation Event, the Company may, acting in good faith, modify (i) the technical specifications, network, name, symbol and tokenomics of the Tokens and (ii) the Token Allocation, in each case to give effect to any token split, denomination change, network migration, supply or vesting restructuring, or similar adjustment, provided that the economic value of the Token Allocation to the Purchaser, measured immediately before and after the adjustment, is not materially diminished.",
  },
  {
    kind: "paragraph",
    text: "3.3 The Company reserves the right, in its sole discretion, to refuse this Agreement (in which case the Purchase Price shall be refunded in full, without interest, less any non-recoverable payment processing fees actually incurred) if the Purchaser fails to satisfy the Company’s onboarding, KYC, AML or sanctions checks, or if the Company reasonably concludes that completion of this Agreement with the Purchaser would or could expose the Company or any Affiliate to material legal, regulatory or reputational risk.",
  },
  {
    kind: "paragraph",
    text: "3.4 Company termination for convenience. At any time prior to the Token Generation Event, the Company may terminate this Agreement for any reason by giving written notice to the Purchaser, in which case the Company shall refund the Purchase Price to the Purchaser (without interest, and less any non-recoverable payment processing fees actually incurred) within thirty (30) days. Termination under this clause 3.4 shall not give rise to any liability of the Company beyond the refund of the Purchase Price.",
  },

  { kind: "heading", text: "4. PAYMENT" },
  {
    kind: "paragraph",
    text: "4.1 The Purchaser has paid, or shall pay, the Purchase Price in the currency and through the payment channel specified by the Company. Payment is deemed made when received by the Company in cleared funds (or, in the case of on-chain payment, when irreversibly confirmed in the Company’s designated wallet).",
  },
  {
    kind: "paragraph",
    text: "4.2 All taxes, duties, levies and charges payable on the receipt, holding or use of the Tokens, or on any payment under this Agreement, are the sole responsibility of the Purchaser. The Purchase Price is stated gross of any such amounts and shall not be grossed up.",
  },

  { kind: "heading", text: "5. TOKEN GENERATION EVENT AND DELIVERY" },
  {
    kind: "paragraph",
    text: "5.1 The Company shall use commercially reasonable efforts to procure that the Token Generation Event occurs on or before the Deadline Date. The Company gives no representation, warranty or guarantee that the Token Generation Event will occur by any particular date or at all.",
  },
  {
    kind: "paragraph",
    text: "5.2 The Company shall give the Purchaser not less than seven (7) calendar days’ written or electronic notice of the scheduled date of the Token Generation Event, together with reasonable instructions for the Purchaser to confirm or update its Wallet address.",
  },
  {
    kind: "paragraph",
    text: "5.3 Delivery of the Token Allocation shall be made to the Wallet notified by the Purchaser. The Purchaser is solely responsible for the correctness and security of its Wallet address and the means of access to it. Delivery to the notified Wallet address (whether by direct on-chain transfer, claim, airdrop or smart-contract distribution) shall constitute full and final discharge of the Issuer’s and the Company’s delivery obligations under this Agreement.",
  },
  {
    kind: "paragraph",
    text: "5.4 If the Purchaser fails to provide a valid Wallet address within ninety (90) days of being requested to do so, the Company may hold the Token Allocation in custody for the Purchaser, at the Purchaser’s risk and without obligation to invest, earn yield on, or preserve the value of those Tokens, for a further twelve (12) months, after which the unclaimed Tokens shall be forfeited and the Purchaser shall have no further claim against the Company or the Issuer in respect of them.",
  },

  { kind: "heading", text: "6. DELAY; CONTINUATION; PURCHASER OPT-OUT" },
  {
    kind: "paragraph",
    text: "6.1 If the Token Generation Event has not occurred on or before the Deadline Date, this Agreement shall automatically continue in force and the Deadline Date shall be extended by twelve (12) months, and shall continue to be so extended for successive twelve-month periods thereafter, in each case without any further action by either Party.",
  },
  {
    kind: "paragraph",
    text: "6.2 Notwithstanding clause 6.1, the Purchaser may, by written notice to the Company given within ninety (90) days following any Deadline Date that has passed without the occurrence of the Token Generation Event, elect to terminate this Agreement and receive a refund of the Purchase Price (without interest, and less any non-recoverable payment processing fees actually incurred). If the Purchaser does not give such notice within that ninety-day window, the Purchaser is deemed to have agreed to the automatic continuation under clause 6.1 and waives, in respect of that Deadline Date, any right to terminate or claim refund.",
  },
  {
    kind: "paragraph",
    text: "6.3 Refunds following a valid notice under clause 6.2 shall be paid within thirty (30) days of receipt of the notice, to the source of payment (or to another account or wallet nominated by the Purchaser in writing).",
  },
  {
    kind: "paragraph",
    text: "6.4 The remedies set out in this clause 6 and in clause 3.4 are the Purchaser’s sole and exclusive remedies in respect of any delay in, or failure to occur of, the Token Generation Event, save in the case of the Company’s fraud or wilful default.",
  },

  { kind: "heading", text: "7. NATURE OF THE TOKEN" },
  {
    kind: "paragraph",
    text: "7.1 The Token is intended to function as a utility token within the Project. The Token is not intended to confer, and the Purchaser shall not be entitled to claim:",
  },
  { kind: "list", text: "(a) any equity, share, ownership interest or profit-share in the Company, the Issuer or any Affiliate;" },
  { kind: "list", text: "(b) any right to dividends, distributions or proceeds from the Company, the Issuer or any Affiliate;" },
  { kind: "list", text: "(c) any voting or governance rights in respect of the Company, the Issuer or any Affiliate; or" },
  { kind: "list", text: "(d) any debt claim against, or other financial interest in, the Company, the Issuer or any Affiliate." },
  {
    kind: "paragraph",
    text: '7.2 The Purchaser acknowledges that the Token is not intended to be a "security", "financial instrument", "investment", "collective investment scheme", "asset-referenced token", "e-money token", or similar regulated product under any law applicable to the Purchaser, and that the Purchaser is not acquiring the Token (or rights to the Token under this Agreement) for investment, speculation or resale purposes.',
  },
  {
    kind: "paragraph",
    text: "7.3 Until delivery to the Wallet in accordance with clause 5, the Purchaser has no proprietary, beneficial or possessory interest in any Token, and the Purchaser’s rights under this Agreement are purely contractual.",
  },
  {
    kind: "paragraph",
    text: "7.4 The Purchaser irrevocably waives any right it may have to seek specific performance of the Company’s or the Issuer’s obligation to deliver the Tokens. The Purchaser’s remedies in respect of any breach of those obligations are limited to the refund mechanics in clauses 3.3, 3.4 and 6 and, otherwise, to monetary damages subject to clause 12.",
  },

  { kind: "heading", text: "8. RISK DISCLOSURES; PURCHASER ACKNOWLEDGEMENTS" },
  {
    kind: "paragraph",
    text: "8.1 The Purchaser acknowledges and accepts that the purchase of rights to future tokens, and the holding and use of tokens generally, involve significant risks, including:",
  },
  { kind: "list", text: "(a) technological risks (smart-contract bugs or exploits, network failures, key loss);" },
  { kind: "list", text: "(b) market risks (extreme price volatility, illiquidity, total loss of value);" },
  { kind: "list", text: "(c) regulatory risks (changes in law adversely affecting tokens, the Project, the Company or the Issuer, including the possibility of the Project being prohibited, restricted or required to restructure);" },
  { kind: "list", text: "(d) execution risks (delays in or failure of the Project’s development, launch or commercial success); and" },
  { kind: "list", text: "(e) competitive risks (other projects or platforms displacing the Project)." },
  { kind: "paragraph", text: "8.2 The Purchaser further acknowledges:" },
  { kind: "list", text: "(a) that the Tokens may have no market value at any time and may never be listed on any exchange;" },
  { kind: "list", text: "(b) that the Company makes no representation, warranty or guarantee as to the future utility, functionality, value, listing, liquidity or marketability of the Tokens;" },
  { kind: "list", text: "(c) that the Company may, in accordance with clause 3.2, modify the technical specifications, name, symbol, network or tokenomics of the Tokens prior to the Token Generation Event;" },
  { kind: "list", text: "(d) that the regulatory treatment of tokens is uncertain in many jurisdictions and may change adversely after the date of this Agreement; and" },
  { kind: "list", text: "(e) that the Purchaser has carried out, or has elected not to carry out, its own due diligence on the Project, the Company and the Tokens, and is not relying on any oral or written statement made by the Company, the Issuer or any Affiliate (other than the express statements made in this Agreement)." },
  {
    kind: "paragraph",
    text: "8.3 The Purchaser confirms that the Purchase Price represents funds that the Purchaser can afford to lose in their entirety without material adverse effect on the Purchaser’s financial position.",
  },

  { kind: "heading", text: "9. ELIGIBILITY; REPRESENTATIONS OF THE PURCHASER" },
  {
    kind: "paragraph",
    text: "9.1 The Purchaser represents and warrants to the Company that, on the date of this Agreement and at the Token Generation Event:",
  },
  { kind: "list", text: "(a) the Purchaser is at least eighteen (18) years of age and has full legal capacity to enter into this Agreement;" },
  { kind: "list", text: "(b) the Purchaser is not a citizen of, resident or domiciled in, or physically located in, any Restricted Jurisdiction;" },
  { kind: "list", text: "(c) the Purchaser is not a U.S. person within the meaning of Regulation S under the U.S. Securities Act of 1933, as amended, and is not acquiring the rights under this Agreement for the account or benefit of any U.S. person;" },
  { kind: "list", text: "(d) the Purchaser is not the subject of any sanctions administered by the United Nations, the European Union, the United Kingdom, the United States Office of Foreign Assets Control or any other applicable sanctions authority, and is not acting on behalf of any such person;" },
  { kind: "list", text: "(e) the funds used to pay the Purchase Price are not derived from, and are not being applied for, any unlawful activity; the Purchaser is purchasing the rights under this Agreement on its own account and not on behalf of any undisclosed third party;" },
  { kind: "list", text: "(f) the Purchaser was directly and personally invited by the Company or its representatives to enter into this Agreement on a private and non-public basis, and was not solicited by, and has not relied on, any general advertisement, public marketing, broadcast communication or other form of public solicitation;" },
  { kind: "list", text: "(g) the Purchaser has sufficient knowledge and experience in financial, business and digital-asset matters to be capable of evaluating the merits and risks of entering into this Agreement and acquiring the Tokens, and is able to bear the economic risk of total loss of the Purchase Price;" },
  { kind: "list", text: "(h) the Purchaser is acquiring the rights to the Tokens for their utility within the Project and not principally for the purposes of resale, distribution or speculation;" },
  { kind: "list", text: "(i) all information provided by the Purchaser to the Company (including the personal information at the head of this Agreement and any information provided in connection with KYC) is accurate, complete and not misleading; and" },
  { kind: "list", text: "(j) the Purchaser has read and understood this Agreement, including the risk disclosures in clause 8, and has had the opportunity to seek independent legal, tax and financial advice." },
  {
    kind: "paragraph",
    text: "9.2 The Purchaser shall promptly notify the Company in writing if any representation in clause 9.1 ceases to be true at any time before the Token Generation Event.",
  },

  { kind: "heading", text: "10. KYC, AML AND SANCTIONS" },
  {
    kind: "paragraph",
    text: "10.1 The Purchaser shall provide such identification, source-of-funds, source-of-wealth and other information as the Company or any of its service providers may reasonably request for the purposes of KYC, AML or sanctions compliance, both at the date of this Agreement and at any time prior to the Token Generation Event.",
  },
  {
    kind: "paragraph",
    text: "10.2 The Company may suspend or terminate this Agreement and refund the Purchase Price (less any non-recoverable payment processing fees actually incurred) if the Purchaser fails to provide such information within a reasonable time, or if any information provided would, in the Company’s reasonable judgement, prevent the Company or the Issuer from performing this Agreement in compliance with applicable law.",
  },

  { kind: "heading", text: "11. TRANSFER; COOPERATION WITH RESTRUCTURING" },
  {
    kind: "paragraph",
    text: "11.1 The Purchaser may not assign, transfer, pledge, declare a trust over, or grant any security interest over this Agreement or any rights under it (including the right to receive the Token Allocation) without the prior written consent of the Company (which the Company may withhold in its sole discretion). Any purported transfer in breach of this clause is void.",
  },
  {
    kind: "paragraph",
    text: '11.2 The Company may assign or transfer this Agreement, in whole or in part, to any Affiliate or to a successor by way of merger, reorganisation, sale of assets, re-domiciliation or restructuring (including any "flip" to a new token-issuance vehicle), provided that the assignee or successor expressly assumes the Company’s obligations under this Agreement in writing.',
  },
  {
    kind: "paragraph",
    text: "11.3 The Purchaser shall, at the Company’s reasonable request and without further consideration, promptly execute and deliver such replacement agreements, novations, transfers, subscription documents, KYC refresh confirmations and other documents as the Company reasonably requires to give effect to any assignment, restructuring or re-domiciliation contemplated by clause 11.2, provided that the Purchaser’s economic position under the resulting arrangements is not materially diminished compared with this Agreement.",
  },

  { kind: "heading", text: "12. LIMITATION OF LIABILITY" },
  {
    kind: "paragraph",
    text: "12.1 Nothing in this Agreement excludes or limits any liability that cannot be excluded or limited by applicable law (including liability for fraud or wilful default).",
  },
  {
    kind: "paragraph",
    text: "12.2 Subject to clause 12.1, the aggregate liability of the Company (and of the Issuer and any Affiliate) under or in connection with this Agreement, whether arising in contract, tort, restitution, breach of statutory duty or otherwise, shall not exceed the Purchase Price actually received by the Company from the Purchaser.",
  },
  {
    kind: "paragraph",
    text: "12.3 Subject to clause 12.1, neither the Company nor the Issuer nor any Affiliate shall be liable for any loss of profit, loss of opportunity, loss of business, loss of value of any Token or other asset, or any indirect or consequential loss, however arising.",
  },
  {
    kind: "paragraph",
    text: "12.4 Any claim arising out of or in connection with this Agreement must be commenced within twelve (12) months after the claimant became, or ought reasonably to have become, aware of the facts giving rise to the claim. Any claim not so commenced is irrevocably waived and time-barred as between the Parties.",
  },

  { kind: "heading", text: "13. CONFIDENTIALITY; DATA PROTECTION" },
  {
    kind: "paragraph",
    text: "13.1 Each Party shall keep confidential, and use only for the purposes of this Agreement, any non-public information received from the other Party in connection with this Agreement, including the existence and terms of this Agreement, save for disclosure to professional advisers or service providers bound by equivalent duties, or where required by applicable law.",
  },
  {
    kind: "paragraph",
    text: "13.2 The Company shall process the Purchaser’s personal data in accordance with its privacy notice as notified to the Purchaser from time to time, and the Purchaser acknowledges and agrees to such processing.",
  },

  { kind: "heading", text: "14. FORCE MAJEURE" },
  {
    kind: "paragraph",
    text: "14.1 Neither Party shall be liable for any delay or failure in performance (other than the Purchaser’s obligation to pay the Purchase Price) caused by circumstances beyond its reasonable control, including acts of God, war, terrorism, civil unrest, governmental, regulatory or judicial action, sanctions, cyber-attack, exchange outages or material failure of any third-party network or infrastructure. The affected Party shall promptly notify the other Party and use reasonable efforts to mitigate the impact. If a force-majeure event continues for more than twelve (12) consecutive months, either Party may terminate this Agreement by written notice, in which case the Purchase Price shall be refunded as if the Purchaser had served a notice under clause 6.2.",
  },

  { kind: "heading", text: "15. GOVERNING LAW; JURISDICTION; WAIVERS" },
  {
    kind: "paragraph",
    text: "15.1 This Agreement is governed by, and shall be construed in accordance with, the laws of the Republic of Costa Rica, without regard to its conflict-of-laws rules.",
  },
  {
    kind: "paragraph",
    text: "15.2 The Parties submit to the exclusive jurisdiction of the competent courts of the First Judicial Circuit of San José, Republic of Costa Rica, for the resolution of any dispute arising out of or in connection with this Agreement.",
  },
  {
    kind: "paragraph",
    text: "15.3 Each Party irrevocably waives, to the maximum extent permitted by applicable law, (i) any right to bring or participate in any class, collective, consolidated or representative proceeding against the other Party in connection with this Agreement, and (ii) any right to have any dispute under this Agreement determined together with the dispute of any other Purchaser or third party. All disputes between the Parties shall be resolved on an individual basis.",
  },

  { kind: "heading", text: "16. EXECUTION; NOTICES" },
  {
    kind: "paragraph",
    text: "16.1 This Agreement may be executed by handwritten signature, by qualified electronic signature, or by any other means of electronic acceptance agreed between the Parties (including by countersignature exchanged by email). The Parties waive any right to challenge the validity, admissibility or enforceability of this Agreement on the ground that it was executed by electronic means.",
  },
  {
    kind: "paragraph",
    text: "16.2 Notices to the Company shall be sent by email to legal@bplay.tech (or such other address as the Company may notify from time to time). Notices to the Purchaser shall be sent by email to the email address at the head of this Agreement. Notices are deemed received on the next Business Day following transmission, absent a bounce-back or non-delivery message.",
  },

  { kind: "heading", text: "17. MISCELLANEOUS" },
  {
    kind: "paragraph",
    text: "17.1 Entire agreement. This Agreement constitutes the entire agreement between the Parties on its subject matter and supersedes all prior discussions, understandings and agreements, whether oral or written. Each Party confirms that it has not relied on any statement, representation, assurance or warranty other than as expressly set out in this Agreement.",
  },
  { kind: "paragraph", text: "17.2 Amendments. No amendment of this Agreement is effective unless agreed in writing by both Parties." },
  {
    kind: "paragraph",
    text: "17.3 Severability. If any provision of this Agreement is held invalid or unenforceable, the remaining provisions remain in force, and the Parties shall negotiate in good faith a replacement provision most closely reflecting their original intent.",
  },
  {
    kind: "paragraph",
    text: "17.4 No partnership. Nothing in this Agreement creates a partnership, joint venture, employment or agency relationship between the Parties.",
  },
  {
    kind: "paragraph",
    text: "17.5 Third-party rights. A person who is not a Party has no right to enforce any provision of this Agreement, save that any Affiliate of the Company and the Issuer may enforce any provision of this Agreement expressed to be for their benefit.",
  },
  {
    kind: "paragraph",
    text: "17.6 Survival. The provisions of clauses 7 (Nature of the Token), 8 (Risk Disclosures), 12 (Limitation of Liability), 13 (Confidentiality), 15 (Governing Law; Jurisdiction; Waivers) and this clause 17, together with any other provision that by its nature is intended to survive, shall survive any termination or expiry of this Agreement.",
  },
  {
    kind: "paragraph",
    text: "17.7 Counterparts. This Agreement may be executed in counterparts and by electronic means, each of which is an original and all of which together constitute one and the same instrument.",
  },
];
