import { describe, it, expect } from 'vitest';
import { AbstractManyToOneField } from '../AbstractManyToOneField';
import { ManyToOneConfig } from '../../../../config/Config';

class TestManyToOneField extends AbstractManyToOneField<TestManyToOneField> {
  constructor(name: string, order: number, config: ManyToOneConfig) {
    super(name, order, config);
  }
  protected createInstance(name: string, order: number): TestManyToOneField {
    return new TestManyToOneField(name, order, this.config);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

const makeConfig = (overrides: Partial<ManyToOneConfig> = {}): ManyToOneConfig =>
  ({
    // entityForm is only stored; we never invoke anything on it in these tests.
    entityForm: {} as any,
    ...overrides,
  }) as ManyToOneConfig;

const make = (name = 'f', order = 1, config: ManyToOneConfig = makeConfig()) =>
  new TestManyToOneField(name, order, config);

describe('AbstractManyToOneField - constructor', () => {
  it('stores config and type = "manyToOne"', () => {
    const cfg = makeConfig();
    const f = make('owner', 3, cfg);
    expect(f.getName()).toBe('owner');
    expect(f.getOrder()).toBe(3);
    expect(f.type).toBe('manyToOne');
    expect(f.config).toBe(cfg);
  });
});

describe('AbstractManyToOneField - getEntityForm / hasConfig / getIdFieldName', () => {
  it('getEntityForm returns config.entityForm', () => {
    const entityForm = { marker: true } as any;
    const f = make('f', 1, makeConfig({ entityForm }));
    expect(f.getEntityForm()).toBe(entityForm);
  });

  it('hasConfig returns true when config present', () => {
    const f = make();
    expect(f.hasConfig()).toBe(true);
  });

  it('hasConfig returns false when config is null', () => {
    const f = make();
    // force config to null to hit the false branch
    (f as any).config = null;
    expect(f.hasConfig()).toBe(false);
  });

  it('getIdFieldName defaults to "id"', () => {
    expect(make().getIdFieldName()).toBe('id');
  });

  it('getIdFieldName returns configured field.id', () => {
    const f = make('f', 1, makeConfig({ field: { id: 'customId' } }));
    expect(f.getIdFieldName()).toBe('customId');
  });
});

describe('AbstractManyToOneField - getMappedIdName', () => {
  it('returns undefined when current value is missing', async () => {
    const f = make();
    expect(await f.getMappedIdName('create')).toBeUndefined();
  });

  it('returns id + name using default field accessors', async () => {
    const f = make().withValue({ id: '42', name: 'Alice' });
    expect(await f.getMappedIdName('create')).toEqual({ id: '42', name: 'Alice' });
  });

  it('respects configured field.id / field.name strings', async () => {
    const f = make('f', 1, makeConfig({ field: { id: 'uuid', name: 'title' } })).withValue({
      uuid: 'u-1',
      title: 'Wanted',
    });
    expect(await f.getMappedIdName('create')).toEqual({ id: 'u-1', name: 'Wanted' });
  });

  it('invokes function name resolver when field.name is a function', async () => {
    const f = make(
      'f',
      1,
      makeConfig({ field: { id: 'id', name: (v: any) => `${v.first} ${v.last}` } }),
    ).withValue({ id: '7', first: 'Ada', last: 'Lovelace' });
    expect(await f.getMappedIdName('create')).toEqual({ id: '7', name: 'Ada Lovelace' });
  });

  it('catches exceptions from the name resolver and returns undefined', async () => {
    const f = make(
      'f',
      1,
      makeConfig({
        field: {
          id: 'id',
          name: () => {
            throw new Error('boom');
          },
        },
      }),
    ).withValue({ id: '1' });
    // console.error is called internally; just assert we did not throw.
    const result = await f.getMappedIdName('create');
    expect(result).toBeUndefined();
  });
});

describe('AbstractManyToOneField - inherited list support', () => {
  it('inherits useListField / isSupportList from ListableFormField', () => {
    const f = make().useListField();
    expect(f.isSupportList()).toBe(true);
  });
});
