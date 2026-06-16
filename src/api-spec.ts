// Opt-in subpath: `@rchemist/listgrid/api-spec`
//
// Pulled OUT of the main barrel so that consumers who don't render the API
// specification viewer are never forced to install `sweetalert2`. Importing
// from here requires the optional peers `sweetalert2` and
// `sweetalert2-react-content`.
//
// `./components/api/Type` is peer-free and still re-exported from the main
// barrel; it is re-exported here too for self-containedness.
export { ViewApiSpecification } from './listgrid/components/api/ViewApiSpecification';
export { ApiSpecificationButton } from './listgrid/components/api/ApiSpecificationButton';
export * from './listgrid/components/api/Type';
