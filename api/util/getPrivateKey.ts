export function getPrivateKey(): string {
  if (!process.env.PRIVATE_KEY) {
    throw new Error();
  }

  const privateKey = process.env.PRIVATE_KEY.split(String.raw`\n`).join("\n");

  return privateKey;
}
