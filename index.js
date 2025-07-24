const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")
const fs = require("fs")
const pino = require("pino")

const { state, saveState } = useSingleFileAuthState("./auth_info.json")

async function startBot() {
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on("creds.update", saveState)

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text

    if (messageContent === ".menu") {
      await sock.sendMessage(from, { text: "✨ Ameereyyy UserBot Menu ✨\n\n✅ .menu\n✅ .ping\n✅ .owner" })
    }

    if (messageContent === ".ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" })
    }

    if (messageContent === ".owner") {
      await sock.sendMessage(from, { text: "👑 Created by @AmeereyyyGit" })
    }
  })
}

startBot()
