<div align="center">

# 🏠 Walls Don't Lie

### Proof on every wall. Deposit back in your hands.

*Landlord keeping your deposit? Tenant dodging repairs?*
*Deposits held in a smart contract. Settled by photo proof, not phone calls.*

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-walls--dont--lie.vercel.app-e91e8c?style=for-the-badge)](https://walls-dont-lie.vercel.app)

![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-Smart_Contracts-363636?style=flat-square&logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=googlegemini&logoColor=white)

<br/>

<img src="docs/screenshots/01-hero.png" alt="Walls Don't Lie landing page" width="90%"/>

</div>

---

## ✨ What is this?

**Walls Don't Lie** is a decentralized **rental deposit escrow protocol**.

Security deposits are one of the most disputed parts of renting. Claims get made, photos get lost, and the tenant ends up chasing the landlord over phone calls. Walls Don't Lie replaces all of that with **cryptographic proof**:

> 📸 Photos are taken at move-in → 🔐 their hashes are anchored on-chain → 🤖 AI compares them with move-out photos → 💸 the contract settles the deposit automatically.

No he-said-she-said. No court fees. Just evidence.

---

## 🎯 See it in action

A real-world example from the app:

| | |
|---|---|
| 🏢 **Location** | Living Room, East Wall |
| 💰 **Total deposit** | `$2,400.00` |
| ⚠️ **Landlord's claim** | `$1,200` for full wall repainting, citing scuff marks |
| 🤖 **AI diff finding** | Move-in baseline already showed pre-existing microscopic paint fading. Classified as **normal wear**. |
| ✅ **Outcome** | Claim dismissed. **$2,400 returned to the tenant in full, automatically.** |
| 📞 **Phone calls / court fees** | `0` / `0` |

---

## 🔥 Core Capabilities

| | Feature | What it does |
|---|---|---|
| 🔒 | **Smart Contract Escrow** | Deposits are locked and managed transparently on-chain. Nobody can touch the funds until the outcome is agreed or proven. |
| 🤖 | **Automated Evidence Checks** | AI-driven photo verification compares check-in and check-out conditions and tells real damage apart from normal wear and tear. |
| 🧾 | **Tamper-Evident Proof Chain** | Cryptographic hashes of move-in photos are anchored on the Sepolia contract, so evidence can't be quietly altered later. |
| 📍 | **Geotagged Snapshots** | Inspection photos carry EXIF and location data to back up when and where they were taken. |
| 🦊 | **MetaMask Login** | Connect your wallet to create and manage agreements. The connected wallet becomes the landlord, and the tenant is set by address. |
| ⏱️ | **Configurable Claim Window** | The landlord picks how long they have to raise a claim (1 to 129,600 minutes) before the deposit is released. |
| 🪙 | **ERC-20 & ETH Vaults** | Deposits can be held in ETH or ERC-20 tokens, with instant payout on settlement. |
| ⚡ | **Decentralized Trust** | No intermediary bias. Deposits are returned based strictly on verified records. |

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/02-evidence-demo.png" alt="AI evidence diff and dispute resolution"/>
      <br/><sub><b>AI diff + tamper-evident proof chain</b><br/>A $1,200 repainting claim is dismissed as normal wear.</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/04-create-agreement.png" alt="Create agreement modal"/>
      <br/><sub><b>Create an on-chain agreement</b><br/>Set the tenant, deposit and claim window.</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="docs/screenshots/03-dashboard.png" alt="Agreements dashboard with MetaMask on Sepolia"/>
      <br/><sub><b>Agreements dashboard</b><br/>Track every deposit from <code>Created</code> to <code>Settled</code>, connected through MetaMask on Sepolia.</sub>
    </td>
  </tr>
</table>

---

## 🧭 How it works

```mermaid
flowchart LR
    A[🏠 Move-In<br/>Photos captured] --> B[🔐 Hashes anchored<br/>on Sepolia contract]
    B --> C[💰 Deposit locked<br/>in escrow]
    C --> D[📸 Move-Out<br/>inspection photos]
    D --> E[🤖 AI diff vs.<br/>move-in baseline]
    E -->|Normal wear| F[✅ Full deposit<br/>returned to tenant]
    E -->|Real damage| G[⚖️ Fair deduction<br/>settled to landlord]
```

1. **Create** an agreement: tenant wallet, deposit amount and claim window.
2. **Document** the place on Day 1 with timestamped photos.
3. **Anchor** the photo hashes on-chain and lock the deposit.
4. **Compare** move-out photos against the baseline using AI.
5. **Settle** automatically (`Created` → `CheckoutRequested` → `Settled`), on evidence rather than opinion.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS · Three.js · Framer Motion |
| **Backend** | Node.js · Express |
| **AI Engine** | Google Gen AI SDK (`@google/genai`) |
| **Blockchain** | Solidity · Ethereum (Sepolia testnet) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine
- A [Gemini API key](https://aistudio.google.com/apikey) for the AI evidence checks

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/sharanyashetty013-droid/Solidity-gang-.git
cd Solidity-gang-
```

**2. Switch to the frontend branch**

```bash
git checkout feature/frontend-components
```

**3. Install dependencies**

```bash
npm install
```

**4. Set up environment variables**

```bash
cp .env.example .env
```

Then open `.env` and fill in your keys (see `.env.example` for the exact variable names).

**5. Run the app**

```bash
npm run dev
```

Open the local URL shown in your terminal and you're in. 🎉

---

## 📁 Project Structure

```
Solidity-gang-/
├── docs/screenshots # README images
├── public/          # Static assets
├── src/             # React + TypeScript source
├── .env.example     # Environment variable template
├── index.html       # App entry point
├── vite.config.ts   # Vite configuration
└── package.json
```

---

## 🗺️ Roadmap

- [x] Landing page with 3D hero
- [x] Evidence timeline and AI diff UI
- [ ] Mainnet-ready escrow contract audit
- [ ] Multi-room, multi-photo inspections
- [ ] Mobile-first capture flow
- [ ] Dispute appeals with human arbitrators

---

## 🤝 Contributing

Contributions, issues and feature ideas are welcome! Fork the repo, create your branch, and open a pull request.

---

<div align="center">

### Built by the **Solidity Gang** 💗

*Because walls don't lie.*

</div>
