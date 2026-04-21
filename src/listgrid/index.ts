// ListGrid Main Components
export { ViewListGridWrapper } from './view/ViewListGridWrapper';
export { ViewEntityFormWrapper } from './view/ViewEntityFormWrapper';

// Auth — host applications must wrap their tree with <AuthProvider> from here.
export { AuthProvider, useSession, useAuth, hasAnyRole, registerSignOut, signOut } from './auth';
export type { Session, SessionUser, AuthContextValue, AuthProviderProps } from './auth';

// UI — host applications inject concrete UI primitives via <UIProvider>.
export { UIProvider, useUI } from './ui';
export type { UIComponents, UIProviderProps } from './ui';
export { GlobalModalManager } from './ui';

// Messaging — host applications configure toast/alert implementations.
export {
  configureMessages,
  showAlert,
  showConfirm,
  showError,
  showSuccess,
  showToast,
  openToast,
  clearAllToasts,
} from './message';
export type { MessageServices } from './message';

// Loading — optional global loading overlay hook.
export { configureLoading, useLoadingStore } from './loading';
export type { LoadingStore } from './loading';

// Modal manager store (zustand-based).
export {
  useModalManagerStore,
  configureOverlayZIndex,
  getOverlayZIndex,
  POPOVER_Z_INDEX,
} from './store';
export type { ModalOptions } from './store';

// Field extension registry — host apps register domain-specific field classes.
export { registerSmsHistoryField, createSmsHistoryField } from './extensions/FieldExtensions';

// Runtime configuration — replaces hard-coded process.env.NEXT_PUBLIC_* access.
export { configureRuntime, getRuntimeConfig } from './config/RuntimeConfig';
export type { RuntimeConfig } from './config/RuntimeConfig';

// i18n extension point — host injects a translator factory at bootstrap.
export { configureTranslator, getTranslation } from './utils/i18n';
export type { Translator, TranslatorI18n, TranslatorFactory } from './utils/i18n';

// Menu permission checker — host apps register a real checker that decides
// whether the current session may access a given URL / menu alias.
export {
  registerMenuPermissionChecker,
  checkAdminMenuPermission,
  DEFAULT_MENU_ALIAS,
} from './menu';
export type { MenuPermissionChecker, MenuPermissionCheckArgs } from './menu';

// Router — framework-agnostic navigation contract. Use @rchemist/listgrid/next for
// a Next.js adapter; other frameworks (Vite + React Router, Remix, etc.) can
// supply their own RouterServices implementation.
export { RouterProvider, useRouter, usePathname, useParams, useSearchParams, Link } from './router';
export type { RouterServices, RouterApi, RouterLinkProps, RouterProviderProps } from './router';

// URL state — framework-agnostic query-parameter sync contract.
export { UrlStateProvider, useQueryStates, createParser, parseAsString } from './urlState';
export type {
  UrlStateServices,
  UrlParser,
  UrlStateSetOptions,
  QueryStatesSetter,
  UrlStateProviderProps,
} from './urlState';

// API client — host apps configure an ApiClient that fulfils RCM-framework
// REST conventions. See src/listgrid/api/ApiClient.ts.
export {
  configureApiClient,
  callExternalHttpRequest,
  getExternalApiData,
  getExternalApiDataWithError,
  ResponseData,
  createResponseData,
} from './api';
export type {
  ApiClient,
  ApiRequestOptions,
  ApiMethod,
  IEntityError,
  IEntityErrorBody,
} from './api';

// Misc helpers & constants inherited from the original kit root barrel.
export {
  RegexAlias,
  RegexEmailAddress,
  RegexLowerEnglishNumber,
  RegexPasswordNormal,
  RegexPhoneNumber,
  RegexTelephoneNumber,
  RegexUrlBody,
  fDate,
  fDateTime,
  fToNow,
  getFormattedTime,
  formatPrice,
  isEmpty,
  isEquals,
  isEqualsIgnoreCase,
  isEqualCollection,
  isPositive,
  normalizeUrl,
  removeTrailingSeparator,
  parse,
  getLocalStorageItem,
  setLocalStorageItem,
  getSessionStorageObject,
  setSessionStorageItem,
  ASSET_SERVER_URL,
  configureAssetServerUrl,
  getAccessableAssetUrl,
  removeAssetServerPrefix,
  getDefinedDates,
} from './misc';
export type { DefinedDateType } from './misc';

