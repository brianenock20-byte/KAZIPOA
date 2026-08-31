export function canViewSeekerDocument(documentOwnerId: number, sessionUserId: number) {
  return documentOwnerId === sessionUserId;
}
