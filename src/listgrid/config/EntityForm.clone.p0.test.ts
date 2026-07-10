import { describe, it, expect } from 'vitest';
import { EntityForm } from './EntityForm';
import { NumberField } from '../components/fields/NumberField';

/**
 * P0-6: EntityForm.clone() aliases manageEntityForm by reference instead of copying,
 * so mutating the clone leaks into the original (and vice-versa).
 *
 * Regression test to verify that clone() performs a shallow copy of manageEntityForm
 * rather than aliasing it by reference.
 */
describe('EntityForm.clone — P0-6 manageEntityForm reference aliasing', () => {
  it('cloned form has independent manageEntityForm — mutations do not leak to original', () => {
    // Arrange: create a form with manageEntityForm in a known state
    const original = new EntityForm('testEntity', '/api/test')
      .withId('1')
      .withUpdatable(false)  // set update to false
      .addFields({ items: [new NumberField('qty', 1)] });

    const originalManageState = { ...original.manageEntityForm };

    // Act: clone the form
    const cloned = original.clone();

    // Mutate the original form's manageEntityForm
    original.withUpdatable(true);

    // Assert: cloned form's manageEntityForm should NOT be affected
    expect(cloned.manageEntityForm.update).toBe(originalManageState.update);
    expect(cloned.manageEntityForm.update).toBe(false);
    expect(original.manageEntityForm.update).toBe(true);
  });

  it('cloned form mutations do not leak back to original', () => {
    // Arrange: create forms
    const original = new EntityForm('testEntity', '/api/test')
      .withId('2')
      .withCreatable(true)
      .addFields({ items: [new NumberField('qty', 1)] });

    const originalCreateState = original.manageEntityForm.create;

    // Act: clone and mutate the clone
    const cloned = original.clone();
    cloned.withCreatable(false);

    // Assert: original should NOT be affected by clone mutation
    expect(original.manageEntityForm.create).toBe(originalCreateState);
    expect(original.manageEntityForm.create).toBe(true);
    expect(cloned.manageEntityForm.create).toBe(false);
  });

  it('includes manageEntityForm state when cloning with includeValue flag', () => {
    // Arrange
    const original = new EntityForm('testEntity', '/api/test')
      .withId('3')
      .withUpdatable(false)
      .withDeletable(false)
      .addFields({ items: [new NumberField('qty', 1)] });

    // Act
    const cloned = original.clone(true);

    // Assert: both should match initially, but be independent objects
    expect(cloned.manageEntityForm).toEqual(original.manageEntityForm);

    original.manageEntityForm.delete = true;

    // Verify independence
    expect(cloned.manageEntityForm.delete).toBe(false);
    expect(original.manageEntityForm.delete).toBe(true);
  });

  it('all three boolean fields in manageEntityForm are independent after clone', () => {
    // Arrange
    const original = new EntityForm('testEntity', '/api/test')
      .withCreatable(false)
      .withUpdatable(false)
      .withDeletable(false);

    // Act
    const cloned = original.clone();

    // Assert: clone starts with same state
    expect(cloned.manageEntityForm).toEqual({
      create: false,
      update: false,
      delete: false,
    });

    // Mutate all fields on original
    original.manageEntityForm.create = true;
    original.manageEntityForm.update = true;
    original.manageEntityForm.delete = true;

    // Clone should remain unchanged
    expect(cloned.manageEntityForm).toEqual({
      create: false,
      update: false,
      delete: false,
    });
  });
});
