@val @scope("document")
external addEventListener: (string, unit => unit) => unit = "addEventListener"

module Application = {
  @module("./app") @react.component
  external make: unit => React.element = "default"
}

addEventListener("DOMContentLoaded", () => {
  let rootQuery = ReactDOM.querySelector("#app")

  switch rootQuery {
  | None => Console.log("Is there something happening?")
  | Some(root) => {
      Console.log("Is there something happening?")
      ReactDOM.render(<Application />, root)
    }
  }
})
