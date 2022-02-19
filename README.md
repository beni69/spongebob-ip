# spongebob-ip

### steal someone's ip in the funniest way possible

[example video](https://cdn.discordapp.com/attachments/778203356765487134/875746622175338626/bs7aE.mp4)

## running

**running in a container is recommended:**

-   git clone and run `docker compose up`
-   or run natively (_see below_)

## requirements

-   node.js
-   python3 and pip
-   `pip3 install moviepy`
-   ffmpeg and imagemagick
-   comic sans font

## how it works

### video.py

this is where the magic happens. using moviepy, this script will get an image, a
text, a song (hardcoded to _jazz in paris_) and put them all together into a
file.

use it with
`python3 video.py <path to bg image> <text to display (like someones ip)> <name of output file>`

### server.ts

this express server provides an example on how one could automate the generation
of these videos.

you simply create a discord webhook, and get yourself a link that looks like
`<domain>/link?url=<url to redirect to>&wh=<discord webhook url>` (please note
that you do need to url encode all of these parameters) after that, just put it
in a url shortener and you're done

build the code with `yarn build` and run with `yarn start`
