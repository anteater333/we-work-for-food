import { bobImageURL } from "./shared.js";

const getRandomFood = () => {
  const foodEntry = [
    "🍔",
    "🌭",
    "🌮",
    "🥗",
    "🍚",
    "🥑",
    "🍺",
    "🍤",
    "🥕",
    "🧆",
  ];
  const randomFood = foodEntry[Math.floor(Math.random() * foodEntry.length)];

  return randomFood;
};

const today = new Date();
const month = today.getMonth() + 1;
const date = today.getDate();

const dateText = `${month}월 ${date}일`;

export default {
  run: async () => {
    const webhookURL = process.env.TEAMS_WEBHOOK_URL;
    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.hero",
          content: {
            title: `🍽️ ${dateText} | 하림 ${getRandomFood()}`,
            images: [{ url: bobImageURL }],
            buttons: [
              {
                type: "openUrl",
                title: "🔍크게보기",
                value: bobImageURL,
              },
            ],
          },
        },
      ],
    };

    try {
      const response = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("🚀 Teams 메시지 전송 성공!");
      } else {
        console.error("🔥 전송 실패:", response.status, await response.text());
      }
    } catch (error) {
      console.error("🔥 네트워크 에러:", error);
    }
  },
};
