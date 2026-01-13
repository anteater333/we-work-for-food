import { configDotenv } from "dotenv";
import fs from "fs";

configDotenv();

const pageURL = process.env.DEPLOYMENT_URL;
const imagePathName = "bob";

const imageDir = `${process.cwd()}/bob`;

let imageURL = "";
try {
  const files = fs.readdirSync(imageDir);
  const menuFilename = files.find(
    (file) => file.startsWith("thisWeekMenu") && file.endsWith(".png")
  );

  if (!menuFilename) {
    throw new Error(
      `❌ '${imageDir}' 폴더에서 식단표 이미지를 찾을 수 없습니다.`
    );
  }

  imageURL = `${pageURL}/${imagePathName}/${menuFilename}`;
} catch (error) {
  console.error("파일 찾기 실패:", error.message);
  process.exit(1);
}

export const bobImageURL = encodeURI(imageURL);
