import { describe, expect, it } from 'vitest';
import { assignableRoles, canChangeAccountRole, canManageAllEvents, canManageContent, canManageOwnEvents, canManageRoles } from './roles';

describe('role capabilities', () => {
  it('separates event, content, and account administration', () => {
    expect(canManageOwnEvents('organiser')).toBe(true);
    expect(canManageContent('organiser')).toBe(false);
    expect(canManageContent('editor')).toBe(true);
    expect(canManageOwnEvents('editor')).toBe(false);
    expect(canManageAllEvents('admin')).toBe(true);
    expect(canManageRoles('owner')).toBe(true);
    expect(canManageRoles('viewer')).toBe(false);
  });

  it('lets administrators assign routine roles only', () => {
    expect(assignableRoles('admin')).toEqual(['viewer', 'organiser', 'editor']);
    expect(canChangeAccountRole('admin', 'organiser', false)).toBe(true);
    expect(canChangeAccountRole('admin', 'admin', false)).toBe(false);
  });

  it('protects the owner and all self-role changes', () => {
    expect(assignableRoles('owner')).toEqual(['viewer', 'organiser', 'editor', 'admin']);
    expect(canChangeAccountRole('owner', 'admin', false)).toBe(true);
    expect(canChangeAccountRole('owner', 'owner', false)).toBe(false);
    expect(canChangeAccountRole('owner', 'organiser', true)).toBe(false);
  });
});
