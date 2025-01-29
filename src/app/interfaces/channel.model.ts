export interface Channel {
    chanId: string,
    chanName: string,
    chanDescription?: string,
    chanCreatedByUser: string,
    userIds: string[],
}