'use client';
import { memo, useCallback, useRef, useState } from 'react';
import { Address } from './AddressMapField';
import { isBlank } from '../../../utils/StringUtil';
import { Flex } from '../../../ui';
import { Modal } from '../../../ui';
import DaumPostcode from 'react-daum-postcode';

interface PostCodeSelectorProps {
  address?: Address | undefined;
  onSubmit: (address: Address) => void;
  onRemove?: (() => void) | undefined;
  required: boolean;
}

/**
 * 외부 (AddressFieldView / EntityForm) 상호작용을 담당하는 껍데기.
 * 모달 본문은 아래 PostCodeSelectorForm 으로 분리해 외부 재렌더에 완전히 격리한다.
 */
export const PostCodeSelector = (props: PostCodeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  // props.onSubmit 이 부모 재렌더마다 새 참조가 되어도 Form 내부 memo 비교를 깨지 않도록
  // 안정된 핸들러를 ref 패턴으로 구성한다.
  const onSubmitRef = useRef(props.onSubmit);
  onSubmitRef.current = props.onSubmit;

  const handleSubmit = useCallback((address: Address) => {
    onSubmitRef.current(address);
    setOpen(false);
  }, []);

  const handleOpen = () => {
    // 모달을 열 때마다 sessionKey 를 증가시켜 Form 인스턴스를 새로 마운트한다.
    // lazy initializer 가 initialAddress 로부터 깨끗이 초기화된다.
    setSessionKey((k) => k + 1);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const required = props.required;
  const hasAddress = !isBlank(props.address?.postalCode);

  return (
    <>
      <Flex gap={10}>
        <button type="button" className="rcm-button" data-variant="primary" onClick={handleOpen}>
          주소 찾기
        </button>
        {!required && hasAddress && (
          <button
            type="button"
            className="rcm-button"
            data-variant="outline"
            onClick={removeAddress}
          >
            주소 제거
          </button>
        )}
      </Flex>
      {open && (
        <Modal
          opened={open}
          onClose={handleClose}
          closeOnClickOutside={true}
          closeOnEscape={true}
          /* lockScroll={true} */
          position="center"
          size={'lg'}
          zIndex={11000}
          title="주소 검색"
        >
          <PostCodeSelectorForm
            key={sessionKey}
            initialAddress={props.address}
            required={required}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}
    </>
  );

  function removeAddress() {
    if (!required) {
      if (props.onRemove) {
        props.onRemove();
      } else {
        const address: Address = {
          state: '',
          city: '',
          address1: '',
          address2: '',
          postalCode: '',
        };
        props.onSubmit(address);
      }
    }
  }
};

interface PostCodeSelectorFormProps {
  initialAddress?: Address | undefined;
  required: boolean;
  onSubmit: (address: Address) => void;
}

/**
 * 모달 내부 전용 입력 폼.
 * - initialAddress 는 최초 1회 lazy initializer 로만 소비한다 (이후 prop 변화 무시).
 * - address2 는 빈 문자열로 시작해 controlled input 으로 고정 (uncontrolled→controlled 전이 차단).
 * - props.onSubmit 은 "주소 입력" 버튼을 누를 때만 호출. 타이핑은 로컬 state 만 갱신.
 * - React.memo(() => true) 로 부모 재렌더에 완전히 격리하여 타이핑 중 포커스 유실을 방지.
 *   세션 전환은 부모에서 key 변경으로 처리하므로 prop 업데이트를 막아도 문제 없음.
 */
const PostCodeSelectorFormImpl = (props: PostCodeSelectorFormProps) => {
  const [postalCode, setPostalCode] = useState<string>(
    () => props.initialAddress?.postalCode ?? '',
  );
  const [state, setState] = useState<string>(() => props.initialAddress?.state ?? '');
  const [city, setCity] = useState<string>(() => props.initialAddress?.city ?? '');
  const [address1, setAddress1] = useState<string>(() => props.initialAddress?.address1 ?? '');
  const [address2, setAddress2] = useState<string>(() => props.initialAddress?.address2 ?? '');
  const [longitude, setLongitude] = useState<number | undefined>(
    () => props.initialAddress?.longitude,
  );
  const [latitude, setLatitude] = useState<number | undefined>(
    () => props.initialAddress?.latitude,
  );
  const [error, setError] = useState('');
  const [openDaumPostCode, setOpenDaumPostCode] = useState(false);

  const disabled = isBlank(postalCode);
  const submitDisabled = disabled || isBlank(address2);

  const handleDaumComplete = (data: any) => {
    setState(data.sido);
    setCity(data.sigungu);
    setAddress1(data.roadAddress);
    setAddress2('');
    setPostalCode(data.zonecode);
    setLongitude(data.longitude);
    setLatitude(data.latitude);
    setOpenDaumPostCode(false);
  };

  const validateAndSubmit = () => {
    setError('');
    if (isBlank(address1)) {
      setError('주소 선택을 눌러 주소를 입력하세요');
      return;
    }
    if (isBlank(address2)) {
      setError('상세 주소를 반드시 입력해야 합니다.');
      return;
    }
    const longitudeValue = isBlank(longitude) ? undefined : Number(longitude);
    const latitudeValue = isBlank(latitude) ? undefined : Number(latitude);
    const address: Address = {
      state: state || address1.split(' ')[0]!,
      city: city || address1.split(' ')[1]!,
      address1,
      address2,
      postalCode,
      ...(longitudeValue !== undefined ? { longitude: longitudeValue } : {}),
      ...(latitudeValue !== undefined ? { latitude: latitudeValue } : {}),
    };
    props.onSubmit(address);
  };

  return (
    <div className="rcm-postcode-form">
      <div className="rcm-postcode-row">
        <div className="rcm-postcode-row-label">우편번호</div>
        <div className="rcm-postcode-row-content">
          <div className="rcm-postcode-input-row">
            <input type="text" value={postalCode} disabled readOnly className="rcm-input" />
            <button
              type="button"
              className="rcm-button"
              data-variant="primary"
              onClick={() => setOpenDaumPostCode(true)}
            >
              주소 검색
            </button>
          </div>
        </div>
      </div>
      <div className="rcm-postcode-row">
        <div className="rcm-postcode-row-label">주소</div>
        <div className="rcm-postcode-row-content">
          <input
            type="text"
            value={address1}
            placeholder="주소 검색을 눌러 주소를 선택하세요"
            readOnly
            disabled
            className="rcm-input rcm-postcode-input-full"
          />
        </div>
      </div>
      {!disabled && (
        <div className="rcm-postcode-row">
          <div className="rcm-postcode-row-label">상세 주소</div>
          <div className="rcm-postcode-row-content">
            <input
              type="text"
              value={address2}
              placeholder="상세 주소를 입력하세요"
              onChange={(e) => setAddress2(e.target.value ?? '')}
              className="rcm-input rcm-postcode-input-full"
            />
            {!isBlank(error) && <div className="rcm-postcode-error">{error}</div>}
          </div>
        </div>
      )}
      <div className="rcm-postcode-submit-row">
        <button
          type="button"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            submitDisabled
              ? 'btn btn-outline-primary border border-gray-300 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              : 'btn btn-outline-primary border border-blue-500 text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
          disabled={submitDisabled}
          onClick={validateAndSubmit}
        >
          주소 입력
        </button>
      </div>
      {openDaumPostCode && (
        <Modal
          opened={openDaumPostCode}
          onClose={() => setOpenDaumPostCode(false)}
          closeOnClickOutside={false}
          closeOnEscape={true}
          /* lockScroll={true} */
          position="center"
          zIndex={12000}
        >
          <DaumPostcode onComplete={handleDaumComplete} />
        </Modal>
      )}
    </div>
  );
};

const PostCodeSelectorForm = memo(PostCodeSelectorFormImpl, () => true);
