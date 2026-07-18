/** Nova Copilot chat bubble — frontend feature flag (not a security boundary). */

/** `false`: hide the chat bubble entirely (no history / no AI calls). Default: enabled. */
export const chatbotEnabled = import.meta.env.VITE_ENABLE_CHATBOT !== 'false'
