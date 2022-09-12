import routes from "~react-pages";
import { Header } from "@/components/header";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

const Pages = () => {
  return useRoutes(routes);
};

export const App = () => (
  <Router>
    <Header />
    <Pages />
  </Router>
);
