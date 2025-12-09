import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID for entities using UUID v4
 * The polyfill import must come before uuid import for React Native
 */
export function generateId(): string {
  return uuidv4();
}
