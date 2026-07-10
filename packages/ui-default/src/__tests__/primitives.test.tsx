// EA-A0 pre-stage additions to the ui-default primitive set: TextInput's new
// `type` prop (backs Password/Month/Time via one primitive), the TagsInput
// slot (first consumer: TagField), and the UserView placeholder fallback
// (first consumer: ProfileField). No existing __tests__ precedent in
// ui-default (checked) — this file follows the render/fireEvent/screen
// idiom used throughout @listgrid/react's __tests__.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TagsInput, TextInput, UserView } from '../primitives';

describe('TextInput type prop (backward compatible — default stays "text")', () => {
  it('defaults to type="text" when omitted', () => {
    render(<TextInput ariaLabel="plain" value="" />);
    expect(screen.getByLabelText('plain')).toHaveAttribute('type', 'text');
  });

  it('renders type="password"', () => {
    render(<TextInput ariaLabel="pw" type="password" value="" />);
    expect(screen.getByLabelText('pw')).toHaveAttribute('type', 'password');
  });

  it('renders type="month" and type="time"', () => {
    render(<TextInput ariaLabel="m" type="month" value="" />);
    expect(screen.getByLabelText('m')).toHaveAttribute('type', 'month');
    render(<TextInput ariaLabel="t" type="time" value="" />);
    expect(screen.getByLabelText('t')).toHaveAttribute('type', 'time');
  });
});

describe('TagsInput (0.3.x TagField.tsx:45-89 usage — minimal token input)', () => {
  it('Enter adds the typed text as a tag and clears the input', () => {
    const onChange = vi.fn();
    render(<TagsInput ariaLabel="tags" value={[]} onChange={onChange} />);
    const input = screen.getByLabelText('tags');
    fireEvent.change(input, { target: { value: 'alpha' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['alpha']);
    expect(input).toHaveValue('');
  });

  it('a duplicate tag is ignored (no onChange call)', () => {
    const onChange = vi.fn();
    render(<TagsInput ariaLabel="tags" value={['alpha']} onChange={onChange} />);
    const input = screen.getByLabelText('tags');
    fireEvent.change(input, { target: { value: 'alpha' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the per-tag remove button removes exactly that tag', () => {
    const onChange = vi.fn();
    render(<TagsInput ariaLabel="tags" value={['alpha', 'beta']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove alpha' }));
    expect(onChange).toHaveBeenCalledWith(['beta']);
  });

  it('rejects the tag when onValidateTag resolves invalid, surfacing the message', async () => {
    const onChange = vi.fn();
    const onValidateTag = vi.fn().mockResolvedValue({ valid: false, message: 'not allowed' });
    render(
      <TagsInput ariaLabel="tags" value={[]} onChange={onChange} onValidateTag={onValidateTag} />,
    );
    const input = screen.getByLabelText('tags');
    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByRole('alert')).toHaveTextContent('not allowed');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('data suggestions render as a <datalist> wired to the input', () => {
    render(<TagsInput id="tag-field" ariaLabel="tags" value={[]} data={['red', 'green']} />);
    const input = screen.getByLabelText('tags');
    expect(input).toHaveAttribute('list', 'tag-field-suggestions');
    expect(screen.getByText('red')).toBeInTheDocument();
  });
});

describe('UserView fallback (placeholder posture — host overrides via UIComponents.UserView)', () => {
  it('renders the value as plain text', () => {
    render(<UserView value="Jane Doe" />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders empty (no crash) for nullish values', () => {
    const { container } = render(<UserView value={undefined} />);
    expect(container.textContent).toBe('');
  });
});
