# Repository authentication — 8 November 2026

All local authenticated Git/GitHub operations for this project must use **mukeshs555**. The repository remains **pavanikumari555/homemoneycalc**. Ownership is not transferred.

Live `GET /user` confirmed `mukeshs555`; the repository API confirmed `permissions.push=true`, `pull=true`, `admin=false`. Commit identity is Mukesh, `98004617+mukeshs555@users.noreply.github.com`.

## Durable local Git selection

The local `.git/config` has a credential section scoped to the exact repository HTTPS URL. Its first empty helper clears inherited helpers, followed by `scripts/git-credential-mukesh.cjs`. `useHttpPath=true` and `username=mukeshs555` keep credentials repository/account specific. No token is stored in the repository, remote URL, or this helper.

The helper retrieves only `gh auth token --hostname github.com --user mukeshs555`, ignores inherited token environment variables, and checks the live identity before returning credentials to Git's private pipe. Missing credentials, wrong identity, unexpected repo or username stop authentication (`quit=true`); there is no fallback to another saved account.

The helper path in `.git/config` is absolute for this checkout. Reconfigure it if moving/cloning the checkout. A new clone does not inherit `.git/config`. The saved Mukesh login must remain available in GitHub CLI's credential store.

GitHub CLI does not read Git credential helpers. For API/Actions commands, retrieve the explicitly named Mukesh credential privately, set it only in that process's environment, verify `/user`, then run the command. Do not print credentials, use a token in command arguments, rely on the globally active account, or switch another AI's global account. Never run `gh auth token` directly into visible terminal output.

## Concurrent work

Inspect status and fetch first. Compare incoming paths before fast-forwarding a dirty checkout. Preserve unrelated edits; stage named reviewed files only. If a push is rejected, fetch and inspect the new commits, integrate safely, and rerun affected checks. Never force-push. Verify Mukesh's identity and repository write permission again before publishing.
