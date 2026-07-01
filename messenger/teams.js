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
    const webhookURL2 = process.env.TEAMS_WEBHOOK_URL2;
    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            version: "1.2",
            $schema: "http://adaptivecards.io",
            body: [
              {
                type: "TextBlock",
                text: `🍽️ ${dateText} | 하림 ${getRandomFood()}`,
                weight: "Bolder",
                size: "Medium",
              },
              {
                type: "Image",
                url: bobImageURL,
                size: "stretch",
                msTeams: {
                  allowExpansion: true,
                },
              },
            ],
            actions: [
              {
                type: "Action.OpenUrl",
                title: "🔍크게보기",
                url: bobImageURL,
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

    // 심신미약에 따른 파멸적인 하드코딩
    try {
      const response = await fetch(webhookURL2, {
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
