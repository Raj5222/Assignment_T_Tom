import * as crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = process.env.SECRET_KEY!.toString();
const iv = process.env.IV!.toString();

class Crypto {
  public static async encrypt(plainText: string): Promise<string> {
    try {
      plainText = plainText.toString();
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const enc = cipher.update(plainText, "utf8", "hex") + cipher.final("hex");
      console.log(enc)
      return enc
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  public static async decrypt(encrypted: string): Promise<string> {
    try {
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const dec = (
        decipher.update(encrypted, "hex", "utf8") +
        decipher.final("utf8").toString()
      );
      console.log(dec)
      return dec;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  public static async decryptJson(encryptedJson: string): Promise<object> {
    const decryptedJson = await Crypto.decrypt(encryptedJson);
    console.log(decryptedJson)
    return JSON.parse(decryptedJson);
  }

  public static async encryptJson(jsonData: object): Promise<string> {
    const jsonStr = JSON.stringify(jsonData);
    return Crypto.encrypt(jsonStr);
  }
}

export default Crypto;
