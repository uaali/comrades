export interface User{
    uid: string;
    displayName: string | null;
    walletId?: string | null;
    tokenBalance?: number | null;
}