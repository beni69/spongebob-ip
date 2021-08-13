#!/usr/bin/env python3
import sys

from moviepy.editor import *

img = sys.argv[1]
text = sys.argv[2]
out = sys.argv[3]
print(f"will write to file {out} with text {text}")

audio = AudioFileClip("clips/jazz.mp3").set_duration(10)

image_clip = ImageClip(img)

size = .8*image_clip.size[0]

text_clip = TextClip(txt=text, size=(size, 0), font="Comic-Sans-MS",
                     color="black", stroke_color="white", stroke_width=int(size/288)).set_position("center")

clip = CompositeVideoClip(
    [image_clip, text_clip.set_start(6)]).set_duration(audio.duration)
clip = clip.set_audio(audio)

clip.write_videofile(out, fps=1)
