FROM python:3-slim as base
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends curl ffmpeg imagemagick > /dev/null && \
    # clear apt cache
    rm -r /var/lib/apt/lists /var/cache/apt/archives && \
    # change imagemagick security policy
    sed -i 's/rights="none"/rights="read | write"/g' $(find / -name policy.xml | head -1) && \
    # install python dependencies
    pip3 install --no-cache-dir moviepy && \
    # install comic sans font
    mkdir -p /usr/share/fonts/ && curl -o /usr/share/fonts/comic.ttf "https://cdn.karesz.xyz/COMIC.TTF" && fc-cache -f -v


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
RUN pnpm exec pkg . -o ./server


FROM base as final

WORKDIR /app
COPY clips ./clips
COPY video.py .
COPY --from=pkg /src/server .

ENV NODE_ENV=production
EXPOSE 8000
CMD [ "/app/server" ]
