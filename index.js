const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("connection closed due to", lastDisconnect.error, ", reconnecting", shouldReconnect)
      if (shouldReconnect) connectToWhatsApp()
    } else if (connection === "open") {
      console.log("opened connection")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return

    const msgType = Object.keys(m.message)[0]
    const sender = m.key.remoteJid

    if (msgType === "conversation" && m.message.conversation === ".menu") {
      await sock.sendMessage(sender, { text: "✨ *Ameereyyy WhatsApp Bot*\n\n✅ Working perfectly!" })
    }
  })
}

connectToWhatsApp()
