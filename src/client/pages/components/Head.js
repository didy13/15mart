import { Helmet, HelmetProvider } from 'react-helmet-async';

function Head({ pageTitle, styleTitle }) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{`TerminKO | ${pageTitle}`}</title>
      </Helmet>
    </HelmetProvider>
  );
}

export default Head;