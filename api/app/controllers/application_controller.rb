class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods

  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from AuthenticationError, with: :unauthorized

  attr_reader :current_user

  private

  def authenticate_user!
    token = extract_bearer_token
    raise AuthenticationError, "Authorization header missing or malformed" unless token

    payload = JwtService.decode(token)
    @current_user = User.find(payload[:user_id])
  rescue ActiveRecord::RecordNotFound
    raise AuthenticationError, "User not found"
  end

  def extract_bearer_token
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    auth_header.split(" ", 2).last
  end

  def current_household
    @current_household ||= begin
      household_id = params[:household_id]
      household = current_user.households.find(household_id)
      household
    rescue ActiveRecord::RecordNotFound
      raise ActiveRecord::RecordNotFound, "Household not found or you are not a member"
    end
  end

  def not_found(error)
    render json: { error: error.message }, status: :not_found
  end

  def unprocessable_entity(error)
    render json: { error: error.message, details: error.record&.errors&.full_messages }, status: :unprocessable_entity
  end

  def unauthorized(error)
    render json: { error: error.message }, status: :unauthorized
  end
end
