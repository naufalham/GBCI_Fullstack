export interface User {
  _id: string;
  email: string;
  username: string;
}

export interface Profile {
  _id: string;
  userId: string;
  name: string;
  birthday: string;
  height: number;
  weight: number;
  interests: string[];
  horoscope: string;
  zodiac: string;
  imageUrl?: string;
  gender?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  messageType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface LoginPayload {
  email: string;
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface CreateProfilePayload {
  name: string;
  birthday: string;
  height: number;
  weight: number;
  interests: string[];
  gender?: string;
  imageUrl?: string;
}
