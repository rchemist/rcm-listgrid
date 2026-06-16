// Opt-in subpath: `@rchemist/listgrid/qr`
//
// Pulled OUT of the main barrel so that consumers who don't use QR codes are
// never forced to install `qrcode.react`. Importing from here requires the
// optional peer `qrcode.react@^3` (v3 default-export) to be installed.
export { QrField } from './listgrid/components/fields/QrField';
