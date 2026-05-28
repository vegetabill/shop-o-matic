# Shop-o-Matic

A simple shopping list app customized for how I manage my lists and pantry.

I am integrating this with a Home Assistant voice app to replace Alexa.


## Building and Pushing the API Docker Image

The API has a multi-stage `Dockerfile` in `api/`. The production image runs on port 8080 as a non-root user.

### Build

```sh
docker build -t shop-o-matic-api:latest ./api
```

Tag with a version:

```sh
docker build -t shop-o-matic-api:1.2.3 ./api
```

### Push to a registry

Log in if needed:

```sh
docker login ghcr.io   # or docker login, etc.
```

Tag and push:

```sh
IMAGE=ghcr.io/vegetabill/shop-o-matic-api

docker build -t $IMAGE:latest --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) ./api
docker push $IMAGE:latest
```

### Multi-platform build (linux/amd64 + linux/arm64)

Use `buildx` if your deployment target differs from your local machine (e.g. building on Apple Silicon for a cloud host):

```sh
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $IMAGE:latest \
  --push \
  ./api
```

---

## Publishing a New Version

The app uses [EAS (Expo Application Services)](https://expo.dev/eas) for builds and OTA updates.

### Prerequisites

```sh
npm install -g eas-cli
eas login
```

### OTA update (JS-only changes, no native code)

Use this for most feature/bug-fix releases — no App Store review needed.

```sh
cd app
# Bump version in app.json if appropriate
eas update --branch production --message "describe what changed"
```

Users on the existing binary will receive the update automatically on next launch.

### Full native build + App Store submission

Required when native dependencies change, `app.json` config changes, or when bumping the binary version.

1. Bump `version` (and `ios.buildNumber` / `android.versionCode`) in [app/app.json](app/app.json).
2. Build:
   ```sh
   cd app
   eas build --platform ios --profile production
   # or --platform android, or --platform all
   ```
3. Submit to App Store / Play Store:
   ```sh
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

### EAS project setup (first time)

If `extra.eas.projectId` in `app.json` is still a placeholder, initialize EAS first:

```sh
cd app
eas init
```

This will populate the project ID and create an `eas.json` build profile config.

## Creation

This was built entirely with *Claude* . You can find the spec in [requirements.md](./requirements.md)

```sh
recap: Building a household shopping list app with a Rails API backend and React Native Expo frontend. The app is running
  locally and mostly working — next step is testing the full item editing and shopping flows in the simulator.

❯ what is your current model and version?

⏺ I'm Claude Sonnet 4.6 (claude-sonnet-4-6).
```

