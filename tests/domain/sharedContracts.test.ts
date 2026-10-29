import { describe, expect, it } from 'vitest';
import { AlertSchema, AlertSeveritySchema } from '../../src/domain/alerts';
import { AdaptationEffectsSchema, AdaptationSchema } from '../../src/domain/adaptationTypes';
import { TaskTemplateSchema } from '../../src/domain/templates';
import { CommandErrorSchema, StorageErrorSchema } from '../../src/domain/ports';
import { err, isOk, ok } from '../../src/domain/result';
import { generateBriefs, makeBrief } from '../helpers/briefs';

describe('Shared domain contracts and ports', () => {
  it('validates Alert and AlertSeverity schemas', () => {
    expect(AlertSeveritySchema.parse('info')).toBe('info');
    expect(AlertSeveritySchema.parse('warn')).toBe('warn');
    expect(AlertSeveritySchema.parse('critical')).toBe('critical');

    const alert = AlertSchema.parse({
      code: 'CONTINGENCY_CAPPED',
      severity: 'warn',
      message: 'Contingency rate capped at 15%',
      categoryId: 'venue',
    });
    expect(alert.code).toBe('CONTINGENCY_CAPPED');
    expect(alert.severity).toBe('warn');
  });

  it('validates Adaptation and AdaptationEffects schemas', () => {
    const effects = AdaptationEffectsSchema.parse({
      contingencyDelta: 3,
      weightFactors: { venue: 1.1 },
      injectTaskIds: ['task_rain_plan'],
      vendorCheckIds: ['check_tent_permit'],
      alerts: [],
      skipOptionalTasks: false,
      compressTimeline: true,
    });
    expect(effects.contingencyDelta).toBe(3);

    const adaptation = AdaptationSchema.parse({
      id: 'rule_outdoor_weather',
      ruleName: 'Outdoor Weather Readiness',
      reason: 'Outdoor event requires weather contingency buffers',
      effects,
    });
    expect(adaptation.id).toBe('rule_outdoor_weather');
  });

  it('validates TaskTemplate schema', () => {
    const template = TaskTemplateSchema.parse({
      id: 'task_book_caterer',
      title: 'Book Catering Service',
      category: 'catering',
      daysBeforeEvent: 90,
      phase: 'Vendor Booking',
      optional: false,
      dependencies: ['task_finalize_guest_count'],
      adaptationId: 'rule_dietary_needs',
    });
    expect(template.id).toBe('task_book_caterer');
    expect(template.daysBeforeEvent).toBe(90);
  });

  it('validates StorageError and CommandError schemas', () => {
    const storageErr = StorageErrorSchema.parse({
      code: 'STORAGE_UNAVAILABLE',
      message: 'Disk quota exceeded',
    });
    expect(storageErr.code).toBe('STORAGE_UNAVAILABLE');

    const cmdErr = CommandErrorSchema.parse({
      code: 'INVALID_COMMAND',
      message: 'Command payload malformed',
    });
    expect(cmdErr.code).toBe('INVALID_COMMAND');
  });

  it('provides domain Result helpers', () => {
    const success = ok({ id: '123' });
    expect(isOk(success)).toBe(true);
    if (isOk(success)) {
      expect(success.value.id).toBe('123');
    }

    const failure = err('Failed');
    expect(isOk(failure)).toBe(false);
    if (!isOk(failure)) {
      expect(failure.error).toBe('Failed');
    }
  });

  it('generates deterministic test briefs covering edge cases', () => {
    const brief = makeBrief({ guestCount: 99 });
    expect(brief.guestCount).toBe(99);

    const birthdayBrief = makeBrief({ eventType: 'birthday' });
    expect(birthdayBrief.eventType).toBe('birthday');

    const communityBrief = makeBrief({ eventType: 'community' });
    expect(communityBrief.eventType).toBe('community');

    const list = generateBriefs(10, 12345);
    expect(list.length).toBe(10);
    const listAgain = generateBriefs(10, 12345);
    expect(list).toEqual(listAgain);
  });
});
