require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  # Log level
  config.log_level = :debug

  # Use polling file watcher (evented requires the 'listen' gem)
  config.file_watcher = ActiveSupport::FileUpdateChecker

  # Raise error on missing translations
  # config.i18n.raise_on_missing_translations = true
end
