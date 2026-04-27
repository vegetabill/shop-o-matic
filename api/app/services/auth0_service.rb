require "net/http"
require "json"

class Auth0Service
  AUTH0_DOMAIN = ENV.fetch("AUTH0_DOMAIN")
  AUTH0_AUDIENCE = ENV.fetch("AUTH0_AUDIENCE") # Auth0 application client ID

  JWKS_URI = "https://#{AUTH0_DOMAIN}/.well-known/jwks.json"
  ISSUER    = "https://#{AUTH0_DOMAIN}/"

  # Cache JWKS for 1 hour; refresh on key miss before raising
  JWKS_TTL = 3600

  class InvalidTokenError < StandardError; end

  def self.verify(id_token)
    new.verify(id_token)
  end

  def verify(id_token)
    header = decode_header(id_token)
    kid = header["kid"]

    public_key = find_key(kid) || begin
      refresh_jwks_cache!
      find_key(kid)
    end

    raise InvalidTokenError, "No matching signing key found (kid=#{kid})" unless public_key

    payload, _ = JWT.decode(id_token, public_key, true, {
      algorithms: ["RS256"],
      iss: ISSUER,
      verify_iss: true,
      aud: AUTH0_AUDIENCE,
      verify_aud: true,
    })

    raise InvalidTokenError, "Token is missing required fields (sub, email)" unless payload["sub"].present? && payload["email"].present?

    {
      auth0_uid: payload["sub"],
      email: payload["email"],
      name: payload["name"] || payload["email"].split("@").first,
      avatar_url: payload["picture"],
    }
  rescue JWT::ExpiredSignature
    raise InvalidTokenError, "Token has expired"
  rescue JWT::DecodeError => e
    raise InvalidTokenError, "Invalid token: #{e.message}"
  end

  private

  def decode_header(token)
    JWT.decode(token, nil, false)[1]
  rescue JWT::DecodeError => e
    raise InvalidTokenError, "Malformed token: #{e.message}"
  end

  def find_key(kid)
    cached = self.class.jwks_cache
    return nil unless cached
    jwk = cached[:keys].find { |k| k["kid"] == kid }
    return nil unless jwk
    JWT::JWK.import(jwk).public_key
  rescue StandardError
    nil
  end

  def refresh_jwks_cache!
    uri = URI(JWKS_URI)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10
    response = http.request(Net::HTTP::Get.new(uri))
    raise InvalidTokenError, "Failed to fetch JWKS (HTTP #{response.code})" unless response.code == "200"

    body = JSON.parse(response.body)
    self.class.set_jwks_cache(keys: body["keys"], fetched_at: Time.now.to_i)
  rescue Net::OpenTimeout, Net::ReadTimeout => e
    raise InvalidTokenError, "JWKS fetch timed out: #{e.message}"
  rescue JSON::ParserError
    raise InvalidTokenError, "Invalid JWKS response"
  end

  class << self
    def jwks_cache
      return nil unless @jwks_cache
      return nil if Time.now.to_i - @jwks_cache[:fetched_at] > JWKS_TTL
      @jwks_cache
    end

    def set_jwks_cache(data)
      @jwks_cache = data
    end
  end
end
