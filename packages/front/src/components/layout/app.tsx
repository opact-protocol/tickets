import routes from "virtual:generated-pages-react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import TagManager from "react-gtm-module";

const Pages = () => {
  if (!window.location.hostname.includes('tickets')) {
    const rebrandRoute = routes.find(({ path }: any) => path === 'rebrand')

    return useRoutes([{ ...rebrandRoute, path: '/' }])

  }
  return useRoutes(routes);
};

export const App = () => {
  const tagManagerArgs = {
    gtmId: import.meta.env.VITE_GTM_ID as string,
  };

  TagManager.initialize(tagManagerArgs);

  return (
    <Router>
      <Pages />
    </Router>
  );
};
