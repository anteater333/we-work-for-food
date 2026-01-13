// 메신저 전파 본부. hq.js
import teams from "./teams.js";

const MESSENGERS = [teams];

function run() {
  MESSENGERS.forEach((messenger) => {
    messenger.run();
  });
}

run();
