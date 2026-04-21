'use client';

import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useState } from 'react';
import { isBlank } from '../../../utils/StringUtil';

interface KakaoMapProps {
  latitude?: number | undefined;
  longitude?: number | undefined;
  address1?: string | undefined;
  address2?: string | undefined;
  onSetCoordinates: (latitude: number, longitude: number) => void;
  apiKey: string;
}

export const KakaoMap = (props: KakaoMapProps) => {
  const [latitude, setLatitude] = useState(props.latitude);
  const [longitude, setLongitude] = useState(props.longitude);

  useKakaoLoader({ appkey: props.apiKey, libraries: ['services'] });

  /*
  (async () => {
    useKakaoLoader({appkey: kakaoMapApiKey, libraries: ['services']});
  })().then(() => {

  });
*/

  if (latitude === undefined || longitude === undefined) {
    if (isBlank(props.address1)) {
      return null;
    } else {
      if (props.address1) {
        try {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(props.address1, (result: any, status: any) => {
            if (status === 'OK' && result) {
              const latitude = parseFloat(result[0]!.y);
              const longitude = parseFloat(result[0]!.x);
              setLatitude(latitude);
              setLongitude(longitude);
              props.onSetCoordinates(latitude, longitude);
            }
          });
        } catch (e) {
          // no nothing
        }
      }
    }
  }

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  return (
    <>
      <Map
        id={'address-map'}
        level={3}
        center={{ lat: latitude, lng: longitude }}
        style={{ width: '100%', height: '300px', marginTop: `1rem` }}
      >
        <MapMarker // 마커를 생성합니다
          position={{
            // 마커가 표시될 위치입니다
            lat: latitude,
            lng: longitude,
          }}
          title={props.address1 ? `${props.address1} ${props.address2}` : ''}
        />
      </Map>
    </>
  );
};
