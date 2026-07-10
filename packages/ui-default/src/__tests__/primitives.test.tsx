// EA-A0 pre-stage additions to the ui-default primitive set: TextInput's new
// `type` prop (backs Password/Month/Time via one primitive), the TagsInput
// slot (first consumer: TagField), and the UserView placeholder fallback
// (first consumer: ProfileField). No existing __tests__ precedent in
// ui-default (checked) — this file follows the render/fireEvent/screen
// idiom used throughout @listgrid/react's __tests__.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FileInput, TagsInput, TextInput, UserView } from '../primitives';

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

  it('renders type="datetime-local" and type="color" (EA-B0)', () => {
    render(<TextInput ariaLabel="dt" type="datetime-local" value="" />);
    expect(screen.getByLabelText('dt')).toHaveAttribute('type', 'datetime-local');
    render(<TextInput ariaLabel="c" type="color" value="" />);
    expect(screen.getByLabelText('c')).toHaveAttribute('type', 'color');
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

describe('FileInput (EA-C0 pre-stage — plain-URL value, host-owned upload seam)', () => {
  it('URL text edit path calls onChange with the typed value', () => {
    const onChange = vi.fn();
    render(<FileInput ariaLabel="file" value="" onChange={onChange} />);
    const input = screen.getByLabelText('file');
    fireEvent.change(input, { target: { value: 'https://example.com/a.png' } });
    expect(onChange).toHaveBeenCalledWith('https://example.com/a.png');
  });

  it('clearing the text input calls onChange with undefined', () => {
    const onChange = vi.fn();
    render(<FileInput ariaLabel="file" value="https://example.com/a.png" onChange={onChange} />);
    const input = screen.getByLabelText('file');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('the clear button calls onChange with undefined', () => {
    const onChange = vi.fn();
    render(<FileInput ariaLabel="file" value="https://example.com/a.png" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('no file picker renders when onUpload is absent', () => {
    render(<FileInput ariaLabel="file" value="" onChange={vi.fn()} />);
    expect(screen.queryByLabelText('file — upload')).not.toBeInTheDocument();
  });

  it('selecting a file calls onUpload then onChange with the resolved url', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn().mockResolvedValue({ url: 'https://cdn.example.com/uploaded.png' });
    render(<FileInput ariaLabel="file" value="" onChange={onChange} onUpload={onUpload} />);
    const picker = screen.getByLabelText('file — upload') as HTMLInputElement;
    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    fireEvent.change(picker, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('https://cdn.example.com/uploaded.png'),
    );
  });

  it('onUpload rejection leaves the value unchanged and surfaces role="alert"', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn().mockRejectedValue(new Error('too large'));
    render(
      <FileInput
        ariaLabel="file"
        value="https://example.com/a.png"
        onChange={onChange}
        onUpload={onUpload}
      />,
    );
    const picker = screen.getByLabelText('file — upload') as HTMLInputElement;
    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    fireEvent.change(picker, { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('too large');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('file')).toHaveValue('https://example.com/a.png');
  });

  it('a11y attrs: aria-required/aria-invalid/aria-describedby pass through', () => {
    render(
      <FileInput
        ariaLabel="file"
        value=""
        onChange={vi.fn()}
        required
        invalid
        describedBy="file-help"
      />,
    );
    const input = screen.getByLabelText('file');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'file-help');
  });
});
