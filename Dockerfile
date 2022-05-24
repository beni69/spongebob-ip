FROM node:lts as pkg

RUN npm i -g pnpm

WORKDIR /src
COPY package.json .
COPY pnpm-lock.yaml .
COPY tsconfig.json .

RUN pnpm install

COPY public ./public
COPY server.ts .

RUN pnpm build
RUN pnpm exec pkg . -o ./server -t node16-alpine


FROM vbeni/moviepy-alpine as final

# install comic sans font
RUN mkdir -p /usr/share/fonts/ && curl -o /usr/share/fonts/comic.ttf "https://cdn.karesz.xyz/COMIC.TTF" && fc-cache -f -v

WORKDIR /app
COPY clips ./clips
COPY video.py .
COPY --from=pkg /src/server .

ENV NODE_ENV=production
EXPOSE 8000
CMD [ "/app/server" ]