// Core Components
export { ViewListGrid } from './components/list/ViewListGrid';
export { ViewEntityForm } from './components/form/ViewEntityForm';
export { FieldRenderer } from './components/form/FieldRenderer';

// SearchForm — filter + sort + paging DSL used by list views. Host apps that
// previously had their own `SearchForm` should re-export from here to avoid
// two incompatible nominal types.
export {
  SearchForm,
  getQueryConditionTypes,
  getQueryConditionValueType,
  getQueryConditionHelpText,
} from './form/SearchForm';
export type {
  FilterItem,
  SearchValue,
  SearchValueConfig,
  Direction,
  QueryConditionType,
  QueryConditionValueType,
} from './form/SearchForm';
export { PageResult } from './form/Type';
export type { SelectOption, MinMaxLimit, MinMaxStringLimit, EntityWithId } from './form/Type';

// XrefMapping value shape — raw serialized value carried by XrefMappingField.
export type { XrefMappingValue } from './components/fields/view/XrefMappingView';

// Configuration
export * from './config/Config';
export * from './config/ListGrid';
export * from './config/EntityItem';
export * from './config/EntityField';
export * from './config/EntityForm';
export * from './config/EntityTab';
export * from './config/EntityFieldGroup';
export * from './config/EntityFormTypes';
export * from './config/EntityFormMethod';
export * from './config/CommonType';
export * from './config/OnChangeEntityForm';
export * from './config/AdvancedSearchOpenCache';
export * from './config/ListGridViewFieldCache';

// Components - List
export { ListGridHeader } from './components/list/ListGridHeader';
export { RowItem } from './components/list/RowItem';
export { QuickSearchBar } from './components/list/QuickSearchBar';
export { AdvancedSearchForm } from './components/list/AdvancedSearchForm';
export { AdvancedSearchFormV2 } from './components/list/AdvancedSearchFormV2';
export { MemoizedFilterField } from './components/list/ui/MemoizedFilterField';
export { FieldSelector } from './components/list/ui/FieldSelector';
export { ViewFieldSelector } from './components/list/ViewFieldSelector';
export { SubCollectionButtons } from './components/list/SubCollectionButtons';

// Components - Form
export { ViewFieldGroup } from './components/form/ViewFieldGroup';
export { ViewTab } from './components/form/ViewTab';
export { ViewTabPanel } from './components/form/ViewTabPanel';
export { SubCollectionRenderer } from './components/form/SubCollectionRenderer';

// Field Components
export { StringField } from './components/fields/StringField';
export { NumberField } from './components/fields/NumberField';
export { BooleanField } from './components/fields/BooleanField';
export { SelectField } from './components/fields/SelectField';
export { MultiSelectField } from './components/fields/MultiSelectField';
export type { MultiSelectFieldProps } from './components/fields/MultiSelectField';
export { DateField } from './components/fields/DateField';
export { DatetimeField } from './components/fields/DatetimeField';
export { TimeField } from './components/fields/TimeField';
export { YearField } from './components/fields/YearField';
export { MonthField } from './components/fields/MonthField';
export { TextareaField } from './components/fields/TextareaField';
export { HtmlField } from './components/fields/HtmlField';
export { MarkdownField } from './components/fields/MarkdownField';
export { EmailField } from './components/fields/EmailField';
export { PasswordField } from './components/fields/PasswordField';
export { TelephoneNumberField } from './components/fields/TelephoneNumberField';
export { PhoneNumberField } from './components/fields/PhoneNumberField';
export { FileField } from './components/fields/FileField';
export { ImageField } from './components/fields/ImageField';
export { MultipleAssetField } from './components/fields/MultipleAssetField';
export { ColorField } from './components/fields/ColorField';
export { ColorPresetField } from './components/fields/ColorPresetField';
// SelectField 확장 인터페이스 및 타입 (StatusField 기능 통합)
export type {
  StatusReason,
  StatusChangeReason,
  StatusChangeValidation,
  ImmediateChangeProps,
} from './components/fields/SelectField';
export { ManyToOneField, getManyToOneEntityValue } from './components/fields/ManyToOneField';
export { MappedJoinField } from './components/fields/MappedJoinField';
export { XrefMappingField } from './components/fields/XrefMappingField';
export { XrefPriceMappingField } from './components/fields/XrefPriceMappingField';
export { XrefPreferMappingField } from './components/fields/XrefPreferMappingField';
export { XrefAvailableDateMappingField } from './components/fields/XrefAvailableDateMappingField';
export { CheckboxField } from './components/fields/CheckboxField';
export { TagField } from './components/fields/TagField';
export { BirthdayField } from './components/fields/BirthdayField';
// UserField removed from this library
export { LinkField } from './components/fields/LinkField';
export { QrField } from './components/fields/QrField';
export { MessageViewField } from './components/fields/MessageViewField';
export { ProfileField } from './components/fields/ProfileField';
export { InlineMapField } from './components/fields/InlineMapField';
export { CustomOptionField } from './components/fields/CustomOptionField';
export { RuleField } from './components/fields/RuleField';
export { SelectFieldRenderer } from './components/fields/SelectFieldRenderer';
export { applyFullAddressFields as ApplyFullAddressFields } from './components/fields/ApplyFullAddressFields';

