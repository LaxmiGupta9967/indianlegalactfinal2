/**
 * Parses a JSON string that may be wrapped in markdown code fences (```json ... ```).
 * @param jsonString The raw string response from the Gemini API.
 * @returns The parsed JavaScript object.
 * @throws An error if the string is not valid JSON after cleaning.
 */
export function parseGeminiJson<T>(jsonString: string): T {
    // 1. Trim whitespace from the start and end of the string.
    let cleanedString = jsonString.trim();

    // 2. Check if the string starts with ```json and ends with ```.
    if (cleanedString.startsWith('```json')) {
        cleanedString = cleanedString.substring(7); // Remove '```json'
        if (cleanedString.endsWith('```')) {
            cleanedString = cleanedString.slice(0, -3); // Remove '```'
        }
    }
    // Also handle just ``` at the start and end
    else if (cleanedString.startsWith('```')) {
        cleanedString = cleanedString.substring(3);
        if (cleanedString.endsWith('```')) {
            cleanedString = cleanedString.slice(0, -3);
        }
    }

    // 3. Trim again in case there was whitespace between the fences and the JSON.
    cleanedString = cleanedString.trim();

    // 4. Parse the cleaned string.
    try {
        return JSON.parse(cleanedString);
    } catch (error) {
        console.error("Failed to parse cleaned JSON string:", cleanedString);
        throw new Error("Invalid JSON format received from the AI model.");
    }
}
