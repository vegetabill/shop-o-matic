# ─── Stage 1: Expo web build ─────────────────────────────────────────────────
FROM node:20-slim AS expo-build

WORKDIR /expo

COPY app/package*.json ./
RUN npm install --legacy-peer-deps

COPY app/ ./

# Bake the API base URL so the web app calls the same origin at /api/v1
ARG EXPO_PUBLIC_API_BASE_URL=/api/v1
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL

RUN npx expo export --platform web


# ─── Stage 2: Ruby gem build ─────────────────────────────────────────────────
FROM ruby:3.2.5-slim AS rails-build

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY api/Gemfile api/Gemfile.lock ./
RUN bundle config set --local deployment true && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

COPY api/ ./

RUN bundle exec bootsnap precompile --gemfile app/ lib/


# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM ruby:3.2.5-slim AS runtime

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      libpq5 \
      curl \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1001 app && \
    useradd --uid 1001 --gid app --no-create-home app

WORKDIR /app

# Rails app + gems from the build stage
COPY --from=rails-build /app /app
COPY --from=rails-build /usr/local/bundle /usr/local/bundle

# Expo web build → served as static files by Rails
COPY --from=expo-build /expo/dist /app/public

RUN bundle config set --local deployment true && \
    bundle config set --local without 'development test' && \
    chown -R app:app /app

USER app

ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true \
    PORT=8080

EXPOSE 8080

ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
