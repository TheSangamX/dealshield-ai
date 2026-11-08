# DealShield AI Privacy Policy

_Last updated: 8 November 2026_

DealShield AI ("DealShield", "we", "us") is a Chrome extension, operated by Sangam Gupta, that helps salespeople reply to negotiation emails in Gmail. This policy explains what user data we collect, how we use, handle and store it, who we share it with, and the choices you have.

Contact: contact@sangamgupta.in

## 1. Data we collect

| Data | When it is collected | Stored by us? |
|---|---|---|
| **Account data:** your email address and password | When you create an account | Email: yes. Password: held in hashed form by Supabase Auth; we never see it |
| **Email thread content:** subject, names and email addresses of the people on the thread, dates and message text of the Gmail thread you have open | Only when you click **Analyze negotiation** | Message text: no. Subject and the other person's name and email: yes, as analysis history |
| **Generated content:** the reply strategies and drafts created for you | After each successful analysis | Yes, as analysis history |
| **Usage data:** the number and time of your analyses | After each successful analysis | Yes |
| **Subscription data:** plan, status, renewal date, Razorpay subscription ID | When you upgrade or your subscription changes | Yes |
| **Technical data:** IP address and request details (such as time and URL path) | When the extension contacts our servers | Short-term, in our hosting and authentication providers' logs |

Payment details (card, UPI, bank) are entered directly on Razorpay's page. We never receive them.

We do **not** collect your inbox, other emails, contacts, attachments, browsing history, location or any data from other websites.

## 2. How we collect data

- You give us your account details when you sign up.
- The extension reads the Gmail thread you have open inside your browser so it can show it to you. This stays on your device.
- The thread is sent to our servers only after you have agreed to the in-extension data notice **and** clicked **Analyze negotiation**.

## 3. How we use data

We use data only to provide DealShield's single purpose, helping you reply to negotiation emails:

- Email thread content: to generate and fact-check reply strategies.
- Analysis history: so you can reopen past results.
- Account, usage and subscription data: to sign you in, apply your plan's monthly limit and provide Pro features.
- Technical data: to run the service securely and prevent abuse.

We do not use your data for advertising, to build profiles, to train AI models, or to determine creditworthiness. We do not sell your data.

## 4. How we handle and protect data

- All data is transmitted over encrypted HTTPS connections.
- Message text is processed in memory to produce your drafts and is then discarded. It is not written to our database or our logs.
- Database access is restricted with row-level security, so each user can only read their own records.
- Secret keys are kept on the server and are never included in the extension.
- Your sign-in session and extension settings are kept in your browser's local extension storage.

## 5. How we store data and for how long

Our database is hosted by Supabase in the European Union and our API by Render in the United States, so your data may be processed outside your country.

| Data | Kept for |
|---|---|
| Analysis history | Until you delete it, or delete your account |
| Account and usage data | Until you delete your account |
| Subscription data | Until you delete your account, and longer where tax or accounting law requires |
| Technical logs | Short-term, according to our providers' log retention |

## 6. Who we share data with

We share data only with the service providers below, and only as needed to run DealShield. We do not share data with anyone else unless the law requires it.

| Party | What they receive | Why | Privacy policy |
|---|---|---|---|
| **Groq** | Email thread text, subject, sender names and addresses, dates | To generate and fact-check drafts | https://groq.com/privacy-policy |
| **Supabase** | Account, history, usage and subscription data | Authentication and database | https://supabase.com/privacy |
| **Render** | All data passing through our API, and technical data | Hosting our backend | https://render.com/privacy |
| **Razorpay** | Your DealShield user ID and account email, plus the payment details you enter with them | Processing Pro payments | https://razorpay.com/privacy/ |

## 7. Your consent and choices

- **Consent:** DealShield shows a data notice in the extension and collects nothing until you click **I agree and continue**.
- **No analysis, no sending:** you decide per email. Nothing is sent unless you click Analyze.
- **Delete an analysis:** use the trash icon in **Recent analyses**. It is removed from our database immediately.
- **Delete your account and data, or withdraw consent:** email contact@sangamgupta.in from your account's address. We delete your data within 30 days. You can also uninstall the extension at any time, which removes the data stored in your browser.
- **Access or correction:** email us and we will respond within 30 days.
- **Cancel Pro:** click Cancel in the popup. Future charges stop and your account remains until you delete it.

## 8. Chrome Web Store Limited Use

DealShield's use of information received from Gmail web pages adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), including the Limited Use requirements. Data is used only to provide the reply-strategy feature you request, is transferred only to the providers listed above as needed to provide that feature, is not used for advertising, is not sold, and is not used to determine creditworthiness.

## 9. Children

DealShield is a business tool and is not directed at children under 16.

## 10. Changes to this policy

We will update this page and the "Last updated" date when this policy changes. Material changes will be announced in the extension, and we will ask for your consent again where required.
