import { filterMappedByFields, MappedByFieldFilterOptions } from './mappedByFieldFilter';
import { ListableFormField } from '../../fields/abstract';

describe('mappedByFieldFilter', () => {
  describe('filterMappedByFields', () => {
    const createMockField = (fieldName: string): ListableFormField<any> =>
      ({
        name: fieldName,
        label: `Label for ${fieldName}`,
        type: 'string',
        fieldType: 'text',
        formFieldType: 'FormField',
        render: () => null,
      }) as any;

    it('should filter out exact mappedBy field', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('name'),
        createMockField('email'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result).toHaveLength(2);
      expect(result.map((f) => f.name)).not.toContain('studentId');
      expect(result.map((f) => f.name)).toContain('name');
      expect(result.map((f) => f.name)).toContain('email');
    });

    it('should filter out base field when mappedBy ends with Id', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('student'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result).toHaveLength(1);
      expect(result.map((f) => f.name)).toEqual(['name']);
    });

    it('should filter out nested field patterns (student.*)', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('student'),
        createMockField('student.name'),
        createMockField('student.id'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result).toHaveLength(1);
      expect(result.map((f) => f.name)).toEqual(['name']);
    });

    it('should not filter if field is in includePatterns', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('student.name'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, {
        mappedBy: 'studentId',
        includePatterns: ['student.name'],
      });

      expect(result).toHaveLength(2);
      expect(result.map((f) => f.name)).toContain('student.name');
      expect(result.map((f) => f.name)).toContain('name');
    });

    it('should handle mappedBy without Id suffix', () => {
      const fields = [
        createMockField('teacher'),
        createMockField('teacher.name'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'teacher' });

      expect(result).toHaveLength(1);
      expect(result.map((f) => f.name)).toEqual(['name']);
    });

    it('should respect excludePatterns option', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('status'),
        createMockField('custom'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, {
        mappedBy: 'studentId',
        excludePatterns: ['status', 'custom'],
      });

      expect(result).toHaveLength(1);
      expect(result.map((f) => f.name)).toEqual(['name']);
    });

    it('should handle empty fields array', () => {
      const fields: ListableFormField<any>[] = [];
      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result).toHaveLength(0);
    });

    it('should preserve field order', () => {
      const fields = [
        createMockField('email'),
        createMockField('name'),
        createMockField('studentId'),
        createMockField('phone'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result.map((f) => f.name)).toEqual(['email', 'name', 'phone']);
    });

    it('should handle multiple nested levels', () => {
      const fields = [
        createMockField('studentId'),
        createMockField('student'),
        createMockField('student.name'),
        createMockField('student.profile'),
        createMockField('student.profile.avatar'),
        createMockField('name'),
      ];

      const result = filterMappedByFields(fields, { mappedBy: 'studentId' });

      expect(result).toHaveLength(1);
      expect(result.map((f) => f.name)).toEqual(['name']);
    });
  });
});
