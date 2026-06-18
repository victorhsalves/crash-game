export interface CryptoProvider {
  sha256(value: string): string | Promise<string>;
  hmacSha256(key: string, message: string): string | Promise<string>;
}
