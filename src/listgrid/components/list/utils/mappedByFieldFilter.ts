import { ListableFormField } from '../../fields/abstract';

export interface MappedByFieldFilterOptions {
  mappedBy: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

/**
 * Filters out mappedBy related fields from a field array.
 *
 * For example, if mappedBy is "studentId":
 * - "studentId" is filtered out
 * - "student" is filtered out (base field without Id suffix)
 * - "student.name", "student.id" etc. are filtered out (nested patterns)
 *
 * Unless they are explicitly included in includePatterns.
 *
 * @param fields The list of fields to filter
 * @param options Filter options including mappedBy and optional include/exclude patterns
 * @returns Filtered field array
 */
export function filterMappedByFields(
  fields: ListableFormField<any>[],
  options: MappedByFieldFilterOptions,
): ListableFormField<any>[] {
  const { mappedBy, includePatterns = [], excludePatterns = [] } = options;

  // Generate patterns to exclude
  const patternsToExclude = new Set<string>();

  // 1. Exact mappedBy field (e.g., "studentId")
  patternsToExclude.add(mappedBy);

  // 2. Base field without Id/.id suffix
  // Handle "studentId" format (camelCase Id suffix)
  // Handle "enrollment.student.id" format (dot notation .id suffix)
  let baseField = mappedBy;
  if (mappedBy.endsWith('Id')) {
    baseField = mappedBy.slice(0, -2);
  } else if (mappedBy.endsWith('.id')) {
    baseField = mappedBy.slice(0, -3);
  }
  patternsToExclude.add(baseField);

  // 3. Nested pattern (e.g., "student.*" from "studentId" or "enrollment.student.*" from "enrollment.student.id")
  const nestedPattern = `${baseField}.`;

  // 4. Add additional excludePatterns
  excludePatterns.forEach((pattern) => patternsToExclude.add(pattern));

  // Filter fields
  return fields.filter((field) => {
    const fieldName = field.name;

    // Check if field is explicitly included
    if (includePatterns.includes(fieldName)) {
      return true;
    }

    // Check if field should be excluded
    // Exact match
    if (patternsToExclude.has(fieldName)) {
      return false;
    }

    // Nested pattern match (field starts with baseField.)
    if (fieldName.startsWith(nestedPattern)) {
      return false;
    }

    return true;
  });
}
