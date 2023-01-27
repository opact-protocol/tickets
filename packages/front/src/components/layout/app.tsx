import routes from "virtual:generated-pages-react";
import { useState, useEffect } from "react";
import { Header } from "./header";
import { AboutUsModal } from "../modals";
import { Feedback } from "./feedback";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { NeedHelp } from "./needHelp";

const Pages = () => {
  return useRoutes(routes);
};

export const handleOpenModal = (callback: (value: boolean) => void) => {
  if (localStorage.getItem("@hyc-first-interaction")) {
    return;
  }

  callback(true);

  localStorage.setItem("@hyc-first-interaction", "true");
};

export const App = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    handleOpenModal((show) => setShowModal(show));
  });

  return (
    <Router>
      <Header />
      <Pages />
      <AboutUsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <Feedback />
      <NeedHelp />
    </Router>
  );
};
