require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.cache_classes = true

  config.log_level = :fatal

  config.action_mailer.perform_caching = false
end
