export type GenerationStatus = 'COMPLETED' | 'FAILED';

export interface Generation {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  status: GenerationStatus;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

