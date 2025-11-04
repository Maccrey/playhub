interface AdBannerProps {
  'data-ad-unit'?: string;
  'data-ad-width'?: string;
  'data-ad-height'?: string;
}

const DEFAULT_AD_PROPS: Required<AdBannerProps> = {
  'data-ad-unit': 'default-unit',
  'data-ad-width': '320',
  'data-ad-height': '100',
};

const AdBanner: React.FC<AdBannerProps> = (props) => {
  const mergedProps = {...DEFAULT_AD_PROPS, ...props};
  return (
    <ins
      className="kakao_ad_area"
      style={{display: 'none'}}
      data-ad-unit={mergedProps['data-ad-unit']}
      data-ad-width={mergedProps['data-ad-width']}
      data-ad-height={mergedProps['data-ad-height']}
    ></ins>
  );
};

export default AdBanner;
