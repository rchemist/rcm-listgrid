// Stage 1 Inert Copy 전용 ambient 선언.
// @gjcu/* workspace 패키지 import를 any 타입으로 처리해 타입체크만 통과시키는 baseline stub.
//
// 각 module 블록 안에서 사용처의 named import를 모두 const + type으로 선언.
// Stage 2~3에서 Provider 주입으로 대체되면서 자연 소멸 예정 (DECISIONS.md #8).
//
// 자동 생성됨 — 원본 소스의 import 분석으로 추출. 수동 편집 금지, 원본 소스 변경 시 재생성.

declare module '@gjcu/entities/Academic/Common/fields/smshistory' {
    export const SmsHistoryField: any;
    export type SmsHistoryField = any;
}

declare module '@gjcu/shared' {
    export const hasAnyRole: any;
    export type hasAnyRole = any;
}

declare module '@gjcu/ui' {
    export const ASSET_SERVER_URL: any;
    export type ASSET_SERVER_URL = any;
    export const DefinedDateType: any;
    export type DefinedDateType = any;
    export const EntityError: any;
    export type EntityError = any;
    export const RegexAlias: any;
    export type RegexAlias = any;
    export const RegexEmailAddress: any;
    export type RegexEmailAddress = any;
    export const RegexLowerEnglishNumber: any;
    export type RegexLowerEnglishNumber = any;
    export const RegexPasswordNormal: any;
    export type RegexPasswordNormal = any;
    export const RegexPhoneNumber: any;
    export type RegexPhoneNumber = any;
    export const RegexTelephoneNumber: any;
    export type RegexTelephoneNumber = any;
    export const RegexUrlBody: any;
    export type RegexUrlBody = any;
    export const RequestUtil: any;
    export type RequestUtil = any;
    export const fDate: any;
    export type fDate = any;
    export const fDateTime: any;
    export type fDateTime = any;
    export const fToNow: any;
    export type fToNow = any;
    export const formatPrice: any;
    export type formatPrice = any;
    export const getAccessableAssetUrl: any;
    export type getAccessableAssetUrl = any;
    export const getDefinedDates: any;
    export type getDefinedDates = any;
    export const getExternalApiData: any;
    export type getExternalApiData = any;
    export const getExternalApiDataWithError: any;
    export type getExternalApiDataWithError = any;
    export const getFormattedTime: any;
    export type getFormattedTime = any;
    export const getLocalStorageItem: any;
    export type getLocalStorageItem = any;
    export const getSessionStorageObject: any;
    export type getSessionStorageObject = any;
    export const isEmpty: any;
    export type isEmpty = any;
    export const isEqualCollection: any;
    export type isEqualCollection = any;
    export const isEquals: any;
    export type isEquals = any;
    export const isEqualsIgnoreCase: any;
    export type isEqualsIgnoreCase = any;
    export const isPositive: any;
    export type isPositive = any;
    export const normalizeUrl: any;
    export type normalizeUrl = any;
    export const parse: any;
    export type parse = any;
    export const removeAssetServerPrefix: any;
    export type removeAssetServerPrefix = any;
    export const removeTrailingSeparator: any;
    export type removeTrailingSeparator = any;
    export const setLocalStorageItem: any;
    export type setLocalStorageItem = any;
    export const setSessionStorageItem: any;
    export type setSessionStorageItem = any;
}

declare module '@gjcu/ui/auth' {
    export const Session: any;
    export type Session = any;
    export const useSession: any;
    export type useSession = any;
}

declare module '@gjcu/ui/auth/types' {
    export const Session: any;
    export type Session = any;
}

declare module '@gjcu/ui/common/func' {
    export const getAdditionalColorClass: any;
    export type getAdditionalColorClass = any;
    export const getAlignClassName: any;
    export type getAlignClassName = any;
    export const getOppositeTextColorClass: any;
    export type getOppositeTextColorClass = any;
}

declare module '@gjcu/ui/common/type' {
    export const AdditionalColorType: any;
    export type AdditionalColorType = any;
    export const AllColorTypes: any;
    export type AllColorTypes = any;
    export const ColorType: any;
    export type ColorType = any;
    export const SpanValue: any;
    export type SpanValue = any;
    export const TextAlignType: any;
    export type TextAlignType = any;
}

declare module '@gjcu/ui/components/scrollbar/SafePerfectScrollbar' {
    export const SafePerfectScrollbar: any;
    export type SafePerfectScrollbar = any;
}

declare module '@gjcu/ui/elements/Paper' {
    export const Paper: any;
    export type Paper = any;
}

declare module '@gjcu/ui/elements/alerts/Alert' {
    export const Alert: any;
    export type Alert = any;
}

declare module '@gjcu/ui/elements/badges/Badge' {
    export const Badge: any;
    export type Badge = any;
}

declare module '@gjcu/ui/elements/breadcrumbs/Breadcrumb' {
    export const Breadcrumb: any;
    export type Breadcrumb = any;
    export const BreadcrumbItem: any;
    export type BreadcrumbItem = any;
}

