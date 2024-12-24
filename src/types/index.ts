export interface User{
    uid: string;
    displayName: string | null;
    walletId?: string | null;
    tokenBalance?: string | null;
}