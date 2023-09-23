export function getDataUrlFromFile(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject();
        }
      },
      false,
    );
    reader.addEventListener("error", () => {
      reject();
    });

    reader.readAsDataURL(file);
  });
}
