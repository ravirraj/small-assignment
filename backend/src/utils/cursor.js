/**
 * Encode a cursor from (updated_at, id) into a base64 string.
 * We encode both values separated by a pipe so the cursor is opaque to the client.
 * Using base64 makes the cursor URL-safe and non-guessable.
 */
function encodeCursor(updatedAt, id) {
  const payload = `${updatedAt.toISOString()}|${id}`;
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Decode an opaque cursor back into (updatedAt, id).
 * Returns null if the cursor is malformed.
 */
function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const pipeIndex = decoded.lastIndexOf("|");
    if (pipeIndex === -1) return null;

    const isoTimestamp = decoded.substring(0, pipeIndex);
    const id = parseInt(decoded.substring(pipeIndex + 1), 10);

    if (isNaN(id)) return null;

    const updatedAt = new Date(isoTimestamp);
    if (isNaN(updatedAt.getTime())) return null;

    return { updatedAt, id };
  } catch {
    return null;
  }
}

module.exports = { encodeCursor, decodeCursor };