declare module '@gjcu/ui/elements/buttons/Button' {
    export const Button: any;
    export type Button = any;
}

declare module '@gjcu/ui/elements/dropdowns/Dropdown' {
    const __default: any;
    export default __default;
}

declare module '@gjcu/ui/elements/indicator/Indicator' {
    export const Indicator: any;
    export type Indicator = any;
}

declare module '@gjcu/ui/elements/indicator/LoadingOverlay' {
    export const LoadingOverlay: any;
    export type LoadingOverlay = any;
}

declare module '@gjcu/ui/elements/indicator/Skeleton' {
    export const Skeleton: any;
    export type Skeleton = any;
}

declare module '@gjcu/ui/elements/layout/Box' {
    export const Box: any;
    export type Box = any;
}

declare module '@gjcu/ui/elements/layout/Flex' {
    export const Flex: any;
    export type Flex = any;
}

declare module '@gjcu/ui/elements/layout/Grid' {
    export const Grid: any;
    export type Grid = any;
}

declare module '@gjcu/ui/elements/layout/Group' {
    export const Group: any;
    export type Group = any;
}

declare module '@gjcu/ui/elements/layout/SimpleGrid' {
    export const SimpleGrid: any;
    export type SimpleGrid = any;
}

declare module '@gjcu/ui/elements/layout/Stack' {
    export const Stack: any;
    export type Stack = any;
}

declare module '@gjcu/ui/elements/pagination/Pagination' {
    export const Pagination: any;
    export type Pagination = any;
}

declare module '@gjcu/ui/elements/popover/Popover' {
    export const Popover: any;
    export type Popover = any;
}

declare module '@gjcu/ui/elements/stepper/Stepper' {
    export const Stepper: any;
    export type Stepper = any;
}

declare module '@gjcu/ui/elements/table/Table' {
    export const Table: any;
    export type Table = any;
}

declare module '@gjcu/ui/elements/tooltip/Tooltip' {
    export const Tooltip: any;
    export type Tooltip = any;
    export const TooltipColor: any;
    export type TooltipColor = any;
}

declare module '@gjcu/ui/elements/tooltipcard' {
    export const TooltipCard: any;
    export type TooltipCard = any;
}

declare module '@gjcu/ui/elements/tree' {
    export const Tree: any;
    export type Tree = any;
    export const TreeNodeData: any;
    export type TreeNodeData = any;
}

declare module '@gjcu/ui/form/BooleanRadio' {
    export const BooleanRadio: any;
    export type BooleanRadio = any;
}

declare module '@gjcu/ui/form/CheckBox' {
    export const CheckBox: any;
    export type CheckBox = any;
}

declare module '@gjcu/ui/form/CheckBoxChip' {
    export const CheckBoxChip: any;
    export type CheckBoxChip = any;
}

declare module '@gjcu/ui/form/CheckButtonValidationInput' {
    export const CheckButtonValidationInput: any;
    export type CheckButtonValidationInput = any;
}

declare module '@gjcu/ui/form/ColorInput' {
    export const ColorInput: any;
    export type ColorInput = any;
}

declare module '@gjcu/ui/form/DynamicFileUpload' {
    export const LazyFileUploadInput: any;
    export type LazyFileUploadInput = any;
}

declare module '@gjcu/ui/form/EmailDomainInput' {
    export const DEFAULT_EMAIL_DOMAINS: any;
    export type DEFAULT_EMAIL_DOMAINS = any;
    export const EmailDomainCheckButtonInput: any;
    export type EmailDomainCheckButtonInput = any;
    export const EmailDomainInput: any;
    export type EmailDomainInput = any;
}

declare module '@gjcu/ui/form/FileUploadInput' {
    export const FileFieldValue: any;
    export type FileFieldValue = any;
    export const FileUploadInput: any;
    export type FileUploadInput = any;
}

declare module '@gjcu/ui/form/FlatPickrDateField' {
    export const FlatPickrDateField: any;
    export type FlatPickrDateField = any;
}

declare module '@gjcu/ui/form/InlineMap' {
    export const InlineMap: any;
    export type InlineMap = any;
    export const InlineMapPendingRef: any;
    export type InlineMapPendingRef = any;
    export const KeyValue: any;
    export type KeyValue = any;
}

declare module '@gjcu/ui/form/MarkdownEditor' {
    export const MarkdownEditor: any;
    export type MarkdownEditor = any;
}

declare module '@gjcu/ui/form/MultiSelectBox' {
    export const MultiSelectBox: any;
    export type MultiSelectBox = any;
}

declare module '@gjcu/ui/form/NumberInput' {
    export const Currency: any;
    export type Currency = any;
    export const Double: any;
    export type Double = any;
    export const NumberInput: any;
    export type NumberInput = any;
}

declare module '@gjcu/ui/form/PasswordStrength' {
    export const PasswordStrength: any;
    export type PasswordStrength = any;
    export const PasswordStrengthView: any;
    export type PasswordStrengthView = any;
}

