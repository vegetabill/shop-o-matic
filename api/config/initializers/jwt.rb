# JWT configuration
# Set JWT_SECRET in environment or credentials
JWT_SECRET = ENV.fetch("JWT_SECRET") do
  if Rails.application.credentials.jwt_secret.present?
    Rails.application.credentials.jwt_secret
  elsif Rails.env.development? || Rails.env.test?
    "dev-secret-change-in-production-#{Rails.env}"
  else
    raise "JWT_SECRET environment variable is not set!"
  end
end

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 720 # 30 days
