import { consola } from "consola";
import chalk from "chalk";

function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function logWithBg(level: string, fn: (msg: string) => void, msg: string) {
  const time = formatDate(new Date());
  let coloredLevel = level.toUpperCase();

  switch (level.toLowerCase()) {
    case "success":
      coloredLevel = chalk.bgGreen.black.bold(` ${coloredLevel} `);
      break;
    case "info":
      coloredLevel = chalk.bgBlue.black.bold(` ${coloredLevel} `);
      break;
    case "warn":
      coloredLevel = chalk.bgYellow.black.bold(` ${coloredLevel} `);
      break;
    case "error":
      coloredLevel = chalk.bgRed.black.bold(` ${coloredLevel} `);
      break;
    case "debug":
      coloredLevel = chalk.bgGray.black.bold(` ${coloredLevel} `);
      break;
  }

  fn(`[${time}] ${coloredLevel}: ${msg}\n`);
}

export const logger = {
  success: (msg: string) => logWithBg("success", consola.success, msg),
  info: (msg: string) => logWithBg("info", consola.info, msg),
  warn: (msg: string) => logWithBg("warn", consola.warn, msg),
  error: (msg: string) => logWithBg("error", consola.error, msg),
  debug: (msg: string) => logWithBg("debug", consola.debug, msg),
};
