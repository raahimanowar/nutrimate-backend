import { extractText } from "./src/utils/extractText";

(async () => {
  const url =
    "https://ik.imagekit.io/uc8ejfj1j/drop-folder/Screenshot_from_2025-11-21_11-48-27_zXt6SNBxvs.png";

  console.log("Extracting text...");
  const text = await extractText(url);

  console.log("---- OCR OUTPUT ----");
  console.log(text);
})();