// Content Asset Field
export { ContentAssetField } from './components/fields/contentasset/ContentAssetField';
export { ContentAssetItem } from './components/fields/contentasset/ContentAssetItem';

// Address Fields
export { AddressFieldView } from './components/fields/address/AddressFieldView';
export { AddressMapField } from './components/fields/address/AddressMapField';
export { PostCodeSelector } from './components/fields/address/PostCodeSelector';
export { KakaoMap } from './components/fields/address/KakaoMap';

// Rule Fields
export { RuleFieldView } from './components/fields/rule/RuleFieldView';
export { RuleBasedFieldsView as RuleBasedFieldView } from './components/fields/rule/RuleBasedFieldView';
export { RuleFieldRenderer } from './components/fields/rule/RuleFieldRenderer';
export { RuleBasedSelector } from './components/fields/rule/RuleBasedSelector';
export { RuleCondition } from './components/fields/rule/RuleCondition';

// View Components
// UserView and UserListView removed from this library
export { ManyToOneView } from './components/fields/view/ManyToOneView';
export { ManyToOneListView } from './components/fields/view/ManyToOneListView';
export { TreeSelectView } from './components/fields/view/TreeSelectView';
export { LinkFieldView } from './components/fields/view/LinkFieldView';
export { XrefMappingView } from './components/fields/view/XrefMappingView';
export { XrefPriceMappingView as XrefPiceMappingView } from './components/fields/view/XrefPiceMappingView';
export { XrefPreferMappingView } from './components/fields/view/XrefPreferMappingView';
export { XrefPriorityMappingView } from './components/fields/view/XrefPriorityMappingView';
export { XrefAvailableDateMappingView } from './components/fields/view/XrefAvailableDateMappingView';
export { MultipleAssetUpload } from './components/fields/view/MultipleAssetUpload';

// Abstract Field Components
export { FormField } from './components/fields/abstract/FormField';
export { ListableFormField } from './components/fields/abstract/ListableFormField';
export { OptionalField } from './components/fields/abstract/OptionalField';
export { AbstractManyToOneField } from './components/fields/abstract/AbstractManyToOneField';
export { AbstractDateField } from './components/fields/abstract/AbstractDateField';
export { CheckButtonValidationField } from './components/fields/abstract/CheckButtonValidationField';

// Filter Components
export { DatetimeFilter } from './components/fields/filter/DatetimeFilter';
export { NumberFilter } from './components/fields/filter/NumberFilter';

// Preset Components
export * from './components/fields/Preset';

// Status Components
export { StatusChangeReasonModal } from './components/fields/StatusChangeReasonModal';

// Helper Components
export * from './components/helper/FieldRendererHelper';
export { ShowNotifications } from './components/helper/ShowNotifications';

// Revision Components
export { RevisionField } from './components/revision/RevisionField';

// API Components
export { ApiSpecificationButton } from './components/api/ApiSpecificationButton';
export { ViewApiSpecification } from './components/api/ViewApiSpecification';

