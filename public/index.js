const url = document.getElementById("url"),
    wh = document.getElementById("wh"),
    submit = document.getElementById("submit"),
    out = document.getElementById("output");

submit.addEventListener("click", e => {
    out.innerText = `https://spongebob-ip.karesz.xyz/link?url=${encodeURIComponent(
        url.value
    )}&wh=${encodeURIComponent(wh.value)}`;
    out.href = out.innerText;
});
