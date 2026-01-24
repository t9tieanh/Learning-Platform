import axios from 'axios';
import { env } from '~/config/env';
import { CHATBOT_ERROR_MESSAGE, CHATBOT_KEY } from '~/utils/constants';
import redisService from '~/service/utils/redis.service';

class ChatbotService {
    async getChatHistory(userId: string): Promise<{ type: string; content: string }[]> {
        const key = `${CHATBOT_KEY}:${userId}`;
        const history = await redisService.getList(key);

        return history.map((item: any) => ({
            type: item.type,
            content: item.data?.content || ''
        }));
    }

    async sendMessage(question: string, userId: string): Promise<{
        reply: string
    }> {
        const n8nUrl = `${env.N8N_BASE_URL}${env.N8N_WEBHOOK_PATH}`;

        try {
            const response = await axios.post(n8nUrl, {
                question
            }, {
                headers: {
                    'userId': `${CHATBOT_KEY}:${userId}`,
                    'Authorization': env.N8N_AUTH_HEADER,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            return {
                reply: response.data.data.reply ? response.data.data.reply : CHATBOT_ERROR_MESSAGE
            };
        } catch (error) {
            console.error('Error calling N8N webhook:', error);
            return {
                reply: CHATBOT_ERROR_MESSAGE
            };
        }
    }
}

export default new ChatbotService();
