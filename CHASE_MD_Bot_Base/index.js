const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");
const figlet = require("figlet");
const chalk = require("chalk");

console.log(chalk.green(figlet.textSync("CHASE MD", { horizontalLayout: "full" })));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("CHASE_AUTH");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: "silent" }),
        browser: ["CHASE MD", "Safari", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red("Connection closed. Reconnecting..."), shouldReconnect);

            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.blue("✅ Bot connected successfully as CHASE MD"));
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text?.toLowerCase() === "hi") {
            await sock.sendMessage(from, { text: "Hello! I'm CHASE MD 🤖" });
        }
    });
}

startBot();
// Entry point for CHASE MD Bot
