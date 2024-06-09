# Economy Bot

![Economy Bot](https://img.shields.io/badge/discord.js-v14-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Introduction

Welcome to **Economy Bot**, a powerful and flexible Discord bot designed to enhance your server with a complete economic system. With features like trading, banking, and bartering, this bot brings a whole new level of engagement to your community.

## ⚠️ Warning

**Do not upload this code to a public repository.** This bot contains sensitive information that should remain private. Always ensure your Discord bot token and any other sensitive data are kept secure.

## 🚀 Features

- **Trade System**: Engage in trading activities with other members.
- **Banking System**: Deposit and manage your virtual currency with ease.
- **Bartering System**: Swap items with other users in a seamless manner.
- **Daily Rewards**: Encourage daily interaction with rewards.

## 📋 Commands

Just as an example, below is an example of the command:

### `/trade <amount>`
- Perform a trade and see if you gain or lose your investment.

### `/deposit <amount>`
- Deposit your virtual currency into your bank account.

### `/deposit-list`
- View your bank account balance.

### `/addbalance <user> <amount>`
- Add balance to a user's account (Admin only).

## 🛠 Installation

Follow these steps to get Economy Bot up and running on your server:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/ThePeaces/bot-economy.git
    cd Economy-Bot
    ```

2. **Install dependencies:**
    ```sh
    npm install -y
    npm i discord.js
    npm i dotenv
    npm i fs
    npm i ms
    npm i sqlite3
    ```

3. **Set up the database:**
    Ensure you have SQLite3 installed. The bot will automatically create the necessary tables upon first run.

4. **Configure your bot:**
    Create a `.env` file in the root directory and add your Discord bot token:
    ```env
    TOKEN=your_bot_token
    GUILD_ID=your_guild_id
    CLIENT_ID=your_client_id
    ```

5. **Start the bot:**
    ```sh
    node src/index.js
    ```

## 💡 Usage

Invite the bot to your Discord server using the OAuth2 URL, and start using commands like `/trade`, `/deposit`, and others as described in the Features section.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

For any questions or support, please open an issue on this repository or reach out to us on Discord.
> Join my server discord ➫ [Yosed SMP](https://dsc.gg/yosedsmp)
> Join my community server discord ➫ [Chronoscraft](https://dsc.gg/chronoscraft)

---

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/1248487182021300236/1249381759402119250/favicon.png?ex=666718ef&is=6665c76f&hm=440e8e698e600566e510e268af9c26bc9460603a6ef714b3b4a574a9232bb3e2&" width="150" alt="Economy Bot Logo">
</p>

<p align="center">
  Made with by [The Peaces](https://github.com/ThePeaces)
</p>
