import Head from 'next/head';

interface SEOProps {
  title: string;
}

const SEO = ({ title }: SEOProps) => {
  return (
    <Head>
      <title>아르송모르송 | {title}</title>
      <meta
        name='description'
        content='랜덤 음악 퀴즈 게임 아르송모르송! 한곡, 믹스, AI 모드로 즐겨보세요!'
      />
      <meta name='keywords' content='음악, 노래, 퀴즈, 게임, 믹스, AI' />
      <meta property='og:title' content='아르송모르송' />
      <meta
        property='og:description'
        content='아르송모르송에서 랜덤 음악 퀴즈를 시작해보세요!'
      />
      <meta property='og:image' content='/og/oginmage.png' />
      <meta property='og:url' content='https://arsongmrsong.com' />
    </Head>
  );
};
export default SEO;
