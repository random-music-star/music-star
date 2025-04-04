FROM node:20.9.0
WORKDIR /app
COPY . .

# 환경 변수 설
ENV NEXT_PUBLIC_WEBSOCKET_URL=wss://music-random.com/api/ws
ENV NEXT_PUBLIC_BASE_URL=https://music-random.com/api
ENV NEXT_PUBLIC_SSE_URL=https://music-random.com/api/sse

# pnpm 설치
RUN npm install -g pnpm
# 의존성 설치 및 빌드
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]

