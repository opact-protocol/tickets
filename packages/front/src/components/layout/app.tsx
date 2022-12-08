import routes from "virtual:generated-pages-react";
import { Header } from "./header";
import { Feedback } from "./feedback";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

const Pages = () => {
  return useRoutes(routes);
};

export const App = () => (
  <Router>
    <Header />
    <Pages />
    <Feedback />
  </Router>
);
