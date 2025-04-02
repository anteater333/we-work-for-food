const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const iconv = require("iconv-lite");
const { fromPath } = require("pdf2pic");
const { parse, stringify } = require("querystring");
const { config } = require("dotenv");

config();

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
    // 3단계, 다운받은 PDF를 파일로 저장하기
    return fs.writeFile("./bob/thisWeekMenu.pdf", response.data);
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
    // 5단계, 저장한 이미지를 임시 호스팅 사이트로 발송

    const imgBBKey = process.env.IMGBB_KEY;

    const imagePath = "./bob/thisWeekMenu.1.png";
    return fs
      .readFile(imagePath)
      .then((imageData) => {
        const formData = new FormData();
        formData.append("key", imgBBKey);
        formData.append("image", imageData.toString("base64"));
        formData.append("expiration", 604800); // 1주

        return axios.post("https://api.imgbb.com/1/upload", formData);
      })
      .then((response) => {
        return response.data.data.url;
      });
  })
  .then((imgUrl) => {
    // 6단계, 이미지 URL을 메신저에 공유하기 (TODO)
    // Note. Teams가 역시 Microsoft제 제품 다운 API력을 보여주고 있기 때문에 일단 보류. 방법 구상 중.
  })
  .catch((error) => {
    console.error("Error:", error);
  });
