import winston from 'winston';

class LoggerService {
    private logger: winston.Logger;

    constructor() {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 4,
        };

        const colors = {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            http: 'magenta',
            debug: 'white',
        };

        winston.addColors(colors);

        const format = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
        );

        const transports = [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
            }),
            new winston.transports.File({ filename: 'logs/all.log' }),
        ];

        this.logger = winston.createLogger({
            level: this.getLevel(),
            levels,
            format,
            transports,
        });
    }

    private getLevel(): string {
        return 'debug';
    }

    public info(message: string) {
        this.logger.info(message);
    }

    public error(message: string) {
        this.logger.error(message);
    }

    public warn(message: string) {
        this.logger.warn(message);
    }

    public http(message: string) {
        this.logger.http(message);
    }

    public debug(message: string) {
        this.logger.debug(message);
    }
}

export default new LoggerService();
