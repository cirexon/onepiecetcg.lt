import type { Role } from './types';

export const roleOrder: Role[] = ['viewer', 'organiser', 'editor', 'admin', 'owner'];

export const canManageOwnEvents = (role: Role) => ['organiser', 'admin', 'owner'].includes(role);
export const canManageAllEvents = (role: Role) => ['admin', 'owner'].includes(role);
export const canManageContent = (role: Role) => ['editor', 'admin', 'owner'].includes(role);
export const canManageRoles = (role: Role) => ['admin', 'owner'].includes(role);

export function canChangeAccountRole(actor: Role, target: Role, isSelf: boolean) {
  if (isSelf || target === 'owner') return false;
  if (actor === 'owner') return true;
  return actor === 'admin' && !['admin', 'owner'].includes(target);
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === 'owner') return ['viewer', 'organiser', 'editor', 'admin'];
  if (actor === 'admin') return ['viewer', 'organiser', 'editor'];
  return [];
}