declare module '@gjcu/ui/form/RadioChip' {
    export const RadioChip: any;
    export type RadioChip = any;
}

declare module '@gjcu/ui/form/RadioInput' {
    export const RadioInput: any;
    export type RadioInput = any;
}

declare module '@gjcu/ui/form/SearchForm' {
    export const Direction: any;
    export type Direction = any;
    export const FilterItem: any;
    export type FilterItem = any;
    export const QueryConditionType: any;
    export type QueryConditionType = any;
    export const SearchForm: any;
    export type SearchForm = any;
    export const SearchValue: any;
    export type SearchValue = any;
    export const getQueryConditionHelpText: any;
    export type getQueryConditionHelpText = any;
    export const getQueryConditionTypes: any;
    export type getQueryConditionTypes = any;
    export const getQueryConditionValueType: any;
    export type getQueryConditionValueType = any;
}

declare module '@gjcu/ui/form/SelectBox' {
    export const SelectBox: any;
    export type SelectBox = any;
}

declare module '@gjcu/ui/form/Style' {
    export const readonlyClass: any;
    export type readonlyClass = any;
}

declare module '@gjcu/ui/form/TagsInput/index' {
    export const TagsInput: any;
    export type TagsInput = any;
}

declare module '@gjcu/ui/form/TagsInput/types' {
    export const TagValidationResult: any;
    export type TagValidationResult = any;
}

declare module '@gjcu/ui/form/TextInput' {
    export const TextInput: any;
    export type TextInput = any;
}

declare module '@gjcu/ui/form/Textarea' {
    export const Textarea: any;
    export type Textarea = any;
}

declare module '@gjcu/ui/form/Tiptap/TiptapEditor' {
    export const getPlainText: any;
    export type getPlainText = any;
}

declare module '@gjcu/ui/form/Type' {
    export const MinMaxLimit: any;
    export type MinMaxLimit = any;
    export const MinMaxStringLimit: any;
    export type MinMaxStringLimit = any;
    export const PageResult: any;
    export type PageResult = any;
    export const SelectOption: any;
    export type SelectOption = any;
}

declare module '@gjcu/ui/indicator/LinearIndicator' {
    export const LinearIndicator: any;
    export type LinearIndicator = any;
}

declare module '@gjcu/ui/layout/BaseLoading' {
    export const useLoadingStore: any;
    export type useLoadingStore = any;
}

declare module '@gjcu/ui/listgrid' {
    export const EntityFormThemeProvider: any;
    export type EntityFormThemeProvider = any;
}

declare module '@gjcu/ui/message/ShowMessage' {
    export const ShowError: any;
    export type ShowError = any;
}

declare module '@gjcu/ui/message/ToastMessage' {
    export const openToast: any;
    export type openToast = any;
}

declare module '@gjcu/ui/message/messageUtils' {
    export const clearAllToasts: any;
    export type clearAllToasts = any;
    export const showAlert: any;
    export type showAlert = any;
    export const showConfirm: any;
    export type showConfirm = any;
    export const showSuccess: any;
    export type showSuccess = any;
    export const showToast: any;
    export type showToast = any;
}

declare module '@gjcu/ui/modals' {
    export const Modal: any;
    export type Modal = any;
}

declare module '@gjcu/ui/modals/Modal' {
    export const Modal: any;
    export type Modal = any;
}

declare module '@gjcu/ui/store' {
    export const ModalOptions: any;
    export type ModalOptions = any;
    export const POPOVER_Z_INDEX: any;
    export type POPOVER_Z_INDEX = any;
    export const getOverlayZIndex: any;
    export type getOverlayZIndex = any;
    export const useModalManagerStore: any;
    export type useModalManagerStore = any;
}

declare module '@gjcu/ui/user/UserView' {
    export const UserView: any;
    export type UserView = any;
}

declare module '@gjcu/ui/utils' {
    export const isEmpty: any;
    export type isEmpty = any;
    export const isTrue: any;
    export type isTrue = any;
}

declare module '@gjcu/ui/utils/BooleanUtil' {
    export const isTrue: any;
    export type isTrue = any;
}

declare module '@gjcu/ui/utils/PhoneUtil' {
    export const formatPhoneNumber: any;
    export type formatPhoneNumber = any;
    export const removePhoneNumberHyphens: any;
    export type removePhoneNumberHyphens = any;
}

declare module '@gjcu/ui/utils/StringUtil' {
    export const defaultString: any;
    export type defaultString = any;
    export const generateSlug: any;
    export type generateSlug = any;
    export const isBlank: any;
    export type isBlank = any;
    export const subStringAfterLast: any;
    export type subStringAfterLast = any;
    export const subStringBeforeLast: any;
    export type subStringBeforeLast = any;
    export const subStringBetween: any;
    export type subStringBetween = any;
}

declare module '@gjcu/ui/utils/i18n' {
    export const getTranslation: any;
    export type getTranslation = any;
}

declare module '@gjcu/ui/utils/jsonUtils' {
    export const parse: any;
    export type parse = any;
    export const stringify: any;
    export type stringify = any;
}
