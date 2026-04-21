[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / RouterServices

# Interface: RouterServices

Defined in: [listgrid/router/types.ts:35](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L35)

Router services consumed by listgrid. Host adapters supply this to
<RouterProvider value={...}>. The useXxx properties are React hooks
— they will be invoked during listgrid component renders.

## Properties

### useRouter

> **useRouter**: () => [`RouterApi`](RouterApi.md)

Defined in: [listgrid/router/types.ts:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L37)

Hook returning the imperative router API. Called inside listgrid components.

#### Returns

[`RouterApi`](RouterApi.md)

***

### usePathname

> **usePathname**: () => `string`

Defined in: [listgrid/router/types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L39)

Hook returning the current pathname (e.g. "/admin/users").

#### Returns

`string`

***

### useParams

> **useParams**: () => `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

Defined in: [listgrid/router/types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L41)

Hook returning current route params (dynamic segments).

#### Returns

`Record`\<`string`, `string` \| `string`[] \| `undefined`\>

***

### useSearchParams

> **useSearchParams**: () => `URLSearchParams`

Defined in: [listgrid/router/types.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L43)

Hook returning current URL search params.

#### Returns

`URLSearchParams`

***

### Link

> **Link**: `ComponentType`\<[`RouterLinkProps`](RouterLinkProps.md)\>

Defined in: [listgrid/router/types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/router/types.ts#L45)

Link component that navigates client-side without full reload.
