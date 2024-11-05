# Load Secrets from 1Password - GitHub Action

Provide the secrets your GitHub runner needs from 1Password.

[![Check Transpiled JavaScript](https://github.com/bxb100/load-secrets-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/bxb100/load-secrets-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/bxb100/load-secrets-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/bxb100/load-secrets-action/actions/workflows/codeql-analysis.yml)
[![Continuous Integration](https://github.com/bxb100/load-secrets-action/actions/workflows/ci.yml/badge.svg)](https://github.com/bxb100/load-secrets-action/actions/workflows/ci.yml)
[![Lint Codebase](https://github.com/bxb100/load-secrets-action/actions/workflows/linter.yml/badge.svg)](https://github.com/bxb100/load-secrets-action/actions/workflows/linter.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

---

This Action is same as official
[load-secrets-action](https://github.com/1Password/load-secrets-action), using
1Password JavaScript [SDK](https://github.com/1Password/onepassword-sdk-js), to
allow use in Windows, Linux, macOS

This project only support
[1Password Service Account](https://developer.1password.com/docs/service-accounts/get-started)

## Usage

```yaml
on: push
jobs:
  hello-world:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Load secret
        uses: bxb100/load-secrets-action@v0
        with:
          # Export loaded secrets as environment variables
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          SECRET: op://app-cicd/hello-world/secret

      - name: Print masked secret
        run: 'echo "Secret: $SECRET"'
        # Prints: Secret: ***
```
