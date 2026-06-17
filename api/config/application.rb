require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    config.load_defaults 8.0

    # Keep API-only off so the admin portal can render views with sessions/CSRF
    config.api_only = false

    # Allow requests from any host in development/test
    config.hosts.clear if Rails.env.development? || Rails.env.test?

    # Time zone
    config.time_zone = "UTC"

    # Autoload paths
    config.autoload_paths << Rails.root.join("lib")
  end
end
