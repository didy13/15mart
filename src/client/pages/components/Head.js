import { Helmet, HelmetProvider } from 'react-helmet-async';

function Head({ pageTitle, styleTitle }) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{`TerminKO | ${pageTitle}`}</title>
        <link rel="stylesheet" href={`/css/${styleTitle}.css/`}/>
        <link rel="stylesheet" href="/css/style.css"/>
      </Helmet>
    </HelmetProvider>
  );
}

export default Head;