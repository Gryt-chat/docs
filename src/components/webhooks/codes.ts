// What each code in openapi.json means, in words. The spec check fails when a code has no line here.

export const PROBLEM_CODES: Record<string, string> = {
  required: "Missing, or empty once spaces are trimmed off.",
  wrong_type: "The wrong kind of value, like a number where text belongs.",
  too_long: "Over the character limit in `limit`.",
  too_many: "More cards or fields than `limit` allows.",
  invalid_url: "Not an http or https URL.",
  invalid_color: "Not `#rrggbb`, and not a whole number from 0 to 16777215.",
  invalid_timestamp: "Not ISO 8601 with a time zone. `2026-09-15T07:42:00Z` works, `2026-09-15` doesn't.",
  empty_card: "The card has no title, description, fields, image_url or author.",
  total_too_long: "All the cards' text together is over 6000 characters.",
  invalid_format: "A string in a shape the server doesn't accept.",
  invalid: "Anything else the server refused.",
};

export const WARNING_CODES: Record<string, string> = {
  unknown_key: "A key Gryt doesn't know. It was ignored and the rest posted.",
  blocked: "The picture's address is private or local, or it redirected more than 5 times.",
  fetch_failed: "The picture's host answered with an error, or couldn't be reached.",
  too_large: "Over 8 MB for an image or thumbnail, or over 1 MB for an icon or avatar.",
  timeout: "The pictures weren't all downloaded within 12 seconds.",
  unsupported_type: "Not a PNG, JPEG, WebP or GIF. SVG is refused. The server looks at the bytes, not the file name.",
  invalid_image: "The file claimed to be an image but couldn't be decoded.",
  media_budget: "The message's pictures went over 32 MB together.",
  store_failed: "The server couldn't save the picture.",
};
