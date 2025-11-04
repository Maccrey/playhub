export interface Game {
  id: string;
  name: string;
  // Add other properties as needed based on how Game is used throughout the application
  // For example, if there's a description, image, etc.
  highScore?: number; // Assuming it might have a high score property
}
