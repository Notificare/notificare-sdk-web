# Release process

1. Update the version of each library.
2. Update the `CHANGELOG.md`.
3. Push the generated changes to the repository.
4. Clean the project.
```shell
yarn clean
```
5. Build the libraries.
```shell
yarn build
```
6. Release the libraries to NPM.
```shell
lerna publish from-package
```
7. Release the libraries to the CDN.
```shell
cd packages/notificare && gulp publish && cd -
```
8. Create a GitHub release with the contents of the `CHANGELOG.md`.
