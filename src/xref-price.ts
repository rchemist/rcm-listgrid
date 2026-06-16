// Opt-in subpath: `@rchemist/listgrid/xref-price`
//
// Pulled OUT of the main barrel so that consumers who don't use the price-xref
// mapping field are never forced to install `sweetalert2`. Importing from here
// requires the optional peers `sweetalert2` and `sweetalert2-react-content`.
//
// The other Xref fields (Mapping / Prefer / AvailableDate) are peer-free and
// remain in the main barrel.
export { XrefPriceMappingField } from './listgrid/components/fields/XrefPriceMappingField';
export { XrefPriceMappingView as XrefPiceMappingView } from './listgrid/components/fields/view/XrefPiceMappingView';
