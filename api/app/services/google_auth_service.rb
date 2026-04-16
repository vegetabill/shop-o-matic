require "net/http"
require "json"

class GoogleAuthService
  GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

  class InvalidTokenError < StandardError; end

  def self.verify(id_token)
    new(id_token: id_token).verify
  end

  def self.verify_access_token(access_token)
    new(access_token: access_token).verify_access_token
  end

  def initialize(id_token: nil, access_token: nil)
    @id_token = id_token
    @access_token = access_token
  end

  def verify
    uri = URI("#{GOOGLE_TOKEN_INFO_URL}?id_token=#{URI.encode_www_form_component(@id_token)}")
    response = fetch(uri)
    parse_response(response)
  end

  def verify_access_token
    uri = URI("#{GOOGLE_TOKEN_INFO_URL}?access_token=#{URI.encode_www_form_component(@access_token)}")
    response = fetch(uri)
    parse_response(response, check_aud: false)
  end

  private

  def fetch(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10
    http.request(Net::HTTP::Get.new(uri))
  rescue Net::OpenTimeout, Net::ReadTimeout => e
    raise InvalidTokenError, "Google token verification timed out: #{e.message}"
  rescue StandardError => e
    raise InvalidTokenError, "Failed to reach Google token verification endpoint: #{e.message}"
  end

  def parse_response(response, check_aud: true)
    body = JSON.parse(response.body)

    if response.code != "200"
      error_message = body["error_description"] || body["error"] || "Unknown error"
      raise InvalidTokenError, "Google rejected the token: #{error_message}"
    end

    # Validate audience matches our client ID (id_token only)
    if check_aud
      expected_aud = ENV["GOOGLE_CLIENT_ID"]
      if expected_aud.present? && body["aud"] != expected_aud
        raise InvalidTokenError, "Token audience mismatch"
      end
    end

    # Validate required fields are present
    unless body["sub"].present? && body["email"].present?
      raise InvalidTokenError, "Token is missing required fields (sub, email)"
    end

    {
      google_uid: body["sub"],
      email: body["email"],
      name: body["name"] || body["email"].split("@").first,
      avatar_url: body["picture"]
    }
  rescue JSON::ParserError
    raise InvalidTokenError, "Invalid response from Google token endpoint"
  end
end
