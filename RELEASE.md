# Release process

1. Update the version of each library.
2. Update the version in `packages/notificare-core/src/internal/version.ts`.
3. Update the `CHANGELOG.md`.
4. Push the generated changes to the repository.
5. Clean the project.
```shell
yarn clean
```
6. Build the libraries.
```shell
yarn build
```
7. Release the libraries to NPM.
```shell
lerna publish from-package
```
8. Release the libraries to the CDN.
```shell
cd packages/notificare && gulp publish && cd -
```
9. Invalidate the cache
```shell
aws cloudfront create-invalidation --distribution-id $AWS_WEB_SDK_CF_DISTRIBUTION_ID --paths '/libs/web/v4/latest/*'
```
10. Create a GitHub release with the contents of the `CHANGELOG.md`.
