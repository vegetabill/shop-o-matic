FROM ruby:3.2.5-slim AS build

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local deployment true && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

COPY . .

RUN bundle exec bootsnap precompile --gemfile app/ lib/


FROM ruby:3.2.5-slim AS runtime

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      libpq5 \
      curl \
    && rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1001 app && \
    useradd --uid 1001 --gid app --no-create-home app

WORKDIR /app

COPY --from=build /app /app
COPY --from=build /usr/local/bundle /usr/local/bundle

RUN bundle config set --local deployment true && \
    bundle config set --local without 'development test'

RUN chown -R app:app /app

USER app

ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=false \
    PORT=8080

EXPOSE 8080

ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
