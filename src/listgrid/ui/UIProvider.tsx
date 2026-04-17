import React, { createContext, useContext, ReactNode, ComponentType } from 'react';

// Stage 3b UI primitives contract.
//
// Host applications inject concrete implementations (HeroUI, shadcn, custom, etc.)
// via <UIProvider components={...}>. All props are typed as `any` to preserve the
// flexibility of the original @gjcu/ui API surface; precise per-component typing
// is a Stage 6 refinement.
//
// See DECISIONS.md #19 for the rationale on Provider-vs-adapter-vs-headless-core.

export interface UIComponents {
    Alert: ComponentType<any>;
    Badge: ComponentType<any>;
    BooleanRadio: ComponentType<any>;
    Box: ComponentType<any>;
    Breadcrumb: ComponentType<any>;
    BreadcrumbItem: ComponentType<any>;
    Button: ComponentType<any>;
    CheckBox: ComponentType<any>;
    CheckBoxChip: ComponentType<any>;
    CheckButtonValidationInput: ComponentType<any>;
    ColorInput: ComponentType<any>;
    Dropdown: ComponentType<any>;
    EmailDomainCheckButtonInput: ComponentType<any>;
    EmailDomainInput: ComponentType<any>;
    FileUploadInput: ComponentType<any>;
    Flex: ComponentType<any>;
    FlatPickrDateField: ComponentType<any>;
    Grid: ComponentType<any>;
    Group: ComponentType<any>;
    Indicator: ComponentType<any>;
    InlineMap: ComponentType<any>;
    LazyFileUploadInput: ComponentType<any>;
    LinearIndicator: ComponentType<any>;
    LoadingOverlay: ComponentType<any>;
    MarkdownEditor: ComponentType<any>;
    Modal: ComponentType<any>;
    MultiSelectBox: ComponentType<any>;
    NumberInput: ComponentType<any>;
    Pagination: ComponentType<any>;
    Paper: ComponentType<any>;
    PasswordStrength: ComponentType<any>;
    PasswordStrengthView: ComponentType<any>;
    Popover: ComponentType<any>;
    RadioChip: ComponentType<any>;
    RadioInput: ComponentType<any>;
    SafePerfectScrollbar: ComponentType<any>;
    SelectBox: ComponentType<any>;
    SimpleGrid: ComponentType<any>;
    Skeleton: ComponentType<any>;
    Stack: ComponentType<any>;
    Stepper: ComponentType<any>;
    Table: ComponentType<any>;
    TagsInput: ComponentType<any>;
    Textarea: ComponentType<any>;
    TextInput: ComponentType<any>;
    Tooltip: ComponentType<any>;
    TooltipCard: ComponentType<any>;
    Tree: ComponentType<any>;
    UserView: ComponentType<any>;
}

const UIContext = createContext<UIComponents | null>(null);

export interface UIProviderProps {
    components: UIComponents;
    children: ReactNode;
}

export function UIProvider({ components, children }: UIProviderProps) {
    return <UIContext.Provider value={components}>{children}</UIContext.Provider>;
}

export function useUI(): UIComponents {
    const ctx = useContext(UIContext);
    if (ctx === null) {
        throw new Error(
            '[@rcm/listgrid] useUI must be called within a <UIProvider>. ' +
                'Wrap your app with <UIProvider components={...}> imported from @rcm/listgrid.'
        );
    }
    return ctx;
}

// Thin wrapper factory — each wrapper defers to the host-provided component
// at render time via Context lookup. Typed as `any` so wrappers can carry
// compound sub-components (e.g. Table.Th) as static properties without TS
// complaining, matching the original @gjcu/ui API surface.
function makeWrapper<K extends keyof UIComponents>(name: K): any {
    const Wrapper: any = (props: any) => {
        const comps = useUI();
        const Component = comps[name];
        if (!Component) {
            throw new Error(`[@rcm/listgrid] UI component "${String(name)}" missing from UIProvider.`);
        }
        return <Component {...props} />;
    };
    Wrapper.displayName = `rcm.${String(name)}`;
    return new Proxy(Wrapper, {
        get(target, prop, receiver) {
            // Forward unknown static property access (Table.Th, Tooltip.Content, etc.)
            // to the host-provided component when it has been looked up.
            // We can't look up at import time, so we return a wrapper that does so lazily.
            if (prop in target) return Reflect.get(target, prop, receiver);
            if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver);
            // Return a sub-wrapper that resolves the compound on first render.
            const subKey = prop as string;
            const SubWrapper: any = (subProps: any) => {
                const comps = useUI();
                const Parent: any = comps[name];
                if (!Parent) {
                    throw new Error(`[@rcm/listgrid] UI component "${String(name)}" missing from UIProvider.`);
                }
                const Sub = Parent[subKey];
                if (!Sub) {
                    throw new Error(
                        `[@rcm/listgrid] Compound "${String(name)}.${subKey}" missing on host component.`
                    );
                }
                return <Sub {...subProps} />;
            };
            SubWrapper.displayName = `rcm.${String(name)}.${subKey}`;
            return SubWrapper;
        },
    });
}

