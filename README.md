<div align="center">
  <h1>Load Secrets from 1Password - GitHub Action</h1>
  <p>Provide the secrets your GitHub runner needs from 1Password.</p>
</div>

---

This Action is same as official
[load-secrets-action](https://github.com/1Password/load-secrets-action), using
1Password Javascript [SDK](https://github.com/1Password/onepassword-sdk-js), to
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
