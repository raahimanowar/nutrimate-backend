import { createWorker } from "tesseract.js";

export const extractText = async (imageUrl: string): Promise<string> => {
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(imageUrl);
  await worker.terminate();
  return data.text;
};
