workflow "Build & Test" {
  resolves = ["Test"]
  on = "push"
}

action "Install" {
  uses = "Borales/actions-yarn@master"
  args = "install --pure-lockfile"
}

action "Test" {
  uses = "Borales/actions-yarn@master"
  needs = ["Install"]
  args = "test"
}
