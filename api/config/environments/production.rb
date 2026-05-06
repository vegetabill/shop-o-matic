require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false

  # Use a real queuing backend for Active Job
  # config.active_job.queue_adapter = :resque

  config.log_level = :info
  config.log_tags = [:request_id]

  config.action_mailer.perform_caching = false

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false if config.respond_to?(:assets)

  # Force all access to the app over SSL (disable when SSL is terminated by a proxy)
  config.force_ssl = ENV.fetch("FORCE_SSL", "true") == "true"

  config.logger = ActiveSupport::Logger.new($stdout)
    .tap  { |logger| logger.formatter = ::Logger::Formatter.new }
    .then { |logger| ActiveSupport::TaggedLogging.new(logger) }
end
