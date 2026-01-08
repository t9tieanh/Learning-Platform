.PHONY: help web api notification socket clean

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

help:
	@echo "$(BLUE)==== Learning Platform - Makefile ====$(NC)"
	@echo ""
	@echo "$(GREEN)Web (React):$(NC)"
	@echo "  $(YELLOW)make web-install$(NC)      - Install web dependencies"
	@echo "  $(YELLOW)make web-dev$(NC)          - Start web dev server"
	@echo "  $(YELLOW)make web-build$(NC)        - Build web for production"
	@echo "  $(YELLOW)make web-lint$(NC)         - Lint web code"
	@echo "  $(YELLOW)make web-lint-fix$(NC)     - Fix web lint issues"
	@echo ""
	@echo "$(GREEN)Backend Services:$(NC)"
	@echo "  $(YELLOW)make api-build$(NC)        - Build course-service (Maven)"
	@echo "  $(YELLOW)make api-run$(NC)          - Run course-service"
	@echo "  $(YELLOW)make notification-build$(NC) - Build notification-service"
	@echo "  $(YELLOW)make notification-dev$(NC)   - Run notification-service in dev"
	@echo ""
	@echo "$(GREEN)General:$(NC)"
	@echo "  $(YELLOW)make clean$(NC)            - Clean all build artifacts"
	@echo "  $(YELLOW)make help$(NC)             - Show this help message"
	@echo ""

# ============ WEB (React) ============
web-install:
	@echo "$(BLUE)Installing web dependencies...$(NC)"
	cd web && npm install
	@echo "$(GREEN)✓ Web dependencies installed$(NC)"web dependencies...$(NC)"
	cd web && npm install
	@echo "$(GREEN)✓ Web dependencies installed$(NC)"

web-dev:
	@echo "$(BLUE)Starting web dev server...$(NC)"
	cd web && yarn run dev

web-build:
	@echo "$(BLUE)Building web for production...$(NC)"
	cd web && npm run build
	@echo "$(GREEN)✓ Web build completed$(NC)"

web-lint-fix:
	@echo "$(BLUE)Fixing web lint issues...$(NC)"
	cd web && npm run lint:fix
	@echo "$(GREEN)✓ Web linting completed$(NC)"

# ============ Notification Service (Node.js) ============
notification-install:
	@echo "$(BLUE)Installing notification service dependencies...$(NC)"
	cd rest-api/notification-service && npm install
	@echo "$(GREEN)✓ Notification service dependencies installed$(NC)"

notification-dev:
	@echo "$(BLUE)Running notification service in dev mode...$(NC)"
	cd rest-api/notification-service && npm run dev

# ============ Sale Service (Node.js) ============
sale-dev:
	@echo "$(BLUE)Running sale service in dev mode...$(NC)"

web-dev:
	@echo "$(BLUE)Starting web dev server...$(NC)"
	cd web && yarn run dev

web-build:
	@echo "$(BLUE)Building web for production...$(NC)"
	cd web && npm run build
	@echo "$(GREEN)✓ Web build completed$(NC)"

web-lint-fix:
	@echo "$(BLUE)Fixing web lint issues...$(NC)"
	cd web && npm run lint:fix
	@echo "$(GREEN)✓ Web linting completed$(NC)"

# ============ Notification Service (Node.js) ============
notification-install:
	@echo "$(BLUE)Installing notification service dependencies...$(NC)"
	cd rest-api/notification-service && npm install
	@echo "$(GREEN)✓ Notification service dependencies installed$(NC)"

notification-dev:
	@echo "$(BLUE)Running notification service in dev mode...$(NC)"
	cd rest-api/notification-service && npm run dev

# ============ Sale Service (Node.js) ============
sale-dev:
	@echo "$(BLUE)Running sale service in dev mode...$(NC)"
	cd rest-api/sale-service && npm run dev

# ============ Socket Server (Node.js) ============
socket-dev:
	@echo "$(BLUE)Running socket server in dev mode...$(NC)"
	cd socket-server && npm run dev

# ============ General ============
clean:
	@echo "$(BLUE)Cleaning all artifacts...$(NC)"
	rm -rf web/node_modules web/dist
	rm -rf rest-api/course-service/target
	rm -rf rest-api/notification-service/node_modules
	@echo "$(GREEN)✓ Clean completed$(NC)"

# ============ Setup & Run All ============
setup: web-install notification-install
	@echo "$(GREEN)✓ Setup completed$(NC)"

dev-all:
	@echo "$(YELLOW)Running all services in dev mode...$(NC)"
	@echo "$(GREEN)Starting:$(NC)"
	@echo "  - Web (React)"
	@echo "  - Notification Service"
	@echo "  - Sale Service"
	@echo "  - Socket Server"
	@echo ""
	cd web && yarn run dev & \
	cd rest-api/notification-service && npm run dev & \
	cd rest-api/sale-service && npm run dev & \
	cd socket-server && npm run dev & \
	wait

# Chạy chỉ web + notification
dev-web-notification:
	@echo "$(YELLOW)Running Web + Notification Service...$(NC)"
	cd web && yarn run dev & \
	cd rest-api/notification-service && npm run dev & \
	wait

# Chạy chỉ web + sale
dev-web-sale:
	@echo "$(YELLOW)Running Web + Sale Service...$(NC)"
	cd web && yarn run dev & \
	cd rest-api/sale-service && npm run dev & \
	wait

# Chạy web + socket server
dev-web-socket:
	@echo "$(YELLOW)Running Web + Socket Server...$(NC)"
	cd web && yarn run dev & \
	cd socket-server && npm run dev & \
	wait
