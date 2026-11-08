const { test } = require("node:test");
const assert = require("node:assert/strict");
const { credential } = require("../scripts/git-credential-mukesh.cjs");
const request = "protocol=https\nhost=github.com\npath=pavanikumari555/homemoneycalc.git\nusername=mukeshs555\n\n";
test("Git helper uses only the named saved account and verifies its live identity", () => {
  let calls = 0;
  const result = credential(request, (cmd, args, options) => {
    assert.equal(cmd, "gh");
    if (calls++ === 0) {
      assert.deepEqual(args, ["auth", "token", "--hostname", "github.com", "--user", "mukeshs555"]);
      assert.equal(options.env.GH_TOKEN, undefined);
      assert.equal(options.env.GITHUB_TOKEN, undefined);
      return { status: 0, stdout: "test-only-credential\n" };
    }
    assert.equal(options.env.GH_TOKEN, "test-only-credential");
    return { status: 0, stdout: "mukeshs555\n" };
  });
  assert.equal(calls, 2);
  assert.equal(result, "username=mukeshs555\npassword=test-only-credential\n\n");
});
test("Git helper refuses other accounts/repos and stops on missing or mismatched identity", () => {
  const forbidden = () => { throw Error("must not read a credential"); };
  assert.equal(credential(request.replace("username=mukeshs555", "username=pavanikumari555"), forbidden), "quit=true\n\n");
  assert.equal(credential(request.replace("homemoneycalc.git", "other.git"), forbidden), "quit=true\n\n");
  assert.equal(credential(request, () => ({ status: 1 })), "quit=true\n\n");
  let calls = 0;
  assert.equal(credential(request, () => ({ status: 0, stdout: calls++ ? "pavanikumari555" : "test-only-credential" })), "quit=true\n\n");
});
