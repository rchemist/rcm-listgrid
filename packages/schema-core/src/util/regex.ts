// Regex constants — transplanted verbatim from src/listgrid/misc/index.ts
// (0.3.x). React-free. These patterns MUST NOT change: the concrete
// validations in ../validations depend on them byte-for-byte, and changing a
// pattern changes what data existing forms accept/reject.
//
// Only the subset actually consumed by the validations catalog is transplanted
// here (EmailValidation, PhoneNumberValidation, TelephoneNumberValidation,
// PasswordValidation). RegexAllowedIpAddr is NOT here — it was defined
// module-locally in IpAddressValidation.ts (0.3.x), not in misc/index.ts, and
// stays local to ../validations/ip-address-validation.ts for the same reason.

export const RegexEmailAddress: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export const RegexPhoneNumber: RegExp = /^[0-9]{10,11}$/;
export const RegexTelephoneNumber: RegExp = /^[0-9]{9,11}$/;
export const RegexPasswordNormal: RegExp =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&+~()=_-])[A-Za-z\d@$!%*#?&+~()=_-]{8,25}$/;