export const Alert = makeWrapper('Alert');
export const Badge = makeWrapper('Badge');
export const BooleanRadio = makeWrapper('BooleanRadio');
export const Box = makeWrapper('Box');
export const Breadcrumb = makeWrapper('Breadcrumb');
export const BreadcrumbItem = makeWrapper('BreadcrumbItem');
export const Button = makeWrapper('Button');
export const CheckBox = makeWrapper('CheckBox');
export const CheckBoxChip = makeWrapper('CheckBoxChip');
export const CheckButtonValidationInput = makeWrapper('CheckButtonValidationInput');
export const ColorInput = makeWrapper('ColorInput');
export const Dropdown = makeWrapper('Dropdown');
export const EmailDomainCheckButtonInput = makeWrapper('EmailDomainCheckButtonInput');
export const EmailDomainInput = makeWrapper('EmailDomainInput');
export const FileUploadInput = makeWrapper('FileUploadInput');
export const Flex = makeWrapper('Flex');
export const FlatPickrDateField = makeWrapper('FlatPickrDateField');
export const Grid = makeWrapper('Grid');
export const Group = makeWrapper('Group');
export const Indicator = makeWrapper('Indicator');
export const InlineMap = makeWrapper('InlineMap');
export const LazyFileUploadInput = makeWrapper('LazyFileUploadInput');
export const LinearIndicator = makeWrapper('LinearIndicator');
export const LoadingOverlay = makeWrapper('LoadingOverlay');
export const MarkdownEditor = makeWrapper('MarkdownEditor');
export const Modal = makeWrapper('Modal');
export const MultiSelectBox = makeWrapper('MultiSelectBox');
export const NumberInput = makeWrapper('NumberInput');
export const Pagination = makeWrapper('Pagination');
export const Paper = makeWrapper('Paper');
export const PasswordStrength = makeWrapper('PasswordStrength');
export const PasswordStrengthView = makeWrapper('PasswordStrengthView');
export const Popover = makeWrapper('Popover');
export const RadioChip = makeWrapper('RadioChip');
export const RadioInput = makeWrapper('RadioInput');
export const SafePerfectScrollbar = makeWrapper('SafePerfectScrollbar');
export const SelectBox = makeWrapper('SelectBox');
export const SimpleGrid = makeWrapper('SimpleGrid');
export const Skeleton = makeWrapper('Skeleton');
export const Stack = makeWrapper('Stack');
export const Stepper = makeWrapper('Stepper');
export const Table = makeWrapper('Table');
export const TagsInput = makeWrapper('TagsInput');
export const Textarea = makeWrapper('Textarea');
export const TextInput = makeWrapper('TextInput');
export const Tooltip = makeWrapper('Tooltip');
export const TooltipCard = makeWrapper('TooltipCard');
export const Tree = makeWrapper('Tree');
export const UserView = makeWrapper('UserView');

// Shared types used as prop/value types across the library. Kept as `any` for
// Stage 3b; tighter typing is a Stage 6 concern.
// Some names are used as BOTH value (component) and type annotation in the
// original source, so they have matching `const` and `type` declarations.
export type TooltipColor = any;
export type TreeNodeData = any;
export type InlineMapPendingRef = any;
export type KeyValue = any;
export type BreadcrumbItem = any;
export type Tree = any;
export type Currency = any;
export type Double = any;
export type PasswordStrength = any;

// FileFieldValue is used both as a type annotation AND with `instanceof` in the
// original source (e.g., FileField.tsx). Ship a class so instanceof checks work;
// the class itself is a minimal any-shape holder.
export class FileFieldValue {
    existFiles: any[] = [];
    newFiles: any[] = [];
    [key: string]: any;

    static create(...args: any[]): FileFieldValue {
        const v = new FileFieldValue();
        // Minimal behavior: host can override via subclass if richer factory
        // semantics are needed. Args ignored here.
        void args;
        return v;
    }
}

// Constants whose concrete values host apps may override through other means.
export const DEFAULT_EMAIL_DOMAINS: string[] = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'kakao.com',
    'hanmail.net',
    'nate.com',
];
export function readonlyClass(readonly: boolean | undefined, extra: string = ''): string {
    return readonly ? `bg-gray-100 opacity-60 cursor-not-allowed ${extra}`.trim() : extra;
}

// NumberInput-adjacent value helpers. Kept as any wrappers.
export const Currency: any = {};
export const Double: any = {};

// Tiptap-adjacent helper used in validations.
export function getPlainText(html: string | null | undefined): string {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, '');
}
