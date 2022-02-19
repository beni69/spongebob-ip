FROM node:lts

# install external dependencies
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg && pip3 install moviepy
# change imagemagick security policy
RUN sed -i 's/rights="none"/rights="read | write"/g' $(find / -name policy.xml | head -1)
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
