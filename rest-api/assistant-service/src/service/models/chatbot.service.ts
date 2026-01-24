import { env } from '~/config/env';
import { CHATBOT_ERROR_MESSAGE, CHATBOT_KEY, CHATBOT_STORES_KEY } from '~/utils/constants';
import redisService from '~/service/utils/redis.service';
import https from 'https';
import axios from 'axios';

class ChatbotService {
    private axiosInstance = axios.create({
        timeout: 30000,
        httpsAgent: new https.Agent({
            family: 4
        })
    });

    private ttlKey = {
        guest: 3 * 24 * 60 * 60,
        user: 7 * 24 * 60 * 60
    }

    async getChatHistory(userId: string): Promise<{ type: string; content: string }[]> {
        const key = `${CHATBOT_STORES_KEY}:${userId}`;
        const history = await redisService.getList(key);

        return history.map((item: any) => ({
            type: item.type,
            content: item.content
        }));
    }

    async sendMessage(question: string, userId: string, isGuest: boolean): Promise<{
        reply: string
    }> {
        const n8nUrl = `${env.N8N_BASE_URL}${env.N8N_WEBHOOK_PATH}`;

        try {
            const response = await this.axiosInstance.post(n8nUrl, {
                question
            }, {
                headers: {
                    'userId': `${CHATBOT_KEY}:${userId}`,
                    'Authorization': env.N8N_AUTH_HEADER,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const reply = response.data.data.reply ? response.data.data.reply : CHATBOT_ERROR_MESSAGE;

            // Save chat history to Redis asynchronously
            const key = `${CHATBOT_STORES_KEY}:${userId}`;
            const ttl = isGuest ? this.ttlKey.guest : this.ttlKey.user;

            Promise.all([
                redisService.rpush(key, { type: 'human', content: question }),
                redisService.rpush(key, { type: 'ai', content: reply }),
                redisService.expire(key, ttl)
            ]).catch(err => {
                console.error('Error saving chat history to Redis:', err);
            });

            return {
                reply
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
