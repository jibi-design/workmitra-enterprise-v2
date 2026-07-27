/** Ambient types for agora-token (CJS, no published .d.ts). */
declare module "agora-token" {
  export const RtcRole: {
    readonly PUBLISHER: 1;
    readonly SUBSCRIBER: 2;
  };

  export class RtcTokenBuilder {
    static buildTokenWithUid(
      appId: string,
      appCertificate: string,
      channelName: string,
      uid: number,
      role: 1 | 2,
      tokenExpire: number,
      privilegeExpire?: number,
    ): string;

    static buildTokenWithUserAccount(
      appId: string,
      appCertificate: string,
      channelName: string,
      account: string,
      role: 1 | 2,
      tokenExpire: number,
      privilegeExpire?: number,
    ): string;
  }
}
