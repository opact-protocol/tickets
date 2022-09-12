describe("home", () => {
  beforeEach(function () {
    cy.visit("/");
  });

  it("passes", () => {
    cy.get("body", { log: true });
  });
});
