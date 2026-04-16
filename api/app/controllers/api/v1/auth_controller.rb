module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!

      # POST /api/v1/auth/mock (development only)
      def mock
        user = User.find_or_create_by!(email: "dev@example.com") do |u|
          u.google_uid = "dev_mock_uid"
          u.name = "Dev User"
          u.google_avatar_url = nil
        end

        jwt = JwtService.token_for_user(user)
        render json: { token: jwt, user: user_json(user) }, status: :ok
      end

      # POST /api/v1/auth/google
      def google
        id_token = params[:id_token]
        access_token = params[:access_token]

        unless id_token.present? || access_token.present?
          return render json: { error: "id_token or access_token is required" }, status: :bad_request
        end

        google_info = if id_token.present?
          GoogleAuthService.verify(id_token)
        else
          GoogleAuthService.verify_access_token(access_token)
        end

        user = find_or_create_user(google_info)

        jwt = JwtService.token_for_user(user)

        render json: {
          token: jwt,
          user: user_json(user)
        }, status: :ok
      rescue GoogleAuthService::InvalidTokenError => e
        render json: { error: e.message }, status: :unauthorized
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: "Failed to create user account", details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def find_or_create_user(google_info)
        user = User.find_by(google_uid: google_info[:google_uid])

        if user
          # Update potentially stale info
          user.update!(
            email: google_info[:email],
            name: google_info[:name],
            google_avatar_url: google_info[:avatar_url]
          )
        else
          user = User.create!(
            google_uid: google_info[:google_uid],
            email: google_info[:email],
            name: google_info[:name],
            google_avatar_url: google_info[:avatar_url]
          )
        end

        user
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          google_avatar_url: user.google_avatar_url
        }
      end
    end
  end
end
