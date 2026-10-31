# Chrome Web Store listing

Copy for the Developer Dashboard. Fill in the bracketed parts before submitting.

## Store listing

**Name:** DealShield AI

**Summary (max 132 characters):**
Negotiation copilot for Gmail: turn tough pricing emails into a firm offer, a smart trade-off or an urgency reply in seconds.

**Category:** Productivity

**Description:**

DealShield AI sits inside Gmail and helps you answer the emails that decide deals: discount requests, competitor quotes, budget pushback and "sign today" pressure.

Open an email and click Analyze negotiation. DealShield reads the thread and gives you three reply strategies built on negotiation psychology:

• Firm offer: hold your price with warmth and reaffirmed value
• Creative trade-off: concede only in exchange for something valuable, with the give and the get spelled out
• Urgency draft: create momentum using the timing your prospect already gave you

Every draft is fact-checked against the email, so it won't promise deadlines, prices or dates you never offered. Anything only you can confirm appears as a [placeholder]. Insert a draft straight into Gmail's reply box, edit, and send.

Also included:
• Sidebar inside Gmail threads
• History of your recent analyses
• Free plan with monthly analyses; Pro for unlimited

DealShield only reads the thread you have open, and only sends it for analysis when you click Analyze. Privacy policy: https://dealshield-site.onrender.com/privacy.html

**Screenshots (1280×800 or 640×400, at least one):**
1. Popup showing an open email and the Analyze button
2. Strategy tabs with the Trade-off "We give / We get" boxes
3. A draft inserted into Gmail's reply box
4. Sidebar open inside a Gmail thread

**Small promo tile (440×280):** shield logo on indigo (#4F46E5) with "Negotiate better, right in Gmail".

## Privacy practices tab

**Single purpose:**
Help users write negotiation replies to the Gmail email thread they have open, by generating reply strategies on request.

**Permission justifications:**

- `storage`: Saves the user's sign-in session and the "show sidebar" setting locally.
- Host permission `https://mail.google.com/*`: Reads the email thread the user has open, shows the DealShield sidebar in Gmail, and inserts a chosen draft into the reply box.
- Host permission `https://dealshield-ai.onrender.com/*`: Sends the open thread to the DealShield API when the user clicks Analyze, and loads their plan and history.

**Remote code:** No, the extension doesn't use remote code. All JavaScript is bundled in the package.

**Data usage (tick these):**
- Personally identifiable information: email address (account), and names and email addresses in the analysed thread
- Authentication information: sign-in session
- Personal communications: the content of the email thread the user chooses to analyse

**Certifications (all three must be true):**
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://dealshield-site.onrender.com/privacy.html

## Before submitting

- [ ] Backend deployed and `VITE_API_URL` in `extension/.env.production` points at it
- [ ] `npm run package` produced the zip without the localhost warning
- [ ] Supabase Site URL is not localhost
- [ ] Razorpay is in live mode (or Pro upgrade is hidden by leaving the Razorpay keys unset)
- [x] Privacy policy is published (https://dealshield-site.onrender.com/privacy.html)
- [ ] One-time $5 Chrome Web Store developer registration fee paid
