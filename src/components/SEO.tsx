import Head from 'next/head';

interface SEOProps {
  title: string;
}

const SEO = ({ title }: SEOProps) => {
  return (
    <Head>
      <title>랜덤뮤직스타 | {title}</title>
      <meta
        name='description'
        content='랜덤 음악 퀴즈 게임 랜덤뮤직스타! 한곡, 믹스, AI 모드로 즐겨보세요!'
      />
      <meta name='keywords' content='음악, 노래, 퀴즈, 게임, 믹스, AI' />
      <meta property='og:title' content='랜덤뮤직스타' />
      <meta
        property='og:description'
        content='랜덤뮤직스타에서 랜덤 음악 퀴즈를 시작해보세요!'
      />
      <meta
        property='og:image'
        content='https://www.music-random.com/og/ogimage.png'
      />
      <meta property='og:url' content='https://www.music-random.com' />
      <link rel='icon' href='/favicon.ico' />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon-16x16.png'
      />
      <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
      <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
    </Head>
  );
};
export default SEO;