// Transfer Components
export { DataExporter } from './transfer/DataExporter';
export { DataExportProcessor } from './transfer/DataExportProcessor';
export { default as DynamicDataImporter } from './transfer/DynamicDataImporter';
export { DataImportResultView } from './transfer/DataImportResultView';
export { DataImportDescription } from './transfer/DataImportDescription';
export { DataImportSample } from './transfer/DataImportSample';
export { DataImporter } from './transfer/DataImporter';
export { DataImportProcessor } from './transfer/DataImportProcessor';

// Transfer Services and Types
export * from './transfer/DataExportService';
export * from './transfer/Type';

// Transfer Providers
export * from './transfer/Provider/ExcelProvider';

// Validations
export * from './validations/Validation';
export * from './validations/RequiredValidation';
export * from './validations/EmailValidation';
export * from './validations/CustomValidation';
export * from './validations/RegexValidation';
export * from './validations/RegexFormularValidation';
export * from './validations/MinMaxNumberValidation';
export * from './validations/TelephoneNumberValidation';
export * from './validations/PhoneNumberValidation';
export * from './validations/PasswordValidation';
export * from './validations/StringValidation';
export * from './validations/IpAddressValidation';

// Extension Types
export * from './extensions/EntityFormExtension.types';

// Types
export * from './components/form/types/ViewEntityForm.types';
export * from './components/form/types/ViewEntityFormAlerts.types';
export * from './components/form/types/ViewEntityFormButtons.types';
export * from './components/list/types/ViewListGrid.types';
export * from './components/list/types/ViewListGridTheme.types';
export * from './components/list/types/ListGridHeader.types';
export * from './components/list/types/RowItem.types';
export * from './components/list/types/SubCollectionButtons.type';
export * from './components/api/Type';
export * from './components/fields/rule/Type';
export * from './components/fields/contentasset/types';

// ListGrid Theme
export * from './components/list/context/ListGridThemeContext';
export * from './components/list/themes';

// Hooks
export * from './components/form/hooks/useEntityFormSave';
export * from './components/form/hooks/useEntityFormInitializer';
export * from './components/form/hooks/useAlertManager';
export * from './components/form/hooks/useEntityFormTitle';
export * from './components/form/hooks/useEntityFormLogic';
export * from './components/list/hooks/useListGridLogic';
export * from './components/list/hooks/useListGridHeader';
export * from './components/list/hooks/useQuickSearchBar';
export * from './components/fields/contentasset/hooks/useContentAsset';
// Stage 9: re-export the full surface of listgrid internals for
// migration-compatibility (wildcard for files whose helper
// functions and companion exports were previously hidden by a
// narrower `export { X }` line).
export * from './components/fields/abstract/FormField';
export * from './components/fields/abstract/ListableFormField';
export * from './components/fields/abstract/OptionalField';
export type {
  AbstractManyToOneFieldProps,
  CardViewConfig,
  SelectBoxViewConfig,
} from './components/fields/abstract/AbstractManyToOneField';
export type { AbstractDateFieldProps } from './components/fields/abstract/AbstractDateField';
// Note: abstract/CheckButtonValidationField also exports a Props type with the
// same name as config/Config's CheckButtonValidationFieldProps (distinct shape).
// The Config.ts one is the public one. The abstract version is used only for
// class inheritance and is not re-exported to avoid ambiguity.
export * from './components/fields/ApplyFullAddressFields';
export * from './components/fields/CustomOptionField';
export * from './components/fields/view/CardManyToOneView';
export * from './components/form/context/EntityFormThemeContext';
export * from './components/form/types/ViewEntityFormTheme.types';
export * from './config/SubCollectionField';
export * from './config/CardSubCollectionField';
export * from './config/TableSubCollectionField';
export * from './config/EntityFormButton';
export * from './config/InlineSubCollectionField';
export * from './transfer/DynamicDataImporter';
export * from './transfer/ExcelPasswordField';

// Styling helpers — `cn` (tailwind-merge + clsx) and the per-slot
// `classNames` / `mergeSlot` / `resolveSlots` primitives hosts use when
// overriding scoped `rcm-*` classes on field components.
export * from './utils/cn';
export * from './utils/classNames';
