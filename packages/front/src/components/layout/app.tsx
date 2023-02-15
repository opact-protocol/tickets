import routes from "virtual:generated-pages-react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

const Pages = () => {
  return useRoutes(routes);
};

export const App = () => {
  console.log(window.performance.memory);
  return (
    <Router>
      <Pages />
    </Router>
  );
};
