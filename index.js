const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const iconv = require("iconv-lite");
const { fromPath } = require("pdf2pic");
const { parse, stringify } = require("querystring");
const path = require("path");

const baseUrl = "http://www.pvv.co.kr/bbs/";
const tablePage = "index.php?page=1&code=bbs_menu01";

axios
  .get(baseUrl + tablePage, { responseType: "arraybuffer" })
  .then((response) => {
    // 1단계, 식단표 페이지에서 최상단 식단표 게시글 찾기
    const targetXPath =
      "body > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > table:nth-child(1) > tbody > tr:nth-child(14) > td:nth-child(3) > a:nth-child(1)";

    const html = iconv.decode(response.data, "iso-8859-1");
    const $ = cheerio.load(html);
    const thisWeek = $(targetXPath).attr();

    return baseUrl + thisWeek.href;
  })
  .then((thisWeekUrl) => {
    // 2단계, 이번 주 식단표 게시글에서 PDF 다운받기
    const fileXPath =
      "#DivAndPrint > table > tbody > tr > td > table:nth-child(6) > tbody > tr:nth-child(4) > td:nth-child(2) > a";

    return axios
      .get(thisWeekUrl, { responseType: "arraybuffer" })
      .then((response) => {
        const html = iconv.decode(response.data, "iso-8859-1");
        const $ = cheerio.load(html);
        const fileUrl = $(fileXPath).attr("href");
        const qs = parse(fileUrl.split("?")[1]);
        const modifiedQs = stringify({ ...qs, filename: undefined });
        const encodedFilename = escape(qs.filename);

        return axios.get(
          baseUrl + "download.php?" + modifiedQs + encodedFilename,
          {
            responseType: "arraybuffer",
          }
        );
      });
  })
  .then((response) => {
    // 3단계, 다운받은 PDF를 파일로 저장하고 기존 이미지를 삭제하기
    return fs.writeFile("./bob/thisWeekMenu.pdf", response.data).then(
      fs.readdir("./bob").then((files) => {
        const pngFiles = files.filter((file) => path.extname(file) === ".png");
        const deletePromises = pngFiles.map((file) =>
          fs.rm(path.join("./bob", file))
        );
        return Promise.all(deletePromises);
      })
    );
  })
  .then(() => {
    // 4단계, 저장한 PDF를 읽어 이미지화 하기

    const convert = fromPath("./bob/thisWeekMenu.pdf", {
      density: 300,
      saveFilename: "thisWeekMenu",
      savePath: "./bob",
      format: "png",
      width: 1536,
      height: 1024,
    });

    return convert(1, { responseType: "image" });
  })
  .then(() => {
    // 5단계, 이미지 이름 난수화

    const randomNumber = Math.floor(Math.random() * 1000000);
    const oldPath = "./bob/thisWeekMenu.1.png";
    const newPath = `./bob/thisWeekMenu.${randomNumber}.png`;

    return fs.rename(oldPath, newPath).then(() => {
      return newPath;
    });
  })
  .then((newPath) => {
    // 6단계, index.html 내부 이미지 이름 수정

    return fs.readFile("./index.html", "utf8").then((html) => {
      const updatedHtml = html.replace(
        /thisWeekMenu\.\d+\.png/g,
        newPath.split("/").pop()
      );
      return fs.writeFile("./index.html", updatedHtml, "utf8");
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
