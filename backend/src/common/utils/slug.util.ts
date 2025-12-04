export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateUniqueSlug(text: string): string {
  const base = generateSlug(text);
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

export function generateInviteSlug(): string {
  return Math.random().toString(36).substring(2, 10) +
         Math.random().toString(36).substring(2, 10);
}
