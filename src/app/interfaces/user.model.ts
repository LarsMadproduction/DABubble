export interface User {
    id: string,
    name: string,
    userImage: string,
    email: string,
    password: string,
    status: 'offline'|'online',
    lastSeen: any,
    recentEmojis: string[],
}