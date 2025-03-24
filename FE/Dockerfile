FROM node:20.9.0
WORKDIR /app
COPY . .

# 환경 변수 설정
ENV NEXT_PUBLIC_WEBSOCKET_URL=ws://13.124.231.140:8080/ws
ENV NEXT_PUBLIC_BASE_URL=http://13.124.231.140:8080
ENV NEXT_PUBLIC_SSE_URL=http://13.124.231.140:8080/sse

# pnpm 설치
RUN npm install -g pnpm
# 의존성 설치 및 빌드
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]

