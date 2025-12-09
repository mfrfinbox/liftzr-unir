/**
 * UI Constants for consistent styling across the app
 */

// Separator style - change this in one place to update all separators
export const SEPARATOR_STYLE = 'h-[1px] bg-muted/30';

// Border radius constants for consistent rounding
export const BORDER_RADIUS = {
  button: 'rounded-xl', // Primary buttons, cards
  small: 'rounded-lg', // Small elements
  full: 'rounded-full', // Pills, badges
  minimal: 'rounded-sm', // Input fields, checkboxes
} as const;

// Input field style - consistent styling for all workout inputs
export const INPUT_STYLE = {
  container: 'rounded-md', // Minimal border radius for inputs
  backgroundColor: {
    active: 'bg-muted/30',
    completed: 'bg-muted/30',
  },
} as const;

// Exercise header row style (SET, REPS, WEIGHT headers)
export const EXERCISE_HEADER_STYLE = 'mb-3 flex-row items-center rounded-md bg-muted/10 py-2.5';

// Checkbox style for set completion
export const CHECKBOX_STYLE = {
  base: 'h-8 w-8 items-center justify-center border rounded-sm',
  completed: 'border-primary bg-primary',
  uncompleted: 'border-muted-foreground',
} as const;

// Set row background styles
export const SET_ROW_BACKGROUND = {
  completed: 'bg-primary/10 px-2 rounded-md',
  odd: 'bg-muted/30 px-2 rounded-md',
  even: 'px-2',
} as const;
