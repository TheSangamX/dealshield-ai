# DealShield AI Privacy Policy

_Last updated: 31 October 2026_

DealShield AI ("DealShield", "we") is a Chrome extension that helps salespeople reply to negotiation emails in Gmail. This policy explains what data the extension and its backend handle, why, and the choices you have.

Contact: contact@sangamgupta.in

## What we collect and why

| Data | When | Why | Stored? |
|---|---|---|---|
| Account email and password | When you create an account | To sign you in (handled by Supabase Auth; we never see your password) | Yes, by Supabase Auth |
| Content of the email thread you have open (subject, sender names and addresses, dates, message text) | Only when you click **Analyze negotiation** | To generate reply strategies | No. The message text is not stored by DealShield |
| Generated strategies, thread subject and the other party's name and email address | After each successful analysis | To show your analysis history | Yes, until you delete it |
| Analysis count per month | After each successful analysis | To apply your plan's monthly limit | Yes |
| Subscription status (plan, renewal date, Razorpay subscription ID) | When you upgrade or your subscription changes | To provide Pro features | Yes |

The extension reads the open Gmail thread locally so it can show it in the popup. Nothing is sent to our servers until you click Analyze.

We do not collect your inbox, contacts, other emails, browsing history or location. We don't use your data for advertising, and we don't sell it.

## Service providers

- **Groq**: processes the email thread text to generate and fact-check the strategies.
- **Supabase**: authentication and database (account, subscription, usage, history).
- **Razorpay**: payment processing for Pro. Card, UPI and bank details go directly to Razorpay; we never receive them.
- **Render**: hosts our backend API.

Each provider handles data under its own privacy policy and only for the purpose above.

## Chrome Web Store Limited Use

DealShield's use of information received from Google APIs and from Gmail web pages adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), including the Limited Use requirements. Data is used only to provide the reply-strategy feature you request, is not transferred to others except the providers above as needed to provide that feature, and is not used for advertising or to determine creditworthiness.

## Retention and deletion

- Delete any analysis from **Recent analyses** in the popup; it is removed from our database immediately.
- To delete your account and all associated data, email contact@sangamgupta.in from your account's address. We delete it within 30 days.
- Cancelling Pro stops future charges; your account and history remain until you delete them.

## Security

Data is sent over HTTPS. Database access is restricted with row-level security so each user can only read their own records, and secret keys are kept on the server.

## Children

DealShield is a business tool and is not directed at children under 16.

## Changes

We will update this page and the "Last updated" date when this policy changes. Material changes will be announced in the extension.
