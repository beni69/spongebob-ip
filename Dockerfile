# see Dockerfile.node-moviepy
FROM vbeni/node-moviepy

# install comic sans font
RUN mkdir -p /usr/share/fonts/ && curl -o /usr/share/fonts/comic.ttf "https://cdn.karesz.xyz/COMIC.TTF" && fc-cache -f -v

# install node stuff
WORKDIR /app
COPY package*.json /app
COPY yarn.lock /app
RUN yarn install

# build typescript source code
COPY . /app
RUN yarn build

EXPOSE 8000
CMD [ "yarn", "start" ]
