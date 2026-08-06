import { describe, expect, it } from 'vitest';
import { koreanObjectParticle, koreanTopicParticle, requiredMessage } from '../util/korean';

describe('Korean particles for required messages', () => {
  it.each([
    ['채널', '은', '채널은 필수 값입니다.'],
    ['우선순위', '는', '우선순위는 필수 값입니다.'],
    ['Priority', '는', 'Priority는 필수 값입니다.'],
  ])('uses the topic particle for %s', (label, particle, message) => {
    expect(koreanTopicParticle(label)).toBe(particle);
    expect(requiredMessage(label)).toBe(message);
  });

  it('keeps the object-particle helper available for backward compatibility', () => {
    expect(koreanObjectParticle('채널')).toBe('을');
    expect(koreanObjectParticle('우선순위')).toBe('를');
  });
});
