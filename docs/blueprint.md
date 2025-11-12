# **App Name**: Kathputli Unwind

## Core Features:

- Dynamic Tangle Generation: Randomly assign puppet strings to controller slots, creating a unique entanglement puzzle for each playthrough.
- String Re-ordering: Enable the player to drag and drop string anchors to re-order the strings and 'un-tangle' them.
- Action Command Display: Show a command for the puppet, such as 'Make the puppet bow,' indicating the goal for the player.
- Tangle Logic: Check the position of Action and Blocking strings; guarantee the game starts in a tangled state by automatically entangling if not already tangled.
- String Pull Action: Allow the player to 'pull' a string by clicking a button beneath each slot, triggering the puppet action if correct, or a failure state if incorrect.
- Win/Lose Feedback: Display win/lose screens based on whether the player correctly untangled the strings and pulled the correct action string.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), reminiscent of traditional theater curtains, conveying depth and sophistication.
- Background color: Soft gray (#ECEFF1), provides a neutral backdrop allowing the puppet and strings to stand out.
- Accent color: Muted purple (#9575CD), used sparingly to highlight interactive elements such as the pull buttons.
- Body and headline font: 'Literata', a serif font evoking traditional literary forms; provides readability and a touch of vintage flair.
- Use clean, simple icons to represent different string actions (e.g., head, hands, feet) if needed.
- The puppet should be center-screen with strings leading to a controller bar along the top.
- Implement smooth transitions for string movements when re-ordering and a clear puppet animation upon successful completion of the command.