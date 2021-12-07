import wa from "whatsapp-web.js";
import { hourleyDistributionCommand } from "./commands/hourlyDistribution";
import { karmaCommand } from "./commands/karmaCommand";
import { listCommand } from "./commands/listCommand";
import { msgCountCommand } from "./commands/msgCountCommand";
import { msgTypesCommand } from "./commands/msgTypesCommand";
import { topCommand } from "./commands/topCommand";

export const handleCommand = async (msg: wa.Message) => {
  const command = msg.body.split(" ")[0];
  if (!command.startsWith("/")) {
    return;
  }
  switch (command) {
    case "/top":
      await topCommand(msg);
      break;
    case "/list":
      await listCommand(msg);
      break;
    case "/karma":
      await karmaCommand(msg);
      break;
    case '/msgTypes':
      await msgTypesCommand(msg);
      break;
    case '/msgCount':
      await msgCountCommand(msg);
      break;
    case '/hourlyDist':
      await hourleyDistributionCommand(msg);
      break;
    default:
      break;
  }
}
