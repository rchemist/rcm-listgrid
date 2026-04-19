// api spec 을 보여 주는 두 가지 방법
import { SelectOption } from '../../form/Type';

export interface ApiSpecification {
  url: string;
  authorized?: boolean; // accessToken 이 반드시 필요한지 여부
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  formData?: ApiFormData | string;
  response: string;
}

export interface ApiFormData {
  type: 'Request Body' | 'Query Parameters' | 'None';
  body?: string;
  fields?: ApiDataField[];
}

export interface ApiDataField {
  name: string;
  label: string;
  defaultValue?: string;
  type: string;
  description?: string;
  required?: boolean;
  options?: SelectOption[];
}

// 타입 가드 함수
export function isApiSpecification(obj: any): obj is ApiSpecification {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.url === 'string' &&
    typeof obj.method === 'string' &&
    (typeof obj.response === 'string' || obj.response !== undefined)
  );
}
