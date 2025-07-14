import makeWASocket from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (messageContent === "!menu") {
            await sock.sendMessage(from, { text: "💫 Shanuwa Md Bot Menu 💫\n\n🧑‍💻 Owner: Shanuka Shameen\n❤️ Status Auto Seen Enabled." });
        }

        if (messageContent === "!owner") {
            await sock.sendMessage(from, { text: "👑 Owner: Shanuka Shameen\n📞 Contact: +94XXXXXXXXX" });
        }
    });

    // auto seen status
    sock.ev.on("messages.update", (m) => {
        for (let update of m) {
            if (update.key?.fromMe === false) {
                sock.readMessages([update.key]);
            }
        }
    });
}

startBot();
