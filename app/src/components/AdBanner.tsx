
interface AdBannerProps {
  'data-ad-unit': string;
  'data-ad-width': string;
  'data-ad-height': string;
}

const AdBanner: React.FC<AdBannerProps> = (props) => {
  return (
    <ins
      className="kakao_ad_area"
      style={{ display: 'none' }}
      data-ad-unit={props['data-ad-unit']}
      data-ad-width={props['data-ad-width']}
      data-ad-height={props['data-ad-height']}
    ></ins>
  );
};

export default AdBanner;
