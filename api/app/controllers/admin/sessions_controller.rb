require "net/http"
require "json"

class Admin::SessionsController < ActionController::Base
  layout false

  before_action :redirect_if_signed_in, only: [:new, :start]

  def new; end

  def start
    verifier  = SecureRandom.urlsafe_base64(64)
    challenge = Base64.urlsafe_encode64(OpenSSL::Digest::SHA256.digest(verifier), padding: false)
    session[:pkce_verifier] = verifier

    redirect_to auth0_authorize_url(challenge), allow_other_host: true
  end

  def callback
    if params[:error].present?
      redirect_to admin_login_path, alert: "Auth0 error: #{params[:error_description]}"
      return
    end

    code     = params[:code]
    verifier = session.delete(:pkce_verifier)

    unless code && verifier
      redirect_to admin_login_path, alert: "Invalid callback — please try again."
      return
    end

    id_token = exchange_code(code, verifier)
    info     = Auth0Service.verify(id_token)
    user     = User.find_by(auth0_uid: info[:auth0_uid])

    if user&.admin?
      session[:admin_user_id] = user.id
      redirect_to admin_root_path, notice: "Signed in as #{user.name}."
    else
      redirect_to admin_login_path, alert: "Your account does not have admin access."
    end
  rescue Auth0Service::InvalidTokenError => e
    redirect_to admin_login_path, alert: "Authentication failed: #{e.message}"
  end

  def destroy
    session.delete(:admin_user_id)
    redirect_to admin_login_path
  end

  private

  def redirect_if_signed_in
    user = User.find_by(id: session[:admin_user_id])
    redirect_to admin_root_path if user&.admin?
  end

  def auth0_authorize_url(challenge)
    "https://#{Auth0Service::AUTH0_DOMAIN}/authorize?" + {
      response_type:         "code",
      client_id:             Auth0Service::AUTH0_AUDIENCE,
      redirect_uri:          admin_callback_url,
      scope:                 "openid email profile",
      code_challenge:        challenge,
      code_challenge_method: "S256"
    }.to_query
  end

  def exchange_code(code, verifier)
    uri  = URI("https://#{Auth0Service::AUTH0_DOMAIN}/oauth/token")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl     = true
    http.open_timeout = 10
    http.read_timeout = 10

    req = Net::HTTP::Post.new(uri)
    req["Content-Type"] = "application/x-www-form-urlencoded"
    req.body = URI.encode_www_form(
      grant_type:    "authorization_code",
      client_id:     Auth0Service::AUTH0_AUDIENCE,
      code:          code,
      redirect_uri:  admin_callback_url,
      code_verifier: verifier
    )

    res  = http.request(req)
    body = JSON.parse(res.body)

    unless res.code == "200"
      raise Auth0Service::InvalidTokenError,
        "Token exchange failed: #{body['error_description'] || body['error']}"
    end
    raise Auth0Service::InvalidTokenError, "No id_token in response" unless body["id_token"]

    body["id_token"]
  end
end
