'use client';
import { useEffect, useState } from 'react';
import { Address } from './AddressMapField';
import { isBlank } from '../../../utils/StringUtil';
import { Box } from '../../../ui';
import { Flex } from '../../../ui';
import { Grid } from '../../../ui';
import { Modal } from '../../../ui';
import clsx from 'clsx';
// CSS module removed in Stage 8 (host app supplies styling)
const classes: Record<string, string> = {};
import DaumPostcode from 'react-daum-postcode';

interface PostCodeSelectorProps {
  address?: Address | undefined;
  onSubmit: (address: Address) => void;
  onRemove?: (() => void) | undefined;
  required: boolean;
}

export const PostCodeSelector = (props: PostCodeSelectorProps) => {
  const [open, setOpen] = useState(false);

  const [openDaumPostCode, setOpenDaumPostCode] = useState(false);

  const [postalCode, setPostalCode] = useState<string>();
  const [state, setState] = useState<string>();
  const [city, setCity] = useState<string>();
  const [address1, setAddress1] = useState<string>();
  const [address2, setAddress2] = useState<string>();
  const [longitude, setLongitude] = useState<number>();
  const [latitude, setLatitude] = useState<number>();

  const [error, setError] = useState('');

  const disabled = isBlank(postalCode);

  const required = props.required;

  useEffect(() => {
    // 모달이 열릴 때만 props.address 값으로 내부 상태를 초기화한다.
    // 편집 중(open=true 유지)에는 부모 재렌더로 props 참조가 바뀌어도 재초기화하지 않아
    // 사용자가 상세주소(address2) 등에 입력한 값이 유실되지 않도록 한다.
    if (open) {
      initializeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Flex gap={10}>
        <button
          type="button"
          className="rcm-button"
          data-variant="primary"
          onClick={() => {
            setOpen(!open);
          }}
        >
          주소 찾기
        </button>
        {!required && !isBlank(postalCode) && (
          <button
            type="button"
            className="rcm-button"
            data-variant="outline"
            onClick={() => {
              removeAddress();
            }}
          >
            주소 제거
          </button>
        )}
      </Flex>
      {open && (
        <Modal
          opened={open}
          onClose={() => {
            initializeData();
            setOpen(false);
          }}
          closeOnClickOutside={true}
          closeOnEscape={true}
          /* lockScroll={true} */
          position="center"
          size={'lg'}
          zIndex={11000}
          title="주소 검색"
        >
          <div style={{ padding: `2rem` }}>
            <Grid className={classes.row} gutter={16} align="center">
              <Grid.Col span={2} className={clsx(classes.title, 'text-right pr-2')}>
                우편번호
              </Grid.Col>
              <Grid.Col span={10}>
                <div className="rcm-postcode-input-row">
                  <input
                    type="text"
                    value={postalCode}
                    disabled={true}
                    readOnly={true}
                    className="rcm-input"
                  />
                  <button
                    type="button"
                    className="rcm-button"
                    data-variant="primary"
                    onClick={() => {
                      setOpenDaumPostCode(true);
                    }}
                  >
                    주소 검색
                  </button>
                </div>
              </Grid.Col>
            </Grid>
            <Grid className={clsx(classes.row, classes.subRow)} gutter={16} align="center">
              <Grid.Col span={2} className={clsx(classes.title, 'text-right pr-2')}>
                주소
              </Grid.Col>
              <Grid.Col span={10}>
                <input
                  type="text"
                  value={address1}
                  placeholder={'주소 검색을 눌러 주소를 선택하세요'}
                  readOnly={true}
                  disabled={true}
                  className="rcm-input"
                />
              </Grid.Col>
            </Grid>
            {!disabled && (
              <Grid className={clsx(classes.row, classes.subRow)} gutter={16} align="center">
                <Grid.Col span={2} className={clsx(classes.title, 'text-right pr-2')}>
                  상세 주소
                </Grid.Col>
                <Grid.Col span={10}>
                  <input
                    type="text"
                    value={address2}
                    placeholder={'상세 주소를 입력하세요'}
                    onChange={(e: any) => {
                      setAddress2(e.target.value ?? '');
                    }}
                    className="rcm-input"
                  />
                  {!isBlank(error) && <Box className={classes.error}>{error}</Box>}
                </Grid.Col>
              </Grid>
            )}
            <Box className={classes.buttonContainer}>
              <button
                type="button"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  disabled || isBlank(address2)
                    ? 'btn btn-outline-primary border border-gray-300 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                    : 'btn btn-outline-primary border border-blue-500 text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
                disabled={disabled || isBlank(address2)}
                onClick={() => {
                  validateAndSubmit();
                }}
              >
                주소 입력
              </button>
            </Box>
          </div>
        </Modal>
      )}
      {openDaumPostCode && (
        <Modal
          opened={openDaumPostCode}
          onClose={() => {
            setOpenDaumPostCode(false);
          }}
          closeOnClickOutside={false}
          closeOnEscape={true}
          /* lockScroll={true} */
          position="center"
          zIndex={12000}
        >
          <DaumPostcode
            onComplete={(data: any) => {
              setState(data.sido);
              setCity(data.sigungu);
              setAddress1(data.roadAddress);
              setAddress2('');
              setPostalCode(data.zonecode);
              setLongitude(data.longitude);
              setLatitude(data.latitude);
              setOpenDaumPostCode(false);
            }}
          ></DaumPostcode>
        </Modal>
      )}
    </>
  );

  function removeAddress() {
    if (!required) {
      setState('');
      setCity('');
      setAddress1('');
      setAddress2('');
      setPostalCode('');
      setLatitude(undefined);
      setLongitude(undefined);

      // onRemove 콜백이 있으면 사용, 없으면 기존 방식 사용
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

  function validateAndSubmit() {
    let validated = true;
    setError('');
    if (isBlank(address1)) {
      setError('주소 선택을 눌러 주소를 입력하세요');
      validated = false;
    }

    if (validated) {
      if (isBlank(address2)) {
        setError('상세 주소를 반드시 입력해야 합니다.');
        validated = false;
      }
    }

    if (validated) {
      const longitudeValue = isBlank(longitude) ? undefined : Number(longitude);
      const latitudeValue = isBlank(latitude) ? undefined : Number(latitude);
      const address: Address = {
        state: state ?? address1!.split(' ')[0]!,
        city: city ?? address1!.split(' ')[1]!,
        address1: address1!,
        address2: address2!,
        postalCode: postalCode!,
        ...(longitudeValue !== undefined ? { longitude: longitudeValue } : {}),
        ...(latitudeValue !== undefined ? { latitude: latitudeValue } : {}),
      };
      props.onSubmit(address);
      setOpen(false);
    }
  }

  function initializeData() {
    if (props.address) {
      setCity(props.address.city);
      setState(props.address.state);
      setPostalCode(props.address.postalCode);
      setAddress1(props.address.address1);
      setAddress2(props.address.address2);
      setLongitude(props.address.longitude);
      setLatitude(props.address.latitude);
    }
  }
};
