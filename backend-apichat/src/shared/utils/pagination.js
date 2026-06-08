export class PaginationCursor {
  static encode(id, timestamp) {
    return Buffer.from(`${id}:${timestamp}`).toString('base64');
  }

  static decode(cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 2) throw new Error('Invalid cursor format');
      return { id: parts[0], timestamp: parseInt(parts[1]) };
    } catch (err) {
      throw new Error('Invalid cursor format');
    }
  }

  static createNextCursor(items) {
    if (items.length === 0) return null;
    const lastItem = items[items.length - 1];
    const timestamp = lastItem.createdAt instanceof Date ? lastItem.createdAt.getTime() : lastItem.createdAt;
    return this.encode(lastItem._id || lastItem.id, timestamp);
  }
}
